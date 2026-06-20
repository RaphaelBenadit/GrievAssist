// src/pages/Home.js
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import HomeFeedPreview from "../components/HomeFeedPreview";

// SVG Icons
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

const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
);

const ChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);

// Particle Component
const Particles = () => {
  const particles = useMemo(() => {
    return [...Array(20)].map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 15}s`,
      animationDuration: `${15 + Math.random() * 10}s`,
      size: `${4 + Math.random() * 4}px`,
      opacity: 0.3 + Math.random() * 0.4,
    }));
  }, []);

  return (
    <div className="particles-container">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="particle"
          style={{
            left: particle.left,
            animationDelay: particle.animationDelay,
            animationDuration: particle.animationDuration,
            width: particle.size,
            height: particle.size,
            opacity: particle.opacity,
          }}
        />
      ))}
    </div>
  );
};

function Home() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      return;
    }
    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 401) {
          setUser(null);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        } else {
          return res.json();
        }
      })
      .then(data => {
        if (data && data.name) {
          setUser(data);
          localStorage.setItem("user", JSON.stringify(data));
        }
      })
      .catch(() => {
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      });
  }, []);

  const handleComplaintClick = () => {
    if (user) {
      navigate("/complaint");
    } else {
      navigate("/login");
    }
  };

  // Features data
  const features = [
    {
      icon: <RocketIcon />,
      title: "Instant Submission",
      description: "Submit complaints in seconds with our streamlined, AI-guided form that adapts to your needs.",
      color: "from-[#1B6B3A] to-[#4A90D9]"
    },
    {
      icon: <BrainIcon />,
      title: "AI Categorization",
      description: "Advanced machine learning automatically categorizes and routes your complaint to the right department.",
      color: "from-[#2C5F8A] to-[#3A7B5C]"
    },
    {
      icon: <ShieldIcon />,
      title: "Priority Scoring",
      description: "Intelligent priority scoring ensures urgent issues receive immediate attention.",
      color: "from-[#4A8AB5] to-[#3D8B5A]"
    },
    {
      icon: <ChartIcon />,
      title: "Real-time Tracking",
      description: "Monitor your complaint status in real-time with detailed progress updates.",
      color: "from-[#4A90D9] to-[#1B6B3A]"
    },
    {
      icon: <ClockIcon />,
      title: "24/7 Availability",
      description: "Submit and track complaints anytime, anywhere with our always-on platform.",
      color: "from-[#3A7B5C] to-[#2C5F8A]"
    },
    {
      icon: <UsersIcon />,
      title: "Dedicated Support",
      description: "Our AI chatbot and support team are always ready to help you navigate the process.",
      color: "from-[#3D8B5A] to-[#4A8AB5]"
    }
  ];

  // Stats data
  const stats = [
    { number: "50K+", label: "Complaints Resolved" },
    { number: "98%", label: "Satisfaction Rate" },
    { number: "24hrs", label: "Avg Resolution Time" },
    { number: "10K+", label: "Active Users" }
  ];

  return (
    <div className="min-h-screen flex flex-col relative bg-[#0F1B2D] text-white overflow-hidden">
      {/* Animated Background */}
      <div className="animated-bg"></div>

      {/* Particles */}
      <Particles />

      {/* Navbar */}
      <Navbar />

      {/* Marquee Banner */}
      <div className="marquee-container relative z-10">
        <div className="marquee-content">
          ✨ From Complaint to Resolution – Experience the Power of AI-Driven Grievance Management! 🚀 Smart Categorization • Real-time Tracking • Priority Scoring ✨
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-24 lg:py-32">
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#1B6B3A]/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-[#4A90D9]/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative max-w-4xl mx-auto fade-in-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-5 py-2 mb-8">
            <span className="w-2 h-2 bg-[#1B6B3A] rounded-full animate-pulse"></span>
            <span className="text-[#94A3B8] text-sm font-medium">AI-Powered Grievance Platform</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-8 leading-tight">
            {user?.name ? (
              <>
                <span className="text-white">Welcome back, </span>
                <span className="text-gradient">{user.name}</span>
              </>
            ) : (
              <>
                <span className="text-white">Revolutionizing </span>
                <span className="text-gradient">Grievance</span>
                <br />
                <span className="text-white">Resolution with </span>
                <span className="text-gradient">AI</span>
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle mx-auto mb-12">
            Submit your complaints effortlessly and let our intelligent AI system categorize, prioritize, and route them for faster resolution. Experience the future of governance.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              className="btn-primary btn-icon pulse-glow"
              onClick={handleComplaintClick}
            >
              <RocketIcon />
              <span>{user ? "Submit New Complaint" : "Get Started"}</span>
            </button>
            <button
              className="btn-secondary btn-icon"
              onClick={() => navigate("/about")}
            >
              <span>Learn More</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="glass-card p-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="stats-card fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="stats-number">{stat.number}</div>
                <div className="stats-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16 fade-in-up">
            <span className="inline-block bg-[#1B6B3A]/10 border border-[#1B6B3A]/30 text-[#1B6B3A] text-sm font-semibold px-4 py-2 rounded-full mb-4">
              POWERFUL FEATURES
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
              <span className="text-white">Why Choose </span>
              <span className="text-gradient">GrievAssist?</span>
            </h2>
            <p className="text-[#94A3B8] max-w-2xl mx-auto text-lg">
              Our platform combines cutting-edge AI technology with user-friendly design to deliver the best grievance management experience.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass-card p-12 relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1B6B3A]/10 to-[#4A90D9]/10 pointer-events-none"></div>

            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-6">
                <span className="text-white">Ready to Get Your </span>
                <span className="text-gradient">Issues Resolved?</span>
              </h2>
              <p className="text-[#94A3B8] mb-8 text-lg max-w-xl mx-auto">
                Join thousands of citizens who have experienced faster, smarter grievance resolution with GrievAssist.
              </p>
              <button
                className="btn-primary btn-icon pulse-glow"
                onClick={handleComplaintClick}
              >
                <RocketIcon />
                <span>Submit Your Complaint Now</span>
              </button>
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

export default Home;
