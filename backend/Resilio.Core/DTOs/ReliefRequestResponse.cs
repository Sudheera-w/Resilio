namespace Resilio.Core.DTOs;

public sealed record ReliefRequestResponse(
    Guid RequestId,
    Guid CreatedByUserId,
    string Area,
    string? Description,
    string Urgency,
    string Status,
    DateTime CreatedAt,
    DateTime UpdatedAt
);