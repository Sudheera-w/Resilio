using Microsoft.Data.SqlClient;
using Resilio.Core.Interfaces;
using Resilio.Core.Models;

namespace Resilio.Infrastructure.Repositories;

public sealed class ResourceRepository : IResourceRepository
{
    private readonly IDbConnectionFactory _factory;

    public ResourceRepository(IDbConnectionFactory factory) => _factory = factory;

    private static Resource Map(SqlDataReader r) => new Resource
    {
        Id                 = r.GetInt32(0),
        Name               = r.GetString(1),
        Category           = r.IsDBNull(2) ? null : r.GetString(2),
        Quantity           = r.GetInt32(3),
        AllocationStatus   = r.GetString(4),
        AllocatedRequestId = r.IsDBNull(5) ? null : r.GetGuid(5),
        CreatedAt          = r.GetDateTime(6),
        UpdatedAt          = r.GetDateTime(7)
    };

    public async Task<IReadOnlyList<Resource>> GetAllAsync(CancellationToken ct)
    {
        const string sql = @"
            SELECT Id, Name, Category, Quantity,
                   AllocationStatus, AllocatedRequestId,
                   CreatedAt, UpdatedAt
            FROM dbo.Resources
            ORDER BY CreatedAt DESC;";

        using var conn = (SqlConnection)_factory.CreateConnection();
        await conn.OpenAsync(ct);

        using var cmd = new SqlCommand(sql, conn);
        using var reader = await cmd.ExecuteReaderAsync(ct);

        var list = new List<Resource>();
        while (await reader.ReadAsync(ct))
            list.Add(Map(reader));

        return list;
    }

    public async Task<Resource?> GetByIdAsync(int id, CancellationToken ct)
    {
        const string sql = @"
            SELECT Id, Name, Category, Quantity,
                   AllocationStatus, AllocatedRequestId,
                   CreatedAt, UpdatedAt
            FROM dbo.Resources
            WHERE Id = @Id;";

        using var conn = (SqlConnection)_factory.CreateConnection();
        await conn.OpenAsync(ct);

        using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@Id", id);

        using var reader = await cmd.ExecuteReaderAsync(ct);
        if (!await reader.ReadAsync(ct)) return null;

        return Map(reader);
    }

