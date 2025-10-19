import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import HomePage from "./pages/HomePage";
import FloatingMenu from "./components/FloatingMenu";
import AdminDashboard from "./pages/AdminDashboard";
import { Home } from "lucide-react";

export default function App() {
  return (
    <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/AdminDashboard" element={<AdminDashboard />} />
          <Route
            path="/"
            element={
              <Layout>
                <HomePage />
              </Layout>
            }
            />
          <Route 
            path="/register" 
            element={
              <Layout>
                <Register />
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
      </Routes>

      <FloatingMenu />

    </Router>
  );
}
