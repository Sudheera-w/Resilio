import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./OtpVerifyPage.css";
import { API_BASE } from "../../utils/api";
import bgRequest from "../../assets/Background-Request.png";

export default function OtpVerifyPage({ initialResendSeconds = 45 }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Get contact passed from previous page if available
  const contactFromForm = location.state?.contact || "your phone number or email";

  // OTP input state
  const [digits, setDigits] = useState(Array(6).fill(""));
  const inputsRef = useRef([]);

  // Timer state
  const [secondsLeft, setSecondsLeft] = useState(initialResendSeconds);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Combined OTP value
  const code = useMemo(() => digits.join(""), [digits]);

  // Check if all 6 digits are filled
  const isComplete = useMemo(() => digits.every((digit) => digit !== ""), [digits]);

  // Countdown timer
  useEffect(() => {
    if (secondsLeft <= 0) return;

    const timerId = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [secondsLeft]);

  // Focus first input on load
  useEffect(() => {
    inputsRef.current?.[0]?.focus?.();
  }, []);

  // Move focus to a specific box
  const focusIndex = (index) => {
    const input = inputsRef.current?.[index];
    if (input) {
      input.focus();
      input.select?.();
    }
  };

  // Set a digit at a specific position
  const setDigitAt = (index, value) => {
    setDigits((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  // Handle typing in OTP boxes
  const handleChange = (index, event) => {
    setError("");

    const rawValue = event.target.value;
    const onlyDigits = rawValue.replace(/\D/g, "");

    // Handle paste or fast multiple character input
    if (onlyDigits.length > 1) {
      const splitDigits = onlyDigits.slice(0, 6 - index).split("");

      setDigits((prev) => {
        const next = [...prev];
        for (let i = 0; i < splitDigits.length; i += 1) {
          next[index + i] = splitDigits[i];
        }
        return next;
      });

      const nextIndex = Math.min(index + splitDigits.length, 5);
      focusIndex(nextIndex);
      return;
    }

    const value = onlyDigits.slice(-1);
    setDigitAt(index, value);

    if (value && index < 5) {
      focusIndex(index + 1);
    }
  };

  // Handle key navigation
  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace") {
      if (digits[index]) {
        setDigitAt(index, "");
        return;
      }

      if (index > 0) {
        setDigitAt(index - 1, "");
        focusIndex(index - 1);
      }
    }

    if (event.key === "ArrowLeft" && index > 0) {
      focusIndex(index - 1);
    }

    if (event.key === "ArrowRight" && index < 5) {
      focusIndex(index + 1);
    }

    if (event.key === "Enter" && !loading) {
      handleVerify();
    }
  };

  // Handle paste
  const handlePaste = (index, event) => {
    setError("");

    const pastedText = (event.clipboardData?.getData("text") || "").replace(/\D/g, "");
    if (!pastedText) return;

    event.preventDefault();

    const splitDigits = pastedText.slice(0, 6 - index).split("");

    setDigits((prev) => {
      const next = [...prev];
      for (let i = 0; i < splitDigits.length; i += 1) {
        next[index + i] = splitDigits[i];
      }
      return next;
    });

    const nextIndex = Math.min(index + splitDigits.length - 1, 5);
    focusIndex(nextIndex);
  };

  // Verify OTP
  const handleVerify = async () => {
    if (loading) return;

    setError("");

    if (!isComplete) {
      setError("Please enter the 6-digit code.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/Auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact: contactFromForm, code: code }),
      });

      if (!response.ok) {
        throw new Error("Invalid or expired code.");
      }

      alert("OTP verified successfully.");
      sessionStorage.setItem("userContact", contactFromForm);
      navigate("/dashboard", { replace: true });
    } catch {
      setError("Verification failed. Please check the code and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (secondsLeft > 0 || loading) return;

    setLoading(true);
    try {
      await fetch(`${API_BASE}/api/Auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact: contactFromForm }),
      });

      setSecondsLeft(initialResendSeconds);
      setDigits(Array(6).fill(""));
      setError("");
      focusIndex(0);

      alert("A new OTP has been sent.");
    } catch {
      setError("Failed to resend code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Back to request page
  const handleGoBack = () => {
    navigate("/request-help");
  };

  // Format countdown
  const formatSeconds = (seconds) => String(Math.max(0, seconds)).padStart(2, "0");

  return (
    <div
      className="verifyPage"
      style={{ backgroundImage: `url(${bgRequest})` }}
    >
      <div className="card">
        {/* Page title */}
        <h1 className="title">VERIFY YOUR CODE</h1>

        {/* Subtitle */}
        <p className="subtitle">
          A 6-digit verification code has been sent to your registered contact.
          <br />
          <span className="phone">({contactFromForm})</span>
        </p>

        {/* OTP input boxes */}
        <div className="otpRow" aria-label="6-digit verification code">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(element) => {
                inputsRef.current[index] = element;
              }}
              className={`otpBox ${index < 3 ? "otpBoxActive" : ""}`}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(event) => handleChange(index, event)}
              onKeyDown={(event) => handleKeyDown(index, event)}
              onPaste={(event) => handlePaste(index, event)}
              aria-label={`Digit ${index + 1}`}
              disabled={loading}
            />
          ))}
        </div>

        {/* Error message */}
        {error && <p className="errorText">{error}</p>}

        {/* Verify button */}
        <button
          type="button"
          className="verifyBtn"
          onClick={handleVerify}
          disabled={loading}
        >
          {loading ? "VERIFYING..." : "VERIFY"}
        </button>

        {/* Bottom actions */}
        <div className="bottomRow">
          <button
            type="button"
            className="linkBtn"
            onClick={handleGoBack}
            disabled={loading}
          >
            Go back
          </button>

          <div className="resendWrap">
            <div className="resendText">Didn&apos;t receive the code?</div>
            <button
              type="button"
              className={`resendBtn ${secondsLeft > 0 ? "resendDisabled" : ""}`}
              onClick={handleResend}
              disabled={secondsLeft > 0 || loading}
            >
              Resend in <span className="resendTime">0:{formatSeconds(secondsLeft)}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}