    public async Task<Resource> CreateAsync(Resource resource, CancellationToken ct)
    {
        const string sql = @"
            INSERT INTO dbo.Resources (Name, Category, Quantity)
            OUTPUT INSERTED.Id, INSERTED.Name, INSERTED.Category,
                   INSERTED.Quantity, INSERTED.AllocationStatus,
                   INSERTED.AllocatedRequestId,
                   INSERTED.CreatedAt, INSERTED.UpdatedAt
            VALUES (@Name, @Category, @Quantity);";

        using var conn = (SqlConnection)_factory.CreateConnection();
        await conn.OpenAsync(ct);

        using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@Name",     resource.Name);
        cmd.Parameters.AddWithValue("@Category", (object?)resource.Category ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@Quantity", resource.Quantity);

        using var reader = await cmd.ExecuteReaderAsync(ct);
        await reader.ReadAsync(ct);
        return Map(reader);
    }

    public async Task<Resource> UpdateAsync(Resource resource, CancellationToken ct)
    {
        const string sql = @"
            UPDATE dbo.Resources
            SET Name      = @Name,
                Category  = @Category,
                Quantity  = @Quantity,
                UpdatedAt = SYSUTCDATETIME()
            OUTPUT INSERTED.Id, INSERTED.Name, INSERTED.Category,
                   INSERTED.Quantity, INSERTED.AllocationStatus,
                   INSERTED.AllocatedRequestId,
                   INSERTED.CreatedAt, INSERTED.UpdatedAt
            WHERE Id = @Id;";

        using var conn = (SqlConnection)_factory.CreateConnection();
        await conn.OpenAsync(ct);

        using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@Id",       resource.Id);
        cmd.Parameters.AddWithValue("@Name",     resource.Name);
        cmd.Parameters.AddWithValue("@Category", (object?)resource.Category ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@Quantity", resource.Quantity);

        using var reader = await cmd.ExecuteReaderAsync(ct);
        if (!await reader.ReadAsync(ct))
            throw new KeyNotFoundException($"Resource {resource.Id} not found.");

        return Map(reader);
    }

    public async Task DeleteAsync(int id, CancellationToken ct)
    {
        const string sql = @"
            DELETE FROM dbo.Resources
            WHERE Id = @Id
              AND AllocatedRequestId IS NULL;";

        using var conn = (SqlConnection)_factory.CreateConnection();
        await conn.OpenAsync(ct);

        using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@Id", id);

        var rows = await cmd.ExecuteNonQueryAsync(ct);
        if (rows == 0)
            throw new InvalidOperationException(
                "Resource not found or currently allocated — cannot delete.");
    }

    public async Task<Resource> AllocateAsync(
        int id, Guid reliefRequestId, int quantity, CancellationToken ct)
    {
        const string checkSql = @"
            SELECT Status FROM dbo.ReliefRequests
            WHERE RequestId = @RequestId;";

        const string updateSql = @"
            UPDATE dbo.Resources
            SET AllocationStatus   = 'Allocated',
                AllocatedRequestId = @RequestId,
                UpdatedAt          = SYSUTCDATETIME()
            OUTPUT INSERTED.Id, INSERTED.Name, INSERTED.Category,
                   INSERTED.Quantity, INSERTED.AllocationStatus,
                   INSERTED.AllocatedRequestId,
                   INSERTED.CreatedAt, INSERTED.UpdatedAt
            WHERE Id = @Id
              AND AllocationStatus = 'NotAllocated'
              AND Quantity > 0;";

        const string allocSql = @"
            INSERT INTO dbo.ResourceAllocations
                (ResourceId, ReliefRequestId, AllocatedQuantity)
            VALUES (@Id, @RequestId, @Quantity);";

        using var conn = (SqlConnection)_factory.CreateConnection();
        await conn.OpenAsync(ct);

        using (var checkCmd = new SqlCommand(checkSql, conn))
        {
            checkCmd.Parameters.AddWithValue("@RequestId", reliefRequestId);
            var status = (string?)await checkCmd.ExecuteScalarAsync(ct);

            if (status == null)
                throw new KeyNotFoundException("Relief request not found.");
            if (status != "Open")
                throw new InvalidOperationException(
                    "Resource can only be allocated to Open requests.");
        }

        using var cmd = new SqlCommand(updateSql, conn);
        cmd.Parameters.AddWithValue("@Id",        id);
        cmd.Parameters.AddWithValue("@RequestId", reliefRequestId);

        using var reader = await cmd.ExecuteReaderAsync(ct);
        if (!await reader.ReadAsync(ct))
            throw new InvalidOperationException(
                "Resource not found, already allocated, or quantity is 0.");

        var updated = Map(reader);
        reader.Close();

        using var allocCmd = new SqlCommand(allocSql, conn);
        allocCmd.Parameters.AddWithValue("@Id",        id);
        allocCmd.Parameters.AddWithValue("@RequestId", reliefRequestId);
        allocCmd.Parameters.AddWithValue("@Quantity",  quantity);
        await allocCmd.ExecuteNonQueryAsync(ct);

        return updated;
    }

    public async Task<Resource> ReleaseAsync(int id, CancellationToken ct)
    {
        const string checkSql = @"
            SELECT r.Status
            FROM dbo.ReliefRequests r
            INNER JOIN dbo.Resources res ON res.AllocatedRequestId = r.RequestId
            WHERE res.Id = @Id;";

        const string updateSql = @"
            UPDATE dbo.Resources
            SET AllocationStatus   = 'Released',
                AllocatedRequestId = NULL,
                UpdatedAt          = SYSUTCDATETIME()
            OUTPUT INSERTED.Id, INSERTED.Name, INSERTED.Category,
                   INSERTED.Quantity, INSERTED.AllocationStatus,
                   INSERTED.AllocatedRequestId,
                   INSERTED.CreatedAt, INSERTED.UpdatedAt
            WHERE Id = @Id
              AND AllocationStatus = 'Allocated';";

        using var conn = (SqlConnection)_factory.CreateConnection();
        await conn.OpenAsync(ct);

        using (var checkCmd = new SqlCommand(checkSql, conn))
        {
            checkCmd.Parameters.AddWithValue("@Id", id);
            var status = (string?)await checkCmd.ExecuteScalarAsync(ct);

            if (status == "Completed")
                throw new InvalidOperationException(
                    "Cannot release a resource from a Completed request.");
        }

        using var cmd = new SqlCommand(updateSql, conn);
        cmd.Parameters.AddWithValue("@Id", id);

        using var reader = await cmd.ExecuteReaderAsync(ct);
        if (!await reader.ReadAsync(ct))
            throw new InvalidOperationException(
                "Resource not found or not currently allocated.");

        return Map(reader);
    }
}