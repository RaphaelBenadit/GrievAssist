import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../config/api";
import ComplaintsList from "../components/ComplaintsList";
import ComplaintPreview from "../components/ComplaintPreview";
import AdminNavbar from "../components/AdminNavbar";

// Icons
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const ChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ExclamationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

function AdminDashboard() {
  const [highlightId, setHighlightId] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [statusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [openId, setOpenId] = useState(null);
  const [statusDialog, setStatusDialog] = useState({ open: false, id: null });
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewComplaint, setPreviewComplaint] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const highlight = params.get("highlight");
    setHighlightId(highlight);
  }, []);

  const fetchComplaints = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }
      const res = await axios.get(`${API_BASE_URL}/api/complaints/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sorted = [...res.data].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setComplaints(sorted);
    } catch (err) {
      if (err.response?.status === 401) navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchComplaints();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const updateStatus = async (id, status) => {
    setIsUpdating(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE_URL}/api/complaints/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComplaints((prev) =>
        prev.map((c) => (c._id === id ? { ...c, status } : c))
      );
      setStatusDialog({ open: false, id: null });
      setSelectedStatus(null);
      setTimeout(() => fetchComplaints(), 500);
    } catch (err) {
      alert("Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCloseDialog = (e, complaintId) => {
    e.stopPropagation();
    if (statusDialog.id === complaintId) {
      setStatusDialog({ open: false, id: null });
      setSelectedStatus(null);
    }
  };

  const handlePreviewClick = (complaintId) => {
    const found = complaints.find(c => c._id === complaintId);
    setPreviewComplaint(found);
    setPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    setPreviewComplaint(null);
  };

  // Calculate stats
  const totalComplaints = complaints.length;
  const pendingComplaints = complaints.filter(c => c.status === "pending").length;
  const resolvedComplaints = complaints.filter(c => c.status === "resolved").length;
  const processingComplaints = complaints.filter(c => c.status === "processing").length;

  const stats = [
    {
      label: "Total Complaints",
      value: totalComplaints,
      icon: ChartIcon,
      color: "from-[#1B6B3A] to-[#4A90D9]",
      textColor: "text-[#1B6B3A]"
    },
    {
      label: "Pending",
      value: pendingComplaints,
      icon: ClockIcon,
      color: "from-[#4A8AB5] to-[#3D8B5A]",
      textColor: "text-[#4A8AB5]"
    },
    {
      label: "Processing",
      value: processingComplaints,
      icon: ExclamationIcon,
      color: "from-[#4A90D9] to-[#2C5F8A]",
      textColor: "text-[#4A90D9]"
    },
    {
      label: "Resolved",
      value: resolvedComplaints,
      icon: CheckCircleIcon,
      color: "from-[#1B6B3A] to-[#2A8F50]",
      textColor: "text-[#1B6B3A]"
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#0F1B2D]">
      {/* Animated Background */}
      <div className="animated-bg"></div>

      {/* Sidebar */}
      <AdminNavbar active="/admin/dashboard" />

      {/* Main Content */}
      <main className="flex-1 md:ml-72 p-4 md:p-8 relative z-10 pt-20 md:pt-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div className="fade-in-left">
            <h1 className="text-3xl font-extrabold mb-2">
              <span className="text-white">Admin </span>
              <span className="text-gradient">Dashboard</span>
            </h1>
            <p className="text-[#94A3B8]">Monitor and manage all grievance complaints</p>
          </div>

          <div className="flex items-center gap-4 fade-in-right">
            <button
              onClick={handleRefresh}
              className={`flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-[#94A3B8] hover:text-white hover:bg-white/10 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
            >
              <RefreshIcon />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={index}
                className="glass-card !rounded-xl p-6 relative overflow-hidden fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`}></div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#64748B] text-sm mb-1">{stat.label}</p>
                    <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} bg-opacity-10 flex items-center justify-center text-white`}>
                    <IconComponent />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Complaints Section */}
        <div className="glass-card !rounded-2xl overflow-hidden">
          {/* Section Header */}
          <div className="px-6 py-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">All Complaints</h2>
              <p className="text-sm text-[#64748B]">{totalComplaints} total complaints in the system</p>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-80">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]">
                <SearchIcon />
              </span>
              <input
                type="text"
                placeholder="Search by ID, description, user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#64748B] focus:outline-none focus:border-[#1B6B3A] focus:ring-1 focus:ring-[#1B6B3A] transition-all"
              />
            </div>
          </div>

          {/* Complaints List */}
          <div className="p-6">
            <ComplaintsList
              complaints={complaints}
              statusFilter={statusFilter}
              searchTerm={searchTerm}
              openId={openId}
              setOpenId={setOpenId}
              statusDialog={statusDialog}
              setStatusDialog={setStatusDialog}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
              isUpdating={isUpdating}
              handleCloseDialog={handleCloseDialog}
              updateStatus={updateStatus}
              highlightId={highlightId}
              onPreview={handlePreviewClick}
            />
          </div>
        </div>

        {/* Floating Complaint Preview Modal */}
        <ComplaintPreview
          complaint={previewComplaint}
          open={previewOpen}
          onClose={handleClosePreview}
          updateStatus={updateStatus}
        />
      </main>
    </div>
  );
}

export default AdminDashboard;
