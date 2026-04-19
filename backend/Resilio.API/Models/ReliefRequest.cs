namespace Resilio.API.Models;

public class ReliefRequest
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Contact { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string HelpType { get; set; } = string.Empty; // Food, Medicine, Shelter, Rescue
    public string? Note { get; set; }
    public bool IsUrgent { get; set; }
    public string Priority { get; set; } = "Medium"; // High, Medium, Low
    public int? AssignedVolunteerId { get; set; }
    public Volunteer? AssignedVolunteer { get; set; }

    public string Status { get; set; } = "Pending";
    public DateTime CreatedAt { get; set; } = DateTime.Now;
}
