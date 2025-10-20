import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Common components
import NavBar from "./components/NavBar";
import FloatingMenu from "./components/FloatingMenu";
import Layout from "./Layout";

// Dashboard screens
import { UserDashboard } from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import HomePage from "./pages/HomePage";
import ServicePage from "./Service";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#f9f9f9]">
        <NavBar />
        <Routes>
          {/* Non-layout routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* Layout wrapped routes */}
          <Route
            path="/"
            element={
              <Layout>
                <HomePage />
              </Layout>
            }
          />
          <Route
            path="/user-dashboard"
            element={
              <Layout>
                <UserDashboard />
              </Layout>
            }
          />
          <Route
            path="/admin"
            element={
              <Layout>
                <AdminDashboard />
              </Layout>
            }
          />
          <Route
            path="/services"
            element={
              <Layout>
                <ServicePage />
              </Layout>
            }
          />
          /
        </Routes>
        <FloatingMenu />
      </div>
    </Router>
  );
}

export default App;
