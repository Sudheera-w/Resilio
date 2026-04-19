using Resilio.API.Models;
using Resilio.API.Services;
using System;
using System.Threading.Tasks;
using Xunit;
using Microsoft.EntityFrameworkCore;

namespace Resilio.API.Tests;

public class AuthServiceTests : TestBase
{
    [Fact]
    public async Task GenerateAndSaveOtpAsync_ShouldCreateOtpRecord()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var service = new AuthService(context);
        var contact = "0712345678";

        // Act
        var result = await service.GenerateAndSaveOtpAsync(contact);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("123456", result);

        // Verify saved to database
        var savedRecord = await context.OtpRecords.FirstOrDefaultAsync(o => o.Contact == contact);
        Assert.NotNull(savedRecord);
    }

    [Fact]
    public async Task VerifyOtpAsync_ShouldReturnTrue_WhenCodeIsValid()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var service = new AuthService(context);
        var contact = "john@example.com";
        var code = "123456";

        var otpRecord = new OtpRecord
        {
            Contact = contact,
            Code = code,
            ExpiresAt = DateTime.Now.AddMinutes(5),
            IsUsed = false
        };
        context.OtpRecords.Add(otpRecord);
        await context.SaveChangesAsync();

        // Act
        var (isValid, message) = await service.VerifyOtpAsync(contact, code);

        // Assert
        Assert.True(isValid);
    }
}
