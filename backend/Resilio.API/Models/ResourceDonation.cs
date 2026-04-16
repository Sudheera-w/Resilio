namespace Resilio.API.Models;

public class ResourceDonation
{
    public int Id { get; set; }
    public string ResourceType { get; set; } = string.Empty; // Food, Medicine, Clothes, Vehicle, Other
    public string Quantity { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string DonorName { get; set; } = string.Empty;
    public string ContactNumber { get; set; } = string.Empty;
    public string ContactMethod { get; set; } = "Mobile";

    // Dynamic fields depending on resource type
    public string? ExpiryDate { get; set; }
    public string? FoodType { get; set; }
    public string? ItemName { get; set; }
    public string? MedicineType { get; set; }
    public string? ClothingType { get; set; }
    public string? Size { get; set; }
    public string? VehicleType { get; set; }
    public string? VehicleCapacity { get; set; }
    public string? AvailableTime { get; set; }
    public string? OtherDetails { get; set; }
    public bool PickupRequired { get; set; }
    public string? Availability { get; set; }

    public string Status { get; set; } = "Pending";
    public DateTime CreatedAt { get; set; } = DateTime.Now;
}
