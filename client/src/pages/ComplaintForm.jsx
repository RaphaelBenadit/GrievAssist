import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import VoiceRecorder from "../components/VoiceRecorder";
import axios from "axios";
import API_BASE_URL from "../config/api";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// Map click handler
function LocationPicker({ setLocation }) {
  useMapEvents({
    click(e) {
      setLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

// Wrapper to invalidate map size
function MapWithInvalidate({ children, ...props }) {
  return (
    <MapContainer
      {...props}
      whenCreated={(mapInstance) => {
        setTimeout(() => {
          mapInstance.invalidateSize();
        }, 300);
      }}
    >
      {children}
    </MapContainer>
  );
}

// Icons
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const DocumentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const LocationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const CameraIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
  </svg>
);

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ExpandIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
  </svg>
);

function ComplaintForm() {
  const [location, setLocation] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  // Auto-detect user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {
          // fallback → Chennai
          setLocation({ lat: 13.0827, lng: 80.2707 });
        }
      );
    }
  }, []);

  // Form states
  const [personal, setPersonal] = useState({
    name: "",
    age: "",
    dob: "",
    phone: "",
    email: "",
    address: "",
  });
  const [complaint, setComplaint] = useState({
    description: "",
    district: "",
    suggestions: "",
  });
  const [success, setSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voiceFile, setVoiceFile] = useState(null);

  // Unified media state (photo OR video)
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaType, setMediaType] = useState(null); // "image" or "video"
  const [preview, setPreview] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [mediaError, setMediaError] = useState(null);

  // Refs for separate file inputs (camera photo, camera video, gallery)
  const photoCaptureRef = useRef(null);
  const videoCaptureRef = useRef(null);
  const galleryRef = useRef(null);

  // Handlers
  const handlePersonalChange = (e) =>
    setPersonal({ ...personal, [e.target.name]: e.target.value });
  const handleComplaintChange = (e) =>
    setComplaint({ ...complaint, [e.target.name]: e.target.value });

  // Unified media handler (photo or video)
  const handleMediaChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setMediaError(null);
    setVideoUrl(null);

    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");

    if (!isVideo && !isImage) {
      setMediaError("Only image and video files are allowed.");
      return;
    }

    // Validate size (15MB max)
    if (file.size > 15 * 1024 * 1024) {
      setMediaError(`File too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Max 15 MB.`);
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    if (isVideo) {
      // Validate video duration (30s max)
      const durationError = await new Promise((resolve) => {
        const video = document.createElement("video");
        video.preload = "metadata";
        video.onloadedmetadata = () => {
          URL.revokeObjectURL(video.src);
          if (video.duration > 30) {
            resolve(`Video too long (${Math.round(video.duration)}s). Max 30 seconds.`);
          } else {
            resolve(null);
          }
        };
        video.onerror = () => resolve(null);
        video.src = previewUrl;
      });

      if (durationError) {
        setMediaError(durationError);
        URL.revokeObjectURL(previewUrl);
        return;
      }

      setMediaFile(file);
      setMediaType("video");
      setPreview(previewUrl);

      // Auto-upload video to Cloudinary
      setVideoUploading(true);
      setVideoProgress(0);
      try {
        const token = localStorage.getItem("token");
        const formData = new FormData();
        formData.append("video", file);

        const res = await axios.post(`${API_BASE_URL}/api/video/upload`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setVideoProgress(percent);
          },
        });

        setVideoUrl(res.data.videoUrl);
      } catch (err) {
        setMediaError(err.response?.data?.message || "Failed to upload video.");
      } finally {
        setVideoUploading(false);
      }
    } else {
      // Image — just store locally, will be sent with form submission
      setMediaFile(file);
      setMediaType("image");
      setPreview(previewUrl);
    }
  };

  const handleRemoveMedia = () => {
    if (preview) URL.revokeObjectURL(preview);
    setMediaFile(null);
    setMediaType(null);
    setPreview(null);
    setVideoUrl(null);
    setMediaError(null);
    setVideoProgress(0);
    // Reset file inputs so the same file can be re-selected
    if (photoCaptureRef.current) photoCaptureRef.current.value = "";
    if (videoCaptureRef.current) videoCaptureRef.current.value = "";
    if (galleryRef.current) galleryRef.current.value = "";
  };

  // Submit Complaint
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location) {
      alert("Please select your location on the map.");
      return;
    }
    if (videoUploading) {
      alert("Please wait for the video to finish uploading.");
      return;
    }
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      Object.entries({ ...personal, ...complaint }).forEach(([k, v]) =>
        formData.append(k, v)
      );
      formData.append("location", JSON.stringify(location));
      if (mediaFile && mediaType === "image") formData.append("image", mediaFile);
      if (videoUrl) formData.append("videoUrl", videoUrl);
      if (voiceFile) formData.append("voiceRecording", voiceFile);

      const res = await axios.post(
        `${API_BASE_URL}/api/complaints`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setSuccess({
        id: res.data.complaint.complaintId,
        message: res.data.message,
      });

      // Reset form
      setPersonal({
        name: "",
        age: "",
        dob: "",
        phone: "",
        email: "",
        address: "",
      });
      setComplaint({ description: "", district: "", suggestions: "" });
      handleRemoveMedia();
      setLocation(null);
      setVoiceFile(null);
    } catch (err) {
      if (err.response?.data?.message?.includes("jwt expired")) {
        alert("Session expired. Please log in again.");
        localStorage.clear();
        window.location.href = "/login";
      } else {
        alert(err.response?.data?.message || "Error submitting complaint");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const districts = [
    "Chennai", "Coimbatore", "Madurai", "Trichy", "Salem",
    "Erode", "Thanjavur", "Tirunelveli", "Thoothukudi", "Vellore",
  ];

  const steps = [
    { number: 1, title: "Personal Info", icon: UserIcon },
    { number: 2, title: "Complaint Details", icon: DocumentIcon },
    { number: 3, title: "Location & Media", icon: LocationIcon },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#0F1B2D] text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="animated-bg"></div>

      {/* Background Glow Effects */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-[#1B6B3A]/15 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-[#2C5F8A]/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="flex-1 relative z-10 py-6 px-3 md:py-12 md:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Success Box */}
          {success && (
            <div className="glass-card p-10 text-center fade-in-up">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#1B6B3A] to-[#4A90D9] flex items-center justify-center mb-6">
                <CheckIcon />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-gradient">Complaint Submitted!</h2>
              <p className="text-[#94A3B8] mb-4">Your complaint has been successfully registered.</p>
              <div className="glass-card !rounded-xl p-4 inline-block mb-8">
                <p className="text-sm text-[#64748B]">Complaint ID</p>
                <p className="text-2xl font-mono font-bold text-[#1B6B3A]">{success.id}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  className="btn-primary"
                  onClick={() => navigate("/my-complaints")}
                >
                  View My Complaints
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setSuccess(null);
                    setCurrentStep(1);
                  }}
                >
                  Submit Another
                </button>
              </div>
            </div>
          )}

          {/* Complaint Form */}
          {!success && (
            <div className="fade-in-up">
              {/* Header */}
              <div className="text-center mb-8">
                <span className="inline-flex items-center gap-2 bg-[#1B6B3A]/10 border border-[#1B6B3A]/30 text-[#1B6B3A] text-sm font-semibold px-4 py-2 rounded-full mb-4">
                  <DocumentIcon />
                  Complaint Form
                </span>
                <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
                  <span className="text-white">Submit Your </span>
                  <span className="text-gradient">Grievance</span>
                </h1>
                <p className="text-[#94A3B8]">Fill in the details below and we'll route it to the right department</p>
              </div>

              {/* Progress Steps */}
              <div className="flex justify-center mb-6 md:mb-10">
                <div className="flex items-center gap-2 md:gap-4">
                  {steps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = currentStep >= step.number;
                    return (
                      <React.Fragment key={step.number}>
                        <button
                          onClick={() => setCurrentStep(step.number)}
                          className={`flex items-center gap-2 md:gap-3 px-3 py-2 md:px-4 rounded-xl transition-all text-sm md:text-base ${isActive
                            ? "bg-gradient-to-r from-[#1B6B3A] to-[#4A90D9] text-white shadow-lg shadow-[#1B6B3A]/30"
                            : "bg-white/5 text-[#64748B] border border-white/10 hover:bg-white/10"
                            }`}
                        >
                          <Icon />
                          <span className="hidden sm:inline font-medium">{step.title}</span>
                        </button>
                        {index < steps.length - 1 && (
                          <div className={`w-4 md:w-8 h-0.5 ${isActive ? "bg-[#1B6B3A]" : "bg-white/10"}`}></div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* Form Card */}
              <div className="glass-card p-4 md:p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1B6B3A] via-[#4A90D9] to-[#2C5F8A]"></div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Step 1: Personal Details */}
                  {currentStep === 1 && (
                    <div className="space-y-6 fade-in-up">
                      <h3 className="text-xl font-bold flex items-center gap-3 mb-6">
                        <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1B6B3A] to-[#4A90D9] flex items-center justify-center">
                          <UserIcon />
                        </span>
                        Personal Details
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="form-label">Full Name *</label>
                          <input
                            type="text"
                            name="name"
                            value={personal.name}
                            onChange={handlePersonalChange}
                            className="form-input"
                            placeholder="Enter your full name"
                            required
                          />
                        </div>
                        <div>
                          <label className="form-label">Age</label>
                          <input
                            type="number"
                            name="age"
                            value={personal.age}
                            onChange={handlePersonalChange}
                            className="form-input"
                            placeholder="Enter your age"
                          />
                        </div>
                        <div>
                          <label className="form-label">Date of Birth</label>
                          <input
                            type="date"
                            name="dob"
                            value={personal.dob}
                            onChange={handlePersonalChange}
                            className="form-input"
                          />
                        </div>
                        <div>
                          <label className="form-label">Phone Number *</label>
                          <input
                            type="tel"
                            name="phone"
                            value={personal.phone}
                            onChange={handlePersonalChange}
                            className="form-input"
                            placeholder="Enter your phone number"
                            required
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="form-label">Email *</label>
                          <input
                            type="email"
                            name="email"
                            value={personal.email}
                            onChange={handlePersonalChange}
                            className="form-input"
                            placeholder="Enter your email address"
                            required
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="form-label">Address</label>
                          <textarea
                            name="address"
                            value={personal.address}
                            onChange={handlePersonalChange}
                            className="form-input resize-none"
                            rows={3}
                            placeholder="Enter your full address"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => setCurrentStep(2)}
                          className="btn-primary w-full sm:w-auto"
                        >
                          Next: Complaint Details
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Complaint Details */}
                  {currentStep === 2 && (
                    <div className="space-y-6 fade-in-up">
                      <h3 className="text-xl font-bold flex items-center gap-3 mb-6">
                        <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2C5F8A] to-[#3A7B5C] flex items-center justify-center">
                          <DocumentIcon />
                        </span>
                        Complaint Details
                      </h3>

                      <div>
                        <label className="form-label">Description *</label>
                        <textarea
                          name="description"
                          value={complaint.description}
                          onChange={handleComplaintChange}
                          className="form-input resize-none"
                          rows={5}
                          placeholder="Describe your complaint in detail..."
                          required
                        />
                      </div>

                      <div>
                        <label className="form-label">District *</label>
                        <select
                          name="district"
                          value={complaint.district}
                          onChange={handleComplaintChange}
                          className="form-input"
                          required
                        >
                          <option value="">Select your district</option>
                          {districts.map((dist, i) => (
                            <option key={i} value={dist}>{dist}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="form-label">Suggestions (Optional)</label>
                        <textarea
                          name="suggestions"
                          value={complaint.suggestions}
                          onChange={handleComplaintChange}
                          className="form-input resize-none"
                          rows={3}
                          placeholder="Any suggestions for resolution..."
                        />
                      </div>

                      <div className="flex flex-col-reverse sm:flex-row justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => setCurrentStep(1)}
                          className="btn-secondary w-full sm:w-auto"
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(3)}
                          className="btn-primary w-full sm:w-auto"
                        >
                          Next: Location & Media
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Location & Media */}
                  {currentStep === 3 && (
                    <div className="space-y-6 fade-in-up">
                      <h3 className="text-xl font-bold flex items-center gap-3 mb-6">
                        <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4A8AB5] to-[#3D8B5A] flex items-center justify-center">
                          <LocationIcon />
                        </span>
                        Location & Media
                      </h3>

                      {/* Location Picker */}
                      <div>
                        <label className="form-label">Select Location on Map *</label>
                        {!fullscreen && (
                          <div className="relative rounded-xl overflow-hidden border border-white/10">
                            <div className="h-64">
                              {location && (
                                <MapWithInvalidate
                                  center={[location.lat, location.lng]}
                                  zoom={14}
                                  style={{ width: "100%", height: "100%" }}
                                >
                                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                  <LocationPicker setLocation={setLocation} />
                                  <Marker position={[location.lat, location.lng]} />
                                </MapWithInvalidate>
                              )}
                            </div>
                            <button
                              type="button"
                              className="absolute top-3 right-3 bg-[#1B6B3A] text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#145530] transition-colors"
                              onClick={() => setFullscreen(true)}
                            >
                              <ExpandIcon />
                              Fullscreen
                            </button>
                          </div>
                        )}
                        {location && (
                          <div className="mt-3 flex items-center gap-2 text-sm text-[#94A3B8]">
                            <LocationIcon />
                            <span>Selected: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>
                          </div>
                        )}
                      </div>

                      {/* Unified Media Upload (Photo or Video) */}
                      <div>
                        <label className="form-label flex items-center gap-2">
                          <CameraIcon />
                          Attach Photo or Video (Optional)
                        </label>
                        {!mediaFile && !videoUrl && (
                          <div className="space-y-3">
                            {/* Hidden file inputs — separate for camera photo, camera video, and gallery */}
                            <input
                              ref={photoCaptureRef}
                              type="file"
                              accept="image/*"
                              capture="environment"
                              onChange={handleMediaChange}
                              className="hidden"
                            />
                            <input
                              ref={videoCaptureRef}
                              type="file"
                              accept="video/*"
                              capture="environment"
                              onChange={handleMediaChange}
                              className="hidden"
                            />
                            <input
                              ref={galleryRef}
                              type="file"
                              accept="image/*,video/*"
                              onChange={handleMediaChange}
                              className="hidden"
                            />

                            {/* Action buttons grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {/* Take Photo */}
                              <button
                                type="button"
                                onClick={() => photoCaptureRef.current?.click()}
                                className="flex flex-col items-center justify-center gap-2 py-6 px-4 border-2 border-dashed border-white/15 rounded-xl cursor-pointer hover:border-[#1B6B3A] hover:bg-[#1B6B3A]/5 transition-all active:scale-95"
                              >
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1B6B3A] to-[#2C5F8A] flex items-center justify-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                                  </svg>
                                </div>
                                <span className="text-white text-sm font-medium">Take Photo</span>
                                <span className="text-[#64748B] text-[11px]">Open Camera</span>
                              </button>

                              {/* Record Video */}
                              <button
                                type="button"
                                onClick={() => videoCaptureRef.current?.click()}
                                className="flex flex-col items-center justify-center gap-2 py-6 px-4 border-2 border-dashed border-white/15 rounded-xl cursor-pointer hover:border-[#4A90D9] hover:bg-[#4A90D9]/5 transition-all active:scale-95"
                              >
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4A90D9] to-[#2C5F8A] flex items-center justify-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                                  </svg>
                                </div>
                                <span className="text-white text-sm font-medium">Record Video</span>
                                <span className="text-[#64748B] text-[11px]">Max 30 seconds</span>
                              </button>

                              {/* Upload from Gallery */}
                              <button
                                type="button"
                                onClick={() => galleryRef.current?.click()}
                                className="flex flex-col items-center justify-center gap-2 py-6 px-4 border-2 border-dashed border-white/15 rounded-xl cursor-pointer hover:border-[#3A7B5C] hover:bg-[#3A7B5C]/5 transition-all active:scale-95"
                              >
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3A7B5C] to-[#4A90D9] flex items-center justify-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                                  </svg>
                                </div>
                                <span className="text-white text-sm font-medium">From Gallery</span>
                                <span className="text-[#64748B] text-[11px]">Photo or Video</span>
                              </button>
                            </div>
                            <p className="text-center text-[11px] text-[#64748B]">Max file size: 15 MB • Video max: 30 seconds</p>
                          </div>
                        )}

                        {/* Image Preview */}
                        {mediaFile && mediaType === "image" && preview && (
                          <div className="mt-4 flex justify-center">
                            <div className="relative">
                              <img
                                src={preview}
                                alt="Preview"
                                className="max-h-48 rounded-xl shadow-lg border border-white/10"
                              />
                              <button
                                type="button"
                                onClick={handleRemoveMedia}
                                className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors shadow-lg"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Video Preview */}
                        {mediaFile && mediaType === "video" && preview && (
                          <div className="mt-4 space-y-3">
                            <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/30">
                              <video
                                src={preview}
                                controls
                                playsInline
                                className="w-full max-h-48 object-contain"
                              />
                              <button
                                type="button"
                                onClick={handleRemoveMedia}
                                className="absolute top-3 right-3 w-8 h-8 bg-red-500/90 text-white rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors"
                              >
                                ✕
                              </button>
                            </div>
                            {/* Upload Progress */}
                            {videoUploading && (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-[#94A3B8]">Uploading video to cloud...</span>
                                  <span className="text-[#4A90D9] font-semibold">{videoProgress}%</span>
                                </div>
                                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-[#4A90D9] to-[#1B6B3A] rounded-full transition-all duration-300"
                                    style={{ width: `${videoProgress}%` }}
                                  />
                                </div>
                              </div>
                            )}
                            {/* Upload success */}
                            {videoUrl && !videoUploading && (
                              <div className="flex items-center gap-2 text-sm text-[#1B6B3A]">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Video uploaded — AI analysis will run automatically</span>
                              </div>
                            )}
                            {/* Video error */}
                            {mediaError && (
                              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                                <span>⚠️</span>
                                <span>{mediaError}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* File info */}
                        {mediaFile && (
                          <div className="mt-2 flex items-center justify-between text-xs text-[#64748B]">
                            <span className="truncate max-w-[60%]">{mediaFile.name}</span>
                            <span className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-full bg-white/10 uppercase font-semibold">{mediaType}</span>
                              {(mediaFile.size / (1024 * 1024)).toFixed(1)} MB
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Voice Recording */}
                      <VoiceRecorder
                        onRecordingComplete={(file) => setVoiceFile(file)}
                      />

                      <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pb-4">
                        <button
                          type="button"
                          onClick={() => setCurrentStep(2)}
                          className="btn-secondary w-full sm:w-auto"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting || videoUploading}
                          className={`btn-primary flex items-center justify-center gap-3 w-full sm:w-auto ${isSubmitting || videoUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {isSubmitting ? (
                            <>
                              <div className="spinner !w-5 !h-5 !border-2"></div>
                              <span>Submitting...</span>
                            </>
                          ) : videoUploading ? (
                            <>
                              <div className="spinner !w-5 !h-5 !border-2"></div>
                              <span>Uploading Video...</span>
                            </>
                          ) : (
                            <>
                              <SendIcon />
                              <span>Submit Complaint</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Map Modal */}
      {fullscreen && (
        <div className="fixed inset-0 z-50 bg-[#0F1B2D] flex flex-col">
          <div className="p-4 flex justify-between items-center bg-black/50 border-b border-white/10">
            <h3 className="text-lg font-bold">Select Location</h3>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors"
              onClick={() => setFullscreen(false)}
            >
              Close Map
            </button>
          </div>
          {location && (
            <MapWithInvalidate
              center={[location.lat, location.lng]}
              zoom={15}
              style={{ flex: 1 }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationPicker setLocation={setLocation} />
              <Marker position={[location.lat, location.lng]} />
            </MapWithInvalidate>
          )}
        </div>
      )}
    </div>
  );
}

export default ComplaintForm;
