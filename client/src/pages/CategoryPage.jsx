import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import API_BASE_URL from "../config/api";
import AdminNavbar from "../components/AdminNavbar";

// Icons
const TagIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

const ChevronUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
  </svg>
);

const DocumentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

function CategoryPage() {
  const [grouped, setGrouped] = useState([]);
  const [openCategory, setOpenCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchGroupedComplaints = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await axios.get(`${API_BASE_URL}/api/complaints/grouped/category`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGrouped(res.data || []);
    } catch (err) {
      console.error("Error fetching grouped complaints:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroupedComplaints();
  }, [fetchGroupedComplaints]);

  // Get priority badge classes
  const getPriorityBadge = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-500/20 text-red-400 border border-red-500/30";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
      case "low":
        return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
      default:
        return "bg-white/10 text-white/60 border border-white/20";
    }
  };

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

  // Calculate total complaints
  const totalComplaints = grouped.reduce((acc, cat) => acc + (cat.complaints?.length || 0), 0);

  // Get category color based on index
  const getCategoryColor = (index) => {
    const colors = [
      "from-[#1B6B3A] to-[#4A90D9]",
      "from-[#2C5F8A] to-[#3A7B5C]",
      "from-[#4A8AB5] to-[#3D8B5A]",
      "from-[#4A90D9] to-[#1B6B3A]",
      "from-[#3A7B5C] to-[#2C5F8A]",
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#0F1B2D]">
        <div className="animated-bg"></div>
        <AdminNavbar active="/admin/categories" />
        <main className="flex-1 md:ml-72 p-4 md:p-8 relative z-10 pt-20 md:pt-8 flex items-center justify-center">
          <div className="spinner"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0F1B2D]">
      {/* Animated Background */}
      <div className="animated-bg"></div>

      {/* Sidebar */}
      <AdminNavbar active="/admin/categories" />

      {/* Main Content */}
      <main className="flex-1 md:ml-72 p-4 md:p-8 relative z-10 pt-20 md:pt-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8 fade-in-left">
          <div>
            <h1 className="text-3xl font-extrabold mb-2">
              <span className="text-white">Complaint </span>
              <span className="text-gradient">Categories</span>
            </h1>
            <p className="text-[#94A3B8]">View complaints organized by AI-assigned categories</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="glass-card !rounded-xl p-6 relative overflow-hidden fade-in-up">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1B6B3A] to-[#4A90D9]"></div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#64748B] text-sm mb-1">Total Categories</p>
                <p className="text-3xl font-bold text-gradient">{grouped.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1B6B3A] to-[#4A90D9] flex items-center justify-center">
                <TagIcon />
              </div>
            </div>
          </div>

          <div className="glass-card !rounded-xl p-6 relative overflow-hidden fade-in-up delay-100">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2C5F8A] to-[#3A7B5C]"></div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#64748B] text-sm mb-1">Total Complaints</p>
                <p className="text-3xl font-bold text-[#2C5F8A]">{totalComplaints}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2C5F8A] to-[#3A7B5C] flex items-center justify-center">
                <DocumentIcon />
              </div>
            </div>
          </div>

          <div className="glass-card !rounded-xl p-6 relative overflow-hidden fade-in-up delay-200">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#4A8AB5] to-[#3D8B5A]"></div>
            <div className="flex items-center gap-4">
              <div>
                <p className="text-[#64748B] text-sm mb-2">Priority Legend</p>
                <div className="flex gap-2 flex-wrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityBadge("high")}`}>High</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityBadge("medium")}`}>Medium</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityBadge("low")}`}>Low</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Categories List */}
        {grouped.length === 0 ? (
          <div className="glass-card p-16 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-white/5 flex items-center justify-center mb-6">
              <TagIcon />
            </div>
            <p className="text-[#64748B] text-lg">No complaint categories found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {grouped.map((cat, idx) => (
              <div
                key={cat._id || idx}
                className={`glass-card !rounded-xl overflow-hidden transition-all duration-300 fade-in-up ${openCategory === cat.category ? "ring-2 ring-[#1B6B3A]/50" : ""
                  }`}
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                {/* Category Header */}
                <button
                  className="w-full px-6 py-5 flex items-center justify-between hover:bg-white/5 transition-colors"
                  onClick={() =>
                    setOpenCategory(openCategory === cat.category ? null : cat.category)
                  }
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getCategoryColor(idx)} flex items-center justify-center`}>
                      <TagIcon />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-bold text-white">{cat.category}</h3>
                      <p className="text-sm text-[#64748B]">{cat.complaints?.length || 0} complaints</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {cat.avgPriority && (
                      <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${getPriorityBadge(cat.avgPriority)}`}>
                        Avg: {cat.avgPriority}
                      </span>
                    )}
                    <span className="text-[#64748B]">
                      {openCategory === cat.category ? <ChevronUpIcon /> : <ChevronDownIcon />}
                    </span>
                  </div>
                </button>

                {/* Expanded Details */}
                {openCategory === cat.category && (
                  <div className="border-t border-white/10 p-6 bg-black/20">
                    {cat.complaints && cat.complaints.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="modern-table">
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Complaint ID</th>
                              <th>User</th>
                              <th>Description</th>
                              <th>Priority</th>
                              <th>Confidence</th>
                              <th>Status</th>
                              <th>Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {cat.complaints.map((c, i) => (
                              <tr key={c._id}>
                                <td className="text-[#64748B]">{i + 1}</td>
                                <td>
                                  <span className="font-mono text-[#1B6B3A] font-semibold">{c.complaintId}</span>
                                </td>
                                <td>
                                  <div>
                                    <p className="font-medium text-white">{c.user?.name || c.name || "-"}</p>
                                    <p className="text-xs text-[#64748B]">{c.user?.email || c.email || ""}</p>
                                  </div>
                                </td>
                                <td className="max-w-xs">
                                  <p className="truncate text-[#94A3B8]">
                                    {c.description?.length > 50 ? c.description.slice(0, 50) + "..." : c.description}
                                  </p>
                                </td>
                                <td>
                                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityBadge(c.priority)}`}>
                                    {c.priority}
                                  </span>
                                </td>
                                <td className="text-[#94A3B8]">
                                  {typeof c.modelConfidence === "number" ? `${(c.modelConfidence * 100).toFixed(0)}%` : "-"}
                                </td>
                                <td>
                                  <span className={`status-badge ${getStatusBadge(c.status)}`}>
                                    {c.status}
                                  </span>
                                </td>
                                <td className="text-[#94A3B8]">
                                  {new Date(c.createdAt).toLocaleDateString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-[#64748B]">No complaints under this category</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default CategoryPage;
