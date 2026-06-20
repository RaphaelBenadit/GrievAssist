// src/pages/AdminFeedPublisher.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../config/api";
import AdminNavbar from "../components/AdminNavbar";
import AdminWrapper from "../components/AdminWrapper";

/* ============================================================
   ICONS
   ============================================================ */
const PublishIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

/* ============================================================
   HELPERS
   ============================================================ */
const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (days > 0) return `${days}d ago`;
  if (hrs > 0) return `${hrs}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return "Just now";
};

/* ============================================================
   PUBLISH FORM MODAL
   ============================================================ */
function PublishModal({ complaint, onClose, onPublished, apiBase }) {
  const [form, setForm] = useState({
    title: complaint.description?.substring(0, 80) || "",
    description: complaint.description || "",
    proofText: "",
    proofVideoUrl: "",
  });
  const [proofImages, setProofImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState(null);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    setProofImages(files);
    setPreviewUrls(files.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPublishing(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("complaintId", complaint._id);
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("proofText", form.proofText);
      if (form.proofVideoUrl) formData.append("proofVideoUrl", form.proofVideoUrl);
      proofImages.forEach((img) => formData.append("proofImages", img));

      const res = await axios.post(`${apiBase}/api/feed`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      onPublished(res.data.feedPost);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to publish");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0F1B2D] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-[#0F1B2D] border-b border-white/10 px-8 py-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-white">Publish to Public Feed</h2>
            <p className="text-[#64748B] text-sm mt-1">
              Complaint <span className="text-[#4A90D9] font-mono">{complaint.complaintId}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#64748B] hover:text-white bg-white/5 hover:bg-white/10 rounded-xl p-2 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {/* Post Title */}
          <div>
            <label className="block text-[#94A3B8] text-sm font-semibold mb-2">
              Post Title <span className="text-red-400">*</span>
            </label>
            <input
              id="feed-title"
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
              maxLength={150}
              placeholder="Brief title for this resolved complaint…"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#64748B] focus:outline-none focus:border-[#4A90D9]/50 transition-all text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[#94A3B8] text-sm font-semibold mb-2">
              Public Description <span className="text-red-400">*</span>
            </label>
            <textarea
              id="feed-description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              required
              rows={4}
              maxLength={1000}
              placeholder="Describe the resolved complaint for public visibility…"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#64748B] focus:outline-none focus:border-[#4A90D9]/50 transition-all text-sm resize-none"
            />
          </div>

          {/* Resolution Note */}
          <div>
            <label className="block text-[#94A3B8] text-sm font-semibold mb-2">
              Resolution Note / Proof Text
            </label>
            <textarea
              id="feed-proof-text"
              value={form.proofText}
              onChange={(e) => setForm((f) => ({ ...f, proofText: e.target.value }))}
              rows={3}
              maxLength={600}
              placeholder="Explain how this complaint was resolved, what action was taken…"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#64748B] focus:outline-none focus:border-[#1B6B3A]/50 transition-all text-sm resize-none"
            />
          </div>

          {/* Proof Images */}
          <div>
            <label className="block text-[#94A3B8] text-sm font-semibold mb-2">
              Proof Images (up to 5)
            </label>
            <input
              id="feed-proof-images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="w-full text-[#94A3B8] text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#1B6B3A]/20 file:text-[#1B6B3A] hover:file:bg-[#1B6B3A]/30 cursor-pointer"
            />
            {previewUrls.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {previewUrls.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`Preview ${i + 1}`}
                    className="w-full aspect-video object-cover rounded-xl ring-1 ring-white/10"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Proof Video URL */}
          <div>
            <label className="block text-[#94A3B8] text-sm font-semibold mb-2">
              Proof Video URL (Cloudinary / YouTube / external)
            </label>
            <input
              id="feed-proof-video"
              type="url"
              value={form.proofVideoUrl}
              onChange={(e) => setForm((f) => ({ ...f, proofVideoUrl: e.target.value }))}
              placeholder="https://…"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#64748B] focus:outline-none focus:border-[#4A90D9]/50 transition-all text-sm"
            />
          </div>

          {/* Complaint original video if exists */}
          {complaint.videoUrl && !form.proofVideoUrl && (
            <div className="bg-[#4A90D9]/10 border border-[#4A90D9]/25 rounded-xl p-4 text-sm text-[#94A3B8]">
              <p className="font-semibold text-[#4A90D9] mb-1">Original complaint video available</p>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, proofVideoUrl: complaint.videoUrl }))}
                className="text-[#4A90D9] hover:underline"
              >
                Use original video as proof →
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white/5 border border-white/10 text-[#94A3B8] hover:text-white hover:bg-white/10 rounded-xl py-3 font-semibold transition-all text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="publish-submit-btn"
              disabled={publishing}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#1B6B3A] to-[#4A90D9] text-white rounded-xl py-3 font-semibold hover:opacity-90 disabled:opacity-50 transition-all text-sm"
            >
              {publishing ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <PublishIcon />
              )}
              {publishing ? "Publishing…" : "Publish to Feed"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ============================================================
   ADMIN FEED PUBLISHER MAIN PAGE
   ============================================================ */
function AdminFeedPublisher() {
  const [complaints, setComplaints] = useState([]);
  const [feedPosts, setFeedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("publish"); // "publish" | "manage"
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const apiBase = `${window.location.protocol}//${window.location.hostname}:5000`;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) { navigate("/"); return; }

      const [compRes, feedRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/complaints/all`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${apiBase}/api/feed?limit=100`).then((r) => r.json()),
      ]);

      // Only resolved complaints
      const resolved = compRes.data.filter((c) => c.status === "resolved");
      setComplaints(resolved.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setFeedPosts(feedRes.posts || []);
    } catch (err) {
      if (err.response?.status === 401) navigate("/");
    } finally {
      setLoading(false);
    }
  }, [navigate, apiBase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handlePublished = (newPost) => {
    setSelectedComplaint(null);
    setFeedPosts((prev) => [newPost, ...prev]);
    setSuccess(`"${newPost.title}" published to the public feed!`);
    setTimeout(() => setSuccess(null), 4000);
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Delete this feed post? This cannot be undone.")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${apiBase}/api/feed/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFeedPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch {
      alert("Failed to delete post");
    }
  };

  const publishedIds = new Set(feedPosts.map((p) => p.complaint?.toString()));

  const filteredComplaints = complaints.filter((c) => {
    const q = searchTerm.toLowerCase();
    return (
      !q ||
      c.complaintId?.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q) ||
      c.district?.toLowerCase().includes(q) ||
      c.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex min-h-screen bg-[#0F1B2D]">
      <div className="animated-bg" />
      <AdminNavbar active="/admin/feed" />

      <main className="flex-1 md:ml-72 p-4 md:p-8 relative z-10 pt-20 md:pt-8">
        {/* Header */}
        <div className="mb-8 fade-in-left">
          <h1 className="text-3xl font-extrabold mb-2">
            <span className="text-white">Feed </span>
            <span className="text-gradient">Publisher</span>
          </h1>
          <p className="text-[#94A3B8]">
            Publish resolved complaints with proof to the public transparency feed
          </p>
        </div>

        {/* Success message */}
        {success && (
          <div className="mb-6 flex items-center gap-3 bg-[#1B6B3A]/20 border border-[#1B6B3A]/40 text-[#00E68A] rounded-xl px-5 py-4 text-sm font-semibold animate-fade-in-down">
            <CheckIcon />
            {success}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-3 mb-8">
          <button
            id="tab-publish"
            onClick={() => setTab("publish")}
            className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${tab === "publish" ? "bg-gradient-to-r from-[#1B6B3A] to-[#4A90D9] text-white shadow-lg" : "bg-white/5 text-[#94A3B8] border border-white/10 hover:bg-white/10"}`}
          >
            Resolved Complaints ({complaints.length})
          </button>
          <button
            id="tab-manage"
            onClick={() => setTab("manage")}
            className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${tab === "manage" ? "bg-gradient-to-r from-[#1B6B3A] to-[#4A90D9] text-white shadow-lg" : "bg-white/5 text-[#94A3B8] border border-white/10 hover:bg-white/10"}`}
          >
            Published Posts ({feedPosts.length})
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-[#1B6B3A]/30 border-t-[#00E68A] rounded-full animate-spin" />
          </div>
        ) : tab === "publish" ? (
          /* =========================================================
             TAB: Resolved Complaints → Publish
             ========================================================= */
          <div className="glass-card !rounded-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <h2 className="text-lg font-bold text-white">Resolved Complaints</h2>
                <p className="text-xs text-[#64748B]">Select a complaint to publish it with proof to the public feed</p>
              </div>
              <input
                type="text"
                placeholder="Search complaints…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-72 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#4A90D9]/50 transition-all"
              />
            </div>

            {filteredComplaints.length === 0 ? (
              <div className="py-16 text-center text-[#64748B]">
                <p className="text-5xl mb-4">📭</p>
                <p>No resolved complaints found</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {filteredComplaints.map((c) => {
                  const alreadyPublished = publishedIds.has(c._id);
                  return (
                    <div key={c._id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-white/3 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-[#4A90D9] text-xs font-mono font-bold">{c.complaintId}</span>
                          {c.district && <span className="text-[#64748B] text-xs">· {c.district}</span>}
                          {c.category && (
                            <span className="bg-white/5 text-[#94A3B8] text-xs px-2 py-0.5 rounded-full">
                              {c.category}
                            </span>
                          )}
                          {alreadyPublished && (
                            <span className="bg-[#1B6B3A]/20 text-[#00E68A] text-xs px-2 py-0.5 rounded-full border border-[#1B6B3A]/30 flex items-center gap-1">
                              <CheckIcon />
                              Published
                            </span>
                          )}
                        </div>
                        <p className="text-white text-sm font-medium mb-1 truncate">{c.description?.substring(0, 100)}…</p>
                        <p className="text-[#64748B] text-xs">{timeAgo(c.createdAt)} · {c.name}</p>
                      </div>

                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          id={`preview-btn-${c._id}`}
                          onClick={() => window.open(`/admin/dashboard?highlight=${c._id}`, "_blank")}
                          className="flex items-center gap-1.5 bg-white/5 border border-white/10 text-[#94A3B8] hover:text-white hover:bg-white/10 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                          title="View in dashboard"
                        >
                          <EyeIcon />
                          View
                        </button>
                        <button
                          id={`publish-btn-${c._id}`}
                          onClick={() => setSelectedComplaint(c)}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                            alreadyPublished
                              ? "bg-[#1B6B3A]/10 text-[#00E68A] border border-[#1B6B3A]/30 hover:bg-[#1B6B3A]/20"
                              : "bg-gradient-to-r from-[#1B6B3A] to-[#4A90D9] text-white hover:opacity-90"
                          }`}
                          title={alreadyPublished ? "Publish again with updated proof" : "Publish to feed"}
                        >
                          <PublishIcon />
                          {alreadyPublished ? "Re-publish" : "Publish"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* =========================================================
             TAB: Manage Published Posts
             ========================================================= */
          <div className="glass-card !rounded-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-white/5">
              <h2 className="text-lg font-bold text-white">Published Feed Posts</h2>
              <p className="text-xs text-[#64748B]">
                Manage what's currently visible on the public feed
              </p>
            </div>

            {feedPosts.length === 0 ? (
              <div className="py-16 text-center text-[#64748B]">
                <p className="text-5xl mb-4">📢</p>
                <p>No posts published yet</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {feedPosts.map((post) => (
                  <div key={post._id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-white/3 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-[#4A90D9] text-xs font-mono font-bold">{post.complaintId}</span>
                        {post.district && <span className="text-[#64748B] text-xs">· {post.district}</span>}
                        <span className="text-[#64748B] text-xs">· {timeAgo(post.createdAt)}</span>
                      </div>
                      <p className="text-white text-sm font-medium mb-1 truncate">{post.title}</p>
                      <div className="flex items-center gap-4 text-xs text-[#64748B]">
                        <span>👍 {post.upvotes?.length || 0} upvotes</span>
                        <span>💬 {post.comments?.length || 0} comments</span>
                        {post.proofImages?.length > 0 && <span>🖼 {post.proofImages.length} images</span>}
                        {post.proofVideos?.length > 0 && <span>🎥 {post.proofVideos.length} videos</span>}
                      </div>
                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => window.open("/feed", "_blank")}
                        className="flex items-center gap-1.5 bg-white/5 border border-white/10 text-[#94A3B8] hover:text-white hover:bg-white/10 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                      >
                        <EyeIcon />
                        View
                      </button>
                      <button
                        id={`delete-post-${post._id}`}
                        onClick={() => handleDelete(post._id)}
                        className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                      >
                        <TrashIcon />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Publish Modal */}
      {selectedComplaint && (
        <PublishModal
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          onPublished={handlePublished}
          apiBase={apiBase}
        />
      )}
    </div>
  );
}

export default AdminFeedPublisher;
