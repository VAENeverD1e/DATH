import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiPost, setAuth } from "../api/client";

const Register = () => {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone_number: "",
    date_of_birth: "",
    address: "",
    gender: "",
    insurance_provider: "",
    insurance_number: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [formError, setFormError] = useState("");

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

  // Phone validation
  const validatePhone = (phone) => {
    if (!phone || !phone.trim()) {
      return "Phone number is required.";
    }
    if (!/^[\d+\-\s()]+$/.test(phone.trim())) {
      return "Phone number must contain only digits, +, -, and spaces.";
    }
    const digits = phone.trim().replace(/[\s\-()]/g, '');
    if (digits.length < 7 || digits.length > 20) {
      return "Phone number must be 7-20 digits.";
    }
    return "";
  };

  // Date of birth validation
  const validateDOB = (dob) => {
    if (!dob || !dob.trim()) {
      return "Date of birth is required.";
    }
    const date = new Date(dob);
    const today = new Date();
    if (isNaN(date.getTime())) {
      return "Invalid date format.";
    }
    if (date > today) {
      return "Date of birth cannot be in the future.";
    }
    const age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate()) ? age - 1 : age;
    if (actualAge < 13) {
      return "You must be at least 13 years old.";
    }
    return "";
  };

  // Address validation
  const validateAddress = (address) => {
    if (!address || !address.trim()) {
      return "Address is required.";
    }
    if (address.trim().length < 5) {
      return "Address must be at least 5 characters.";
    }
    if (address.trim().length > 200) {
      return "Address must not exceed 200 characters.";
    }
    return "";
  };

  // Insurance provider validation
  const validateInsuranceProvider = (provider) => {
    if (!provider || !provider.trim()) {
      return "Insurance provider is required.";
    }
    if (provider.trim().length < 2) {
      return "Insurance provider must be at least 2 characters.";
    }
    if (provider.trim().length > 100) {
      return "Insurance provider must not exceed 100 characters.";
    }
    return "";
  };

  // Insurance number validation
  const validateInsuranceNumber = (number) => {
    if (!number || !number.trim()) {
      return "Insurance number is required.";
    }
    if (!/^[A-Za-z0-9-]{4,50}$/.test(number.trim())) {
      return "Insurance number must be 4-50 characters (letters, numbers, and hyphens only).";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    const newErrors = {};
    setFormError(""); // clear previous general error

    // Check for empty required fields
    if (!form.firstName || !form.lastName || !form.email || !form.password || !form.confirmPassword ||
        !form.phone_number || !form.date_of_birth || !form.address || !form.gender ||
        !form.insurance_provider || !form.insurance_number) {
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
    }

    // Password validations
    const passwordError = validatePassword(form.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    // Phone validation
    const phoneError = validatePhone(form.phone_number);
    if (phoneError) {
      newErrors.phone_number = phoneError;
    }

    // DOB validation
    const dobError = validateDOB(form.date_of_birth);
    if (dobError) {
      newErrors.date_of_birth = dobError;
    }

    // Address validation
    const addressError = validateAddress(form.address);
    if (addressError) {
      newErrors.address = addressError;
    }

    // Gender validation
    if (!form.gender || !['Male', 'Female', 'Other'].includes(form.gender)) {
      newErrors.gender = "Please select a valid gender.";
    }

    // Insurance provider validation
    const insuranceProviderError = validateInsuranceProvider(form.insurance_provider);
    if (insuranceProviderError) {
      newErrors.insurance_provider = insuranceProviderError;
    }

    // Insurance number validation
    const insuranceNumberError = validateInsuranceNumber(form.insurance_number);
    if (insuranceNumberError) {
      newErrors.insurance_number = insuranceNumberError;
    }

    setErrors(newErrors);

    // Only proceed if no errors
    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      setSuccessMsg("");

      try {
        // Generate username from first + last name (lowercase)
        const username = `${form.firstName.toLowerCase()}${form.lastName.toLowerCase()}`;

        // Call real backend register API with all required fields
        const response = await apiPost('/api/auth/register', {
          username: username,
          email: form.email,
          password: form.password,
          phone_number: form.phone_number,
          date_of_birth: form.date_of_birth,
          address: form.address,
          gender: form.gender,
          insurance_provider: form.insurance_provider,
          insurance_number: form.insurance_number,
        });

        // Save auth and user to storage
        setAuth({
          token: response.token,
          user: response.user,
        }, false); // Don't use "Remember me" for new registrations by default

        setLoading(false);
        setSuccessMsg("Registration successful!");
        
        setTimeout(() => {
          // Redirect to user dashboard
          navigate('/user-dashboard', { replace: true });
        }, 900);
      } catch (err) {
        setLoading(false);
        // Handle field-specific errors from backend
        if (err.fields) {
          setErrors(err.fields);
        }
        setFormError(err.message || err.error || "Registration failed. Please try again.");
      }
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
        style={{ minHeight: "800px" }}
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
                placeholder="••••••••"
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

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone_number"
              placeholder="+1 (555) 000-0000"
              value={form.phone_number}
              onChange={handleChange}
              className={`mt-1 block w-full border rounded px-3 py-2 text-base ${
                errors.phone_number ? "border-red-500" : "border-gray-200"
              }`}
            />
            {errors.phone_number && (
              <p className="text-xs text-red-500 mt-1">{errors.phone_number}</p>
            )}
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date of Birth
            </label>
            <input
              type="date"
              name="date_of_birth"
              value={form.date_of_birth}
              onChange={handleChange}
              className={`mt-1 block w-full border rounded px-3 py-2 text-base ${
                errors.date_of_birth ? "border-red-500" : "border-gray-200"
              }`}
            />
            {errors.date_of_birth && (
              <p className="text-xs text-red-500 mt-1">{errors.date_of_birth}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <input
              type="text"
              name="address"
              placeholder="123 Main St, City, State, ZIP"
              value={form.address}
              onChange={handleChange}
              className={`mt-1 block w-full border rounded px-3 py-2 text-base ${
                errors.address ? "border-red-500" : "border-gray-200"
              }`}
            />
            {errors.address && (
              <p className="text-xs text-red-500 mt-1">{errors.address}</p>
            )}
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Gender
            </label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className={`mt-1 block w-full border rounded px-3 py-2 text-base ${
                errors.gender ? "border-red-500" : "border-gray-200"
              }`}
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            {errors.gender && (
              <p className="text-xs text-red-500 mt-1">{errors.gender}</p>
            )}
          </div>

          {/* Insurance Provider */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Insurance Provider
            </label>
            <input
              type="text"
              name="insurance_provider"
              placeholder="Insurance Company Name"
              value={form.insurance_provider}
              onChange={handleChange}
              className={`mt-1 block w-full border rounded px-3 py-2 text-base ${
                errors.insurance_provider ? "border-red-500" : "border-gray-200"
              }`}
            />
            {errors.insurance_provider && (
              <p className="text-xs text-red-500 mt-1">{errors.insurance_provider}</p>
            )}
          </div>

          {/* Insurance Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Insurance Number
            </label>
            <input
              type="text"
              name="insurance_number"
              placeholder="ABC123-456"
              value={form.insurance_number}
              onChange={handleChange}
              className={`mt-1 block w-full border rounded px-3 py-2 text-base ${
                errors.insurance_number ? "border-red-500" : "border-gray-200"
              }`}
            />
            {errors.insurance_number && (
              <p className="text-xs text-red-500 mt-1">{errors.insurance_number}</p>
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
