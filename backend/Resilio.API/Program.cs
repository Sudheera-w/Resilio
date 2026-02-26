// var builder = WebApplication.CreateBuilder(args);

// // Add controllers
// builder.Services.AddControllers();

// // Add Swagger
// builder.Services.AddEndpointsApiExplorer();
// builder.Services.AddSwaggerGen(c =>
// {
//     c.SwaggerDoc("v1", new() 
//     { 
//         Title = "Resilio API", 
//         Version = "v1",
//         Description = "Disaster Relief Resource Management System API"
//     });
// });

// var app = builder.Build();

// // Enable Swagger
// app.UseSwagger();
// app.UseSwaggerUI(c =>
// {
//     c.SwaggerEndpoint("/swagger/v1/swagger.json", "Resilio API v1");
//     c.RoutePrefix = "swagger"; // Access at http://localhost:5000/swagger
// });

// app.UseHttpsRedirection();
// app.MapControllers();

// // Health check endpoint
// app.MapGet("/api/health", () => Results.Ok(new { status = "healthy", app = "Resilio" }));

// //database connection test
// app.MapGet("/api/test-db", async () =>
// {
//     try
//     {
//         var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
//         using var connection = new Microsoft.Data.SqlClient.SqlConnection(connectionString);
//         await connection.OpenAsync();
//         return Results.Ok(new { status = "Database connected!", server = connection.DataSource });
//     }
//     catch (Exception ex)
//     {
//         return Results.Problem("Database connection failed: " + ex.Message);
//     }
// });

// app.Run();

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Resilio.API.Services;
using Resilio.Core.Interfaces;
using Resilio.Infrastructure.Data;
using Resilio.Infrastructure.Repositories;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// DI: Infrastructure
builder.Services.AddSingleton<IDbConnectionFactory, SqlConnectionFactory>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IOtpRepository, OtpRepository>();
builder.Services.AddScoped<IAuditLogRepository, AuditLogRepository>();

// DI: Services
builder.Services.AddSingleton<IOtpGenerator, OtpGenerator>();
builder.Services.AddSingleton<IOtpHasher>(sp =>
{
    var cfg = sp.GetRequiredService<IConfiguration>();
    var secret = cfg["Otp:HmacSecret"] ?? throw new InvalidOperationException("Otp:HmacSecret missing.");
    return new OtpHasher(secret);
});
builder.Services.AddSingleton<IJwtTokenService, JwtTokenService>();
builder.Services.AddScoped<IAuthService, AuthService>();

// JWT Auth
var jwtKey = builder.Configuration["Auth:JwtKey"] ?? throw new InvalidOperationException("Auth:JwtKey missing.");
var issuer = builder.Configuration["Auth:JwtIssuer"] ?? "Resilio";
var audience = builder.Configuration["Auth:JwtAudience"] ?? "ResilioClient";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = issuer,
            ValidateAudience = true,
            ValidAudience = audience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ValidateLifetime = true
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();