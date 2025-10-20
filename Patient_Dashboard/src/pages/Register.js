import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [formError, setFormError] = useState("");

  // Simulate existing users for demo — replace later with database call
  const existingEmails = ["you@example.com"];

  // Handle input changes and clear specific field errors
  const handleChange = (e) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: undefined })); // clear that field's error
    setForm({ ...form, [name]: value });
};


  // Name validation: only letters
  const isValidName = (name) => /^[A-Za-z]+$/.test(name.trim());

  // Email validation: basic format check
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  // normalize existingEmails once (near declaration)
  const existingEmailsLower = existingEmails.map((e) => e.toLowerCase());

  // Password validation: at least 8 chars, one letter, one number
  const validatePassword = (password) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long.";
    }
    if (!/[A-Za-z]/.test(password)) {
      return "Password must contain at least one letter.";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number.";
    }
    return ""; // no errors
  };
  const handleSubmit = (e) => {
    e.preventDefault(); 
    const newErrors = {};
    setFormError(""); // clear previous general error

    // Check for empty required fields
    if (!form.firstName || !form.lastName || !form.email || !form.password || !form.confirmPassword) {
    setFormError("Please fill in all required fields.");
    return;
    }

    // Name validations
    if (!isValidName(form.firstName)) {
      newErrors.firstName = "First name must contain only letters.";
    }
    if (!isValidName(form.lastName)) {
      newErrors.lastName = "Last name must contain only letters.";
    }

    // Email validations
    if (!isValidEmail(form.email)) {
      newErrors.email = "Invalid email format.";
    } else if (existingEmailsLower.includes(form.email.trim().toLowerCase())) {
    newErrors.email = "This email is already in use.";
    }

    // Password validations
    const passwordError = validatePassword(form.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);

    // Only proceed if no errors
    if (Object.keys(newErrors).length === 0) {
        // Handle registration logic here
        console.log("Registration successful:", form);
        // All passed → simulate registration
        setLoading(true);
        setSuccessMsg("");
        setTimeout(() => {
            setLoading(false);
            setSuccessMsg("Registration successful!");
            setTimeout(() => navigate("/"), 900);
        }, 1400);
    }  
};

  return (
    <div
      className="min-h-screen flex items-center justify-center relative"
      style={{ fontFamily: "'Poppins', 'Arial', sans-serif" }}
    >
      {/* Background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0"
        style={{
          background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
          filter: "blur(60px)",
          opacity: 0.5,
        }}
      ></div>

      <div
        className="w-full max-w-lg bg-white p-8 rounded-lg shadow relative z-10"
        style={{ minHeight: "600px" }}
      >
        <h2
          className="text-2xl font-bold mb-8 text-center"
          style={{ fontFamily: "'Poppins', 'Arial', sans-serif" }}
        >
          Create an account
        </h2>

        {formError && (
        <div className="mb-4 text-center text-sm text-red-500 font-medium">
            {formError}
        </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name fields side-by-side */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">
                First name
              </label>
              <input
                type="text"
                name="firstName"
                placeholder="First name"
                value={form.firstName}
                onChange={handleChange}
                // required
                className={`mt-1 block w-full border rounded px-3 py-2 text-base ${
                  errors.firstName ? "border-red-500" : "border-gray-200"
                }`}
              />
              {errors.firstName && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.firstName}
                </p>
              )}
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">
                Last name
              </label>
              <input
                type="text"
                name="lastName"
                placeholder="Last name"
                value={form.lastName}
                onChange={handleChange}
                // required
                className={`mt-1 block w-full border rounded px-3 py-2 text-base ${
                  errors.lastName ? "border-red-500" : "border-gray-200"
                }`}
              />
              {errors.lastName && (
                <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
            //   required
              className={`mt-1 block w-full border rounded px-3 py-2 text-base ${
                errors.email ? "border-red-500" : "border-gray-200"
              }`}
              autoComplete="email"
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                // required
                className={`mt-1 block w-full border rounded px-3 py-2 pr-10 text-base ${
                  errors.password ? "border-red-500" : "border-gray-200"
                }`}
                autoComplete="new-password"
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? (
                  // Eye-off icon (visible)
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9.27-3.11-10.5-7.5a10.05 10.05 0 012.908-4.412m2.122-1.415A9.956 9.956 0 0112 5c5 0 9.27 3.11 10.5 7.5a9.956 9.956 0 01-4.198 5.568M15 12a3 3 0 11-6 0 3 3 0 016 0zM3 3l18 18" />
                  </svg>
                ) : (
                  // Eye icon (hidden)
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
                <p className="text-xs text-red-500 mt-1">{errors.password}</p>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Confirm password
            </label>
              <input
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm your password"
                value={form.confirmPassword}
                onChange={handleChange}
                // required
                className={`mt-1 block w-full border rounded px-3 py-2 pr-10 text-base ${
                  errors.confirmPassword ? "border-red-500" : "border-gray-200"
                }`}
                autoComplete="new-password"
              />
            {errors.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Guideline text with extra bottom margin */}
          <div className="text-xs text-gray-500 mb-4">
            Use 8 or more characters with a mix of letters & numbers.
          </div>

        <button
            type="submit"
            className={`w-full py-3 text-lg text-white rounded transition font-bold ${
                loading
                ? "bg-blue-400 cursor-not-allowed"
                : successMsg
                ? "bg-green-500 hover:bg-green-600"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
            style={{ fontFamily: "'Poppins', 'Arial', sans-serif" }}
            disabled={loading}
            >
            <div className="flex items-center justify-center gap-3">
                {loading ? (
                <span>Registering...</span>
                ) : successMsg ? (
                <span>Registration successful!</span>
                ) : (
                <span>Register</span>
                )}
            </div>
        </button>

          <div
            className="text-center mt-4 text-sm text-gray-700 font-medium"
            style={{ fontFamily: "'Poppins', 'Arial', sans-serif" }}
          >
            Already have an account?{" "}
            <Link to="/" className="text-blue-500">
              Log In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
