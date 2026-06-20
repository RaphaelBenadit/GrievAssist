import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import API_BASE_URL from "../config/api";

// Icons
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const MinimizeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
  </svg>
);

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

// Themed Toast Notification Component
const Toast = ({ toast, onDismiss }) => {
  if (!toast) return null;
  const isSuccess = toast.type === 'success';
  return (
    <div
      style={{
        position: 'fixed',
        top: '32px',
        right: '32px',
        zIndex: 9999,
        minWidth: '360px',
        maxWidth: '480px',
        animation: 'toastSlideIn 0.5s cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #0F1B2D 0%, #111827 100%)',
          border: `1px solid ${isSuccess ? 'rgba(27,162,63,0.4)' : 'rgba(239,68,68,0.4)'}`,
          borderRadius: '16px',
          padding: '20px 24px',
          boxShadow: isSuccess
            ? '0 0 30px rgba(27,162,63,0.15), 0 20px 40px rgba(0,0,0,0.4)'
            : '0 0 30px rgba(239,68,68,0.15), 0 20px 40px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(20px)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Top gradient accent */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: isSuccess
              ? 'linear-gradient(90deg, #1B6B3A, #4A90D9, #1B6B3A)'
              : 'linear-gradient(90deg, #EF4444, #4A8AB5, #EF4444)',
            borderRadius: '16px 16px 0 0',
          }}
        />
        {/* Glow effect */}
        <div
          style={{
            position: 'absolute',
            top: '-50%',
            right: '-20%',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: isSuccess
              ? 'radial-gradient(circle, rgba(27,162,63,0.08) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(239,68,68,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', position: 'relative' }}>
          {/* Icon */}
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              background: isSuccess ? 'rgba(27,162,63,0.15)' : 'rgba(239,68,68,0.15)',
              border: `1px solid ${isSuccess ? 'rgba(27,162,63,0.3)' : 'rgba(239,68,68,0.3)'}`,
            }}
          >
            {isSuccess ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1B6B3A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            )}
          </div>
          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              color: isSuccess ? '#1B6B3A' : '#EF4444',
              fontWeight: 700,
              fontSize: '15px',
              marginBottom: '4px',
              letterSpacing: '0.01em',
            }}>
              {toast.title}
            </p>
            <p style={{
              color: '#94A3B8',
              fontSize: '13px',
              lineHeight: '1.5',
              margin: 0,
            }}>
              {toast.message}
            </p>
          </div>
          {/* Dismiss */}
          <button
            onClick={onDismiss}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748B',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '6px',
              display: 'flex',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => e.target.style.color = '#fff'}
            onMouseLeave={(e) => e.target.style.color = '#64748B'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        {/* Progress bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '3px',
            borderRadius: '0 0 16px 16px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              background: isSuccess
                ? 'linear-gradient(90deg, #1B6B3A, #4A90D9)'
                : 'linear-gradient(90deg, #EF4444, #4A8AB5)',
              animation: 'toastProgress 5s linear forwards',
            }}
          />
        </div>
      </div>
      <style>{`
        @keyframes toastSlideIn {
          from { transform: translateX(120%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes toastProgress {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </div>
  );
};

const ComplaintPreview = ({ complaint, open, onClose, updateStatus, sendEmail }) => {
  const [localStatus, setLocalStatus] = useState(complaint?.status || "pending");
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [removingImage, setRemovingImage] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [emailAttachments, setEmailAttachments] = useState([]);
  const [duplicates, setDuplicates] = useState([]);
  const [loadingDuplicates, setLoadingDuplicates] = useState(false);
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [voiceSummary, setVoiceSummary] = useState(complaint?.voiceSummary || null);
  const [toast, setToast] = useState(null);
  const [showReply, setShowReply] = useState(false);
  // Publish-to-Feed state
  const [showPublish, setShowPublish] = useState(false);
  const [publishForm, setPublishForm] = useState({ title: "", description: "", proofText: "", proofVideoUrl: "" });
  const [publishImages, setPublishImages] = useState([]);
  const [publishImagePreviews, setPublishImagePreviews] = useState([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const publishFileRef = useRef(null);

  const showToast = (type, title, message) => {
    setToast({ type, title, message });
    setTimeout(() => setToast(null), 5000);
  };

  useEffect(() => {
    setLocalStatus(complaint?.status || "pending");
    setEmailTo(complaint?.user?.email || complaint?.email || "");
    const recipientName = complaint?.user?.name || complaint?.name || "Citizen";
    const cid = complaint?.complaintId ? ` (${complaint.complaintId})` : "";
    const defaultMsg = `Greetings ${recipientName},\n\nThank you for your initiative in bringing this matter to our attention. Your participation helps us make good things happen for our society.\n\nWe have received your complaint${cid} and our team is reviewing it. We will keep you updated on the progress.\n\nRegards,\nTeam GrievAssist\nRaphael Benadit G`;
    setEmailMessage(defaultMsg);
    setEmailAttachments([]);
    setDuplicates([]);
    setShowDuplicates(false);
    setVoiceSummary(complaint?.voiceSummary || null);
    setShowReply(false);
    // Reset publish form
    setShowPublish(false);
    setPublishSuccess(false);
    setPublishForm({
      title: complaint?.description?.substring(0, 80) || "",
      description: complaint?.description || "",
      proofText: "",
      proofVideoUrl: complaint?.videoUrl || "",
    });
    setPublishImages([]);
    setPublishImagePreviews([]);
  }, [complaint]);

  useEffect(() => {
    if (open) {
      setShowModal(true);
      setTimeout(() => {
        document.body.classList.add("modal-open");
      }, 10);
    } else {
      setShowModal(false);
      document.body.classList.remove("modal-open");
    }
  }, [open]);

  if (!open || !complaint) return null;

  const handleUpdateStatus = async () => {
    if (updateStatus) {
      setIsSaving(true);
      await updateStatus(complaint._id, localStatus);
      setIsSaving(false);
    }
  };

  const handleSendEmail = async () => {
    if (!emailTo || !emailMessage) return;
    const formData = new FormData();
    formData.append("to", emailTo);
    formData.append("message", emailMessage);
    formData.append("complaintId", complaint.complaintId);
    if (emailAttachments && emailAttachments.length > 0) {
      formData.append("attachment", emailAttachments[0]);
    }
    try {
      await axios.post("/api/complaints/reply", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      showToast(
        'success',
        'Reply Sent Successfully!',
        `Your official reply to ${emailTo} regarding complaint ${complaint.complaintId} has been dispatched.`
      );
      setEmailMessage("");
      setEmailAttachments([]);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      showToast(
        'error',
        'Email Delivery Failed',
        `Could not send reply: ${errorMsg}`
      );
    }
  };

  const handleAttachmentChange = (e) => {
    setEmailAttachments([...e.target.files]);
  };

  const handleRemoveImage = async () => {
    setRemovingImage(true);
    if (updateStatus) {
      await updateStatus(complaint._id, { ...complaint, image: null });
    }
    setRemovingImage(false);
  };

  const handleFindDuplicates = async () => {
    if (!complaint?._id) return;

    setLoadingDuplicates(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE_URL}/api/complaints/duplicates/${complaint._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDuplicates(response.data.duplicates || []);
      setShowDuplicates(true);
    } catch (err) {
      console.error("Error finding duplicates:", err);
      alert("Failed to find duplicates");
    } finally {
      setLoadingDuplicates(false);
    }
  };

  const handleSummarizeAudio = async () => {
    if (!complaint?._id) return;
    setIsSummarizing(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE_URL}/api/complaints/${complaint._id}/summarize-audio`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setVoiceSummary(response.data.voiceSummary);
    } catch (err) {
      console.error("Error summarizing audio:", err);
      alert(err.response?.data?.message || "Failed to analyze audio recording");
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <>
      <Toast toast={toast} onDismiss={() => setToast(null)} />
      <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${showModal ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div
          className={`bg-[#0F1B2D] border border-white/10 rounded-2xl shadow-2xl w-[90vw] max-w-6xl relative transition-all duration-500 flex flex-col ${showModal ? 'scale-100 translate-y-0' : 'scale-95 -translate-y-8'}`}
          style={{ minHeight: '70vh', maxHeight: '85vh' }}
        >
          {/* Animated Header Background */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#1B6B3A] via-[#4A90D9] to-[#2C5F8A] rounded-t-2xl z-20"></div>

          {/* Header with controls */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0F1B2D] rounded-t-2xl z-10">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <h3 className="text-lg font-bold text-white ml-2">Complaint Details <span className="text-[#64748B] text-sm font-mono ml-2">{complaint.complaintId}</span></h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="p-2 rounded-lg hover:bg-white/5 text-[#94A3B8] hover:text-white transition-colors"
                title="Minimize"
                onClick={() => setShowModal(false)}
              >
                <MinimizeIcon />
              </button>
              <button
                className="p-2 rounded-lg hover:bg-red-500/20 text-[#94A3B8] hover:text-red-400 transition-colors"
                title="Close"
                onClick={onClose}
              >
                <CloseIcon />
              </button>
            </div>
          </div>

          {/* Content — single-column vertical flow */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

            {/* ── SECTION 1: Attached Evidence ── */}
            <div className="glass-card !bg-white/5 p-6 space-y-5">
              <h3 className="text-lg font-bold text-[#4A90D9] flex items-center gap-2">
                <span className="w-1 h-6 bg-[#4A90D9] rounded-full"></span>
                📎 Attached Evidence
              </h3>

              {/* Complaint Description */}
              <div>
                <label className="text-[#64748B] text-xs uppercase font-semibold block mb-2">Description</label>
                <p className="text-white/90 text-sm leading-relaxed bg-black/20 p-3 rounded-lg border border-white/5">
                  {complaint.description || complaint.details || "No description provided."}
                </p>
              </div>

              {/* Suggestions */}
              {complaint.suggestions && (
                <div>
                  <label className="text-[#64748B] text-xs uppercase font-semibold block mb-2">Suggestions</label>
                  <p className="text-white/80 italic text-sm bg-black/20 p-3 rounded-lg border border-white/5">
                    "{complaint.suggestions}"
                  </p>
                </div>
              )}

              {/* Image */}
              {complaint.image ? (
                <div className="relative group">
                  <label className="text-[#64748B] text-xs uppercase font-semibold block mb-2">📷 Photo</label>
                  <a href={`${API_BASE_URL}/uploads/${complaint.image}`} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-xl border border-white/10">
                    <img
                      src={`${API_BASE_URL}/uploads/${complaint.image}`}
                      alt="complaint"
                      className="w-full max-h-64 object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                      <span className="text-white flex items-center gap-2 font-medium"><ExternalLinkIcon /> View Full Size</span>
                    </div>
                  </a>
                  {complaint.imageSource === 'admin' && (
                    <button
                      className="absolute top-8 right-2 p-2 bg-red-600 text-white rounded-lg shadow-lg hover:bg-red-700 transition-colors"
                      onClick={handleRemoveImage}
                      disabled={removingImage}
                      title="Remove Image"
                    >
                      {removingImage ? <span className="loading-spinner w-4 h-4"></span> : <TrashIcon />}
                    </button>
                  )}
                </div>
              ) : (
                !complaint.videoUrl && !complaint.voiceRecording && (
                  <div className="h-20 w-full flex items-center justify-center bg-white/5 rounded-xl border border-white/10 border-dashed text-[#64748B] text-sm">
                    No media attached
                  </div>
                )
              )}

              {/* Video */}
              {complaint.videoUrl && (
                <div className="space-y-2">
                  <label className="text-[#64748B] text-xs uppercase font-semibold block">🎥 Video</label>
                  <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black">
                    <video src={complaint.videoUrl} controls playsInline className="w-full max-h-64 object-contain" />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-sm text-white text-xs font-semibold flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                        </svg>
                        VIDEO
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Voice Recording */}
              {complaint.voiceRecording && (
                <div className="space-y-3">
                  <label className="text-[#64748B] text-xs uppercase font-semibold block">🎙️ Voice Recording</label>
                  <div className="bg-black/30 p-4 rounded-xl border border-white/10">
                    <audio controls src={`${API_BASE_URL}/uploads/${complaint.voiceRecording}`} className="w-full voice-audio-player" style={{ height: '40px' }} />
                  </div>
                  <button
                    onClick={handleSummarizeAudio}
                    disabled={isSummarizing}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300"
                    style={{
                      background: isSummarizing ? 'rgba(139,92,246,0.2)' : 'linear-gradient(135deg, #2C5F8A 0%, #3A7B5C 100%)',
                      border: '1px solid rgba(139,92,246,0.3)',
                      color: 'white',
                      cursor: isSummarizing ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isSummarizing ? (
                      <><div className="spinner !w-5 !h-5 !border-2"></div><span>Analyzing Audio with AI...</span></>
                    ) : (
                      <><svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg><span>{voiceSummary ? 'Re-analyze Recording' : 'Summarize Recording'}</span></>
                    )}
                  </button>
                  {voiceSummary?.transcription && (
                    <div className="space-y-3 animate-fade-in-down">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#3A7B5C]/20 text-[#3A7B5C] border border-[#3A7B5C]/30">
                          🌐 {voiceSummary.detectedLanguage?.charAt(0).toUpperCase() + voiceSummary.detectedLanguage?.slice(1) || 'Unknown'}
                        </span>
                        <span className="text-xs text-[#64748B]">Analyzed {voiceSummary.analyzedAt ? new Date(voiceSummary.analyzedAt).toLocaleString() : ''}</span>
                      </div>
                      <div className="bg-black/30 p-4 rounded-xl border border-white/10">
                        <label className="text-[#64748B] text-xs uppercase font-semibold block mb-2">Transcription</label>
                        <p className="text-white/90 text-sm leading-relaxed">{voiceSummary.transcription}</p>
                      </div>
                      <div className="bg-black/30 p-4 rounded-xl border border-[#2C5F8A]/20">
                        <label className="text-[#2C5F8A] text-xs uppercase font-semibold block mb-2">AI Summary</label>
                        <p className="text-white/90 text-sm leading-relaxed">{voiceSummary.summary}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-black/30 p-3 rounded-xl border border-white/10 text-center">
                          <label className="text-[#64748B] text-[10px] uppercase font-semibold block mb-1">Category</label>
                          <span className="px-3 py-1 rounded-full bg-[#1B6B3A]/20 text-[#1B6B3A] text-xs font-semibold">{voiceSummary.detectedCategory || 'N/A'}</span>
                        </div>
                        <div className="bg-black/30 p-3 rounded-xl border border-white/10 text-center">
                          <label className="text-[#64748B] text-[10px] uppercase font-semibold block mb-1">Priority</label>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${voiceSummary.detectedPriority === 'high' ? 'bg-red-500/20 text-red-400' : voiceSummary.detectedPriority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'}`}>{voiceSummary.detectedPriority || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Location */}
              {complaint.location?.lat && complaint.location?.lng && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${complaint.location.lat},${complaint.location.lng}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[#4A90D9] hover:underline text-sm font-medium"
                >
                  <ExternalLinkIcon /> View Exact Location on Google Maps
                </a>
              )}
            </div>

            {/* ── SECTION 2: Analysis Results ── */}
            <div className="glass-card !bg-white/5 p-6 space-y-5">
              <h3 className="text-lg font-bold text-[#3A7B5C] flex items-center gap-2">
                <span className="w-1 h-6 bg-[#3A7B5C] rounded-full"></span>
                🤖 Analysis Results
              </h3>

              {/* AI Classification Summary */}
              <div className="bg-gradient-to-br from-[#0F1B2D] to-[#1a2744] p-4 rounded-xl border border-[#4A90D9]/20">
                <h4 className="text-sm font-bold text-[#4A90D9] mb-3 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                  AI Classification Summary
                </h4>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                    <label className="text-[#64748B] text-[9px] uppercase font-semibold block mb-1">Category</label>
                    <span className="px-2 py-0.5 rounded-full bg-[#1B6B3A]/20 text-[#1B6B3A] text-[11px] font-bold capitalize">
                      {complaint.humanCorrection || complaint.category || 'unassigned'}
                    </span>
                  </div>
                  <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                    <label className="text-[#64748B] text-[9px] uppercase font-semibold block mb-1">Priority</label>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${complaint.priority === 'high' ? 'bg-red-500/20 text-red-400' : complaint.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'}`}>
                      {complaint.priority || 'low'}
                    </span>
                  </div>
                  <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                    <label className="text-[#64748B] text-[9px] uppercase font-semibold block mb-1">Confidence</label>
                    <span className="text-white font-bold text-xs">
                      {complaint.modelConfidence ? `${(complaint.modelConfidence * 100).toFixed(0)}%` : 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded text-[9px] font-semibold bg-[#1B6B3A]/15 text-[#1B6B3A] border border-[#1B6B3A]/20">📝 Text</span>
                  {complaint.voiceRecording && <span className="px-2 py-0.5 rounded text-[9px] font-semibold bg-[#3A7B5C]/15 text-[#3A7B5C] border border-[#3A7B5C]/20">🎙️ Voice</span>}
                  {complaint.videoUrl && <span className="px-2 py-0.5 rounded text-[9px] font-semibold bg-[#4A90D9]/15 text-[#4A90D9] border border-[#4A90D9]/20">🎥 Video</span>}
                  <span className="ml-auto text-[9px] text-[#64748B]">Sources analyzed</span>
                </div>
              </div>

              {/* Video Analysis */}
              {complaint.videoUrl && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#64748B] font-semibold uppercase">Video Analysis Status</span>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${complaint.videoStatus === 'completed' ? 'bg-[#1B6B3A]/20 text-[#1B6B3A] border border-[#1B6B3A]/30' : complaint.videoStatus === 'processing' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : complaint.videoStatus === 'failed' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-white/10 text-[#64748B] border border-white/10'}`}>
                      {complaint.videoStatus === 'completed' ? '✓ Analyzed' : complaint.videoStatus === 'processing' ? '⏳ Processing...' : complaint.videoStatus === 'failed' ? '✗ Failed' : 'Pending'}
                    </span>
                  </div>
                  {complaint.videoStatus === 'completed' && complaint.videoCategory && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-black/30 p-3 rounded-xl border border-white/10 text-center">
                        <label className="text-[#64748B] text-[10px] uppercase font-semibold block mb-1">Video Category</label>
                        <span className="px-3 py-1 rounded-full bg-[#4A90D9]/20 text-[#4A90D9] text-xs font-semibold capitalize">{complaint.videoCategory}</span>
                      </div>
                      <div className="bg-black/30 p-3 rounded-xl border border-white/10 text-center">
                        <label className="text-[#64748B] text-[10px] uppercase font-semibold block mb-1">Confidence</label>
                        <span className="text-white font-bold text-sm">{complaint.videoConfidence ? `${(complaint.videoConfidence * 100).toFixed(1)}%` : 'N/A'}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Similar Complaints */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-[#4A8AB5] flex items-center gap-2">
                    <span className="w-1 h-5 bg-[#4A8AB5] rounded-full"></span>
                    Similar Complaints
                  </h4>
                  <button
                    onClick={handleFindDuplicates}
                    disabled={loadingDuplicates}
                    className="text-xs flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/30 transition-colors"
                  >
                    {loadingDuplicates ? <span className="animate-spin">↻</span> : <SearchIcon />}
                    Find Similar
                  </button>
                </div>
                {showDuplicates && (
                  <div className="animate-fade-in-down">
                    {duplicates.length > 0 ? (
                      <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                        <p className="text-xs text-[#94A3B8] mb-2">Found {duplicates.length} potential duplicate(s):</p>
                        {duplicates.map((duplicate) => (
                          <div key={duplicate._id} className="p-3 bg-black/40 rounded-lg border border-white/10 hover:border-white/20 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-mono text-xs text-[#4A90D9]">{duplicate.complaintId}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${duplicate.matchType === 'exact' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'}`}>
                                {duplicate.matchType === 'exact' ? 'Exact Match' : `${duplicate.similarity}% Similar`}
                              </span>
                            </div>
                            <p className="text-xs text-[#94A3B8] line-clamp-2 mb-2">{duplicate.description}</p>
                            <div className="text-[10px] text-[#64748B] flex items-center gap-2">
                              <span>{new Date(duplicate.createdAt).toLocaleDateString()}</span>
                              <span className="w-1 h-1 rounded-full bg-[#64748B]"></span>
                              <span className="capitalize">{duplicate.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 bg-black/20 rounded-lg">
                        <p className="text-sm text-[#94A3B8]">No similar complaints found.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ── SECTION 3: User Details ── */}
            <div className="glass-card !bg-white/5 p-6 space-y-5">
              <h3 className="text-lg font-bold text-[#2C5F8A] flex items-center gap-2">
                <span className="w-1 h-6 bg-[#2C5F8A] rounded-full"></span>
                👤 User Details
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <label className="text-[#64748B] text-xs uppercase font-semibold">Submitted By</label>
                  <p className="text-white font-medium">{complaint.user?.name || complaint.name || "N/A"}</p>
                </div>
                <div>
                  <label className="text-[#64748B] text-xs uppercase font-semibold">Email</label>
                  <p className="text-white font-medium truncate">{complaint.user?.email || complaint.email || "N/A"}</p>
                </div>
                <div>
                  <label className="text-[#64748B] text-xs uppercase font-semibold">Phone</label>
                  <p className="text-white font-medium">{complaint.phone || "N/A"}</p>
                </div>
                <div>
                  <label className="text-[#64748B] text-xs uppercase font-semibold">District</label>
                  <p className="text-white font-medium">{complaint.district || "N/A"}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-[#64748B] text-xs uppercase font-semibold">Address</label>
                  <p className="text-white">{complaint.address || "N/A"}</p>
                </div>
                <div className="col-span-2 md:col-span-3">
                  <label className="text-[#64748B] text-xs uppercase font-semibold">Date & Time</label>
                  <p className="text-white">{complaint.createdAt ? new Date(complaint.createdAt).toLocaleString() : "-"}</p>
                </div>
              </div>

              {/* Status Updater */}
              <div className="bg-black/30 p-4 rounded-xl border border-white/10">
                <label className="text-[#64748B] text-xs uppercase font-semibold block mb-2">Update Status</label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <select
                      className="w-full bg-[#0F1B2D] text-white border border-white/20 rounded-lg px-4 py-2.5 appearance-none focus:outline-none focus:border-[#1B6B3A]"
                      value={localStatus}
                      onChange={(e) => setLocalStatus(e.target.value)}
                      disabled={isSaving}
                    >
                      <option value="pending">Pending</option>
                      <option value="in progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                  <button onClick={handleUpdateStatus} disabled={isSaving} className="btn-primary px-6">
                    {isSaving ? "Saving..." : "Update"}
                  </button>
                </div>
              </div>
            </div>

            {/* ── SECTION 4: Email Reply (toggle) ── */}
            <div className="glass-card !bg-white/5 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#1B6B3A] flex items-center gap-2">
                  <span className="w-1 h-6 bg-[#1B6B3A] rounded-full"></span>
                  <MailIcon />
                  Reply to User
                </h3>
                <button
                  onClick={() => setShowReply(!showReply)}
                  className={`text-xs px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${showReply ? 'bg-white/10 text-[#94A3B8] hover:bg-white/15' : 'bg-[#1B6B3A]/20 text-[#1B6B3A] border border-[#1B6B3A]/30 hover:bg-[#1B6B3A]/30'}`}
                >
                  <MailIcon />
                  {showReply ? 'Hide Reply' : 'Compose Reply'}
                </button>
              </div>

              {showReply && (
                <div className="space-y-4 animate-fade-in-down">
                  <div>
                    <label className="text-[#64748B] text-xs uppercase font-semibold block mb-2">Recipient</label>
                    <input
                      type="email"
                      className="form-input w-full"
                      value={emailTo}
                      onChange={(e) => setEmailTo(e.target.value)}
                      placeholder="user@example.com"
                    />
                  </div>
                  <div>
                    <label className="text-[#64748B] text-xs uppercase font-semibold block mb-2">Message</label>
                    <textarea
                      className="form-input w-full resize-none font-mono text-sm leading-relaxed"
                      rows={8}
                      value={emailMessage}
                      onChange={(e) => setEmailMessage(e.target.value)}
                      placeholder="Type your reply message here..."
                    />
                  </div>
                  <div>
                    <label className="text-[#64748B] text-xs uppercase font-semibold block mb-2">Attachments</label>
                    <input
                      type="file"
                      multiple
                      onChange={handleAttachmentChange}
                      className="block w-full text-sm text-[#94A3B8] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#1B6B3A]/10 file:text-[#1B6B3A] hover:file:bg-[#1B6B3A]/20 cursor-pointer"
                    />
                  </div>
                  <button onClick={handleSendEmail} className="w-full btn-primary py-3 flex items-center justify-center gap-2">
                    <MailIcon />
                    Send Official Reply
                  </button>
                </div>
              )}
            </div>

            {/* ── SECTION 5: Publish to Public Feed ── */}
            <div className="glass-card !bg-white/5 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#00E68A] flex items-center gap-2">
                  <span className="w-1 h-6 bg-[#00E68A] rounded-full"></span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                  </svg>
                  Publish to Public Feed
                </h3>
                <div className="flex items-center gap-2">
                  {publishSuccess && (
                    <span className="text-xs text-[#00E68A] font-semibold flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                      Published!
                    </span>
                  )}
                  <button
                    onClick={() => setShowPublish(!showPublish)}
                    className={`text-xs px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
                      showPublish
                        ? 'bg-white/10 text-[#94A3B8] hover:bg-white/15'
                        : 'bg-[#00E68A]/15 text-[#00E68A] border border-[#00E68A]/30 hover:bg-[#00E68A]/25'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3" />
                    </svg>
                    {showPublish ? 'Hide' : 'Compose Post'}
                  </button>
                </div>
              </div>

              {complaint.status !== 'resolved' && !showPublish && (
                <p className="text-xs text-yellow-400/80 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2">
                  ⚠️ This complaint is not yet marked as <strong>resolved</strong>. You can still publish, but it's best practice to resolve it first.
                </p>
              )}

              {showPublish && (
                <div className="space-y-4 animate-fade-in-down">
                  {/* Post Title */}
                  <div>
                    <label className="text-[#64748B] text-xs uppercase font-semibold block mb-2">Post Title *</label>
                    <input
                      type="text"
                      value={publishForm.title}
                      onChange={(e) => setPublishForm(f => ({ ...f, title: e.target.value }))}
                      maxLength={150}
                      placeholder="Brief public title for this resolved complaint…"
                      className="form-input w-full"
                    />
                  </div>

                  {/* Public Description */}
                  <div>
                    <label className="text-[#64748B] text-xs uppercase font-semibold block mb-2">Public Description *</label>
                    <textarea
                      value={publishForm.description}
                      onChange={(e) => setPublishForm(f => ({ ...f, description: e.target.value }))}
                      rows={3}
                      maxLength={1000}
                      placeholder="Describe this resolved complaint for public visibility…"
                      className="form-input w-full resize-none"
                    />
                  </div>

                  {/* Resolution Note */}
                  <div>
                    <label className="text-[#64748B] text-xs uppercase font-semibold block mb-2">Resolution Note / Proof Text</label>
                    <textarea
                      value={publishForm.proofText}
                      onChange={(e) => setPublishForm(f => ({ ...f, proofText: e.target.value }))}
                      rows={2}
                      maxLength={600}
                      placeholder="Explain what action was taken to resolve this…"
                      className="form-input w-full resize-none"
                    />
                  </div>

                  {/* Proof Images */}
                  <div>
                    <label className="text-[#64748B] text-xs uppercase font-semibold block mb-2">Proof Images (up to 5)</label>
                    <input
                      ref={publishFileRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files).slice(0, 5);
                        setPublishImages(files);
                        setPublishImagePreviews(files.map(f => URL.createObjectURL(f)));
                      }}
                      className="block w-full text-sm text-[#94A3B8] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#00E68A]/10 file:text-[#00E68A] hover:file:bg-[#00E68A]/20 cursor-pointer"
                    />
                    {publishImagePreviews.length > 0 && (
                      <div className="mt-2 grid grid-cols-4 gap-2">
                        {publishImagePreviews.map((url, i) => (
                          <img key={i} src={url} alt={`Preview ${i + 1}`} className="aspect-square object-cover rounded-lg ring-1 ring-white/10" />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Proof Video URL */}
                  <div>
                    <label className="text-[#64748B] text-xs uppercase font-semibold block mb-2">Proof Video URL</label>
                    <input
                      type="url"
                      value={publishForm.proofVideoUrl}
                      onChange={(e) => setPublishForm(f => ({ ...f, proofVideoUrl: e.target.value }))}
                      placeholder="https://… (Cloudinary, YouTube, etc.)"
                      className="form-input w-full"
                    />
                    {complaint.videoUrl && !publishForm.proofVideoUrl && (
                      <button
                        type="button"
                        onClick={() => setPublishForm(f => ({ ...f, proofVideoUrl: complaint.videoUrl }))}
                        className="mt-1 text-xs text-[#4A90D9] hover:underline"
                      >
                        ↑ Use original complaint video
                      </button>
                    )}
                  </div>

                  {/* Submit */}
                  <button
                    onClick={async () => {
                      if (!publishForm.title || !publishForm.description) {
                        showToast('error', 'Missing fields', 'Title and description are required.');
                        return;
                      }
                      setIsPublishing(true);
                      try {
                        const token = localStorage.getItem('token');
                        const formData = new FormData();
                        formData.append('complaintId', complaint._id);
                        formData.append('title', publishForm.title);
                        formData.append('description', publishForm.description);
                        formData.append('proofText', publishForm.proofText);
                        if (publishForm.proofVideoUrl) formData.append('proofVideoUrl', publishForm.proofVideoUrl);
                        publishImages.forEach(img => formData.append('proofImages', img));
                        await axios.post(`${API_BASE_URL}/api/feed`, formData, {
                          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
                        });
                        setPublishSuccess(true);
                        setShowPublish(false);
                        showToast('success', 'Published to Feed!', `Complaint ${complaint.complaintId} is now live on the public feed.`);
                      } catch (err) {
                        showToast('error', 'Publish Failed', err.response?.data?.message || err.message);
                      } finally {
                        setIsPublishing(false);
                      }
                    }}
                    disabled={isPublishing}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #1B6B3A 0%, #4A90D9 100%)', color: 'white' }}
                  >
                    {isPublishing ? (
                      <><div className="spinner !w-5 !h-5 !border-2"></div><span>Publishing…</span></>
                    ) : (
                      <><svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" /></svg><span>Publish to Public Feed</span></>
                    )}
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default ComplaintPreview;
