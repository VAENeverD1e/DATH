import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import HomePage from "./pages/HomePage";
import FloatingMenu from "./components/FloatingMenu";
import AdminDashboard from "./pages/AdminDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import ServicePage from "./pages/Service";
// import { Home } from "lucide-react"; // bỏ vì không dùng

export default function App() {
  return (
    <Router>
      <Routes>
        {/* routes không bọc layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* routes bọc layout */}
        <Route
          path="/"
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