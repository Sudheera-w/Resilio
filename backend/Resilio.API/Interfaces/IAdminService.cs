using Resilio.API.DTOs;
using Resilio.API.Models;

namespace Resilio.API.Interfaces;

public interface IAdminService
{
    Task<DashboardStatsDto> GetDashboardStatsAsync();
    Task<ReliefRequest?> UpdateRequestPriorityAsync(int id, string priority);
    Task<(bool Success, ReliefRequest? Request, Volunteer? Volunteer, string Message)> AssignVolunteerAsync(int requestId, int volunteerId);
    Task<ReliefRequest?> UpdateRequestStatusAsync(int id, string status);
    Task<Volunteer?> UpdateVolunteerStatusAsync(int id, string status);
    Task<ResourceDonation?> UpdateDonationStatusAsync(int id, string status);

    // Admin hard-deletes (no status restriction for admin)
    Task<(bool Success, string Message)> AdminDeleteRequestAsync(int id);
    Task<(bool Success, string Message)> AdminDeleteVolunteerAsync(int id);
    Task<(bool Success, string Message)> AdminDeleteDonationAsync(int id);
}
