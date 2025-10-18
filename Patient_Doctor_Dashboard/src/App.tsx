import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserDashboard } from "./screens/UserDashboard/UserDashboard";
import { DoctorDashboard } from "./screens/DoctorDashboard/DoctorDashboard";
import NavBar from "./components/NavBar";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#f9f9f9]">
        <NavBar />
        <Routes>
          <Route path="/" element={<UserDashboard />} />
          <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
