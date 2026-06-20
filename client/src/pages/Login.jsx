// src/pages/Login.js
import React, { useState } from "react";
import axios from "axios";
import API_BASE_URL from "../config/api";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";

// Icons
const EmailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const SparkleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
  </svg>
);

const ArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, formData);

      // Save login info
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // Success message before redirect
      setMessage("success:Successfully logged in! Redirecting...");
      setTimeout(() => {
        if (res.data.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/userhome");
        }
      }, 1000);
    } catch (err) {
      setMessage("error:" + (err.response?.data?.msg || "Invalid email or password"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0F1B2D] text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="animated-bg"></div>

      {/* Background Glow Effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#1B6B3A]/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#4A90D9]/15 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#2C5F8A]/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="flex items-center justify-center flex-1 px-6 py-16">
        <div className="w-full max-w-md fade-in-up">
          {/* Login Card */}
          <div className="glass-card p-10 relative overflow-hidden">
            {/* Decorative gradient line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1B6B3A] via-[#4A90D9] to-[#2C5F8A]"></div>

            {/* Logo */}
            <div className="flex justify-center mb-8">
              <img src="/logo.png" alt="GrievAssist Logo" className="w-20 h-20 object-contain drop-shadow-xl hover:scale-105 transition-transform" />
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold mb-2">
                Welcome <span className="text-gradient">Back</span>
              </h2>
              <p className="text-[#94A3B8]">Sign in to continue to GrievAssist</p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Field */}
              <div className="relative">
                <label className="form-label">Email Address</label>
                <div className="relative">
                  <span className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focusedField === 'email' ? 'text-[#1B6B3A]' : 'text-[#64748B]'}`}>
                    <EmailIcon />
                  </span>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    className="form-input pl-12"
                    style={{ paddingLeft: "3.5rem" }}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="relative">
                <label className="form-label">Password</label>
                <div className="relative">
                  <span className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focusedField === 'password' ? 'text-[#1B6B3A]' : 'text-[#64748B]'}`}>
                    <LockIcon />
                  </span>
                  <input
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    className="form-input pl-12"
                    style={{ paddingLeft: "3.5rem" }}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    required
                  />
                </div>
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#1B6B3A] focus:ring-[#1B6B3A] focus:ring-offset-0" />
                  <span className="text-[#94A3B8] group-hover:text-white transition-colors">Remember me</span>
                </label>
                <Link to="#" className="text-[#1B6B3A] hover:text-[#4A90D9] transition-colors font-medium">
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3
                  ${loading
                    ? "bg-[#1E293B] text-[#64748B] cursor-not-allowed"
                    : "bg-gradient-to-r from-[#1B6B3A] to-[#4A90D9] text-white hover:shadow-lg hover:shadow-[#1B6B3A]/40 hover:scale-[1.02]"
                  }`}
              >
                {loading ? (
                  <>
                    <div className="spinner !w-5 !h-5 !border-2"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowIcon />
                  </>
                )}
              </button>
            </form>



            {/* Sign Up Link */}
            <div className="text-center">
              <span className="text-[#94A3B8]">Don't have an account? </span>
              <Link to="/signup" className="text-[#1B6B3A] hover:text-[#4A90D9] font-semibold transition-colors">
                Create Account
              </Link>
            </div>

            {/* Message Alert */}
            {message && (
              <div className={`mt-6 p-4 rounded-xl flex items-center gap-3 ${message.startsWith("success:")
                  ? "bg-[#1B6B3A]/10 border border-[#1B6B3A]/30 text-[#1B6B3A]"
                  : "bg-red-500/10 border border-red-500/30 text-red-400"
                }`}>
                {message.startsWith("success:") ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                <span className="text-sm font-medium">{message.split(":")[1]}</span>
              </div>
            )}
          </div>

          {/* Security Note */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 text-[#64748B] text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#1B6B3A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Secured with 256-bit SSL encryption</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
