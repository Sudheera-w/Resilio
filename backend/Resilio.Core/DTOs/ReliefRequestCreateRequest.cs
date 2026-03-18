namespace Resilio.Core.DTOs;
 
public sealed record ReliefRequestCreateRequest(
    string Area,
    string? Description,
    string Urgency // Fields: low, medium, high, critical
);