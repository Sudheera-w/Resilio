import React from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import "./AboutUs.css";
import aboutHero from "../../assets/Landing_Page/about_us_hero.png";

export default function AboutUs() {
  const stats = [
    { label: "Volunteers Joined", value: "2,500+", color: "#ef4444" },
    { label: "Communities Served", value: "120+", color: "#3b82f6" },
    { label: "Relief Packages Delivered", value: "15,000+", color: "#10b981" },
    { label: "Active Regional Hubs", value: "45", color: "#f59e0b" }
  ];

  return (
    <div className="staticPage">
      <Navbar />

      <main className="aboutUs">
        <section className="aboutHero">
          <div className="aboutHeroImage" style={{ backgroundImage: `url(${aboutHero})` }}>
            <div className="aboutHeroOverlay" />
            <div className="container">
              <div className="aboutHeroText">
                <h1>Bridging Communities Through Crisis</h1>
                <p>Resilio is a specialized disaster management system designed to coordinate rapid relief efforts across dynamic environments.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mission">
          <div className="container">
            <div className="missionGrid">
              <div className="missionText">
                <span className="badge">Our Mission</span>
                <h2>Human-Centered Disaster Response</h2>
                <p>
                  In the wake of disaster, time is the ultimate resource. Resilio was founded on the belief that
                  local communities are the first and most vital responders. Our mission is to empower these
                  communities with real-time coordination tools that turn chaos into organized action.
                </p>
                <p>
                  By leveraging distributed coordination and real-time data, we ensure that every bottle of water,
                  every medical kit, and every volunteer hour is deployed exactly where it's needed most.
                </p>
              </div>
              <div className="missionStats">
                {stats.map((stat, index) => (
                  <div key={index} className="statCard">
                    <h3 style={{ color: stat.color }}>{stat.value}</h3>
                    <p>{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="values">
          <div className="container">
            <div className="sectionHeader">
              <h2>Our Core Values</h2>
              <p>The principles that guide every feature we build and every operation we support.</p>
            </div>

            <div className="valuesGrid">
              <div className="valueCard">
                <div className="valueIcon">🛡️</div>
                <h3>Integrity & Transparency</h3>
                <p>Every donation and request is tracked with full accountability to ensure trust within the community.</p>
              </div>
              <div className="valueCard">
                <div className="valueIcon">⚡</div>
                <h3>Radical Efficiency</h3>
                <p>We optimize delivery routes and matching algorithms to minimize response times during critical windows.</p>
              </div>
              <div className="valueCard">
                <div className="valueIcon">🤝</div>
                <h3>Local Empowerment</h3>
                <p>We build tools that give power back to local coordinators who understand their terrain and people best.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
