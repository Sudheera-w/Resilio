using Microsoft.EntityFrameworkCore;
using Resilio.API.Data;
using Resilio.API.DTOs;
using Resilio.API.Interfaces;
using Resilio.API.Models;

namespace Resilio.API.Services;

public class AdminService : IAdminService
{
    private readonly ResilioDbContext _context;

    public AdminService(ResilioDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardStatsDto> GetDashboardStatsAsync()
    {
        return new DashboardStatsDto
        {
            TotalRequests = await _context.ReliefRequests.CountAsync(),
            PendingRequests = await _context.ReliefRequests.CountAsync(r => r.Status == "Pending"),
            CompletedRequests = await _context.ReliefRequests.CountAsync(r => r.Status == "Completed"),
            TotalVolunteers = await _context.Volunteers.CountAsync(),
            ActiveVolunteers = await _context.Volunteers.CountAsync(v => v.Status == "Active"),
            TotalDonations = await _context.Donations.CountAsync()
        };
    }

    public async Task<ReliefRequest?> UpdateRequestPriorityAsync(int id, string priority)
    {
        var request = await _context.ReliefRequests.FindAsync(id);
        if (request == null) return null;

        request.Priority = priority;
        await _context.SaveChangesAsync();

        return request;
    }

    public async Task<(bool Success, ReliefRequest? Request, Volunteer? Volunteer, string Message)> AssignVolunteerAsync(int requestId, int volunteerId)
    {
        var request = await _context.ReliefRequests.FindAsync(requestId);
        if (request == null) return (false, null, null, "Request not found");

        var volunteer = await _context.Volunteers.FindAsync(volunteerId);
        if (volunteer == null) return (false, null, null, "Volunteer not found");

        request.AssignedVolunteerId = volunteer.Id;
        request.Status = "Assigned";
        volunteer.Status = "Busy";

        await _context.SaveChangesAsync();

        return (true, request, volunteer, "Volunteer assigned successfully");
    }

    public async Task<ReliefRequest?> UpdateRequestStatusAsync(int id, string status)
    {
        var request = await _context.ReliefRequests.Include(r => r.AssignedVolunteer).FirstOrDefaultAsync(r => r.Id == id);
        if (request == null) return null;

        request.Status = status;

        if ((status == "Completed" || status == "Resolved" || status == "Cancelled") && request.AssignedVolunteer != null)
        {
            request.AssignedVolunteer.Status = "Active";
        }

        await _context.SaveChangesAsync();
        return request;
    }

    public async Task<Volunteer?> UpdateVolunteerStatusAsync(int id, string status)
    {
        var volunteer = await _context.Volunteers.FindAsync(id);
        if (volunteer == null) return null;

        volunteer.Status = status;
        await _context.SaveChangesAsync();

        return volunteer;
    }

    public async Task<ResourceDonation?> UpdateDonationStatusAsync(int id, string status)
    {
        var donation = await _context.Donations.FindAsync(id);
        if (donation == null) return null;

        donation.Status = status;
        await _context.SaveChangesAsync();

        return donation;
    }

    // ── Admin Hard Deletes ─────────────────────────────────────────────────

    public async Task<(bool Success, string Message)> AdminDeleteRequestAsync(int id)
    {
        var request = await _context.ReliefRequests.FindAsync(id);
        if (request == null) return (false, "Request not found.");

        _context.ReliefRequests.Remove(request);
        await _context.SaveChangesAsync();
        return (true, "Request deleted by admin.");
    }

    public async Task<(bool Success, string Message)> AdminDeleteVolunteerAsync(int id)
    {
        var volunteer = await _context.Volunteers
            .Include(v => v.AssignedRequests)
            .FirstOrDefaultAsync(v => v.Id == id);

        if (volunteer == null) return (false, "Volunteer not found.");

        // Safety: unlink assigned requests before removing
        if (volunteer.Status == "Busy")
            return (false, "Cannot delete a volunteer currently deployed on an active assignment. Update the request status first.");

        foreach (var req in volunteer.AssignedRequests)
            req.AssignedVolunteerId = null;

        _context.Volunteers.Remove(volunteer);
        await _context.SaveChangesAsync();
        return (true, "Volunteer deleted by admin.");
    }

    public async Task<(bool Success, string Message)> AdminDeleteDonationAsync(int id)
    {
        var donation = await _context.Donations.FindAsync(id);
        if (donation == null) return (false, "Donation not found.");

        _context.Donations.Remove(donation);
        await _context.SaveChangesAsync();
        return (true, "Donation deleted by admin.");
    }
}

