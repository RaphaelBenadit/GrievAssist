import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// Icons
const BrainIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611l-.573.095c-1.423.237-2.885.238-4.31.003l8.488-.022m-5.382 0l-.423-.11a8.968 8.968 0 00-4.19 0l-.423.11" />
  </svg>
);

const RocketIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
  </svg>
);

const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);

const GlobeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
  </svg>
);

const HeartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
);

function About() {
  const values = [
    {
      icon: <BrainIcon />,
      title: "AI-Powered Intelligence",
      description: "Leveraging cutting-edge machine learning algorithms to automatically categorize and prioritize complaints for efficient processing.",
      color: "from-[#2C5F8A] to-[#3A7B5C]"
    },
    {
      icon: <RocketIcon />,
      title: "Rapid Resolution",
      description: "Our streamlined workflow ensures that complaints reach the right department instantly, reducing resolution time significantly.",
      color: "from-[#1B6B3A] to-[#4A90D9]"
    },
    {
      icon: <ShieldIcon />,
      title: "Secure & Transparent",
      description: "Enterprise-grade security with complete transparency in the complaint resolution process, keeping you informed at every step.",
      color: "from-[#4A8AB5] to-[#3D8B5A]"
    },
    {
      icon: <UsersIcon />,
      title: "Citizen-Centric",
      description: "Designed with citizens in mind, our platform provides an intuitive interface that makes filing and tracking complaints effortless.",
      color: "from-[#4A90D9] to-[#1B6B3A]"
    }
  ];

  const timeline = [
    { year: "2023", title: "Platform Launch", description: "GrievAssist was launched with basic complaint management features." },
    { year: "2024", title: "AI Integration", description: "Integrated advanced AI for automatic categorization and priority scoring." },
    { year: "2024", title: "Mobile Optimization", description: "Launched fully responsive design for seamless mobile experience." },
    { year: "2025", title: "Chatbot Assistant", description: "Introduced AI-powered chatbot for 24/7 user assistance." }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#0F1B2D] text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="animated-bg"></div>

      {/* Background Glow Effects */}
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-[#1B6B3A]/15 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-[#2C5F8A]/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto text-center fade-in-up">
          <span className="inline-flex items-center gap-2 bg-[#1B6B3A]/10 border border-[#1B6B3A]/30 text-[#1B6B3A] text-sm font-semibold px-4 py-2 rounded-full mb-6">
            <span className="w-2 h-2 bg-[#1B6B3A] rounded-full animate-pulse"></span>
            About Our Platform
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6">
            <span className="text-white">Transforming </span>
            <span className="text-gradient">Governance</span>
            <br />
            <span className="text-white">Through </span>
            <span className="text-gradient">Technology</span>
          </h1>
          <p className="text-[#94A3B8] text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            GrievAssist is an AI-powered grievance redressal platform designed to bridge the gap between citizens and government authorities, ensuring faster, smarter, and more transparent complaint resolution.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="relative z-10 py-16 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
          <div className="glass-card p-8 relative overflow-hidden fade-in-left">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1B6B3A] to-[#4A90D9]"></div>
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#1B6B3A] to-[#4A90D9] flex items-center justify-center mb-6">
              <GlobeIcon />
            </div>
            <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
            <p className="text-[#94A3B8] leading-relaxed">
              To democratize access to grievance redressal by leveraging artificial intelligence, ensuring every citizen's voice is heard and addressed promptly, regardless of their location or status.
            </p>
          </div>

          <div className="glass-card p-8 relative overflow-hidden fade-in-right">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2C5F8A] to-[#3A7B5C]"></div>
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#2C5F8A] to-[#3A7B5C] flex items-center justify-center mb-6">
              <HeartIcon />
            </div>
            <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
            <p className="text-[#94A3B8] leading-relaxed">
              A future where technology enables seamless communication between citizens and authorities, where every complaint is resolved efficiently, and where governance truly serves the people.
            </p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 fade-in-up">
            <span className="inline-block bg-[#2C5F8A]/10 border border-[#2C5F8A]/30 text-[#2C5F8A] text-sm font-semibold px-4 py-2 rounded-full mb-4">
              OUR CORE VALUES
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
              <span className="text-white">What Sets Us </span>
              <span className="text-gradient">Apart</span>
            </h2>
            <p className="text-[#94A3B8] max-w-2xl mx-auto">
              We're committed to transforming the way citizens interact with government services.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div
                key={index}
                className="feature-card fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`feature-icon bg-gradient-to-br ${value.color}`}>
                  {value.icon}
                </div>
                <h3 className="feature-title">{value.title}</h3>
                <p className="feature-desc">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 fade-in-up">
            <span className="inline-block bg-[#4A90D9]/10 border border-[#4A90D9]/30 text-[#4A90D9] text-sm font-semibold px-4 py-2 rounded-full mb-4">
              OUR JOURNEY
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold">
              <span className="text-white">Platform </span>
              <span className="text-gradient">Evolution</span>
            </h2>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-4 md:left-1/2 md:transform md:-translate-x-1/2 w-1 h-full bg-gradient-to-b from-[#1B6B3A] via-[#4A90D9] to-[#2C5F8A] rounded-full"></div>

            {timeline.map((item, index) => (
              <div
                key={index}
                className={`relative flex items-center mb-12 fade-in-up md:${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                {/* Mobile: always show on the right of the line */}
                <div className={`w-full pl-12 md:pl-0 md:w-1/2 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12 md:text-left'}`}>
                  <div className="glass-card p-6">
                    <span className="text-[#1B6B3A] font-bold text-lg">{item.year}</span>
                    <h4 className="text-xl font-bold mt-2 mb-2">{item.title}</h4>
                    <p className="text-[#94A3B8] text-sm">{item.description}</p>
                  </div>
                </div>

                {/* Timeline Dot */}
                <div className="absolute left-4 md:left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gradient-to-br from-[#1B6B3A] to-[#4A90D9] rounded-full border-4 border-[#0F1B2D] z-10"></div>

                {/* Empty space for desktop alternating layout */}
                <div className="hidden md:block md:w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 py-16 px-6 mb-16">
        <div className="max-w-6xl mx-auto">
          <div className="glass-card p-10 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="stats-card fade-in-up">
              <div className="stats-number">50K+</div>
              <div className="stats-label">Complaints Resolved</div>
            </div>
            <div className="stats-card fade-in-up delay-100">
              <div className="stats-number">98%</div>
              <div className="stats-label">User Satisfaction</div>
            </div>
            <div className="stats-card fade-in-up delay-200">
              <div className="stats-number">10+</div>
              <div className="stats-label">Districts Covered</div>
            </div>
            <div className="stats-card fade-in-up delay-300">
              <div className="stats-number">24/7</div>
              <div className="stats-label">Support Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default About;
