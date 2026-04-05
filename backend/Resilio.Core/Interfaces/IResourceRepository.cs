using Resilio.Core.Models;

namespace Resilio.Core.Interfaces;

public interface IResourceRepository
{
    Task<IReadOnlyList<Resource>> GetAllAsync(CancellationToken ct);
    Task<Resource?> GetByIdAsync(int id, CancellationToken ct);
    Task<Resource> CreateAsync(Resource resource, CancellationToken ct);
    Task<Resource> UpdateAsync(Resource resource, CancellationToken ct);
    Task DeleteAsync(int id, CancellationToken ct);
    Task<Resource> AllocateAsync(int id, Guid reliefRequestId, int quantity, CancellationToken ct);
    Task<Resource> ReleaseAsync(int id, CancellationToken ct);
}