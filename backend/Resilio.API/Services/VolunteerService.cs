using Microsoft.EntityFrameworkCore;
using Resilio.API.Data;
using Resilio.API.Interfaces;
using Resilio.API.Models;

namespace Resilio.API.Services;

public class VolunteerService : IVolunteerService
{
    private readonly ResilioDbContext _context;

    public VolunteerService(ResilioDbContext context)
    {
        _context = context;
    }

    public async Task<Volunteer> CreateVolunteerAsync(Volunteer volunteer)
    {
        _context.Volunteers.Add(volunteer);
        await _context.SaveChangesAsync();
        return volunteer;
    }

    public async Task<IEnumerable<Volunteer>> GetVolunteersAsync()
    {
        return await _context.Volunteers
            .OrderByDescending(v => v.CreatedAt)
            .ToListAsync();
    }

    public async Task<Volunteer?> GetVolunteerByIdAsync(int id)
    {
        return await _context.Volunteers
            .Include(v => v.AssignedRequests)
            .FirstOrDefaultAsync(v => v.Id == id);
    }

    public async Task<(bool Success, string Message, Volunteer? Volunteer)> UpdateVolunteerAsync(int id, Volunteer updated)
    {
        var volunteer = await _context.Volunteers.FindAsync(id);
        if (volunteer == null)
            return (false, "Volunteer not found.", null);

        // Blocked volunteers cannot update their profile
        if (volunteer.Status == "Blocked")
            return (false, "Your account is blocked. Contact the admin.", null);

        // Update editable profile fields
        volunteer.FullName         = updated.FullName;
        volunteer.Contact          = updated.Contact;
        volunteer.Roles            = updated.Roles;
        volunteer.Availability     = updated.Availability;
        volunteer.HasVehicle       = updated.HasVehicle;
        volunteer.VehicleType      = updated.VehicleType;
        volunteer.Location         = updated.Location;
        volunteer.InstantAvailable = updated.InstantAvailable;

        await _context.SaveChangesAsync();
        return (true, "Volunteer profile updated.", volunteer);
    }

    public async Task<(bool Success, string Message)> DeleteVolunteerAsync(int id)
    {
        var volunteer = await _context.Volunteers
            .Include(v => v.AssignedRequests)
            .FirstOrDefaultAsync(v => v.Id == id);

        if (volunteer == null)
            return (false, "Volunteer not found.");

        // Cannot withdraw while actively deployed on an assignment
        if (volunteer.Status == "Busy")
            return (false, "Cannot withdraw while you are currently deployed on an assignment. Complete your active task first.");

        // Unlink any previously assigned-but-now-completed requests
        foreach (var req in volunteer.AssignedRequests.Where(r => r.Status != "Pending"))
            req.AssignedVolunteerId = null;

        _context.Volunteers.Remove(volunteer);
        await _context.SaveChangesAsync();
        return (true, "Volunteer registration withdrawn.");
    }
}

