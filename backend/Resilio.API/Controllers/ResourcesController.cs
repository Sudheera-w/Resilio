using Microsoft.AspNetCore.Mvc;
using Resilio.Core.DTOs;
using Resilio.Core.Interfaces;
using Resilio.Core.Models;

namespace Resilio.API.Controllers;

[ApiController]
[Route("api/resources")]
public sealed class ResourcesController : ControllerBase
{
    private readonly IResourceRepository _repo;

    public ResourcesController(IResourceRepository repo) => _repo = repo;

    // GET /api/resources
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ResourceResponse>>> GetAll(
        CancellationToken ct)
    {
        var resources = await _repo.GetAllAsync(ct);
        return Ok(resources.Select(ToResponse));
    }

    // POST /api/resources
    [HttpPost]
    public async Task<ActionResult<ResourceResponse>> Create(
        [FromBody] ResourceCreateRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest(new ProblemDetails
            {
                Title  = "Validation error",
                Detail = "Name is required."
            });

        if (request.Quantity < 0)
            return BadRequest(new ProblemDetails
            {
                Title  = "Validation error",
                Detail = "Quantity cannot be negative."
            });

        var resource = new Resource
        {
            Name     = request.Name,
            Category = request.Category,
            Quantity = request.Quantity
        };

        var created = await _repo.CreateAsync(resource, ct);
        return CreatedAtAction(nameof(GetAll), new { }, ToResponse(created));
    }

    // PUT /api/resources/{id}
    [HttpPut("{id:int}")]
    public async Task<ActionResult<ResourceResponse>> Update(
        int id, [FromBody] ResourceUpdateRequest request, CancellationToken ct)
    {
        var existing = await _repo.GetByIdAsync(id, ct);
        if (existing == null)
            return NotFound(new ProblemDetails { Title = "Not found" });

        if (request.Quantity.HasValue && request.Quantity < 0)
            return BadRequest(new ProblemDetails
            {
                Title  = "Validation error",
                Detail = "Quantity cannot be negative."
            });

        try
        {
            var updated = new Resource
            {
                Id       = id,
                Name     = request.Name     ?? existing.Name,
                Category = request.Category ?? existing.Category,
                Quantity = request.Quantity ?? existing.Quantity
            };

            var result = await _repo.UpdateAsync(updated, ct);
            return Ok(ToResponse(result));
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new ProblemDetails { Title = "Not found" });
        }
    }

    // DELETE /api/resources/{id}
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var existing = await _repo.GetByIdAsync(id, ct);
        if (existing == null)
            return NotFound(new ProblemDetails { Title = "Not found" });

        try
        {
            await _repo.DeleteAsync(id, ct);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ProblemDetails
            {
                Title  = "Business rule",
                Detail = ex.Message
            });
        }
    }

    // POST /api/resources/{id}/allocate
    [HttpPost("{id:int}/allocate")]
    public async Task<ActionResult<ResourceResponse>> Allocate(
        int id, [FromBody] ResourceAllocateRequest request, CancellationToken ct)
    {
        try
        {
            var result = await _repo.AllocateAsync(
                id, request.ReliefRequestId, request.AllocatedQuantity, ct);
            return Ok(ToResponse(result));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new ProblemDetails
            {
                Title  = "Not found",
                Detail = ex.Message
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ProblemDetails
            {
                Title  = "Business rule",
                Detail = ex.Message
            });
        }
    }

    // POST /api/resources/{id}/release
    [HttpPost("{id:int}/release")]
    public async Task<ActionResult<ResourceResponse>> Release(
        int id, CancellationToken ct)
    {
        try
        {
            var result = await _repo.ReleaseAsync(id, ct);
            return Ok(ToResponse(result));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new ProblemDetails
            {
                Title  = "Not found",
                Detail = ex.Message
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ProblemDetails
            {
                Title  = "Business rule",
                Detail = ex.Message
            });
        }
    }

    // helper
    private static ResourceResponse ToResponse(Resource r) => new(
        r.Id,
        r.Name,
        r.Category,
        r.Quantity,
        r.AllocationStatus,
        r.AllocatedRequestId,
        r.CreatedAt,
        r.UpdatedAt
    );
}