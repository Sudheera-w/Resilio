using Resilio.API.Models;

namespace Resilio.API.Interfaces;

public interface IDonationService
{
    Task<ResourceDonation> CreateDonationAsync(ResourceDonation donation);
    Task<IEnumerable<ResourceDonation>> GetDonationsAsync();
    Task<ResourceDonation?> GetDonationByIdAsync(int id);
    Task<(bool Success, string Message, ResourceDonation? Donation)> UpdateDonationAsync(int id, ResourceDonation updated);
    Task<(bool Success, string Message)> DeleteDonationAsync(int id);
}
