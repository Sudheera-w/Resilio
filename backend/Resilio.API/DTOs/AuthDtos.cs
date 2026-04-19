namespace Resilio.API.DTOs;

public class SendOtpRequest 
{ 
    public string Contact { get; set; } = string.Empty; 
}

public class VerifyOtpRequest 
{ 
    public string Contact { get; set; } = string.Empty; 
    public string Code { get; set; } = string.Empty; 
}
