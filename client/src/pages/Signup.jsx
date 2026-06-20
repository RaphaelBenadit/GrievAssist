// src/pages/Signup.js
import React, { useState } from "react";
import axios from "axios";
import API_BASE_URL from "../config/api";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";

// Icons
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

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

const RocketIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

function Signup() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!acceptTerms) {
      setMessage("error:Please accept the Terms of Service and Privacy Policy");
      return;
    }
    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/signup`, formData);
      setMessage("success:" + (res.data.msg || "Account created successfully!"));
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setMessage("error:" + (err.response?.data?.msg || "Something went wrong. Try again!"));
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: "", color: "" };
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    const labels = ["", "Weak", "Fair", "Good", "Strong"];
    const colors = ["", "bg-red-500", "bg-yellow-500", "bg-blue-500", "bg-[#1B6B3A]"];
    return { strength, label: labels[strength], color: colors[strength] };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  // Benefits list
  const benefits = [
    "AI-powered complaint categorization",
    "Real-time status tracking",
    "Priority-based resolution",
    "24/7 support availability"
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#0F1B2D] text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="animated-bg"></div>

      {/* Background Glow Effects */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#2C5F8A]/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[#1B6B3A]/15 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#4A90D9]/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="flex items-center justify-center flex-1 px-6 py-16">
        <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Benefits */}
          <div className="hidden lg:block fade-in-left">
            <div className="mb-8">
              <span className="inline-flex items-center gap-2 bg-[#1B6B3A]/10 border border-[#1B6B3A]/30 text-[#1B6B3A] text-sm font-semibold px-4 py-2 rounded-full mb-4">
                <RocketIcon />
                Join GrievAssist Today
              </span>
              <h1 className="text-4xl font-extrabold mb-4">
                <span className="text-white">Start Your </span>
                <span className="text-gradient">Journey</span>
              </h1>
              <p className="text-[#94A3B8] text-lg leading-relaxed">
                Join thousands of citizens who have experienced faster, smarter grievance resolution with our AI-powered platform.
              </p>
            </div>

            {/* Benefits List */}
            <ul className="space-y-4">
              {benefits.map((benefit, index) => (
                <li
                  key={index}
                  className="flex items-center gap-4 text-[#94A3B8] fade-in-left"
                  style={{ animationDelay: `${index * 0.1 + 0.2}s` }}
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1B6B3A] to-[#4A90D9] flex items-center justify-center flex-shrink-0">
                    <CheckIcon />
                  </div>
                  <span className="text-white">{benefit}</span>
                </li>
              ))}
            </ul>

            {/* Testimonial Card */}
            <div className="mt-10 glass-card p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2C5F8A] to-[#3A7B5C]"></div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2C5F8A] to-[#3A7B5C] flex items-center justify-center text-lg font-bold">
                  R
                </div>
                <div>
                  <p className="text-[#94A3B8] italic mb-3">
                    "GrievAssist resolved my complaint in just 2 days. The AI categorization made the process incredibly smooth!"
                  </p>
                  <p className="text-white font-semibold">Rahul K.L</p>
                  <p className="text-[#64748B] text-sm">Ex - RCB Player</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Signup Form */}
          <div className="fade-in-up lg:fade-in-right">
            <div className="glass-card p-10 relative overflow-hidden">
              {/* Decorative gradient line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1B6B3A] via-[#4A90D9] to-[#2C5F8A]"></div>

              {/* Logo */}
              <div className="flex justify-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1B6B3A] to-[#4A90D9] flex items-center justify-center shadow-lg shadow-[#1B6B3A]/30">
                  <SparkleIcon />
                </div>
              </div>

              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-extrabold mb-2">
                  Create <span className="text-gradient">Account</span>
                </h2>
                <p className="text-[#94A3B8]">Get started with GrievAssist for free</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSignup} className="space-y-5">
                {/* Name Field */}
                <div className="relative">
                  <label className="form-label">Full Name</label>
                  <div className="relative">
                    <span className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focusedField === 'name' ? 'text-[#1B6B3A]' : 'text-[#64748B]'}`}>
                      <UserIcon />
                    </span>
                    <input
                      type="text"
                      name="name"
                      placeholder="Enter your full name"
                      className="form-input pl-12"
                      onChange={handleChange}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                      required
                    />
                  </div>
                </div>

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
                      placeholder="Create a strong password"
                      className="form-input pl-12"
                      onChange={handleChange}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      required
                    />
                  </div>

                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="mt-3">
                      <div className="flex gap-1 mb-2">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full transition-all ${level <= passwordStrength.strength ? passwordStrength.color : 'bg-white/10'
                              }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-[#64748B]">
                        Password strength: <span className={passwordStrength.strength >= 3 ? 'text-[#1B6B3A]' : 'text-[#4A8AB5]'}>{passwordStrength.label}</span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Terms Checkbox */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative mt-1">
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="w-5 h-5 rounded border-white/20 bg-white/5 text-[#1B6B3A] focus:ring-[#1B6B3A] focus:ring-offset-0 cursor-pointer"
                    />
                  </div>
                  <span className="text-sm text-[#94A3B8] group-hover:text-white transition-colors">
                    I agree to the <Link to="#" className="text-[#1B6B3A] hover:underline">Terms of Service</Link> and <Link to="#" className="text-[#1B6B3A] hover:underline">Privacy Policy</Link>
                  </span>
                </label>

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
                      <span>Creating account...</span>
                    </>
                  ) : (
                    <>
                      <RocketIcon />
                      <span>Create Account</span>
                    </>
                  )}
                </button>
              </form>

              {/* Sign In Link */}
              <div className="text-center mt-8">
                <span className="text-[#94A3B8]">Already have an account? </span>
                <Link to="/login" className="text-[#1B6B3A] hover:text-[#4A90D9] font-semibold transition-colors">
                  Sign In
                </Link>
              </div>

              {/* Message Alert */}
              {message && (
                <div className={`mt-6 p-4 rounded-xl flex items-center gap-3 ${message.startsWith("success:")
                  ? "bg-[#1B6B3A]/10 border border-[#1B6B3A]/30 text-[#1B6B3A]"
                  : "bg-red-500/10 border border-red-500/30 text-red-400"
                  }`}>
                  {message.startsWith("success:") ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  <span className="text-sm font-medium">{message.split(":")[1]}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
