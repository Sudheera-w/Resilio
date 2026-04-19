using Microsoft.EntityFrameworkCore;
using Resilio.API.Data;
using Resilio.API.Interfaces;
using Resilio.API.Models;

namespace Resilio.API.Services;

public class AuthService : IAuthService
{
    private readonly ResilioDbContext _context;

    public AuthService(ResilioDbContext context)
    {
        _context = context;
    }

    public async Task<string> GenerateAndSaveOtpAsync(string contact)
    {
        // Hardcoded OTP for temporary testing
        string code = "123456";

        var otpRecord = new OtpRecord
        {
            Contact = contact,
            Code = code,
            ExpiresAt = DateTime.Now.AddMinutes(10),
            IsUsed = false
        };

        _context.OtpRecords.Add(otpRecord);
        await _context.SaveChangesAsync();

        return code;
    }

    public async Task<(bool IsValid, string Message)> VerifyOtpAsync(string contact, string code)
    {
        var record = await _context.OtpRecords
            .Where(o => o.Contact == contact && o.Code == code && !o.IsUsed)
            .OrderByDescending(o => o.ExpiresAt) 
            .FirstOrDefaultAsync();

        if (record == null)
            return (false, "Invalid OTP code.");

        if (record.ExpiresAt < DateTime.Now)
            return (false, "OTP code has expired.");

        record.IsUsed = true;
        await _context.SaveChangesAsync();

        return (true, "OTP verified successfully.");
    }
}
