using Microsoft.EntityFrameworkCore;
using Resilio.API.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler =
            System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Health checks
builder.Services.AddHealthChecks()
    .AddDbContextCheck<ResilioDbContext>();

// Database connection - Azure SQL / SQL Server
builder.Services.AddDbContext<ResilioDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        var allowedOrigins = builder.Configuration
            .GetSection("AllowedOrigins")
            .Get<string[]>() ?? Array.Empty<string>();

        var origins = new List<string> { "http://localhost:5173" };
        origins.AddRange(allowedOrigins);

        policy
            .WithOrigins(origins.ToArray())
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddScoped<Resilio.API.Interfaces.IAdminService, Resilio.API.Services.AdminService>();
builder.Services.AddScoped<Resilio.API.Interfaces.IAuthService, Resilio.API.Services.AuthService>();
builder.Services.AddScoped<Resilio.API.Interfaces.IDonationService, Resilio.API.Services.DonationService>();
builder.Services.AddScoped<Resilio.API.Interfaces.IRequestService, Resilio.API.Services.RequestService>();
builder.Services.AddScoped<Resilio.API.Interfaces.IVolunteerService, Resilio.API.Services.VolunteerService>();
builder.Services.AddScoped<Resilio.API.Interfaces.IUserService, Resilio.API.Services.UserService>();

var app = builder.Build();

// Ensure DB schema is applied in development (Azure SQL or local) so writes don't fail due to missing tables.
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<ResilioDbContext>();
    db.Database.Migrate();
}

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Dev runs on http://localhost:5209; redirecting to HTTPS breaks Vite proxy calls.
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors("AllowFrontend");

// Serve frontend files from wwwroot
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseAuthorization();

app.MapControllers();

// Simple health endpoint
app.MapGet("/health", () => Results.Ok("Healthy"));

// Fallback for React routes like /login, /signup, /dashboard
app.MapFallbackToFile("index.html");

app.Run();