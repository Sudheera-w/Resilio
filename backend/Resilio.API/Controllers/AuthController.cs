using Microsoft.AspNetCore.Mvc;
using Resilio.API.DTOs;
using Resilio.API.Interfaces;

namespace Resilio.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("send-otp")]
    public async Task<IActionResult> SendOtp([FromBody] SendOtpRequest request)
    {
        if (string.IsNullOrEmpty(request.Contact)) return BadRequest("Contact is required.");

        var code = await _authService.GenerateAndSaveOtpAsync(request.Contact);

        return Ok(new { message = "OTP generated successfully.", mockCode = code });
    }

    [HttpPost("verify-otp")]
    public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpRequest request)
    {
        var result = await _authService.VerifyOtpAsync(request.Contact, request.Code);

        if (!result.IsValid)
            return BadRequest(new { message = result.Message });

        return Ok(new { message = result.Message });
    }
}
