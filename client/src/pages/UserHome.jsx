// src/pages/UserHome.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import HomeFeedPreview from "../components/HomeFeedPreview";

// Icons
const RocketIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
  </svg>
);

const BrainIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611l-.573.095c-1.423.237-2.885.238-4.31.003l8.488-.022m-5.382 0l-.423-.11a8.968 8.968 0 00-4.19 0l-.423.11" />
  </svg>
);

const ChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);

const DocumentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

function UserHome() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed && parsed.name ? parsed : null);
      } catch {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, []);

  const handleComplaintClick = () => {
    navigate("/complaint");
  };

  const features = [
    {
      icon: <RocketIcon />,
      title: "Quick Filing",
      description: "Submit complaints effortlessly with our streamlined, AI-powered process.",
      color: "from-[#1B6B3A] to-[#4A90D9]"
    },
    {
      icon: <BrainIcon />,
      title: "Smart Routing",
      description: "AI ensures your issue reaches the right department instantly.",
      color: "from-[#2C5F8A] to-[#3A7B5C]"
    },
    {
      icon: <ChartIcon />,
      title: "Track Progress",
      description: "Stay updated on complaint resolution with real-time tracking.",
      color: "from-[#4A8AB5] to-[#3D8B5A]"
    }
  ];

  const quickActions = [
    {
      icon: <PlusIcon />,
      title: "New Complaint",
      description: "Submit a new grievance",
      action: () => navigate("/complaint"),
      color: "from-[#1B6B3A] to-[#4A90D9]"
    },
    {
      icon: <EyeIcon />,
      title: "View Complaints",
      description: "Track your submissions",
      action: () => navigate("/my-complaints"),
      color: "from-[#2C5F8A] to-[#3A7B5C]"
    },
    {
      icon: <DocumentIcon />,
      title: "Help Center",
      description: "Get assistance",
      action: () => navigate("/contact"),
      color: "from-[#4A8AB5] to-[#3D8B5A]"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#0F1B2D] text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="animated-bg"></div>

      {/* Background Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#1B6B3A]/15 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#2C5F8A]/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Navbar */}
      <Navbar />

      {/* Marquee Banner */}
      <div className="marquee-container relative z-10">
        <div className="marquee-content">
          🚀 Your complaints matter • AI-powered resolution • Real-time tracking • Secure & transparent • File now, resolve faster 🚀
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 py-20 lg:py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center fade-in-up">
            {/* Welcome Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#1B6B3A]/20 to-[#4A90D9]/20 border border-[#1B6B3A]/30 rounded-full px-5 py-2 mb-8">
              <span className="w-2 h-2 bg-[#1B6B3A] rounded-full animate-pulse"></span>
              <span className="text-[#1B6B3A] font-medium text-sm">Welcome Back</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
              <span className="text-white">Hello, </span>
              <span className="text-gradient">{user?.name || "User"}</span>
              <span className="text-white">! 👋</span>
            </h1>

            <p className="text-[#94A3B8] text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              File your grievances easily and let our AI-powered system categorize & prioritize them for faster resolution.
            </p>

            {/* CTA Button */}
            <button
              onClick={handleComplaintClick}
              className="btn-primary btn-icon pulse-glow text-lg"
            >
              <PlusIcon />
              <span>Post New Complaint</span>
            </button>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="relative z-10 py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="glass-card !rounded-xl p-6 text-left hover:scale-105 transition-all duration-300 group fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  {action.icon}
                </div>
                <h3 className="font-bold text-lg mb-1">{action.title}</h3>
                <p className="text-[#64748B] text-sm">{action.description}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 fade-in-up">
            <span className="inline-block bg-[#2C5F8A]/10 border border-[#2C5F8A]/30 text-[#2C5F8A] text-sm font-semibold px-4 py-2 rounded-full mb-4">
              PLATFORM FEATURES
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold">
              <span className="text-white">How </span>
              <span className="text-gradient">GrievAssist</span>
              <span className="text-white"> Helps You</span>
            </h2>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="feature-card fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`feature-icon bg-gradient-to-br ${feature.color}`}>
                  {feature.icon}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-desc">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-16 px-6 mb-8">
        <div className="max-w-3xl mx-auto">
          <div className="glass-card p-10 relative overflow-hidden text-center">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1B6B3A]/10 to-[#4A90D9]/10 pointer-events-none"></div>

            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-extrabold mb-4">
                <span className="text-white">Need Help? </span>
                <span className="text-gradient">We're Here!</span>
              </h2>
              <p className="text-[#94A3B8] mb-8">
                Our AI chatbot is available 24/7 to assist you with any queries.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleComplaintClick}
                  className="btn-primary btn-icon"
                >
                  <RocketIcon />
                  <span>Submit Complaint</span>
                </button>
                <button
                  onClick={() => navigate("/contact")}
                  className="btn-secondary"
                >
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Embedded Public Resolution Feed */}
      <HomeFeedPreview user={user} />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default UserHome;
