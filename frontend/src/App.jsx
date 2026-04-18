import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/Landing_Page/LandingPage";
import RequestRelief from "./pages/Request_Relief/RequestRelief";
import OtpVerifyPage from "./pages/OtpVerify_Page/OtpVerifyPage";
import VolunteerSignup from "./pages/Volunteer/VolunteerSignup";
import ResourceDonation from "./pages/Donation/ResourceDonation";
import UserLogin from "./pages/User_Dashboard/UserLogin";
import UserDashboard from "./pages/User_Dashboard/UserDashboard";

import AdminLogin from "./pages/Admin/AdminLogin";
import AdminLayout from "./pages/Admin/AdminLayout";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminRequests from "./pages/Admin/AdminRequests";
import AdminVolunteers from "./pages/Admin/AdminVolunteers";
import AdminDonations from "./pages/Admin/AdminDonations";
import HowItWorks from "./pages/Static/HowItWorks";
import AboutUs from "./pages/Static/AboutUs";
import Contact from "./pages/Static/Contact";

import SyncStatusBar from "./components/SyncStatusBar";

function App() {
  return (
    <BrowserRouter>
      <SyncStatusBar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/request-help" element={<RequestRelief />} />
        <Route path="/otp-verify" element={<OtpVerifyPage />} />
        <Route path="/volunteer" element={<VolunteerSignup />} />
        <Route path="/donate" element={<ResourceDonation />} />
        <Route path="/login" element={<UserLogin />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        
        {/* Static Info Pages */}
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<Contact />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/requests" element={<AdminRequests />} />
          <Route path="/admin/volunteers" element={<AdminVolunteers />} />
          <Route path="/admin/donations" element={<AdminDonations />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;