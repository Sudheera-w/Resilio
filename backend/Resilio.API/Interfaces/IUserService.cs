using Resilio.API.DTOs;

namespace Resilio.API.Interfaces;

public interface IUserService
{
    Task<UserDashboardDto> GetUserDashboardAsync(string contact);
}
