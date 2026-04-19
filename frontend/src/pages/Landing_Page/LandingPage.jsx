import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import "./LandingPage.css";

// Images
import backgroundImg from "../../assets/Landing_Page/Background.png";
import helpImg from "../../assets/Landing_Page/Help.png";
import volunteerImg from "../../assets/Landing_Page/Volunteer.png";
import donateImg from "../../assets/Landing_Page/Donate.png";

export default function LandingPage() {
  const navigate = useNavigate();

  // Reusable card data
  const actionCards = [
    {
      id: 1,
      title: "Need Help?",
      description: "Request food, medicine, shelter.",
      buttonText: "Request Now",
      image: helpImg,
      colorClass: "redCard",
      onClick: () => navigate("/request-help"),
    },
    {
      id: 2,
      title: "Want to Help?",
      description: "Deliver aid, transport, support.",
      buttonText: "Join as Volunteer",
      image: volunteerImg,
      colorClass: "greenCard",
      onClick: () => navigate("/volunteer"),
    },
    {
      id: 3,
      title: "Donate Resources",
      description: "Provide food, vehicles, supplies.",
      buttonText: "Donate Now",
      image: donateImg,
      colorClass: "blueCard",
      onClick: () => navigate("/donate"),
    },
  ];

  return (
    <div className="landingPage">
      <Navbar />

      {/* =========================
          HERO SECTION
      ========================== */}
      <section
        className="heroSection"
        style={{ backgroundImage: `url(${backgroundImg})` }}
      >

        {/* Dark overlay for better text readability */}
        <div className="heroOverlay" />

        <div className="heroContent">
          <h2 className="heroTitle">
            Connect. Respond.
            <br />
            Save Lives.
          </h2>

          <p className="heroSubtitle">
            Request help or support disaster relief efforts in real-time.
          </p>
        </div>
      </section>

      {/* =========================
          ACTION CARDS SECTION
      ========================== */}
      <section className="cardsSection">
        <div className="cardsWrapper">
          {actionCards.map((card) => (
            <div className="actionCard" key={card.id}>
              {/* Top colored image area */}
              <div className={`cardImageArea ${card.colorClass}`}>
                <img
                  src={card.image}
                  alt={card.title}
                  className="cardTopImage"
                />
              </div>

              {/* Bottom white content area */}
              <div className="cardContent">
                <h3 className="cardTitle">{card.title}</h3>
                <p className="cardDescription">{card.description}</p>

                <button
                  className={`cardButton ${card.colorClass}`}
                  onClick={card.onClick}
                >
                  {card.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}