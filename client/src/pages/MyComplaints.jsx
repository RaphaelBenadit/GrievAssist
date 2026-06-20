// src/pages/MyComplaints.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axios from "axios";
import API_BASE_URL from "../config/api";

// Icons
const DocumentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const LocationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const ImageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE_URL}/api/complaints/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setComplaints(res.data);
      } catch (err) {
        setComplaints([]);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  // Get status badge classes
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "status-pending";
      case "processing":
      case "in progress":
        return "status-processing";
      case "resolved":
        return "status-resolved";
      case "rejected":
        return "status-rejected";
      default:
        return "bg-white/10 text-white/60";
    }
  };

  // Calculate stats
  const pendingCount = complaints.filter(c => c.status?.toLowerCase() === "pending").length;
  const resolvedCount = complaints.filter(c => c.status?.toLowerCase() === "resolved").length;
  const processingCount = complaints.filter(c => ["processing", "in progress"].includes(c.status?.toLowerCase())).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#0F1B2D] text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="animated-bg"></div>

      {/* Background Glow Effects */}
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-[#1B6B3A]/15 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-[#2C5F8A]/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="flex-1 relative z-10 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8 fade-in-up">
            <div>
              <span className="inline-flex items-center gap-2 bg-[#1B6B3A]/10 border border-[#1B6B3A]/30 text-[#1B6B3A] text-sm font-semibold px-4 py-2 rounded-full mb-4">
                <DocumentIcon />
                Your Complaints
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
                <span className="text-white">My </span>
                <span className="text-gradient">Complaints</span>
              </h1>
              <p className="text-[#94A3B8]">Track and manage all your submitted grievances</p>
            </div>

            <button
              onClick={() => navigate("/complaint")}
              className="btn-primary btn-icon self-start lg:self-auto"
            >
              <PlusIcon />
              <span>New Complaint</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className="glass-card !rounded-xl p-6 relative overflow-hidden fade-in-up">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1B6B3A] to-[#4A90D9]"></div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#64748B] text-sm mb-1">Total Submitted</p>
                  <p className="text-3xl font-bold text-gradient">{complaints.length}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1B6B3A] to-[#4A90D9] flex items-center justify-center">
                  <DocumentIcon />
                </div>
              </div>
            </div>

            <div className="glass-card !rounded-xl p-6 relative overflow-hidden fade-in-up delay-100">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#4A8AB5] to-[#3D8B5A]"></div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#64748B] text-sm mb-1">Pending</p>
                  <p className="text-3xl font-bold text-[#3D8B5A]">{pendingCount + processingCount}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4A8AB5] to-[#3D8B5A] flex items-center justify-center">
                  <ClockIcon />
                </div>
              </div>
            </div>

            <div className="glass-card !rounded-xl p-6 relative overflow-hidden fade-in-up delay-200">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1B6B3A] to-[#2A8F50]"></div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#64748B] text-sm mb-1">Resolved</p>
                  <p className="text-3xl font-bold text-[#1B6B3A]">{resolvedCount}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1B6B3A] to-[#2A8F50] flex items-center justify-center">
                  <CheckIcon />
                </div>
              </div>
            </div>
          </div>

          {/* Complaints List */}
          {loading ? (
            <div className="glass-card p-16 text-center">
              <div className="spinner mx-auto mb-4"></div>
              <p className="text-[#94A3B8]">Loading your complaints...</p>
            </div>
          ) : complaints.length === 0 ? (
            <div className="glass-card p-16 text-center fade-in-up">
              <div className="w-20 h-20 mx-auto rounded-full bg-white/5 flex items-center justify-center mb-6">
                <DocumentIcon />
              </div>
              <h3 className="text-xl font-bold mb-2">No Complaints Yet</h3>
              <p className="text-[#64748B] mb-6">You haven't submitted any complaints. File your first grievance now!</p>
              <button
                onClick={() => navigate("/complaint")}
                className="btn-primary btn-icon inline-flex"
              >
                <PlusIcon />
                <span>Submit Your First Complaint</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {complaints.map((c, index) => (
                <div
                  key={c._id}
                  className="glass-card !rounded-xl overflow-hidden fade-in-up hover:scale-[1.01] transition-transform"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Card Header */}
                  <div className="px-6 py-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1B6B3A] to-[#4A90D9] flex items-center justify-center text-lg font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-mono text-[#1B6B3A] font-semibold">{c.complaintId}</p>
                        <p className="text-sm text-[#64748B]">{new Date(c.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className={`status-badge ${getStatusBadge(c.status)}`}>
                      {c.status?.toUpperCase() || "N/A"}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="px-6 py-4">
                    <p className="text-[#94A3B8] mb-4">{c.description}</p>

                    <div className="flex flex-wrap gap-4 text-sm">
                      {c.district && (
                        <span className="flex items-center gap-2 text-[#64748B]">
                          <LocationIcon />
                          {c.district}
                        </span>
                      )}

                      {c.location?.lat && c.location?.lng && (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${c.location.lat},${c.location.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-[#4A90D9] hover:underline"
                        >
                          <LocationIcon />
                          View on Map
                        </a>
                      )}

                      {c.image && (
                        <a
                          href={`${API_BASE_URL}/uploads/${c.image}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-[#2C5F8A] hover:underline"
                        >
                          <ImageIcon />
                          View Image
                        </a>
                      )}

                      {c.voiceRecording && (
                        <span className="flex items-center gap-2 text-[#3A7B5C]">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                          </svg>
                          Voice Attached
                        </span>
                      )}
                    </div>
                  </div>

                  {/* AI Analysis (if available) */}
                  {(c.category || c.priority) && (
                    <div className="px-6 py-3 bg-white/5 border-t border-white/5 flex flex-wrap gap-4">
                      {c.category && (
                        <span className="flex items-center gap-2 text-sm">
                          <span className="text-[#64748B]">Category:</span>
                          <span className="px-3 py-1 rounded-full bg-[#1B6B3A]/20 text-[#1B6B3A] text-xs font-semibold">
                            {c.category}
                          </span>
                        </span>
                      )}
                      {c.priority && (
                        <span className="flex items-center gap-2 text-sm">
                          <span className="text-[#64748B]">Priority:</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${c.priority?.toLowerCase() === "high" ? "bg-red-500/20 text-red-400" :
                            c.priority?.toLowerCase() === "medium" ? "bg-yellow-500/20 text-yellow-400" :
                              "bg-blue-500/20 text-blue-400"
                            }`}>
                            {c.priority}
                          </span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default MyComplaints;
