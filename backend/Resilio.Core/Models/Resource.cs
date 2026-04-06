namespace Resilio.Core.Models;

public sealed class Resource
{
    public int Id { get; init; }
    public string Name { get; init; } = default!;
    public string? Category { get; init; }
    public int Quantity { get; init; }
    public string AllocationStatus { get; init; } = "NotAllocated";
    public Guid? AllocatedRequestId { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}