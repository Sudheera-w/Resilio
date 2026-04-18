import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import "./HowItWorks.css";
import processHero from "../../assets/Landing_Page/how_it_works_illustration.png";

export default function HowItWorks() {
  const navigate = useNavigate();

  const steps = [
    {
      num: "01",
      title: "Submit a Request",
      desc: "Individuals or organizations in need of food, medical supplies, or shelter submit a request through our secure platform.",
      icon: "📋"
    },
    {
      num: "02",
      title: "Intelligent Matching",
      desc: "Our system automatically matches requests with nearby volunteers and donation resources in real-time.",
      icon: "⚡"
    },
    {
      num: "03",
      title: "Rapid Deployment",
      desc: "Volunteers receive notifications and coordinates to deliver aid directly to the requested location safely.",
      icon: "🚛"
    }
  ];

  return (
    <div className="staticPage">
      <Navbar />

      <main className="howItWorks">
        <section className="hero">
          <div className="container">
            <div className="heroContent">
              <span className="badge">Our Process</span>
              <h1>How Resilio Works</h1>
              <p>
                We bridge the gap between people in need and those who can help.
                Our platform ensures that relief reaches the right place at the right time.
              </p>
              <div className="heroBtns">
                <button className="primaryBtn" onClick={() => navigate("/request-help")}>Get Started</button>
                <button className="secondaryBtn" onClick={() => navigate("/volunteer")}>View Dashboard</button>
              </div>
            </div>
            <div className="heroImageArea">
              <img src={processHero} alt="Process Illustration" />
            </div>
          </div>
        </section>

        <section className="stepsSection">
          <div className="container">
            <div className="sectionHeader">
              <h2>A Simple 3-Step Process</h2>
              <p>Designed for speed and reliability when every second counts.</p>
            </div>

            <div className="stepsGrid">
              {steps.map((step, index) => (
                <div key={index} className="stepCard">
                  <div className="stepHeader">
                    <span className="stepNum">{step.num}</span>
                    <span className="stepIcon">{step.icon}</span>
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="ctaSection">
          <div className="container">
            <div className="ctaCard">
              <h2>Ready to make a difference?</h2>
              <p>Join our network of volunteers or donate supplies to support those in need.</p>
              <div className="ctaBtns">
                <button onClick={() => navigate("/volunteer")}>Become a Volunteer</button>
                <button onClick={() => navigate("/donate")}>Donate Resources</button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
