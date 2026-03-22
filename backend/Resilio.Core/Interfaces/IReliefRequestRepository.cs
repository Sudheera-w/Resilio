namespace Resilio.Core.Interfaces;

public sealed record ReliefRequestRecord(
    Guid RequestId,
    Guid CreatedByUserId,
    string Area,
    string? Description,
    string Urgency,
    string Status,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public sealed record ReliefRequestDetailRecord(
    Guid RequestId,
    Guid CreatedByUserId,
    string Area,
    string? Description,
    string Urgency,
    string Status,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    string? SubmittedByName,
    string? SubmittedByPhone,
    string? SubmittedByEmail
);

public interface IReliefRequestRepository
{
    Task<ReliefRequestRecord> CreateAsync(
        ReliefRequestRecord record, CancellationToken ct);
        
    Task<IReadOnlyList<ReliefRequestRecord>> GetAllAsync(
        string? statusFilter, CancellationToken ct);

    Task<ReliefRequestRecord?> GetByIdAsync(
        Guid requestId, CancellationToken ct);

    Task<ReliefRequestRecord> UpdateAsync(
        ReliefRequestRecord record, CancellationToken ct);

    Task DeleteAsync(Guid requestId, CancellationToken ct);

    Task<IReadOnlyList<ReliefRequestRecord>> GetByUserIdAsync(
        Guid userId, CancellationToken ct);

    Task<IReadOnlyList<ReliefRequestDetailRecord>> GetAllWithUserAsync(
        string? statusFilter, CancellationToken ct);
}