using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Resilio.API.Services;
using Resilio.Core.Interfaces;
using Resilio.Infrastructure.Data;
using Resilio.Infrastructure.Repositories;
using System.Text;
using Resilio.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// DI: Infrastructure
builder.Services.AddSingleton<IDbConnectionFactory, SqlConnectionFactory>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IOtpRepository, OtpRepository>();
builder.Services.AddScoped<IAuditLogRepository, AuditLogRepository>();
builder.Services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
builder.Services.AddScoped<IVictimProfileRepository, VictimProfileRepository>();
builder.Services.AddScoped<IVolunteerProfileRepository, VolunteerProfileRepository>();
builder.Services.AddScoped<IReliefRequestRepository, ReliefRequestRepository>();
builder.Services.AddScoped<IReliefRequestService, ReliefRequestService>();
builder.Services.AddScoped<IResourceRepository, ResourceRepository>(); // ← YOUR NEW LINE

// DI: Services
builder.Services.AddSingleton<IOtpGenerator, OtpGenerator>();
builder.Services.AddSingleton<IRefreshTokenGenerator, RefreshTokenGenerator>();
builder.Services.AddSingleton<IOtpHasher>(sp =>
{
    var cfg = sp.GetRequiredService<IConfiguration>();
    var secret = cfg["Otp:HmacSecret"] 
        ?? throw new InvalidOperationException("Otp:HmacSecret missing.");
    return new OtpHasher(secret);
});
builder.Services.AddSingleton<ITokenHasher>(sp =>
{
    var cfg = sp.GetRequiredService<IConfiguration>();
    var secret = cfg["TokenHashing:HmacSecret"]
        ?? throw new InvalidOperationException("TokenHashing:HmacSecret missing.");
    return new TokenHasher(secret);
});
builder.Services.AddSingleton<IJwtTokenService, JwtTokenService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IProfileService, ProfileService>();
builder.Services.AddScoped<IEmailSender, GmailEmailSender>();

// JWT Auth
var jwtKey = builder.Configuration["Auth:JwtKey"] 
    ?? throw new InvalidOperationException("Auth:JwtKey missing.");
var issuer   = builder.Configuration["Auth:JwtIssuer"]   ?? "Resilio";
var audience = builder.Configuration["Auth:JwtAudience"] ?? "ResilioClient";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer           = true,
            ValidIssuer              = issuer,
            ValidateAudience         = true,
            ValidAudience            = audience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey         = new SymmetricSecurityKey(
                                           Encoding.UTF8.GetBytes(jwtKey)),
            ValidateLifetime         = true
        };
    });

builder.Services.AddAuthorization();

var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? Array.Empty<string>();
if (allowedOrigins.Length == 0)
    throw new InvalidOperationException("Configure Cors:AllowedOrigins (see appsettings or Azure App Settings).");

builder.Services.AddCors(options =>
{
    options.AddPolicy("ApiCors", policy =>
        policy
            .WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod());
});

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();

app.UseCors("ApiCors");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Health check endpoint
app.MapGet("/api/health", () => Results.Ok(new { status = "healthy", app = "Resilio" }));

// Database connection test
app.MapGet("/api/test-db", async () =>
{
    try
    {
        var connectionString = builder.Configuration
            .GetConnectionString("DefaultConnection");
        using var connection = new Microsoft.Data.SqlClient
            .SqlConnection(connectionString);
        await connection.OpenAsync();
        return Results.Ok(new { 
            status = "Database connected!", 
            server = connection.DataSource 
        });
    }
    catch (Exception ex)
    {
        return Results.Problem("Database connection failed: " + ex.Message);
    }
});

app.Run();