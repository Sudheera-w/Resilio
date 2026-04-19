import React from "react";
import { useNavigate } from "react-router-dom";
import "./Footer.css";
import logo from "../assets/Landing_Page/Logo.png";

export default function Footer() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footerContainer">
        <div className="footerMain">
          <div className="footerBrandSection">
            <div className="footerLogoArea" onClick={() => navigate("/")}>
              <img src={logo} alt="Resilio Logo" className="footerLogo" />
              <span className="footerBrandName">Resilio</span>
            </div>
            <p className="footerSlogan">
              Connecting communities in times of crisis. Rapid response, distributed impact, saved lives.
            </p>
            <div className="socialLinks">
              <span className="socialIcon">Twitter</span>
              <span className="socialIcon">Facebook</span>
              <span className="socialIcon">LinkedIn</span>
            </div>
          </div>

          <div className="footerLinkColumn">
            <h4>Organization</h4>
            <button onClick={() => navigate("/about")}>About Us</button>
            <button onClick={() => navigate("/how-it-works")}>How it Works</button>
            <button onClick={() => navigate("/impact")}>Our Impact</button>
            <button onClick={() => navigate("/contact")}>Contact</button>
          </div>

          <div className="footerLinkColumn">
            <h4>Support</h4>
            <button onClick={() => navigate("/request-help")}>Request Relief</button>
            <button onClick={() => navigate("/volunteer")}>Become a Volunteer</button>
            <button onClick={() => navigate("/donate")}>Donate Supplies</button>
            <button onClick={() => navigate("/login")}>User Dashboard</button>
          </div>

          <div className="footerContactColumn">
            <h4>Contact Us</h4>
            <p><strong>Emergency:</strong> +1 (800) RESILIO</p>
            <p><strong>Support:</strong> support@resilio.org</p>
            <p><strong>Address:</strong> 123 Relief Way, Crisis Managed, CM 54321</p>
          </div>
        </div>

        <div className="footerBottom">
          <p>&copy; {currentYear} Resilio Emergency Response. All rights reserved.</p>
          <div className="footerPrivacyLinks">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
