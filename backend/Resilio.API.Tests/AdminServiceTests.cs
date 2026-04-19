using Resilio.API.DTOs;
using Resilio.API.Models;
using Resilio.API.Services;
using System.Threading.Tasks;
using Xunit;

namespace Resilio.API.Tests;

public class AdminServiceTests : TestBase
{
    [Fact]
    public async Task AssignVolunteerAsync_ShouldAssignCorrectly()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var service = new AdminService(context);

        var request = new ReliefRequest { FullName = "Victim", HelpType = "Food", Location = "Test" };
        var volunteer = new Volunteer { FullName = "Hero", Roles = "Food", Location = "Test" };
        
        context.ReliefRequests.Add(request);
        context.Volunteers.Add(volunteer);
        await context.SaveChangesAsync();

        // Act
        var result = await service.AssignVolunteerAsync(request.Id, volunteer.Id);

        // Assert
        Assert.True(result.Success);
        var updatedRequest = await context.ReliefRequests.FindAsync(request.Id);
        Assert.NotNull(updatedRequest);  // record must exist after assignment
        Assert.Equal(volunteer.Id, updatedRequest.AssignedVolunteerId);
        Assert.Equal("Assigned", updatedRequest.Status);
    }
}
