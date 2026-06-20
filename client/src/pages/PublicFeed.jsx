// src/pages/PublicFeed.jsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

/* ============================================================
   SVG ICON HELPERS
   ============================================================ */
const ThumbUpIcon = ({ filled }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill={filled ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={filled ? 0 : 2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.909M14.25 9h2.25M5.909 18.75l.OOo.313v.007a.75.75 0 01-.75.75H4.5a.75.75 0 01-.75-.75V9.75a.75.75 0 01.75-.75h1.43c.3 0 .577.112.786.312l.08.076a4.5 4.5 0 010 6.374l-.08.077a1.5 1.5 0 01-.786.31H5.91z" />
  </svg>
);

const HandThumbUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
  </svg>
);

const ChatBubbleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ImageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);

const VideoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
  </svg>
);

const ChevronIcon = ({ open }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
  </svg>
);

const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);

/* ============================================================
   PRIORITY & CATEGORY HELPERS
   ============================================================ */
const priorityColor = {
  high: "bg-red-500/20 text-red-400 border-red-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  low: "bg-green-500/20 text-green-400 border-green-500/30",
};

const categoryColor = {
  roads: "bg-orange-500/20 text-orange-400",
  garbage: "bg-lime-500/20 text-lime-400",
  utilities: "bg-blue-500/20 text-blue-400",
  water: "bg-cyan-500/20 text-cyan-400",
  electricity: "bg-yellow-500/20 text-yellow-400",
  unassigned: "bg-gray-500/20 text-gray-400",
};

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
   IMAGE LIGHTBOX
   ============================================================ */
