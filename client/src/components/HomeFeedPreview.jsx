// src/components/HomeFeedPreview.jsx
// Embedded public feed preview shown directly on both Home and UserHome pages.
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config/api";

/* ─── tiny helpers ─────────────────────────────────────────────────── */
const timeAgo = (d) => {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000), h = Math.floor(m / 60), days = Math.floor(h / 24);
  if (days > 0) return `${days}d ago`;
  if (h > 0) return `${h}h ago`;
  if (m > 0) return `${m}m ago`;
  return "Just now";
};

const priorityColor = {
  high: "bg-red-500/20 text-red-400 border-red-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  low: "bg-green-500/20 text-green-400 border-green-500/30",
};

/* ─── mini card ─────────────────────────────────────────────────────── */
function MiniCard({ post, user, onUpvote, apiBase }) {
  const [upvoted, setUpvoted] = useState(false);
  const [count, setCount] = useState((post.upvotes || []).length);
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    if (!user) return;
    const uid = user._id || user.id;
    setUpvoted((post.upvotes || []).includes(uid));
    setCount((post.upvotes || []).length);
  }, [post.upvotes, user]);

  const handleUpvote = async () => {
    if (!user) return;
    const next = !upvoted;
    setUpvoted(next);
    setCount(c => next ? c + 1 : c - 1);
    await onUpvote(post._id);
  };

  const hasImages = post.proofImages?.length > 0;
  const hasVideo = post.proofVideos?.length > 0;

  return (
    <div className="feed-mini-card group">
      {/* Top gradient bar */}
      <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-[#00E68A] to-[#4A90D9] rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Proof image */}
      {hasImages && (
        <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden mb-4 bg-black/30">
          <img
            src={`${apiBase}/uploads/${post.proofImages[imgIdx]}`}
            alt="Proof"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={e => { e.target.style.display = 'none'; }}
          />
          {post.proofImages.length > 1 && (
            <div className="absolute bottom-2 right-2 flex gap-1">
              {post.proofImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${i === imgIdx ? 'bg-white scale-125' : 'bg-white/40'}`}
                />
              ))}
            </div>
          )}
          {/* Resolved badge overlay */}
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-[#1B6B3A]/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            RESOLVED
          </div>
        </div>
      )}

      {/* No image fallback header */}
      {!hasImages && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 bg-[#1B6B3A]/20 border border-[#1B6B3A]/40 text-[#00E68A] px-2.5 py-1 rounded-full text-[10px] font-bold">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            RESOLVED
          </div>
          {post.priority && (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${priorityColor[post.priority] || ''}`}>
              {post.priority.toUpperCase()}
            </span>
          )}
        </div>
      )}

      {/* Meta */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className="text-[#4A90D9] text-[10px] font-mono font-bold">{post.complaintId}</span>
        {post.district && <span className="text-[#64748B] text-[10px]">· {post.district}</span>}
        {post.category && (
          <span className="bg-white/5 text-[#94A3B8] text-[10px] px-2 py-0.5 rounded-full">
            {post.category}
          </span>
        )}
        <span className="text-[#64748B] text-[10px] ml-auto">{timeAgo(post.createdAt)}</span>
      </div>

      {/* Title */}
      <h3 className="text-sm font-bold text-white mb-2 leading-snug line-clamp-2 group-hover:text-[#00E68A] transition-colors duration-200">
        {post.title}
      </h3>

      {/* Description */}
      <p className="text-[#94A3B8] text-xs leading-relaxed mb-3 line-clamp-2">{post.description}</p>

      {/* Resolution note */}
      {post.proofText && (
        <div className="bg-[#1B6B3A]/10 border border-[#1B6B3A]/20 rounded-lg px-3 py-2 mb-3">
          <p className="text-[#00E68A] text-[10px] font-bold mb-0.5 uppercase tracking-wide">📋 Resolution</p>
          <p className="text-[#94A3B8] text-[11px] line-clamp-2">{post.proofText}</p>
        </div>
      )}

      {/* Video indicator */}
      {hasVideo && !hasImages && (
        <div className="flex items-center gap-1.5 text-[#4A90D9] text-xs mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
          </svg>
          <span>Video proof attached</span>
        </div>
      )}

      {/* Footer interaction bar */}
      <div className="flex items-center gap-3 pt-2 border-t border-white/5">
        <button
          onClick={handleUpvote}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 ${
            upvoted
              ? 'bg-[#00E68A]/15 text-[#00E68A] border border-[#00E68A]/30'
              : 'bg-white/5 text-[#64748B] hover:text-[#00E68A] hover:bg-[#00E68A]/10'
          } ${!user ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          title={!user ? "Login to upvote" : ""}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill={upvoted ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
          </svg>
          <span>{count}</span>
        </button>

        <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>{(post.comments || []).length}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── main component ─────────────────────────────────────────────────── */
export default function HomeFeedPreview({ user }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  const apiBase = useMemo(() => API_BASE_URL, []);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/api/feed?limit=6&skip=0`);
      if (!res.ok) return;
      const data = await res.json();
      setPosts(data.posts || []);
      setTotal(data.total || 0);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleUpvote = async (postId) => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    try {
      const res = await fetch(`${apiBase}/api/feed/${postId}/upvote`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setPosts(prev => prev.map(p => {
        if (p._id !== postId) return p;
        const uid = user?._id || user?.id;
        const newUpvotes = data.upvoted
          ? [...(p.upvotes || []), uid]
          : (p.upvotes || []).filter(u => u !== uid);
        return { ...p, upvotes: newUpvotes };
      }));
    } catch { /* silent */ }
  };

  if (loading) {
    return (
      <section className="relative z-10 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-[#1B6B3A]/30 border-t-[#00E68A] rounded-full animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  if (posts.length === 0) return null; // Don't show section if no feed posts exist

  return (
    <section className="relative z-10 py-16 px-6" id="public-feed-section">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 fade-in-up">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#1B6B3A]/15 border border-[#1B6B3A]/30 rounded-full px-4 py-1.5 mb-4">
              <span className="w-2 h-2 bg-[#00E68A] rounded-full animate-pulse" />
              <span className="text-[#00E68A] text-xs font-semibold uppercase tracking-wide">Live Transparency Board</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold">
              <span className="text-white">Resolved </span>
              <span className="text-gradient">Complaints</span>
            </h2>
            <p className="text-[#94A3B8] mt-2 text-sm max-w-lg">
              Real grievances, real proof, real accountability. Published by the admin with verified evidence.
            </p>
          </div>

          <button
            onClick={() => navigate("/feed")}
            className="flex-shrink-0 flex items-center gap-2 bg-white/5 border border-white/10 text-[#94A3B8] hover:text-white hover:bg-white/10 hover:border-[#00E68A]/30 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 group"
            id="view-all-feed-btn"
          >
            View All {total > 6 ? `(${total})` : ''}
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, idx) => (
            <div
              key={post._id}
              className="fade-in-up"
              style={{ animationDelay: `${idx * 0.08}s` }}
            >
              <MiniCard
                post={post}
                user={user}
                onUpvote={handleUpvote}
                apiBase={apiBase}
              />
            </div>
          ))}
        </div>

        {/* See More CTA */}
        {total > 6 && (
          <div className="text-center mt-10">
            <button
              onClick={() => navigate("/feed")}
              className="btn-secondary btn-icon text-sm px-8 py-3"
              id="feed-see-more-btn"
            >
              <span>See {total - 6} More Resolved Complaints</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
