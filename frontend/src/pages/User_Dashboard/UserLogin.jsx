import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./UserLogin.css";
import { API_BASE } from "../../utils/api";
import bgRequest from "../../assets/Background-Request.png";

export default function UserLogin() {
  const navigate = useNavigate();
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!contact || contact.trim().length < 5) {
      setError("Please enter a valid phone number or email.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/Auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact: contact.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to send OTP. Please try again.");
      }

      // Route them identically to the OTP verify page to authenticate.
      navigate("/otp-verify", { state: { contact: contact.trim(), }, replace: true, });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="loginPage" style={{ backgroundImage: `url(${bgRequest})` }}>
      <div className="loginCard">
        <h1 className="loginTitle">Welcome Back</h1>
        <p className="loginSubtitle">Sign in to track your Resilio profile</p>

        <form onSubmit={handleLogin} className="loginForm">
          <div className="inputGroup">
            <label htmlFor="contact">Phone Number or Email</label>
            <input
              id="contact"
              type="text"
              className="loginInput"
              placeholder="e.g. 0712345678 or john@example.com"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && <p className="loginErrorText">{error}</p>}

          <button type="submit" className="authBtn" disabled={loading}>
            {loading ? "Sending OTP..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
