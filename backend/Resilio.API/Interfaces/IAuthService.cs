namespace Resilio.API.Interfaces;

public interface IAuthService
{
    Task<string> GenerateAndSaveOtpAsync(string contact);
    Task<(bool IsValid, string Message)> VerifyOtpAsync(string contact, string code);
}
