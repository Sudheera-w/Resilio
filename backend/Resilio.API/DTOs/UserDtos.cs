using Resilio.API.Models;

namespace Resilio.API.DTOs;

public class UserDashboardDto
{
    public IEnumerable<ReliefRequest> MyRequests { get; set; } = new List<ReliefRequest>();
    public IEnumerable<Volunteer> MyVolunteerProfiles { get; set; } = new List<Volunteer>();
    public IEnumerable<ResourceDonation> MyDonations { get; set; } = new List<ResourceDonation>();
}
