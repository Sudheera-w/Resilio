using Microsoft.EntityFrameworkCore;
using Resilio.API.Models;

namespace Resilio.API.Data;

public class ResilioDbContext : DbContext
{
    public ResilioDbContext(DbContextOptions<ResilioDbContext> options) : base(options) { }

    public DbSet<ReliefRequest> ReliefRequests { get; set; }
    public DbSet<Volunteer> Volunteers { get; set; }
    public DbSet<ResourceDonation> Donations { get; set; }
    public DbSet<OtpRecord> OtpRecords { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure connection between ReliefRequest and Volunteer
        modelBuilder.Entity<ReliefRequest>()
            .HasOne(r => r.AssignedVolunteer)
            .WithMany(v => v.AssignedRequests)
            .HasForeignKey(r => r.AssignedVolunteerId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
