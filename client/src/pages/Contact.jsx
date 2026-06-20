// src/pages/Contact.js
import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// Icons
const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const EmailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const LocationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const MessageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
  </svg>
);

function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [focusedField, setFocusedField] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission
    setSubmitted(true);
    setFormData({ name: "", email: "", subject: "", message: "" });
    setTimeout(() => setSubmitted(false), 3000);
  };

  const contactInfo = [
    {
      icon: <PhoneIcon />,
      title: "Phone",
      primary: "1800-425-1234",
      secondary: "Toll Free (24/7)",
      color: "from-[#1B6B3A] to-[#4A90D9]"
    },
    {
      icon: <EmailIcon />,
      title: "Email",
      primary: "support@grievassist.gov.in",
      secondary: "We reply within 24 hours",
      color: "from-[#2C5F8A] to-[#3A7B5C]"
    },
    {
      icon: <LocationIcon />,
      title: "Address",
      primary: "Secretariat, Chennai",
      secondary: "600009, Tamil Nadu",
      color: "from-[#4A8AB5] to-[#3D8B5A]"
    },
    {
      icon: <ClockIcon />,
      title: "Working Hours",
      primary: "Mon - Sat: 9AM - 6PM",
      secondary: "Sunday: Closed",
      color: "from-[#4A90D9] to-[#1B6B3A]"
    }
  ];

  const faqs = [
    {
      question: "How do I submit a complaint?",
      answer: "Simply create an account, log in, and click on 'Submit Complaint'. Fill in the required details and our AI will categorize and route your complaint automatically."
    },
    {
      question: "How long does it take to resolve a complaint?",
      answer: "Resolution time varies based on the complexity of the issue. Our AI prioritizes urgent complaints, and average resolution time is 24-48 hours for standard issues."
    },
    {
      question: "Can I track my complaint status?",
      answer: "Yes! You can track your complaint status in real-time through your dashboard or by using our AI chatbot with your complaint ID."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#0F1B2D] text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="animated-bg"></div>

      {/* Background Glow Effects */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#1B6B3A]/15 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[#2C5F8A]/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center fade-in-up">
          <span className="inline-flex items-center gap-2 bg-[#1B6B3A]/10 border border-[#1B6B3A]/30 text-[#1B6B3A] text-sm font-semibold px-4 py-2 rounded-full mb-6">
            <MessageIcon />
            Get in Touch
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6">
            <span className="text-white">We're Here to </span>
            <span className="text-gradient">Help</span>
          </h1>
          <p className="text-[#94A3B8] text-lg md:text-xl max-w-2xl mx-auto">
            Have questions or need assistance? Our team is ready to help you with any queries about GrievAssist.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="relative z-10 py-12 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {contactInfo.map((info, index) => (
            <div
              key={index}
              className="glass-card !rounded-xl p-6 text-center relative overflow-hidden fade-in-up hover:scale-105 transition-transform"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${info.color}`}></div>
              <div className={`w-14 h-14 mx-auto rounded-xl bg-gradient-to-br ${info.color} flex items-center justify-center mb-4`}>
                {info.icon}
              </div>
              <h3 className="font-bold mb-2">{info.title}</h3>
              <p className="text-white font-medium">{info.primary}</p>
              <p className="text-[#64748B] text-sm">{info.secondary}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Main Content */}
      <section className="relative z-10 py-16 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="fade-in-left">
            <div className="glass-card p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1B6B3A] via-[#4A90D9] to-[#2C5F8A]"></div>

              <h2 className="text-2xl font-bold mb-2">
                <span className="text-gradient">Send us a Message</span>
              </h2>
              <p className="text-[#94A3B8] mb-8">Fill out the form and we'll get back to you shortly.</p>

              {submitted && (
                <div className="mb-6 p-4 rounded-xl bg-[#1B6B3A]/10 border border-[#1B6B3A]/30 text-[#1B6B3A] flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">Message sent successfully! We'll respond soon.</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name Field */}
                <div>
                  <label className="form-label">Your Name</label>
                  <div className="relative">
                    <span className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focusedField === 'name' ? 'text-[#1B6B3A]' : 'text-[#64748B]'}`}>
                      <UserIcon />
                    </span>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      placeholder="Enter your name"
                      className="form-input pl-12"
                      onChange={handleChange}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                      required
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label className="form-label">Email Address</label>
                  <div className="relative">
                    <span className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focusedField === 'email' ? 'text-[#1B6B3A]' : 'text-[#64748B]'}`}>
                      <EmailIcon />
                    </span>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      placeholder="Enter your email"
                      className="form-input pl-12"
                      onChange={handleChange}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      required
                    />
                  </div>
                </div>

                {/* Subject Field */}
                <div>
                  <label className="form-label">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    placeholder="How can we help you?"
                    className="form-input"
                    onChange={handleChange}
                    onFocus={() => setFocusedField('subject')}
                    onBlur={() => setFocusedField(null)}
                    required
                  />
                </div>

                {/* Message Field */}
                <div>
                  <label className="form-label">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    placeholder="Tell us more about your inquiry..."
                    rows={5}
                    className="form-input resize-none"
                    onChange={handleChange}
                    onFocus={() => setFocusedField('message')}
                    onBlur={() => setFocusedField(null)}
                    required
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-[#1B6B3A] to-[#4A90D9] text-white hover:shadow-lg hover:shadow-[#1B6B3A]/40 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <SendIcon />
                  <span>Send Message</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right Side - FAQ & Map */}
          <div className="space-y-8 fade-in-right">
            {/* FAQ Section */}
            <div className="glass-card p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2C5F8A] to-[#3A7B5C]"></div>

              <h2 className="text-2xl font-bold mb-6">
                <span className="text-gradient">Frequently Asked Questions</span>
              </h2>

              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <div key={index} className="border-b border-white/10 pb-5 last:border-0 last:pb-0">
                    <h4 className="font-semibold text-white mb-2 flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-gradient-to-br from-[#1B6B3A] to-[#4A90D9] flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                        ?
                      </span>
                      {faq.question}
                    </h4>
                    <p className="text-[#94A3B8] text-sm pl-9">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="glass-card p-6 relative overflow-hidden border border-red-500/30">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-white">Emergency Hotline</h4>
                  <p className="text-red-400 text-lg font-semibold">112</p>
                  <p className="text-[#64748B] text-sm">For urgent matters outside business hours</p>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="glass-card p-2 h-64 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#0F1B2D] to-[#1E293B] flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1B6B3A] to-[#4A90D9] flex items-center justify-center mx-auto mb-4">
                    <LocationIcon />
                  </div>
                  <p className="text-white font-semibold">Chennai, Tamil Nadu</p>
                  <p className="text-[#64748B] text-sm">Secretariat Building</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Contact;
