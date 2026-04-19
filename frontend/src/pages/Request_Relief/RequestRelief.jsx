import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNetwork } from "../../context/useNetwork";
import { addToSyncQueue } from "../../utils/SyncManager";
import { API_BASE } from "../../utils/api";
import "./RequestRelief.css";
import logo from "../../assets/Landing_Page/Logo.png";
import bgRequest from "../../assets/Background-Request.png";

export default function RequestRelief() {

    // Initialize navigation
    const navigate = useNavigate();
    const { isOnline } = useNetwork();

    // State for all form values
    const [formData, setFormData] = useState({
        fullName: "",
        contact: "",
        location: "",
        helpType: "Food",
        note: "",
        isUrgent: true,
    });

    // Track whether user wants auto location or manual location
    const [locationMode, setLocationMode] = useState("current");

    // Loading state for current location button
    const [isFetchingLocation, setIsFetchingLocation] = useState(false);

    // Generic input change handler
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    // Toggle urgent state
    const handleUrgentToggle = () => {
        setFormData((prev) => ({
            ...prev,
            isUrgent: !prev.isUrgent,
        }));
    };

    // Use browser geolocation
    const handleUseCurrentLocation = () => {
        setLocationMode("current");

        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }

        setIsFetchingLocation(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const latitude = position.coords.latitude.toFixed(5);
                const longitude = position.coords.longitude.toFixed(5);

                setFormData((prev) => ({
                    ...prev,
                    location: `Lat: ${latitude}, Lng: ${longitude}`,
                }));

                setIsFetchingLocation(false);
            },
            () => {
                alert("Unable to get your current location.");
                setIsFetchingLocation(false);
            }
        );
    };

    // Switch to manual location entry
    const handleManualLocation = () => {
        setLocationMode("manual");
        setFormData((prev) => ({
            ...prev,
            location: "",
        }));
    };

    // Form submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Simple validation
        if (!formData.fullName.trim()) {
            alert("Please enter your full name.");
            return;
        }

        if (!formData.contact.trim()) {
            alert("Please enter your phone number or email.");
            return;
        }

        if (!formData.location.trim()) {
            alert("Please provide a location.");
            return;
        }

        if (!isOnline) {
            await addToSyncQueue(`${API_BASE}/api/Requests`, formData, true);
            alert("You are offline. Your request has been saved securely and will auto-submit when the internet returns!");
            sessionStorage.setItem("userContact", formData.contact);
            navigate("/dashboard");
            return;
        }

        try {
            // API call to custom ASP.NET Core backend
            const response = await fetch(`${API_BASE}/api/Requests`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error("Failed to submit request.");
            }

            // Immediately send OTP since we are moving to OTP verify page
            await fetch(`${API_BASE}/api/Auth/send-otp`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ contact: formData.contact }),
            });

            // Navigate to OTP verification page after successful submission
            navigate("/otp-verify", { state: { contact: formData.contact } });

        } catch (error) {
            console.error("Error submitting form:", error);
            alert("An error occurred. Please try again.");
        }
    };

    return (
        <div
            className="requestPage"
            style={{ backgroundImage: `url(${bgRequest})` }}
        >
            <div className="requestCard">
                {/* Top logo area */}
                <div className="requestHeader">
                    <img src={logo} alt="Resilio Logo" className="requestLogo" />
                    <span className="requestBrand">Resilio</span>
                </div>

                {/* Title */}
                <h1 className="requestTitle">Submit a Disaster Relief Request</h1> <br />

                {/* Form */}
                <form onSubmit={handleSubmit} className="requestForm">
                    {/* Full Name */}
                    <div className="formGroup">
                        <label htmlFor="fullName" className="formLabel">
                            Full Name
                        </label>
                        <input
                            id="fullName"
                            name="fullName"
                            type="text"
                            className="formInput"
                            value={formData.fullName}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Phone or Email */}
                    <div className="formGroup">
                        <label htmlFor="contact" className="formLabel">
                            Phone Number or Email
                        </label>
                        <input
                            id="contact"
                            name="contact"
                            type="text"
                            className="formInput"
                            value={formData.contact}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Location */}
                    <div className="formGroup">
                        <label className="formLabel">Location</label>

                        <div className="locationButtons">
                            <button
                                type="button"
                                className={`locationBtn ${locationMode === "current" ? "activeLocationBtn" : ""
                                    }`}
                                onClick={handleUseCurrentLocation}
                            >
                                Use Current Location
                            </button>

                            <button
                                type="button"
                                className={`locationBtn ${locationMode === "manual" ? "activeLocationBtn" : ""
                                    }`}
                                onClick={handleManualLocation}
                            >
                                OR Enter Manually
                            </button>
                        </div>

                        {/* Location input */}
                        <input
                            name="location"
                            type="text"
                            className="formInput"
                            placeholder={
                                locationMode === "manual"
                                    ? "Enter your location manually"
                                    : isFetchingLocation
                                        ? "Fetching current location..."
                                        : ""
                            }
                            value={formData.location}
                            onChange={handleChange}
                            disabled={locationMode === "current" && isFetchingLocation}
                        />
                    </div>

                    {/* Type of Help Needed */}
                    <div className="formGroup">
                        <label htmlFor="helpType" className="formLabel">
                            Type of Help Needed
                        </label>

                        <select
                            id="helpType"
                            name="helpType"
                            className="formSelect"
                            value={formData.helpType}
                            onChange={handleChange}
                        >
                            <option value="Food">🍱 Food</option>
                            <option value="Medicine">💊 Medicine</option>
                            <option value="Shelter">🏠 Shelter</option>
                            <option value="Rescue">🚨 Rescue</option>
                        </select>
                    </div>

                    {/* Optional Note */}
                    <div className="formGroup">
                        <label htmlFor="note" className="formLabel">
                            Optional Note
                        </label>
                        <textarea
                            id="note"
                            name="note"
                            className="formTextarea"
                            rows="3"
                            value={formData.note}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Bottom actions row */}
                    <div className="bottomActions">
                        <button
                            type="button"
                            className={`urgentToggle ${formData.isUrgent ? "urgentOn" : "urgentOff"
                                }`}
                            onClick={handleUrgentToggle}
                            aria-label="Toggle urgent status"
                        >
                            <span className="toggleKnob" />
                        </button>

                        <span className="urgentText">Mark as Urgent</span>

                        <button type="button" className="secondaryTextButton">
                            Submit First, Verify Later
                        </button>
                    </div>

                    {/* Submit button */}
                    <button type="submit" className="submitButton">
                        Submit Request
                    </button>

                    {/* Footer help text */}
                    <p className="footerText">
                        What happens next? (We'll send an OTP to your phone/email to
                        verify, but your request is prioritized)
                    </p>
                </form>
            </div>
        </div>
    );
}