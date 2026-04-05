namespace Resilio.Core.DTOs;

public sealed record ResourceCreateRequest(
    string Name,
    string? Category,
    int Quantity
);

public sealed record ResourceUpdateRequest(
    string? Name,
    string? Category,
    int? Quantity
);

public sealed record ResourceAllocateRequest(
    Guid ReliefRequestId,
    int AllocatedQuantity
);

public sealed record ResourceResponse(
    int Id,
    string Name,
    string? Category,
    int Quantity,
    string AllocationStatus,
    Guid? AllocatedRequestId,
    DateTime CreatedAt,
    DateTime UpdatedAt
);