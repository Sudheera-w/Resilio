namespace Resilio.API.DTOs;

public class DashboardStatsDto
{
    public int TotalRequests { get; set; }
    public int PendingRequests { get; set; }
    public int CompletedRequests { get; set; }
    public int TotalVolunteers { get; set; }
    public int ActiveVolunteers { get; set; }
    public int TotalDonations { get; set; }
}

public class UpdatePriorityDto 
{ 
    public string Priority { get; set; } = string.Empty; 
}

public class AssignVolunteerDto 
{ 
    public int VolunteerId { get; set; } 
}

public class UpdateStatusDto 
{ 
    public string Status { get; set; } = string.Empty; 
}
