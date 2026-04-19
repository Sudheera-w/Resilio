using Microsoft.AspNetCore.Mvc;
using Resilio.API.DTOs;
using Resilio.API.Interfaces;

namespace Resilio.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboardStats()
    {
        var stats = await _adminService.GetDashboardStatsAsync();
        return Ok(stats);
    }

    [HttpPut("request/{id}/prioritize")]
    public async Task<IActionResult> UpdatePriority(int id, [FromBody] UpdatePriorityDto dto)
    {
        var request = await _adminService.UpdateRequestPriorityAsync(id, dto.Priority);
        if (request == null) return NotFound("Request not found");
        return Ok(request);
    }

    [HttpPut("request/{id}/assign")]
    public async Task<IActionResult> AssignVolunteer(int id, [FromBody] AssignVolunteerDto dto)
    {
        var result = await _adminService.AssignVolunteerAsync(id, dto.VolunteerId);
        if (!result.Success) return NotFound(result.Message);

        return Ok(new { message = result.Message, request = result.Request, volunteer = result.Volunteer });
    }

    [HttpPut("request/{id}/status")]
    public async Task<IActionResult> UpdateRequestStatus(int id, [FromBody] UpdateStatusDto dto)
    {
        var request = await _adminService.UpdateRequestStatusAsync(id, dto.Status);
        if (request == null) return NotFound("Request not found");
        return Ok(request);
    }

    [HttpPut("volunteer/{id}/status")]
    public async Task<IActionResult> UpdateVolunteerStatus(int id, [FromBody] UpdateStatusDto dto)
    {
        var volunteer = await _adminService.UpdateVolunteerStatusAsync(id, dto.Status);
        if (volunteer == null) return NotFound("Volunteer not found");
        return Ok(volunteer);
    }

    [HttpPut("donation/{id}/status")]
    public async Task<IActionResult> UpdateDonationStatus(int id, [FromBody] UpdateStatusDto dto)
    {
        var donation = await _adminService.UpdateDonationStatusAsync(id, dto.Status);
        if (donation == null) return NotFound();
        return Ok(donation);
    }

    // ── Admin Hard Deletes ─────────────────────────────────────────────────

    [HttpDelete("request/{id}")]
    public async Task<IActionResult> AdminDeleteRequest(int id)
    {
        var (success, message) = await _adminService.AdminDeleteRequestAsync(id);
        if (!success) return Conflict(new { message });
        return Ok(new { message });
    }

    [HttpDelete("volunteer/{id}")]
    public async Task<IActionResult> AdminDeleteVolunteer(int id)
    {
        var (success, message) = await _adminService.AdminDeleteVolunteerAsync(id);
        if (!success) return Conflict(new { message });
        return Ok(new { message });
    }

    [HttpDelete("donation/{id}")]
    public async Task<IActionResult> AdminDeleteDonation(int id)
    {
        var (success, message) = await _adminService.AdminDeleteDonationAsync(id);
        if (!success) return Conflict(new { message });
        return Ok(new { message });
    }
}

