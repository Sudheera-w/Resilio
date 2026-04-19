using Resilio.API.Models;

namespace Resilio.API.Interfaces;

public interface IRequestService
{
    Task<ReliefRequest> CreateRequestAsync(ReliefRequest request);
    Task<IEnumerable<ReliefRequest>> GetRequestsAsync();
    Task<ReliefRequest?> GetRequestByIdAsync(int id);
    Task<(bool Success, string Message, ReliefRequest? Request)> UpdateRequestAsync(int id, ReliefRequest updated);
    Task<(bool Success, string Message)> DeleteRequestAsync(int id);
}
