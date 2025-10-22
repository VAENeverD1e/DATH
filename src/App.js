import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import HomePage from "./pages/HomePage";
import FloatingMenu from "./components/FloatingMenu";
import AdminDashboard from "./pages/AdminDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import AdminLogin from "./pages/AdminLogin";
import ServicePage from "./pages/Service";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* routes không bọc layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* routes bọc layout */}
        {/* make root redirect to admin-login */}
        <Route path="/" element={<Navigate to="/admin-login" replace />} />

        {/* public homepage moved to /home */}
        <Route
          path="/home"
          element={
            <Layout>
              <HomePage />
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
        <Route
          path="/doctor"
          element={
            <Layout>
              <DoctorDashboard />
            </Layout>
          }
        />
      </Routes>

      <FloatingMenu />
    </Router>
  );
}