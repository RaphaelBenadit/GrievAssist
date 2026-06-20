import React from "react";

// Icons
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

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const LocationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const FileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const ComplaintsList = ({
  complaints,
  statusFilter = "all",
  searchTerm = "",
  openId,
  setOpenId,
  highlightId,
  onPreview,
}) => {
  // Filter complaints
  let filteredComplaints =
    statusFilter === "all"
      ? complaints
      : complaints.filter((c) => {
        if (statusFilter === "resolved") return c.status === "resolved";
        if (statusFilter === "in progress") return c.status === "in progress";
        if (statusFilter === "pending") return c.status === "pending";
        return true;
      });

  // Search term filtering
  if (searchTerm.trim()) {
    const term = searchTerm.trim().toLowerCase();
    filteredComplaints = filteredComplaints.filter((c) => {
      return (
        (c.complaintId && c.complaintId.toLowerCase().includes(term)) ||
        (c.description && c.description.toLowerCase().includes(term)) ||
        (c.user?.name && c.user.name.toLowerCase().includes(term)) ||
        (c.name && c.name.toLowerCase().includes(term)) ||
        (c.user?.email && c.user.email.toLowerCase().includes(term)) ||
        (c.email && c.email.toLowerCase().includes(term))
      );
    });
  }

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

  return filteredComplaints.length === 0 ? (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto rounded-full bg-white/5 flex items-center justify-center mb-4">
        <FileIcon />
      </div>
      <p className="text-[#64748B]">No complaints found matching your criteria</p>
    </div>
  ) : (
    <div className="space-y-4">
      {filteredComplaints.map((c, index) => (
        <div
          key={c._id}
          className={`glass-card !rounded-xl overflow-hidden transition-all duration-300 fade-in-up ${openId === c._id ? "ring-2 ring-[#1B6B3A]/50" : ""
            } ${highlightId === c._id ? "ring-2 ring-[#4A90D9] !bg-[#4A90D9]/10" : ""
            }`}
          style={{ animationDelay: `${index * 0.05}s` }}
          onClick={() => setOpenId(openId === c._id ? null : c._id)}
        >
          {/* Summary Row */}
          <div className="relative px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/5 cursor-pointer transition-colors">
            {highlightId === c._id && (
              <span className="absolute top-2 right-2 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4A90D9] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#4A90D9]"></span>
              </span>
            )}

            <div className="flex items-center gap-4 flex-1 min-w-0">
              <span className="font-mono font-bold text-[#1B6B3A] text-lg flex-shrink-0">
                {c.complaintId || `#${index + 1}`}
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-white truncate pr-4">
                  {c.description || "No description provided"}
                </p>
                <div className="flex items-center gap-3 mt-1 text-xs text-[#64748B]">
                  <span className="flex items-center gap-1">
                    <UserIcon />
                    {c.user?.name || c.name || "Anonymous"}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-[#64748B]"></span>
                  <span className="flex items-center gap-1">
                    <ClockIcon />
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <span className={`status-badge ${getStatusBadge(c.status)}`}>
                {c.status || "pending"}
              </span>

              {/* Preview Button */}
              {typeof onPreview === "function" && (
                <button
                  className="hidden sm:flex px-4 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm font-medium border border-white/10 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPreview(c._id);
                  }}
                >
                  Preview
                </button>
              )}

              <span className="text-[#64748B]">
                {openId === c._id ? <ChevronUpIcon /> : <ChevronDownIcon />}
              </span>
            </div>
          </div>

          {/* Expanded details */}
          {openId === c._id && (
            <div className="bg-black/20 border-t border-white/10 px-6 py-6 cursor-default">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Column 1: Core Details */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1">Description</h4>
                    <p className="text-sm text-white leading-relaxed">{c.description || "N/A"}</p>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1">AI Analysis</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {c.category && (
                        <span className="px-2 py-1 rounded bg-[#1B6B3A]/20 text-[#1B6B3A] text-xs font-medium border border-[#1B6B3A]/30">
                          {c.category}
                        </span>
                      )}
                      {c.priority && (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityBadge(c.priority)}`}>
                          {c.priority} Priority
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Column 2: Location & Contact */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1">Location</h4>
                    <div className="flex items-start gap-2 text-sm text-white">
                      <LocationIcon />
                      <span>{c.district || "District not specified"}</span>
                    </div>
                    {c.address && <p className="text-xs text-[#94A3B8] mt-1 pl-6">{c.address}</p>}
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1">Contact Info</h4>
                    <p className="text-sm text-white">{c.user?.name || c.name || "N/A"}</p>
                    <p className="text-xs text-[#94A3B8]">{c.user?.email || c.email || "N/A"}</p>
                    {c.phone && <p className="text-xs text-[#94A3B8]">{c.phone}</p>}
                  </div>
                </div>

                {/* Column 3: Actions */}
                <div className="space-y-4 flex flex-col justify-end">
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <h4 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">Metadata</h4>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#94A3B8]">Created:</span>
                      <span className="text-white">{new Date(c.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#94A3B8]">Last Updated:</span>
                      <span className="text-white">{c.updatedAt ? new Date(c.updatedAt).toLocaleString() : "-"}</span>
                    </div>
                  </div>

                  <button
                    className="w-full btn-primary py-2 text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPreview(c._id);
                    }}
                  >
                    Open Full Details
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ComplaintsList;
