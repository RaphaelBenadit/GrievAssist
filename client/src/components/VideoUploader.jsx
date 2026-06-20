import React, { useState, useRef } from "react";
import axios from "axios";
import API_BASE_URL from "../config/api";

// Icons
const VideoCameraIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
  </svg>
);

const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
);

const MAX_SIZE_MB = 15;
const MAX_DURATION_SEC = 30;
const ALLOWED_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

function VideoUploader({ onVideoUploaded, complaintId }) {
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const inputRef = useRef(null);

  // Validate video file
  const validateVideo = (file) => {
    // Check type
    if (!ALLOWED_TYPES.includes(file.type) && !file.type.startsWith("video/")) {
      return "Only MP4 and WebM video files are allowed.";
    }
    // Check size
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `Video must be under ${MAX_SIZE_MB} MB. Your file is ${(file.size / (1024 * 1024)).toFixed(1)} MB.`;
    }
    return null;
  };

  // Check video duration after loading metadata
  const checkDuration = (url) => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        if (video.duration > MAX_DURATION_SEC) {
          resolve(`Video must be under ${MAX_DURATION_SEC} seconds. Your video is ${Math.round(video.duration)} seconds.`);
        } else {
          resolve(null);
        }
      };
      video.onerror = () => {
        resolve(null); // Allow upload even if we can't check duration
      };
      video.src = url;
    });
  };

  // Handle file selection
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError(null);
    setUploadResult(null);

    // Validate type & size
    const validationError = validateVideo(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    // Validate duration
    const durationError = await checkDuration(previewUrl);
    if (durationError) {
      setError(durationError);
      URL.revokeObjectURL(previewUrl);
      return;
    }

    setVideoFile(file);
    setVideoPreview(previewUrl);
  };

  // Upload video
  const handleUpload = async () => {
    if (!videoFile) return;

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("video", videoFile);
      if (complaintId) {
        formData.append("complaintId", complaintId);
      }

      const res = await axios.post(`${API_BASE_URL}/api/video/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percent);
        },
      });

      setUploadResult(res.data);
      if (onVideoUploaded) {
        onVideoUploaded(res.data.videoUrl);
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Failed to upload video. Please try again.";
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  // Remove video
  const handleRemove = () => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoFile(null);
    setVideoPreview(null);
    setUploadResult(null);
    setError(null);
    setUploadProgress(0);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <label className="form-label flex items-center gap-2">
        <VideoCameraIcon />
        Upload Video (Optional)
      </label>

      {/* Upload Area */}
      {!videoFile && !uploadResult && (
        <div className="relative">
          <input
            ref={inputRef}
            type="file"
            accept="video/mp4,video/webm,video/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
            id="videoUpload"
          />
          <label
            htmlFor="videoUpload"
            className="flex flex-col items-center justify-center gap-3 w-full py-10 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-[#4A90D9] hover:bg-[#4A90D9]/5 transition-all"
          >
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#4A90D9] to-[#2C5F8A] flex items-center justify-center">
              <VideoCameraIcon />
            </div>
            <div className="text-center">
              <span className="text-white font-medium block">
                Tap to record or upload a video
              </span>
              <span className="text-[#64748B] text-sm block mt-1">
                MP4 or WebM • Max {MAX_SIZE_MB}MB • Max {MAX_DURATION_SEC}s
              </span>
            </div>
          </label>
        </div>
      )}

      {/* Video Preview */}
      {videoPreview && !uploadResult && (
        <div className="space-y-4">
          <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/30">
            <video
              ref={videoRef}
              src={videoPreview}
              controls
              className="w-full max-h-56 object-contain"
              playsInline
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-3 right-3 w-8 h-8 bg-red-500/90 text-white rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <TrashIcon />
            </button>
          </div>

          {/* File info */}
          <div className="flex items-center justify-between text-sm text-[#94A3B8]">
            <span className="truncate max-w-[60%]">{videoFile?.name}</span>
            <span>{(videoFile?.size / (1024 * 1024)).toFixed(1)} MB</span>
          </div>

          {/* Upload Button */}
          {!uploading && (
            <button
              type="button"
              onClick={handleUpload}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl font-semibold bg-gradient-to-r from-[#4A90D9] to-[#2C5F8A] text-white hover:shadow-lg hover:shadow-[#4A90D9]/30 transition-all"
            >
              <UploadIcon />
              <span>Upload & Analyze Video</span>
            </button>
          )}

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#94A3B8]">Uploading & compressing...</span>
                <span className="text-[#4A90D9] font-semibold">{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#4A90D9] to-[#1B6B3A] rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-[#64748B] text-center">
                Video is being compressed and uploaded. AI analysis will run in the background.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Upload Success */}
      {uploadResult && (
        <div className="glass-card !rounded-xl p-4 border border-[#1B6B3A]/30 bg-[#1B6B3A]/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#1B6B3A]/20 flex items-center justify-center text-[#1B6B3A]">
              <CheckCircleIcon />
            </div>
            <div>
              <p className="text-[#1B6B3A] font-semibold text-sm">Video uploaded successfully!</p>
              <p className="text-[#64748B] text-xs">
                {uploadResult.videoStatus === "processing"
                  ? "AI analysis is running in the background..."
                  : "Video saved to cloud storage."}
              </p>
            </div>
          </div>

          {/* Preview uploaded */}
          {videoPreview && (
            <video
              src={videoPreview}
              controls
              className="w-full max-h-40 rounded-lg object-contain bg-black/30"
              playsInline
            />
          )}

          <button
            type="button"
            onClick={handleRemove}
            className="mt-3 text-sm text-red-400 hover:text-red-300 transition-colors flex items-center gap-2"
          >
            <TrashIcon />
            Remove video
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
          <span className="text-sm">{error}</span>
        </div>
      )}
    </div>
  );
}

export default VideoUploader;
