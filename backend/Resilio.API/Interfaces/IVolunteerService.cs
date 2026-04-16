using Resilio.API.Models;

namespace Resilio.API.Interfaces;

public interface IVolunteerService
{
    Task<Volunteer> CreateVolunteerAsync(Volunteer volunteer);
    Task<IEnumerable<Volunteer>> GetVolunteersAsync();
    Task<Volunteer?> GetVolunteerByIdAsync(int id);
    Task<(bool Success, string Message, Volunteer? Volunteer)> UpdateVolunteerAsync(int id, Volunteer updated);
    Task<(bool Success, string Message)> DeleteVolunteerAsync(int id);
}
