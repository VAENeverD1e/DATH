import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const navigate = useNavigate();

  // UI state
  const [adminVisible, setAdminVisible] = useState(false);

  // admin fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // UX state
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState("");

  // Dummy admin credentials for demo purposes
  const DUMMY_ADMINS = [
    { username: "admin", password: "AdminPass123" },
    { username: "superadmin", password: "supersecret" },
  ];

  // Basic validation for admin fields
  const validate = () => {
    const errors = {};
    if (!username || username.trim().length < 3) {
      errors.username = "Please enter a valid admin username.";
    }
    if (!password || password.trim().length === 0) {
      errors.password = "Password cannot be empty.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // On clicking admin toggle button
  const handleAdminToggle = () => {
    setAdminVisible((v) => !v);
    setServerError("");
    setFieldErrors({});
  };

  // Mock login: simulate network delay and check dummy data
  const mockAuthenticate = (identifier, pwd) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = DUMMY_ADMINS.find(
          (u) => u.username.toLowerCase() === identifier.toLowerCase() && u.password === pwd
        );
        resolve(user || null);
      }, 600); // simulate ~600ms network latency
    });
  };

  // Submit admin login (frontend only)
  const handleSubmit = async (e) => {
    e && e.preventDefault();
    setServerError("");
    if (!validate()) return;

    setLoading(true);
    try {
      const user = await mockAuthenticate(username, password);

      if (!user) {
        setServerError("Invalid admin username or password.");
        setLoading(false);
        return;
      }

      // If authentication succeeds, navigate to admin dashboard
      navigate("/admin", { replace: true });
    } catch (err) {
      console.error("Mock login error:", err);
      setServerError("Unexpected error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden p-4">
      {/* Background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0"
        style={{
          background: "linear-gradient(135deg, #1cc7c1ff 0%, #93c5fd 100%)", // a different blue shade
          filter: "blur(80px)",
          opacity: 0.45,
        }}
      ></div>
      <div className="relative z-10 w-full max-w-lg bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-semibold text-center mb-8">Welcome to MediSafe!</h1>

        {/* Role selection */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <span className="text-sm text-gray-600">Choose your role:</span>

        {/* Combined Patient/Doctor button */}
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="px-4 py-1.5 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors"
        >
          Patient / Doctor
        </button>

        {/* Admin button */}
        <button
          type="button"
          onClick={handleAdminToggle}
          aria-pressed={adminVisible}
          className="px-4 py-1.5 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors"
        >
          Admin
        </button>
        </div>

        {/* Admin form — hidden until Admin button clicked */}
        {adminVisible && (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {serverError && (
              <div role="alert" className="text-sm text-red-700 bg-red-50 p-2 rounded">
                {serverError}
              </div>
            )}

            <div>
              <label htmlFor="admin-username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                id="admin-username"
                name="admin-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`mt-1 block w-full border rounded px-3 py-2 ${fieldErrors.username ? "border-red-500" : "border-gray-200"}`}
                placeholder="Enter your admin username"
                disabled={loading}
                aria-invalid={fieldErrors.username ? "true" : "false"}
                aria-describedby={fieldErrors.username ? "admin-username-error" : undefined}
                autoComplete="username"
              />
              {fieldErrors.username && <p id="admin-username-error" className="text-xs text-red-500 mt-1">{fieldErrors.username}</p>}
            </div>

            <div>
              <label htmlFor="admin-password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="admin-password"
                name="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`mt-1 block w-full border rounded px-3 py-2 ${fieldErrors.password ? "border-red-500" : "border-gray-200"}`}
                placeholder="••••••••"
                disabled={loading}
                aria-invalid={fieldErrors.password ? "true" : "false"}
                aria-describedby={fieldErrors.password ? "admin-password-error" : undefined}
                autoComplete="current-password"
              />
              {fieldErrors.password && <p id="admin-password-error" className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>}
            </div>

            <p className="text-sm text-center text-gray-500 mt-8">
              Dummy Admins: <br />
              - Username: <strong>admin</strong>, Password: <strong>AdminPass123</strong> <br />
              - Username: <strong>superadmin</strong>, Password: <strong>supersecret</strong>
            </p>

            <button
              type="submit"
              className={`w-full py-2 rounded text-white flex items-center justify-center ${
                loading ? "bg-gray-400" : "bg-red-600 hover:bg-red-700"
              }`}
              disabled={loading}
              aria-busy={loading}
            >
              <span className="flex items-center justify-center">
                {loading && (
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                )}
                {loading ? "Logging in..." : "Admin Login"}
              </span>
            </button>
          </form>
        )}

        {/* Small help text if admin not visible */}
        {!adminVisible && (
          <p className="text-sm text-center text-gray-500 mt-8">
            Click <strong>Admin</strong> to reveal admin login.
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;
