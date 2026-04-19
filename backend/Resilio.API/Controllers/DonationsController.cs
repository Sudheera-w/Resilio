using Microsoft.AspNetCore.Mvc;
using Resilio.API.Interfaces;
using Resilio.API.Models;

namespace Resilio.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class DonationsController : ControllerBase
{
    private readonly IDonationService _donationService;

    public DonationsController(IDonationService donationService)
    {
        _donationService = donationService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateDonation([FromBody] ResourceDonation donation)
    {
        var createdDonation = await _donationService.CreateDonationAsync(donation);
        return Ok(new { message = "Donation pledge created successfully", data = createdDonation });
    }

    [HttpGet]
    public async Task<IActionResult> GetDonations()
    {
        var donations = await _donationService.GetDonationsAsync();
        return Ok(donations);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetDonation(int id)
    {
        var donation = await _donationService.GetDonationByIdAsync(id);
        if (donation == null) return NotFound(new { message = "Donation not found." });
        return Ok(donation);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateDonation(int id, [FromBody] ResourceDonation updated)
    {
        var (success, message, donation) = await _donationService.UpdateDonationAsync(id, updated);
        if (!success) return Conflict(new { message });
        return Ok(new { message, data = donation });
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteDonation(int id)
    {
        var (success, message) = await _donationService.DeleteDonationAsync(id);
        if (!success) return Conflict(new { message });
        return Ok(new { message });
    }
}

