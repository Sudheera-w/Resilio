using Microsoft.EntityFrameworkCore;
using Resilio.API.Data;
using Resilio.API.Interfaces;
using Resilio.API.Models;

namespace Resilio.API.Services;

public class RequestService : IRequestService
{
    private readonly ResilioDbContext _context;

    public RequestService(ResilioDbContext context)
    {
        _context = context;
    }

    public async Task<ReliefRequest> CreateRequestAsync(ReliefRequest request)
    {
        _context.ReliefRequests.Add(request);
        await _context.SaveChangesAsync();
        return request;
    }

    public async Task<IEnumerable<ReliefRequest>> GetRequestsAsync()
    {
        return await _context.ReliefRequests
            .Include(r => r.AssignedVolunteer)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    public async Task<ReliefRequest?> GetRequestByIdAsync(int id)
    {
        return await _context.ReliefRequests
            .Include(r => r.AssignedVolunteer)
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task<(bool Success, string Message, ReliefRequest? Request)> UpdateRequestAsync(int id, ReliefRequest updated)
    {
        var request = await _context.ReliefRequests.FindAsync(id);
        if (request == null)
            return (false, "Request not found.", null);

        // Business rule: only Pending requests can be edited by the user
        if (request.Status != "Pending")
            return (false, $"Cannot edit a request with status '{request.Status}'. Only Pending requests can be modified.", null);

        // Update only editable fields — preserve system fields
        request.FullName    = updated.FullName;
        request.Contact     = updated.Contact;
        request.Location    = updated.Location;
        request.HelpType    = updated.HelpType;
        request.Note        = updated.Note;
        request.IsUrgent    = updated.IsUrgent;

        await _context.SaveChangesAsync();
        return (true, "Request updated successfully.", request);
    }

    public async Task<(bool Success, string Message)> DeleteRequestAsync(int id)
    {
        var request = await _context.ReliefRequests.FindAsync(id);
        if (request == null)
            return (false, "Request not found.");

        // Business rule: cannot delete a request that has an active volunteer assigned
        if (request.Status == "Assigned")
            return (false, "Cannot cancel a request that already has a volunteer assigned. Update the status to 'Cancelled' first.");

        if (request.Status == "Completed")
            return (false, "Cannot delete a completed request.");

        _context.ReliefRequests.Remove(request);
        await _context.SaveChangesAsync();
        return (true, "Request cancelled and removed.");
    }
}

