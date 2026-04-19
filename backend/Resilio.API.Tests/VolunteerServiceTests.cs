using Resilio.API.Models;
using Resilio.API.Services;
using System.Threading.Tasks;
using Xunit;

namespace Resilio.API.Tests;

public class VolunteerServiceTests : TestBase
{
    [Fact]
    public async Task CreateVolunteerAsync_ShouldSaveToDatabase()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var service = new VolunteerService(context);

        var volunteer = new Volunteer
        {
            FullName = "Ready Action",
            Contact = "55555555",
            Roles = "Rescue Support",
            Availability = "Full-time",
            HasVehicle = "Yes",
            VehicleType = "Truck",
            Location = "Galle",
            InstantAvailable = true,
            Status = "Available"
        };

        // Act
        var result = await service.CreateVolunteerAsync(volunteer);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Rescue Support", result.Roles);
        Assert.Equal("Available", result.Status);
    }
}
