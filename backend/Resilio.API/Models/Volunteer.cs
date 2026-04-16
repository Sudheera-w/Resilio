namespace Resilio.API.Models;

public class Volunteer
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Contact { get; set; } = string.Empty;
    public string Roles { get; set; } = string.Empty; // Comma separated list
    public string Availability { get; set; } = string.Empty;
    public string HasVehicle { get; set; } = string.Empty;
    public string? VehicleType { get; set; }
    public string Location { get; set; } = string.Empty;
    public bool InstantAvailable { get; set; }
    public string Status { get; set; } = "Active";
    public DateTime CreatedAt { get; set; } = DateTime.Now;

    // Navigation property for requests assigned to this volunteer
    public ICollection<ReliefRequest> AssignedRequests { get; set; } = new List<ReliefRequest>();
}
