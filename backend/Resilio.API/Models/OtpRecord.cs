namespace Resilio.API.Models;

public class OtpRecord
{
    public int Id { get; set; }
    public string Contact { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public bool IsUsed { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;
}
