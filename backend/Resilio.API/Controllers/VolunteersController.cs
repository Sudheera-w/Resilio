using Microsoft.AspNetCore.Mvc;
using Resilio.API.Interfaces;
using Resilio.API.Models;

namespace Resilio.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class VolunteersController : ControllerBase
{
    private readonly IVolunteerService _volunteerService;

    public VolunteersController(IVolunteerService volunteerService)
    {
        _volunteerService = volunteerService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateVolunteer([FromBody] Volunteer volunteer)
    {
        var createdVolunteer = await _volunteerService.CreateVolunteerAsync(volunteer);
        return Ok(new { message = "Volunteer registered successfully", data = createdVolunteer });
    }

    [HttpGet]
    public async Task<IActionResult> GetVolunteers()
    {
        var volunteers = await _volunteerService.GetVolunteersAsync();
        return Ok(volunteers);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetVolunteer(int id)
    {
        var volunteer = await _volunteerService.GetVolunteerByIdAsync(id);
        if (volunteer == null) return NotFound(new { message = "Volunteer not found." });
        return Ok(volunteer);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateVolunteer(int id, [FromBody] Volunteer updated)
    {
        var (success, message, volunteer) = await _volunteerService.UpdateVolunteerAsync(id, updated);
        if (!success) return Conflict(new { message });
        return Ok(new { message, data = volunteer });
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteVolunteer(int id)
    {
        var (success, message) = await _volunteerService.DeleteVolunteerAsync(id);
        if (!success) return Conflict(new { message });
        return Ok(new { message });
    }
}

