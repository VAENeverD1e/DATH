import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiPost, setAuth } from "../api/client";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LOCKOUT_LIMIT = 5;      // 5 failed attempts
const LOCKOUT_TIME = 30;      // seconds

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // loading state

  // Validation states
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");

  // Lockout logic
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockout, setLockout] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState(LOCKOUT_TIME);
  const lockoutTimer = useRef(null);

  // Show/hide password
  const [showPassword, setShowPassword] = useState(false);

  // Remember me checkbox
  const [rememberMe, setRememberMe] = useState(false);

  // Validate inputs
  const validate = () => {
    let valid = true;
    setEmailError("");
    setPasswordError("");
    setGeneralError("");

    if (!EMAIL_REGEX.test(email)) {
      setEmailError("Please enter a valid email address.");
      valid = false;
    }
    if (password.trim() === "") {
      setPasswordError("Password cannot be empty.");
      valid = false;
    }
    return valid;
  };

  // Handle lockout countdown
  React.useEffect(() => {
    if (lockout) {
      lockoutTimer.current = setInterval(() => {
        setLockoutSeconds((sec) => {
          if (sec <= 1) {
            clearInterval(lockoutTimer.current);
            setLockout(false);
            setFailedAttempts(0);
            setLockoutSeconds(LOCKOUT_TIME);
            return LOCKOUT_TIME;
          }
          return sec - 1;
        });
      }, 1000);
    }
    return () => clearInterval(lockoutTimer.current);
  }, [lockout]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (lockout) return;
    if (!validate()) return;

    setLoading(true);
    setGeneralError("");

    try {
      // Call real backend login API
      const response = await apiPost('/api/auth/login', {
        email: email,
        password: password,
      });

      // Save auth and user to storage
      setAuth(
        {
          token: response.token,
          user: response.user,
        },
        rememberMe // Use localStorage if "Remember me" is checked
      );

      setTimeout(() => {
        setLoading(false);
        // Redirect based on user role
        if (response.user.role === 'admin') {
          navigate('/admin', { replace: true });
        } else if (response.user.role === 'doctor') {
          navigate('/doctor', { replace: true });
        } else {
          // patient or default → go to homepage
          navigate('/home', { replace: true });
        }
      }, 800);
    } catch (err) {
      setLoading(false);
      setFailedAttempts((prev) => {
        const newCount = prev + 1;
        if (newCount >= LOCKOUT_LIMIT) {
          setLockout(true);
          setGeneralError("Too many failed attempts. Please try again later.");
        } else {
          setGeneralError(
            err.message || `Invalid email or password. Attempts remaining: ${LOCKOUT_LIMIT - newCount}`
          );
        }
        return newCount;
      });
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center relative" style={{ fontFamily: "'Poppins', 'Arial', sans-serif" }}>
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
    <div className="w-full max-w-md bg-white p-8 rounded-lg shadow relative z-10">
      <h2 className="text-2xl font-bold mb-8 text-center" style={{ fontFamily: "'Poppins', 'Arial', sans-serif" }}>
        Welcome back!
      </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Social Login Section */}
            <div className="mb-4">
              <div className="text-center text-sm text-gray-700 mb-3 font-medium" style={{ fontFamily: "'Poppins', 'Arial', sans-serif" }}>
                Sign in with an existing account
              </div>
              <div className="flex flex-row gap-3 justify-center">
                <button
                  type="button"
                  className="flex items-center justify-center px-4 py-2 rounded border border-gray-200 bg-white hover:bg-gray-50 transition font-medium"
                  style={{ fontFamily: "'Poppins', 'Arial', sans-serif" }}
                  // onClick={handleGoogleLogin}
                >
                <span className="inline-flex items-center justify-center h-5 w-5 mr-2">
                  <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google"
                    className="h-5 w-5"
                    style={{ display: "block" }}
                    draggable="false"
                  />
                </span>
                  Google
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center px-4 py-2 rounded border border-gray-200 bg-white hover:bg-gray-50 transition font-medium"
                  style={{ fontFamily: "'Poppins', 'Arial', sans-serif", color: "#1877f3" }}
                  // onClick={handleFacebookLogin}
                >
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="#1877f3">
                    <path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24H12.82v-9.294H9.692v-3.622h3.127V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0"/>
                  </svg>
                  Facebook
                </button>
              </div>
            </div>
              {/* Splitting line */}
              <div className="flex items-center my-4">
                <div className="flex-grow h-px bg-gray-200"></div>
                <span className="mx-3 text-gray-400 text-xs" style={{ fontFamily: "'Poppins', 'Arial', sans-serif" }}>or</span>
                <div className="flex-grow h-px bg-gray-200"></div>
              </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`mt-1 block w-full border ${
                emailError
                  ? "border-red-400"
                  : "border-gray-200"
              } rounded px-3 py-2`}
              placeholder="you@example.com"
              autoComplete="email"
              disabled={lockout || loading}
            />
            {emailError && (
              <span className="text-xs text-red-500">{emailError}</span>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`mt-1 block w-full border ${
                  passwordError
                    ? "border-red-400"
                    : "border-gray-200"
                } rounded px-3 py-2 pr-10`}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={lockout || loading}
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={lockout || loading}
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
            {passwordError && (
              <span className="text-xs text-red-500">{passwordError}</span>
            )}
          </div>
          {/* Remember Me Checkbox */}
          <div className="flex items-center mb-2">
            <input
              id="rememberMe"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              disabled={lockout || loading}
            />
            <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700" style={{ fontFamily: "'Poppins', 'Arial', sans-serif" }}>
              Remember me
            </label>
          </div>

          <button
            type="submit"
            className={`w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition ${
              lockout || loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={lockout || loading}
            style={{ fontFamily: "'Poppins', 'Arial', sans-serif" }}
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
              {lockout
                ? `Locked (${lockoutSeconds}s)`
                : loading
                ? "Signing in..."
                : "Sign in"}
            </span>
          </button>
          {generalError && (
            <div className="text-xs text-center text-red-600">{generalError}</div>
          )}
        </form>
        <p className="text-sm text-center text-gray-600 mt-4">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-500">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;