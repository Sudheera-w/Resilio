using Resilio.API.Models;
using Resilio.API.Services;
using System.Threading.Tasks;
using Xunit;
using System.Linq;

namespace Resilio.API.Tests;

public class RequestServiceTests : TestBase
{
    [Fact]
    public async Task CreateRequestAsync_ShouldSaveToDatabase()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var service = new RequestService(context);

        var request = new ReliefRequest
        {
            FullName = "Test Victim",
            Contact = "111222333",
            Location = "Test City",
            HelpType = "Medicine",
            IsUrgent = true,
            Status = "Pending"
        };

        // Act
        var result = await service.CreateRequestAsync(request);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Pending", result.Status);
        
        var requests = Enumerable.ToList(await service.GetRequestsAsync());
        Assert.Single(requests);
    }
}
