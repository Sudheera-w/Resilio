using Microsoft.EntityFrameworkCore;
using Resilio.API.Data;
using Resilio.API.Interfaces;
using Resilio.API.Models;

namespace Resilio.API.Services;

public class DonationService : IDonationService
{
    private readonly ResilioDbContext _context;

    public DonationService(ResilioDbContext context)
    {
        _context = context;
    }

    public async Task<ResourceDonation> CreateDonationAsync(ResourceDonation donation)
    {
        _context.Donations.Add(donation);
        await _context.SaveChangesAsync();
        return donation;
    }

    public async Task<IEnumerable<ResourceDonation>> GetDonationsAsync()
    {
        return await _context.Donations
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();
    }

    public async Task<ResourceDonation?> GetDonationByIdAsync(int id)
    {
        return await _context.Donations.FindAsync(id);
    }

    public async Task<(bool Success, string Message, ResourceDonation? Donation)> UpdateDonationAsync(int id, ResourceDonation updated)
    {
        var donation = await _context.Donations.FindAsync(id);
        if (donation == null)
            return (false, "Donation not found.", null);

        // Business rule: only Pending donations can be edited
        if (donation.Status != "Pending")
            return (false, $"Cannot edit a donation with status '{donation.Status}'. Only Pending donations can be modified.", null);

        // Update editable fields
        donation.ResourceType    = updated.ResourceType;
        donation.Quantity        = updated.Quantity;
        donation.Location        = updated.Location;
        donation.DonorName       = updated.DonorName;
        donation.ContactNumber   = updated.ContactNumber;
        donation.ContactMethod   = updated.ContactMethod;
        donation.ExpiryDate      = updated.ExpiryDate;
        donation.FoodType        = updated.FoodType;
        donation.ItemName        = updated.ItemName;
        donation.MedicineType    = updated.MedicineType;
        donation.ClothingType    = updated.ClothingType;
        donation.Size            = updated.Size;
        donation.VehicleType     = updated.VehicleType;
        donation.VehicleCapacity = updated.VehicleCapacity;
        donation.AvailableTime   = updated.AvailableTime;
        donation.OtherDetails    = updated.OtherDetails;
        donation.PickupRequired  = updated.PickupRequired;
        donation.Availability    = updated.Availability;

        await _context.SaveChangesAsync();
        return (true, "Donation updated successfully.", donation);
    }

    public async Task<(bool Success, string Message)> DeleteDonationAsync(int id)
    {
        var donation = await _context.Donations.FindAsync(id);
        if (donation == null)
            return (false, "Donation not found.");

        // Business rule: cannot retract an already-approved donation (resources may be deployed)
        if (donation.Status == "Approved")
            return (false, "Cannot cancel an already approved donation. Contact the admin if needed.");

        _context.Donations.Remove(donation);
        await _context.SaveChangesAsync();
        return (true, "Donation pledge cancelled.");
    }
}

