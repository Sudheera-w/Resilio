using Resilio.API.Models;
using Resilio.API.Services;
using System.Threading.Tasks;
using Xunit;

namespace Resilio.API.Tests;

public class UserServiceTests : TestBase
{
    [Fact]
    public async Task GetUserDashboardAsync_ShouldAggregateDataCorrectly()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var service = new UserService(context);
        var contact = "0771122334";

        // Add dummy Request
        context.ReliefRequests.Add(new ReliefRequest
        {
            Contact = contact,
            FullName = "Jane Doe",
            Location = "Colombo",
            HelpType = "Food",
            IsUrgent = true
        });

        // Add dummy Volunteer
        context.Volunteers.Add(new Volunteer
        {
            Contact = contact,
            FullName = "Jane Doe",
            Roles = "Driver"
        });

        // Add dummy Donation
        context.Donations.Add(new ResourceDonation
        {
            ContactNumber = contact,
            ResourceType = "Medicine",
            Quantity = "10 boxes"
        });

        // Add dummy mismatch (should not be gathered)
        context.ReliefRequests.Add(new ReliefRequest
        {
            Contact = "0719998887",
            FullName = "John Mark",
            Location = "Galle",
            HelpType = "Shelter"
        });

        await context.SaveChangesAsync();

        // Act
        var result = await service.GetUserDashboardAsync(contact);

        // Assert
        Assert.NotNull(result);
        Assert.Single(result.MyRequests);
        Assert.Single(result.MyVolunteerProfiles);
        Assert.Single(result.MyDonations);
        var requestsList = System.Linq.Enumerable.ToList(result.MyRequests);
        Assert.Equal("Jane Doe", requestsList[0].FullName);
    }

    [Fact]
    public async Task GetUserDashboardAsync_ShouldHandleMissingDataSafely()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var service = new UserService(context);
        var contact = "nonexistent@user.com";

        // Act
        var result = await service.GetUserDashboardAsync(contact);

        // Assert
        Assert.NotNull(result);
        Assert.Empty(result.MyRequests);
        Assert.Empty(result.MyVolunteerProfiles);
        Assert.Empty(result.MyDonations);
    }
}
