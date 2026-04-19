using Microsoft.AspNetCore.Mvc;
using Resilio.API.Interfaces;
using Resilio.API.Models;

namespace Resilio.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class RequestsController : ControllerBase
{
    private readonly IRequestService _requestService;

    public RequestsController(IRequestService requestService)
    {
        _requestService = requestService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateRequest([FromBody] ReliefRequest request)
    {
        var createdRequest = await _requestService.CreateRequestAsync(request);
        return Ok(new { message = "Relief request created successfully", data = createdRequest });
    }

    [HttpGet]
    public async Task<IActionResult> GetRequests()
    {
        var requests = await _requestService.GetRequestsAsync();
        return Ok(requests);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetRequest(int id)
    {
        var request = await _requestService.GetRequestByIdAsync(id);
        if (request == null) return NotFound(new { message = "Request not found." });
        return Ok(request);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateRequest(int id, [FromBody] ReliefRequest updated)
    {
        var (success, message, request) = await _requestService.UpdateRequestAsync(id, updated);
        if (!success) return Conflict(new { message });
        return Ok(new { message, data = request });
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteRequest(int id)
    {
        var (success, message) = await _requestService.DeleteRequestAsync(id);
        if (!success) return Conflict(new { message });
        return Ok(new { message });
    }
}

