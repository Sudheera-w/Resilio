namespace Resilio.Core.DTOs;


public sealed record ReliefRequestDetailResponse(
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