import React, { useState } from "react";
import { useNetwork } from "../../context/useNetwork";
import { addToSyncQueue } from "../../utils/SyncManager";
import { API_BASE } from "../../utils/api";
import "./VolunteerSignup.css";
import logo from "../../assets/Landing_Page/Logo.png";
import bgImage from "../../assets/Background-Request.png";
import { useNavigate } from "react-router-dom";

export default function VolunteerPage() {
    const [step, setStep] = useState(0);
    const { isOnline } = useNetwork();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: "",
        contact: "",
        roles: [],
        availability: "",
        hasVehicle: "",
        vehicleType: "",
        location: "",
        otp: "",
        instantAvailable: false,
    });

    const [locationMode, setLocationMode] = useState("current");
    const [isFetchingLocation, setIsFetchingLocation] = useState(false);

    const roleOptions = [
        "Transport Support",
        "Medical Assistance",
        "Food Distribution",
        "Rescue Support",
        "General Volunteer Support",
    ];

    const stepLabels = [
        "Introduction",
        "Personal Details",
        "Volunteer Role",
        "Availability",
        "Location",
        "Verification",
        "Completed",
    ];

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleRoleChange = (role) => {
        setFormData((prev) => {
            const isSelected = prev.roles.includes(role);

            return {
                ...prev,
                roles: isSelected
                    ? prev.roles.filter((item) => item !== role)
                    : [...prev.roles, role],
            };
        });
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

    const goNext = async () => {
        if (step === 1) {
            if (!formData.fullName.trim()) {
                alert("Please enter your full name.");
                return;
            }

            if (!formData.contact.trim()) {
                alert("Please enter your phone number or email address.");
                return;
            }
        }

        if (step === 2) {
            if (formData.roles.length === 0) {
                alert("Please select at least one volunteer role.");
                return;
            }
        }

        if (step === 3) {
            if (!formData.availability) {
                alert("Please select your availability.");
                return;
            }

            if (!formData.hasVehicle) {
                alert("Please indicate whether you have a vehicle.");
                return;
            }

            if (formData.hasVehicle === "Yes" && !formData.vehicleType) {
                alert("Please select your vehicle type.");
                return;
            }
        }

        if (step === 4) {
            if (!formData.location.trim()) {
                alert("Please provide your location.");
                return;
            }

            if (!isOnline) {
                const volunteerData = {
                    ...formData,
                    roles: formData.roles.join(", "),
                };
                await addToSyncQueue(`${API_BASE}/api/Volunteers`, volunteerData, true);
                alert("You are offline. Your volunteer profile is safely saved and will automatically submit when network returns!");
                sessionStorage.setItem("userContact", formData.contact);
                setStep(6);
                return;
            }

            try {
                // Send OTP before going to verification step
                await fetch(`${API_BASE}/api/Auth/send-otp`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ contact: formData.contact }),
                });
            } catch (err) {
                console.error("Failed to send OTP", err);
                alert("Failed to send verification code. Please try again.");
                return; // Stop here if failed
            }
        }

        if (step === 5) {
            if (!formData.otp.trim()) {
                alert("Please enter the verification code.");
                return;
            }
        }

        setStep((prev) => prev + 1);
    };

    const goBack = () => {
        if (step > 1) {
            setStep((prev) => prev - 1);
        }
    };

    const resendCode = () => {
        alert("A new verification code has been sent.");
    };

    const handleFinalJoin = async () => {
        if (!formData.otp.trim()) {
            alert("Please enter the verification code.");
            return;
        }

        try {
            // First verify OTP
            const verifyRes = await fetch(`${API_BASE}/api/Auth/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contact: formData.contact, code: formData.otp }),
            });

            if (!verifyRes.ok) {
                alert("Invalid or expired verification code.");
                return;
            }

            // If OTP verified, register volunteer
            const volunteerData = {
                ...formData,
                roles: formData.roles.join(", "),
            };

            const volRes = await fetch(`${API_BASE}/api/Volunteers`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(volunteerData),
            });

            if (!volRes.ok) throw new Error("Failed to register volunteer");

            console.log("Volunteer signup data submitted successfully.");
            setStep(6);
        } catch (error) {
            console.error("Registration error:", error);
            alert("An error occurred during registration. Please try again.");
        }
    };

    const getStepHeader = () => stepLabels[step];

    const renderProgressChips = () => {
        if (step === 0 || step === 6) return null;

        return (
            <div className="progressRow">
                {[1, 2, 3, 4, 5].map((item) => (
                    <div
                        key={item}
                        className={`progressChip ${item < step
                            ? "chipComplete"
                            : item === step
                                ? "chipActive"
                                : "chipPending"
                            }`}
                    >
                        <span className="chipTop">Step {item}</span>
                        <span className="chipBottom">
                            {item < step ? "Completed" : item === step ? "Current" : "Upcoming"}
                        </span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div
            className="volunteerPage"
            style={{ backgroundImage: `url(${bgImage})` }}
        >
            <div className="pageOverlay" />

            <div className="wizardWrapper">
                {/* Left side intro */}
                <aside className="introCard">
                    <div className="miniLabel">Volunteer Registration</div>

                    <h1 className="introTitle">Join as a Volunteer</h1>

                    <p className="introText">
                        Support affected communities by helping with transportation,
                        distribution, emergency response, and other relief activities.
                    </p>

                    <div className="introIcons">
                        <div className="iconItem">
                            <span className="iconEmoji">🚚</span>
                            <span>Transport</span>
                        </div>

                        <div className="iconItem">
                            <span className="iconEmoji">🏥</span>
                            <span>Medical</span>
                        </div>

                        <div className="iconItem">
                            <span className="iconEmoji">📦</span>
                            <span>Distribution</span>
                        </div>
                    </div>

                    <div className="introPoints">
                        <p>• Simple multi-step registration</p>
                        <p>• Quick identity verification</p>
                        <p>• Flexible volunteer availability</p>
                    </div>

                    <button className="primaryBtn" onClick={() => setStep(1)}>
                        Get Started
                    </button>
                </aside>

                {/* Main card */}
                <section className="wizardCard">
                    <div className="wizardTopBar">
                        <div className="topBarLeft">
                            <img src={logo} alt="Resilio Logo" className="topLogo" />

                            <div>
                                <h2 className="wizardTitle">Volunteer Sign Up</h2>
                                <p className="wizardSubtitle">{getStepHeader()}</p>
                            </div>
                        </div>

                        <div className="uxBadge">Resilio Volunteer Portal</div>
                    </div>

                    {renderProgressChips()}

                    {step === 0 && (
                        <div className="wizardContent centeredContent">
                            <p className="placeholderText">
                                Select <strong>Get Started</strong> to begin your volunteer
                                registration.
                            </p>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="wizardContent">
                            <h3 className="stepHeading">Step 1: Personal Details</h3>
                            <p className="sectionDescription">
                                Please provide your basic contact details so we can reach you
                                when support is needed.
                            </p>

                            <div className="formGroup">
                                <label className="formLabel">Full Name</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    className="formInput"
                                    placeholder="Enter your full name"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="formGroup">
                                <label className="formLabel">Phone Number or Email Address</label>
                                <input
                                    type="text"
                                    name="contact"
                                    className="formInput"
                                    placeholder="Enter your phone number or email"
                                    value={formData.contact}
                                    onChange={handleChange}
                                />
                            </div>

                            <p className="helperText">
                                We will only use this information for registration and important
                                volunteer updates.
                            </p>

                            <div className="buttonRow">
                                <button className="primaryBtn" onClick={goNext}>
                                    Continue
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="wizardContent">
                            <h3 className="stepHeading">Step 2: Select Volunteer Roles</h3>
                            <p className="sectionDescription">
                                Choose one or more areas where you are able to contribute.
                            </p>

                            <div className="checkboxGroup">
                                {roleOptions.map((role, index) => (
                                    <label key={index} className="checkboxCard">
                                        <input
                                            type="checkbox"
                                            checked={formData.roles.includes(role)}
                                            onChange={() => handleRoleChange(role)}
                                        />
                                        <span>{role}</span>
                                    </label>
                                ))}
                            </div>

                            <div className="buttonRow dualButtons">
                                <button className="secondaryBtn" onClick={goBack}>
                                    Back
                                </button>
                                <button className="primaryBtn" onClick={goNext}>
                                    Continue
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="wizardContent">
                            <h3 className="stepHeading">Step 3: Availability</h3>
                            <p className="sectionDescription">
                                Let us know when you are available and whether you can provide
                                transportation support.
                            </p>

                            <div className="radioGroup">
                                <label className="radioCard">
                                    <input
                                        type="radio"
                                        name="availability"
                                        value="Full-time"
                                        checked={formData.availability === "Full-time"}
                                        onChange={handleChange}
                                    />
                                    <span>Full-time</span>
                                </label>

                                <label className="radioCard">
                                    <input
                                        type="radio"
                                        name="availability"
                                        value="Part-time"
                                        checked={formData.availability === "Part-time"}
                                        onChange={handleChange}
                                    />
                                    <span>Part-time</span>
                                </label>

                                <label className="radioCard">
                                    <input
                                        type="radio"
                                        name="availability"
                                        value="Emergency only"
                                        checked={formData.availability === "Emergency only"}
                                        onChange={handleChange}
                                    />
                                    <span>Emergency only</span>
                                </label>
                            </div>

                            <div className="formGroup">
                                <label className="formLabel">Do you have a vehicle?</label>

                                <div className="inlineOptions">
                                    <label className="radioItem">
                                        <input
                                            type="radio"
                                            name="hasVehicle"
                                            value="Yes"
                                            checked={formData.hasVehicle === "Yes"}
                                            onChange={handleChange}
                                        />
                                        <span>Yes</span>
                                    </label>

                                    <label className="radioItem">
                                        <input
                                            type="radio"
                                            name="hasVehicle"
                                            value="No"
                                            checked={formData.hasVehicle === "No"}
                                            onChange={handleChange}
                                        />
                                        <span>No</span>
                                    </label>
                                </div>
                            </div>

                            <div className="formGroup">
                                <label className="formLabel">Vehicle Type</label>
                                <select
                                    name="vehicleType"
                                    className="formSelect"
                                    value={formData.vehicleType}
                                    onChange={handleChange}
                                    disabled={formData.hasVehicle !== "Yes"}
                                >
                                    <option value="">Select vehicle type</option>
                                    <option value="Bike">Bike</option>
                                    <option value="Car">Car</option>
                                    <option value="Van">Van</option>
                                    <option value="Truck">Truck</option>
                                </select>
                            </div>

                            <div className="buttonRow dualButtons">
                                <button className="secondaryBtn" onClick={goBack}>
                                    Back
                                </button>
                                <button className="primaryBtn" onClick={goNext}>
                                    Continue
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="wizardContent">
                            <h3 className="stepHeading">Step 4: Location Details</h3>
                            <p className="sectionDescription">
                                Share your location so we can match you with nearby support
                                requests.
                            </p>

                            <div className="locationBlock">
                                <button
                                    type="button"
                                    className={`locationActionBtn ${locationMode === "current" ? "activeLocationAction" : ""
                                        }`}
                                    onClick={handleUseCurrentLocation}
                                >
                                    Use Current Location
                                </button>

                                <button
                                    type="button"
                                    className={`locationActionBtn ${locationMode === "manual" ? "activeLocationAction" : ""
                                        }`}
                                    onClick={handleManualLocation}
                                >
                                    Enter Location Manually
                                </button>

                                <input
                                    type="text"
                                    name="location"
                                    className="formInput"
                                    placeholder={
                                        isFetchingLocation
                                            ? "Retrieving your current location..."
                                            : "Enter your city, area, or address"
                                    }
                                    value={formData.location}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="buttonRow dualButtons">
                                <button className="secondaryBtn" onClick={goBack}>
                                    Back
                                </button>
                                <button className="primaryBtn" onClick={goNext}>
                                    Continue
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 5 && (
                        <div className="wizardContent">
                            <h3 className="stepHeading">Step 5: Verification</h3>
                            <p className="sectionDescription">
                                Enter the verification code sent to your provided contact method
                                to complete registration.
                            </p>

                            <div className="formGroup">
                                <label className="formLabel">Verification Code</label>
                                <input
                                    type="text"
                                    name="otp"
                                    className="formInput"
                                    placeholder="Enter verification code"
                                    value={formData.otp}
                                    onChange={handleChange}
                                />
                            </div>

                            <button className="linkBtn" type="button" onClick={resendCode}>
                                Resend Code
                            </button>

                            <div className="highlightBox">
                                <p className="highlightTitle">Availability Preference</p>

                                <label className="checkboxItem">
                                    <input
                                        type="checkbox"
                                        name="instantAvailable"
                                        checked={formData.instantAvailable}
                                        onChange={handleChange}
                                    />
                                    <span>I am available to support immediately if needed.</span>
                                </label>

                                <p className="smallGrayText">
                                    This helps us prioritize urgent volunteer coordination.
                                </p>
                            </div>

                            <div className="buttonRow dualButtons">
                                <button className="secondaryBtn" onClick={goBack}>
                                    Back
                                </button>
                                <button className="primaryBtn" onClick={handleFinalJoin}>
                                    Complete Registration
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 6 && (
                        <div className="wizardContent successContent">
                            <div className="successBadge">Registration Successful</div>

                            <h3 className="successTitle">
                                Welcome, {formData.fullName || "Volunteer"}!
                            </h3>

                            <p className="successText">
                                Your volunteer registration has been completed successfully.
                                You will receive updates whenever support is needed in your area.
                            </p>

                            <div className="successActions">
                                <button className="secondaryBtn" onClick={() => navigate("/dashboard")}>Go to Dashboard</button>
                                <button className="outlineBtn" onClick={() => navigate("/")}>Return to Home</button>
                            </div>

                            <p className="completionText">
                                Thank you for joining the Resilio volunteer network.
                            </p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}