function Lightbox({ src, onClose }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <img
        src={src}
        alt="Proof"
        className="max-w-[90vw] max-h-[90vh] rounded-2xl shadow-2xl object-contain"
        onClick={(e) => e.stopPropagation()}
      />
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

/* ============================================================
   SINGLE FEED CARD
   ============================================================ */
function FeedCard({ post, user, onUpvote, onComment, onDeleteComment, apiBase }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const [showAllComments, setShowAllComments] = useState(false);

  const upvoted = useMemo(() => {
    if (!user) return false;
    const userId = user._id || user.id;
    return (post.upvotes || []).includes(userId);
  }, [post.upvotes, user]);

  const handleUpvote = () => {
    if (!user) return;
    onUpvote(post._id);
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;
    setSubmitting(true);
    await onComment(post._id, commentText.trim());
    setCommentText("");
    setSubmitting(false);
    setShowComments(true);
  };

  const visibleComments = showAllComments ? post.comments : (post.comments || []).slice(0, 3);

  return (
    <article className="feed-card group" id={`feed-post-${post._id}`}>
      {/* Lightbox */}
      {lightboxSrc && <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          {/* Resolved badge */}
          <div className="flex items-center gap-1.5 bg-[#1B6B3A]/20 border border-[#1B6B3A]/40 text-[#1B6B3A] px-3 py-1 rounded-full text-xs font-semibold">
            <CheckCircleIcon />
            <span>RESOLVED</span>
          </div>
          <span className="text-[#64748B] text-xs">{timeAgo(post.createdAt)}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {post.category && (
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${categoryColor[post.category] || "bg-purple-500/20 text-purple-400"}`}>
              {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
            </span>
          )}
          {post.priority && (
            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${priorityColor[post.priority] || ""}`}>
              {post.priority.toUpperCase()}
            </span>
          )}
        </div>
      </div>

      {/* Complaint ID + District */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[#4A90D9] text-xs font-mono font-bold">{post.complaintId}</span>
        {post.district && (
          <>
            <span className="text-[#64748B]">·</span>
            <span className="text-[#64748B] text-xs">{post.district}</span>
          </>
        )}
      </div>

      {/* Title */}
      <h2 className="text-xl font-bold text-white mb-3 leading-snug group-hover:text-[#00E68A] transition-colors duration-300">
        {post.title}
      </h2>

      {/* Description */}
      <p className="text-[#94A3B8] leading-relaxed mb-5 text-sm">{post.description}</p>

      {/* Proof Text (admin resolution note) */}
      {post.proofText && (
        <div className="bg-[#1B6B3A]/10 border border-[#1B6B3A]/25 rounded-xl p-4 mb-5">
          <p className="text-xs text-[#1B6B3A] font-semibold mb-1 uppercase tracking-wide">📋 Resolution Note</p>
          <p className="text-[#94A3B8] text-sm leading-relaxed">{post.proofText}</p>
        </div>
      )}

      {/* Proof Images */}
      {post.proofImages && post.proofImages.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <ImageIcon />
            <span className="text-xs text-[#94A3B8] font-semibold uppercase tracking-wide">Proof Images</span>
          </div>
          <div className={`grid gap-2 ${post.proofImages.length === 1 ? "grid-cols-1" : post.proofImages.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
            {post.proofImages.map((img, idx) => (
              <div
                key={idx}
                className="relative aspect-video rounded-xl overflow-hidden cursor-pointer group/img ring-1 ring-white/10 hover:ring-[#00E68A]/50 transition-all duration-300"
                onClick={() => setLightboxSrc(`${apiBase}/uploads/${img}`)}
              >
                <img
                  src={`${apiBase}/uploads/${img}`}
                  alt={`Proof ${idx + 1}`}
                  className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                  onError={(e) => { e.target.style.display = "none"; }}
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Proof Videos */}
      {post.proofVideos && post.proofVideos.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <VideoIcon />
            <span className="text-xs text-[#94A3B8] font-semibold uppercase tracking-wide">Proof Videos</span>
          </div>
          <div className="flex flex-col gap-3">
            {post.proofVideos.map((url, idx) => (
              <div key={idx} className="rounded-xl overflow-hidden ring-1 ring-white/10">
                <video
                  src={url}
                  controls
                  className="w-full max-h-72 bg-black rounded-xl"
                  preload="none"
                  poster=""
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-white/5 my-4" />

      {/* Interaction Bar */}
      <div className="flex items-center gap-4">
        {/* Upvote */}
        <button
          id={`upvote-btn-${post._id}`}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
            upvoted
              ? "bg-[#00E68A]/20 text-[#00E68A] border border-[#00E68A]/40 shadow-[0_0_12px_rgba(0,230,138,0.2)]"
              : "bg-white/5 text-[#94A3B8] border border-white/10 hover:bg-[#00E68A]/10 hover:text-[#00E68A] hover:border-[#00E68A]/30"
          } ${!user ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
          onClick={handleUpvote}
          title={!user ? "Login to upvote" : upvoted ? "Remove upvote" : "Upvote"}
        >
          <HandThumbUpIcon />
          <span>{(post.upvotes || []).length}</span>
        </button>

        {/* Toggle Comments */}
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-white/5 text-[#94A3B8] border border-white/10 hover:bg-[#4A90D9]/10 hover:text-[#4A90D9] hover:border-[#4A90D9]/30 transition-all duration-300"
          onClick={() => setShowComments((p) => !p)}
          id={`comments-toggle-${post._id}`}
        >
          <ChatBubbleIcon />
          <span>{(post.comments || []).length}</span>
          <ChevronIcon open={showComments} />
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-5 space-y-3 fade-in-up">
          {/* Comment Input */}
          {user ? (
            <form onSubmit={handleComment} className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1B6B3A] to-[#4A90D9] flex items-center justify-center text-white font-bold text-xs flex-shrink-0 mt-1">
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#4A90D9]/50 focus:ring-1 focus:ring-[#4A90D9]/20 transition-all"
                  id={`comment-input-${post._id}`}
                  maxLength={500}
                />
                <button
                  type="submit"
                  disabled={submitting || !commentText.trim()}
                  className="bg-gradient-to-r from-[#1B6B3A] to-[#4A90D9] text-white px-4 py-2.5 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-1.5 text-sm"
                >
                  <SendIcon />
                </button>
              </div>
            </form>
          ) : (
            <p className="text-[#64748B] text-sm text-center py-2">
              <button
                onClick={() => window.location.href = "/login"}
                className="text-[#4A90D9] hover:underline font-semibold"
              >
                Sign in
              </button>{" "}
              to leave a comment
            </p>
          )}

          {/* Comments List */}
          {(post.comments || []).length === 0 ? (
            <p className="text-[#64748B] text-sm text-center py-3">No comments yet. Be the first!</p>
          ) : (
            <div className="space-y-3 mt-3">
              {visibleComments.map((c) => (
                <div key={c._id} className="flex gap-3 items-start group/comment">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#2C5F8A]/80 to-[#3A7B5C]/80 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                    {c.userName?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 bg-white/5 rounded-xl px-4 py-3">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-white text-xs font-semibold">{c.userName}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[#64748B] text-xs">{timeAgo(c.createdAt)}</span>
                        {user && (user._id === c.user || user.id === c.user || user.role === "admin") && (
                          <button
                            onClick={() => onDeleteComment(post._id, c._id)}
                            className="opacity-0 group-hover/comment:opacity-100 text-red-400/70 hover:text-red-400 transition-all text-xs"
                            title="Delete comment"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-[#94A3B8] text-sm leading-relaxed">{c.text}</p>
                  </div>
                </div>
              ))}

              {(post.comments || []).length > 3 && (
                <button
                  onClick={() => setShowAllComments((p) => !p)}
                  className="w-full text-center text-[#4A90D9] text-xs font-semibold hover:underline py-1"
                >
                  {showAllComments
                    ? "Show fewer comments"
                    : `View all ${post.comments.length} comments`}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
}

/* ============================================================
   MAIN PUBLIC FEED PAGE
   ============================================================ */
function PublicFeed() {
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();
  const LIMIT = 10;

  // Determine API base (handles mobile network access too)
  const apiBase = useMemo(() => {
    const envBase = process.env.REACT_APP_API_BASE_URL;
    if (envBase) return envBase;
    return `${window.location.protocol}//${window.location.hostname}:5000`;
  }, []);

  // Load user from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.name) setUser(parsed);
      } catch {
        setUser(null);
      }
    }
  }, []);

  // Fetch posts
  const fetchPosts = useCallback(async (skip = 0, append = false) => {
    try {
      if (append) setLoadingMore(true);
      else setLoading(true);

      const res = await fetch(`${apiBase}/api/feed?limit=${LIMIT}&skip=${skip}`);
      if (!res.ok) throw new Error("Failed to fetch feed");
      const data = await res.json();

      if (append) {
        setPosts((prev) => [...prev, ...data.posts]);
      } else {
        setPosts(data.posts);
      }
      setTotal(data.total);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [apiBase]);

  useEffect(() => {
    fetchPosts(0, false);
  }, [fetchPosts]);

  // Handle upvote
  const handleUpvote = async (postId) => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    try {
      const res = await fetch(`${apiBase}/api/feed/${postId}/upvote`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      // Optimistically update
      setPosts((prev) =>
        prev.map((p) => {
          if (p._id !== postId) return p;
          const userId = user?._id || user?.id;
          const newUpvotes = data.upvoted
            ? [...(p.upvotes || []), userId]
            : (p.upvotes || []).filter((u) => u !== userId);
          return { ...p, upvotes: newUpvotes };
        })
      );
    } catch {
      // Silent fail
    }
  };

  // Handle comment
  const handleComment = async (postId, text) => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    try {
      const res = await fetch(`${apiBase}/api/feed/${postId}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      // Add comment locally
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? { ...p, comments: [...(p.comments || []), data.comment] }
            : p
        )
      );
    } catch {
      // Silent fail
    }
  };

  // Handle delete comment
  const handleDeleteComment = async (postId, commentId) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${apiBase}/api/feed/${postId}/comment/${commentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? { ...p, comments: (p.comments || []).filter((c) => c._id !== commentId) }
            : p
        )
      );
    } catch {
      // Silent fail
    }
  };

  // Filter posts client-side
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const matchCat = filterCategory === "all" || p.category === filterCategory;
      const matchPri = filterPriority === "all" || p.priority === filterPriority;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        p.title?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.district?.toLowerCase().includes(q) ||
        p.complaintId?.toLowerCase().includes(q);
      return matchCat && matchPri && matchSearch;
    });
  }, [posts, filterCategory, filterPriority, searchQuery]);

  const categories = useMemo(() => {
    const cats = [...new Set(posts.map((p) => p.category).filter(Boolean))];
    return cats.sort();
  }, [posts]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0F1B2D] text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="animated-bg" />

      {/* Glow Effects */}
      <div className="fixed top-1/3 left-1/4 w-[500px] h-[500px] bg-[#1B6B3A]/10 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="fixed bottom-1/3 right-1/4 w-[400px] h-[400px] bg-[#4A90D9]/8 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Navbar */}
      <Navbar />

      {/* Page Hero */}
      <section className="relative z-10 py-16 px-6 text-center">
        <div className="max-w-3xl mx-auto fade-in-up">
          <div className="inline-flex items-center gap-2 bg-[#1B6B3A]/15 border border-[#1B6B3A]/30 rounded-full px-5 py-2 mb-6">
            <span className="w-2 h-2 bg-[#00E68A] rounded-full animate-pulse" />
            <span className="text-[#00E68A] text-sm font-semibold">Community Impact Board</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-5 leading-tight">
            <span className="text-white">Public </span>
            <span className="text-gradient">Resolution Feed</span>
          </h1>
          <p className="text-[#94A3B8] text-lg leading-relaxed max-w-2xl mx-auto">
            Celebrating transparency — see real grievances resolved with verified proof, photos, and videos. 
            Your voice drives real change.
          </p>
        </div>
      </section>

      {/* Filters + Search */}
      <section className="relative z-10 px-6 pb-8">
        <div className="max-w-5xl mx-auto">
          <div className="glass-card p-5 flex flex-col md:flex-row gap-4 items-start md:items-center">
            {/* Search */}
            <div className="flex-1 relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                id="feed-search"
                type="text"
                placeholder="Search by title, district, complaint ID…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#4A90D9]/50 transition-all"
              />
            </div>

            {/* Category filter */}
            <select
              id="feed-category-filter"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#4A90D9]/50 transition-all cursor-pointer"
            >
              <option value="all" className="bg-[#0F1B2D]">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c} className="bg-[#0F1B2D]">
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>

            {/* Priority filter */}
            <select
              id="feed-priority-filter"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#4A90D9]/50 transition-all cursor-pointer"
            >
              <option value="all" className="bg-[#0F1B2D]">All Priorities</option>
              <option value="high" className="bg-[#0F1B2D]">High</option>
              <option value="medium" className="bg-[#0F1B2D]">Medium</option>
              <option value="low" className="bg-[#0F1B2D]">Low</option>
            </select>

            {/* Refresh */}
            <button
              onClick={() => fetchPosts(0)}
              className="flex items-center gap-2 bg-white/5 border border-white/10 text-[#94A3B8] hover:text-white hover:bg-white/10 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all"
              title="Refresh"
            >
              <RefreshIcon />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          {/* Stats bar */}
          <div className="mt-3 flex items-center gap-4 px-1">
            <span className="text-[#64748B] text-xs">
              Showing <span className="text-white font-semibold">{filteredPosts.length}</span> of{" "}
              <span className="text-white font-semibold">{total}</span> resolved complaints
            </span>
          </div>
        </div>
      </section>

      {/* Feed Content */}
      <main className="relative z-10 flex-1 px-6 pb-16">
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-12 h-12 border-4 border-[#1B6B3A]/30 border-t-[#00E68A] rounded-full animate-spin" />
              <p className="text-[#64748B] text-sm">Loading feed…</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <span className="text-5xl">😕</span>
              <h3 className="text-xl font-bold text-white">Couldn't load the feed</h3>
              <p className="text-[#64748B] text-sm max-w-xs">{error}</p>
              <button
                onClick={() => fetchPosts(0)}
                className="btn-secondary text-sm px-6 py-2.5"
              >
                Try Again
              </button>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <span className="text-6xl">📭</span>
              <h3 className="text-2xl font-bold text-white">No posts yet</h3>
              <p className="text-[#64748B] max-w-sm">
                {posts.length === 0
                  ? "The admin hasn't published any resolved complaints to the public feed yet. Check back soon!"
                  : "No posts match your current filters. Try adjusting your search."}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredPosts.map((post, idx) => (
                  <FeedCard
                    key={post._id}
                    post={post}
                    user={user}
                    onUpvote={handleUpvote}
                    onComment={handleComment}
                    onDeleteComment={handleDeleteComment}
                    apiBase={apiBase}
                  />
                ))}
              </div>

              {/* Load More */}
              {posts.length < total && (
                <div className="flex justify-center mt-10">
                  <button
                    onClick={() => fetchPosts(posts.length, true)}
                    disabled={loadingMore}
                    className="btn-secondary btn-icon text-sm px-8 py-3 disabled:opacity-50"
                    id="feed-load-more"
                  >
                    {loadingMore ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : null}
                    <span>{loadingMore ? "Loading…" : "Load More Posts"}</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default PublicFeed;
