import React, { useState } from "react";
import { useNetwork } from "../../context/useNetwork";
import { addToSyncQueue } from "../../utils/SyncManager";
import { API_BASE } from "../../utils/api";
import "./ResourceDonation.css";
import logo from "../../assets/Landing_Page/Logo.png";
import bgImage from "../../assets/Background-Request.png";
import { useNavigate } from "react-router-dom";

export default function ResourceDonationPage() {
    const { isOnline } = useNetwork();
    const [selectedType, setSelectedType] = useState("Food");
    const [locationMode, setLocationMode] = useState("manual");
    const [isFetchingLocation, setIsFetchingLocation] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        resourceType: "Food",
        itemName: "",
        foodType: "",
        quantity: "",
        expiryDate: "",
        medicineType: "",
        clothingType: "",
        size: "",
        vehicleType: "",
        vehicleCapacity: "",
        availableTime: "",
        otherDetails: "",
        pickupRequired: false,
        availability: "Available Immediately",
        location: "",
        donorName: "",
        contactNumber: "",
        contactMethod: "Mobile",
    });

    const resourceTypes = [
        { name: "Food", icon: "🍱", description: "Meals, dry rations, and essential food items" },
        { name: "Medicine", icon: "💊", description: "Medical supplies and health essentials" },
        { name: "Clothes", icon: "👕", description: "Wearable items and protective clothing" },
        { name: "Vehicle", icon: "🚚", description: "Transport support for relief operations" },
        { name: "Other", icon: "📦", description: "Any other useful resource for disaster support" },
    ];

    const handleTypeSelect = (type) => {
        setSelectedType(type);
        setFormData((prev) => ({
            ...prev,
            resourceType: type,
        }));
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleUseCurrentLocation = () => {
        setLocationMode("current");

        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }

        setIsFetchingLocation(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude.toFixed(5);
                const lng = position.coords.longitude.toFixed(5);

                setFormData((prev) => ({
                    ...prev,
                    location: `Lat: ${lat}, Lng: ${lng}`,
                }));

                setIsFetchingLocation(false);
            },
            () => {
                alert("Unable to retrieve your current location.");
                setIsFetchingLocation(false);
            }
        );
    };

    const handleManualLocation = () => {
        setLocationMode("manual");
        setFormData((prev) => ({
            ...prev,
            location: "",
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.resourceType) {
            alert("Please select a resource type.");
            return;
        }

        if (!formData.quantity.trim()) {
            alert("Please enter the quantity.");
            return;
        }

        if (!formData.location.trim()) {
            alert("Please provide the donation location.");
            return;
        }

        if (!isOnline) {
            await addToSyncQueue(`${API_BASE}/api/Donations`, formData, false);
            alert("You are offline. Your donation form is saved safely and will sync when the internet returns!");
            setSubmitted(true);
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/api/Donations`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error("Failed to submit donation.");
            }

            console.log("Donation data submitted successfully.");
            setSubmitted(true);
        } catch (error) {
            console.error("Error submitting donation:", error);
            alert("An error occurred. Please try again.");
        }
    };

    const handleDonateAnother = () => {
        setSubmitted(false);
        setSelectedType("Food");
        setLocationMode("manual");
        setFormData({
            resourceType: "Food",
            itemName: "",
            foodType: "",
            quantity: "",
            expiryDate: "",
            medicineType: "",
            clothingType: "",
            size: "",
            vehicleType: "",
            vehicleCapacity: "",
            availableTime: "",
            otherDetails: "",
            pickupRequired: false,
            availability: "Available Immediately",
            location: "",
            donorName: "",
            contactNumber: "",
            contactMethod: "Mobile",
        });
    };

    const renderDynamicFields = () => {
        switch (selectedType) {
            case "Food":
                return (
                    <>
                        <div className="formGroup">
                            <label className="formLabel">Food Category</label>
                            <select
                                name="foodType"
                                className="formSelect"
                                value={formData.foodType}
                                onChange={handleChange}
                            >
                                <option value="">Select food category</option>
                                <option value="Dry Rations">Dry Rations</option>
                                <option value="Cooked Food">Cooked Food</option>
                                <option value="Packaged Food">Packaged Food</option>
                                <option value="Drinking Water">Drinking Water</option>
                            </select>
                        </div>

                        <div className="formGroup">
                            <label className="formLabel">Item Name</label>
                            <input
                                type="text"
                                name="itemName"
                                className="formInput"
                                placeholder="Enter item name"
                                value={formData.itemName}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="formRow">
                            <div className="formGroup">
                                <label className="formLabel">Quantity</label>
                                <input
                                    type="text"
                                    name="quantity"
                                    className="formInput"
                                    placeholder="e.g. 50 packs"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="formGroup">
                                <label className="formLabel">Expiry Date (Optional)</label>
                                <input
                                    type="date"
                                    name="expiryDate"
                                    className="formInput"
                                    value={formData.expiryDate}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </>
                );

            case "Medicine":
                return (
                    <>
                        <div className="formGroup">
                            <label className="formLabel">Medicine Type</label>
                            <input
                                type="text"
                                name="medicineType"
                                className="formInput"
                                placeholder="e.g. Pain relief, first aid kits, antibiotics"
                                value={formData.medicineType}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="formRow">
                            <div className="formGroup">
                                <label className="formLabel">Quantity</label>
                                <input
                                    type="text"
                                    name="quantity"
                                    className="formInput"
                                    placeholder="e.g. 20 boxes"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="formGroup">
                                <label className="formLabel">Expiry Date (Optional)</label>
                                <input
                                    type="date"
                                    name="expiryDate"
                                    className="formInput"
                                    value={formData.expiryDate}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </>
                );

            case "Clothes":
                return (
                    <>
                        <div className="formGroup">
                            <label className="formLabel">Clothing Type</label>
                            <input
                                type="text"
                                name="clothingType"
                                className="formInput"
                                placeholder="e.g. T-shirts, blankets, jackets"
                                value={formData.clothingType}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="formRow">
                            <div className="formGroup">
                                <label className="formLabel">Size / Category</label>
                                <select
                                    name="size"
                                    className="formSelect"
                                    value={formData.size}
                                    onChange={handleChange}
                                >
                                    <option value="">Select size/category</option>
                                    <option value="Children">Children</option>
                                    <option value="Adults">Adults</option>
                                    <option value="Mixed">Mixed</option>
                                </select>
                            </div>

                            <div className="formGroup">
                                <label className="formLabel">Quantity</label>
                                <input
                                    type="text"
                                    name="quantity"
                                    className="formInput"
                                    placeholder="e.g. 30 items"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </>
                );

            case "Vehicle":
                return (
                    <>
                        <div className="formRow">
                            <div className="formGroup">
                                <label className="formLabel">Vehicle Type</label>
                                <select
                                    name="vehicleType"
                                    className="formSelect"
                                    value={formData.vehicleType}
                                    onChange={handleChange}
                                >
                                    <option value="">Select vehicle type</option>
                                    <option value="Bike">Bike</option>
                                    <option value="Three Wheeler">Three Wheeler</option>
                                    <option value="Car">Car</option>
                                    <option value="Van">Van</option>
                                    <option value="Truck">Truck</option>
                                </select>
                            </div>

                            <div className="formGroup">
                                <label className="formLabel">Capacity</label>
                                <input
                                    type="text"
                                    name="vehicleCapacity"
                                    className="formInput"
                                    placeholder="e.g. Small load / 10 boxes"
                                    value={formData.vehicleCapacity}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="formGroup">
                            <label className="formLabel">Available Time</label>
                            <input
                                type="text"
                                name="availableTime"
                                className="formInput"
                                placeholder="e.g. Today after 3:00 PM"
                                value={formData.availableTime}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="formGroup">
                            <label className="formLabel">Quantity / Support Details</label>
                            <input
                                type="text"
                                name="quantity"
                                className="formInput"
                                placeholder="e.g. 1 vehicle available"
                                value={formData.quantity}
                                onChange={handleChange}
                            />
                        </div>
                    </>
                );

            case "Other":
                return (
                    <>
                        <div className="formGroup">
                            <label className="formLabel">Resource Details</label>
                            <input
                                type="text"
                                name="otherDetails"
                                className="formInput"
                                placeholder="Describe the resource you want to donate"
                                value={formData.otherDetails}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="formGroup">
                            <label className="formLabel">Quantity</label>
                            <input
                                type="text"
                                name="quantity"
                                className="formInput"
                                placeholder="Enter quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                            />
                        </div>
                    </>
                );

            default:
                return null;
        }
    };

    if (submitted) {
        return (
            <div
                className="donationPage"
                style={{ backgroundImage: `url(${bgImage})` }}
            >
                <div className="pageOverlay" />

                <div className="successWrapper">
                    <div className="successCard">
                        <div className="successBadge">Donation Submitted</div>
                        <h2 className="successTitle">Thank you for your contribution!</h2>
                        <p className="successText">
                            Your donation information has been received successfully. Our team
                            will review the details and contact you if pickup or further
                            coordination is required.
                        </p>

                        <div className="successSummary">
                            <p><strong>Resource Type:</strong> {formData.resourceType}</p>
                            <p><strong>Quantity:</strong> {formData.quantity || "Not specified"}</p>
                            <p><strong>Location:</strong> {formData.location}</p>
                        </div>

                        <div className="successActions">
                            <button className="primaryBtn" onClick={handleDonateAnother}>
                                Donate Another Resource
                            </button>
                            <button
                                className="secondaryBtn"
                                onClick={() => navigate("/dashboard")}
                            >
                                Go to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="donationPage"
            style={{ backgroundImage: `url(${bgImage})` }}
        >
            <div className="pageOverlay" />

            <div className="donationWrapper">
                <section className="formCard formCardFull">
                    <div className="formHeader">
                        <div className="formHeaderLeft">
                            <img src={logo} alt="Resilio Logo" className="topLogo" />
                            <div>
                                <h2 className="formTitle">Donate Resources</h2>
                                <p className="formSubtitle">
                                    Share what you can contribute to support emergency response
                                </p>
                            </div>
                        </div>
                    </div>

                    <form className="donationForm" onSubmit={handleSubmit}>
                        <div className="sectionBlock">
                            <h3 className="sectionTitle">1. Select Resource Type</h3>
                            <p className="sectionText">
                                Choose the category that best matches your donation.
                            </p>

                            <div className="resourceGrid">
                                {resourceTypes.map((item) => (
                                    <button
                                        type="button"
                                        key={item.name}
                                        className={`resourceCard ${selectedType === item.name ? "resourceCardActive" : ""}`}
                                        onClick={() => handleTypeSelect(item.name)}
                                    >
                                        <span className="resourceIcon">{item.icon}</span>
                                        <span className="resourceName">{item.name}</span>
                                        <span className="resourceDesc">{item.description}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="sectionBlock">
                            <h3 className="sectionTitle">2. Donation Details</h3>
                            <p className="sectionText">
                                Provide a few details about the resource you want to donate.
                            </p>

                            {renderDynamicFields()}
                        </div>

                        <div className="sectionBlock">
                            <h3 className="sectionTitle">3. Collection Preference</h3>
                            <p className="sectionText">
                                Tell us whether pickup is needed and when the donation is available.
                            </p>

                            <label className="toggleRow">
                                <input
                                    type="checkbox"
                                    name="pickupRequired"
                                    checked={formData.pickupRequired}
                                    onChange={handleChange}
                                />
                                <span>Pickup is required for this donation</span>
                            </label>

                            <div className="formGroup">
                                <label className="formLabel">Availability</label>
                                <select
                                    name="availability"
                                    className="formSelect"
                                    value={formData.availability}
                                    onChange={handleChange}
                                >
                                    <option value="Available Immediately">Available Immediately</option>
                                    <option value="Schedule for Later">Schedule for Later</option>
                                    <option value="Available Today Only">Available Today Only</option>
                                </select>
                            </div>
                        </div>

                        <div className="sectionBlock">
                            <h3 className="sectionTitle">4. Donation Location</h3>
                            <p className="sectionText">
                                Provide the location where the donated resource is available.
                            </p>

                            <div className="locationActions">
                                <button
                                    type="button"
                                    className={`locationBtn ${locationMode === "current" ? "locationBtnActive" : ""}`}
                                    onClick={handleUseCurrentLocation}
                                >
                                    Use Current Location
                                </button>

                                <button
                                    type="button"
                                    className={`locationBtn ${locationMode === "manual" ? "locationBtnActive" : ""}`}
                                    onClick={handleManualLocation}
                                >
                                    Enter Manually
                                </button>
                            </div>

                            <div className="formGroup">
                                <label className="formLabel">Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    className="formInput"
                                    placeholder={
                                        isFetchingLocation
                                            ? "Retrieving current location..."
                                            : "Enter city, area, or pickup address"
                                    }
                                    value={formData.location}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="sectionBlock">
                            <h3 className="sectionTitle">5. Contact Information (Optional)</h3>
                            <p className="sectionText">
                                Contact details are optional, but recommended for smooth pickup
                                and coordination.
                            </p>

                            <div className="contactGrid">
                                <div className="formGroup">
                                    <label className="formLabel">Donor Name</label>
                                    <input
                                        type="text"
                                        name="donorName"
                                        className="formInput"
                                        placeholder="Enter your name"
                                        value={formData.donorName}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="contactRow">
                                    <div className="formGroup">
                                        <label className="formLabel">Contact Number / Email</label>
                                        <input
                                            type="text"
                                            name="contactNumber"
                                            className="formInput"
                                            placeholder="Enter contact detail"
                                            value={formData.contactNumber}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="formGroup smallField">
                                        <label className="formLabel">Type</label>
                                        <select
                                            name="contactMethod"
                                            className="formSelect"
                                            value={formData.contactMethod}
                                            onChange={handleChange}
                                        >
                                            <option value="Mobile">Mobile</option>
                                            <option value="Email">Email</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="formFooter">
                            <button
                                type="button"
                                className="secondaryBtn"
                                onClick={() => navigate("/dashboard")}
                            >
                                Go to Dashboard
                            </button>
                            <button type="submit" className="primaryBtn">
                                Submit Donation
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        </div>
    );
}