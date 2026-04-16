using Microsoft.AspNetCore.Mvc;
using Resilio.API.Interfaces;

namespace Resilio.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UserController : ControllerBase
{
    private readonly IUserService _userService;

    public UserController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet("dashboard/{contact}")]
    public async Task<IActionResult> GetDashboard(string contact)
    {
        if (string.IsNullOrWhiteSpace(contact)) return BadRequest("Contact is required");

        var dashboardData = await _userService.GetUserDashboardAsync(contact);
        
        return Ok(dashboardData);
    }
}
