import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import "./Contact.css";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "General Inquiry",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Contact form submitted:", formData);
    setSubmitted(true);
    // Reset after some time
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: "", email: "", subject: "General Inquiry", message: "" });
    }, 5000);
  };

  return (
    <div className="staticPage">
      <Navbar />
      
      <main className="contact">
        <section className="contactHero">
          <div className="container">
            <div className="contactHeader">
              <h1>Get in Touch</h1>
              <p>Have questions about Resilio or want to partner with us? We'd love to hear from you.</p>
            </div>
          </div>
        </section>

        <section className="contactBody">
          <div className="container">
            <div className="contactGrid">
              <div className="contactInfo">
                <div className="infoCard">
                  <div className="infoIcon">📍</div>
                  <div>
                    <h3>Our Headquarters</h3>
                    <p>123 Relief Way, Disaster Response Hub, Area 51</p>
                  </div>
                </div>
                <div className="infoCard">
                  <div className="infoIcon">📧</div>
                  <div>
                    <h3>Email Us</h3>
                    <p>support@resilio.org</p>
                    <p>partners@resilio.org</p>
                  </div>
                </div>
                <div className="infoCard">
                  <div className="infoIcon">📞</div>
                  <div>
                    <h3>Call Support</h3>
                    <p>+1 (800) RESILIO-AID</p>
                    <p>Mon - Fri, 9am - 6pm EST</p>
                  </div>
                </div>

                <div className="emergencyNotice">
                  <h3>🆘 Emergency?</h3>
                  <p>Starting a local relief effort? Our rapid response team is available 24/7 for regional coordinators.</p>
                  <button className="emergencyBtn">Emergency Hotline</button>
                </div>
              </div>

              <div className="contactFormArea">
                {submitted ? (
                  <div className="successMessage">
                    <div className="successIcon">✅</div>
                    <h2>Message Sent!</h2>
                    <p>Thank you for reaching out. A member of our team will get back to you within 24 hours.</p>
                    <button onClick={() => setSubmitted(false)}>Send Another Message</button>
                  </div>
                ) : (
                  <form className="contactForm" onSubmit={handleSubmit}>
                    <div className="formGroup">
                      <label>Full Name</label>
                      <input 
                        type="text" 
                        placeholder="John Doe" 
                        required 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div className="formGroup">
                      <label>Email Address</label>
                      <input 
                        type="email" 
                        placeholder="john@example.com" 
                        required 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                    <div className="formGroup">
                      <label>Subject</label>
                      <select 
                        value={formData.subject}
                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      >
                        <option>General Inquiry</option>
                        <option>Volunteer Support</option>
                        <option>Donation Questions</option>
                        <option>Media & PR</option>
                        <option>Technical Issue</option>
                      </select>
                    </div>
                    <div className="formGroup">
                      <label>Message</label>
                      <textarea 
                        rows="5" 
                        placeholder="How can we help you?" 
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                      ></textarea>
                    </div>
                    <button type="submit" className="submitBtn">Send Message</button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
