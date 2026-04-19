using Microsoft.EntityFrameworkCore;
using Resilio.API.Data;
using Resilio.API.DTOs;
using Resilio.API.Interfaces;

namespace Resilio.API.Services;

public class UserService : IUserService
{
    private readonly ResilioDbContext _context;

    public UserService(ResilioDbContext context)
    {
        _context = context;
    }

    public async Task<UserDashboardDto> GetUserDashboardAsync(string contact)
    {
        var standardizedContact = contact.Trim();

        var requests = await _context.ReliefRequests
            .Where(r => r.Contact == standardizedContact)
            .Include(r => r.AssignedVolunteer)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        var volunteers = await _context.Volunteers
            .Where(v => v.Contact == standardizedContact)
            .Include(v => v.AssignedRequests)
            .OrderByDescending(v => v.CreatedAt)
            .ToListAsync();

        var donations = await _context.Donations
            .Where(d => d.ContactNumber == standardizedContact)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();

        return new UserDashboardDto
        {
            MyRequests = requests,
            MyVolunteerProfiles = volunteers,
            MyDonations = donations
        };
    }
}
