import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";
import logo from "../assets/Landing_Page/Logo.png";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: "Home", path: "/" },
    { label: "How it Works", path: "/how-it-works" },
    { label: "Dashboard", path: "/dashboard" },
    { label: "About Us", path: "/about" },
    { label: "Contact", path: "/contact" },
  ];

  const handleSignIn = () => navigate("/login");

  const handleNavClick = (item) => {
    if (item.path === "/dashboard") {
      const contact = sessionStorage.getItem("userContact");

      if (contact) {
        navigate("/dashboard");
      } else {
        navigate("/login");
      }
      return;
    }

    navigate(item.path);
  };

  return (
    <header className="navbar">
      <div className="navbarContainer">
        <div className="navbarLeft" onClick={() => navigate("/")}>
          <img src={logo} alt="Resilio Logo" className="logoImage" />
          <h1 className="brandName">Resilio</h1>
        </div>

        <nav className="navbarCenter">
          {navItems.map((item, index) => {
            const isActive =
              item.path === "/dashboard"
                ? location.pathname === "/dashboard"
                : location.pathname === item.path;

            return (
              <button
                key={index}
                className={`navLink ${isActive ? "activeNav" : ""}`}
                onClick={() => handleNavClick(item)}
              >
                {item.label}
                {isActive && <div className="activeLine" />}
              </button>
            );
          })}
        </nav>

        <div className="navbarRight">
          <button className="signInBtn" onClick={handleSignIn}>
            Sign In
          </button>
        </div>
      </div>
    </header>
  );
}