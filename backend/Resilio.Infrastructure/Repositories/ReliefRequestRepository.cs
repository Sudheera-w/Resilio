// Resilio.Infrastructure/Repositories/ReliefRequestRepository.cs
using Microsoft.Data.SqlClient;
using Resilio.Core.Interfaces;

namespace Resilio.Infrastructure.Repositories;

public sealed class ReliefRequestRepository : IReliefRequestRepository
{
    private readonly IDbConnectionFactory _factory;

    public ReliefRequestRepository(IDbConnectionFactory f) => _factory = f;
    //create
    public async Task<ReliefRequestRecord> CreateAsync(
        ReliefRequestRecord record, CancellationToken ct)
    {
        const string sql = @"
            INSERT INTO dbo.ReliefRequests
                (RequestId, CreatedByUserId, Area, Description, Urgency, Status, CreatedAt, UpdatedAt)
            VALUES
                (@Id, @UserId, @Area, @Desc, @Urgency, @Status, @CreatedAt, @UpdatedAt);";

        using var conn = (SqlConnection)_factory.CreateConnection();
        await conn.OpenAsync(ct);
        using var cmd = new SqlCommand(sql, conn);

        cmd.Parameters.AddWithValue("@Id",        record.RequestId);
        cmd.Parameters.AddWithValue("@UserId",    record.CreatedByUserId);
        cmd.Parameters.AddWithValue("@Area",      record.Area);
        cmd.Parameters.AddWithValue("@Desc",      (object?)record.Description ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@Urgency",   record.Urgency);
        cmd.Parameters.AddWithValue("@Status",    record.Status);
        cmd.Parameters.AddWithValue("@CreatedAt", record.CreatedAt);
        cmd.Parameters.AddWithValue("@UpdatedAt", record.UpdatedAt);

        await cmd.ExecuteNonQueryAsync(ct);
        return record;
    }

    // for now its not implemented
    public Task<IReadOnlyList<ReliefRequestRecord>> GetAllAsync(
        string? statusFilter, CancellationToken ct)
        => throw new NotImplementedException();

    public Task<ReliefRequestRecord?> GetByIdAsync(
        Guid requestId, CancellationToken ct)
        => throw new NotImplementedException();

    public Task<ReliefRequestRecord> UpdateAsync(
        ReliefRequestRecord record, CancellationToken ct)
        => throw new NotImplementedException();

    public Task DeleteAsync(Guid requestId, CancellationToken ct)
        => throw new NotImplementedException();
}