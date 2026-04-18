using Resilio.API.Models;
using Resilio.API.Services;
using System.Threading.Tasks;
using Xunit;

namespace Resilio.API.Tests;

public class DonationServiceTests : TestBase
{
    [Fact]
    public async Task CreateDonationAsync_ShouldSaveToDatabase()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var service = new DonationService(context);

        var donation = new ResourceDonation
        {
            DonorName = "Philanthropist",
            ContactNumber = "999888777",
            ResourceType = "Vehicle",
            Quantity = "1 Van",
            Location = "Colombo",
            Status = "Pending"
        };

        // Act
        var result = await service.CreateDonationAsync(donation);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Pending", result.Status);
        Assert.Equal("Philanthropist", result.DonorName);
    }
}
