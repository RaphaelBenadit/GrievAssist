// routes/videoRoutes.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
const cloudinary = require("cloudinary").v2;
const fetch = require("node-fetch");

const Complaint = require("../models/Complaint");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

// Set FFmpeg path
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer: store video files temporarily on disk
const uploadDir = path.join(__dirname, "../uploads/videos");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `video-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const videoFilter = (req, file, cb) => {
  const allowedMimes = ["video/mp4", "video/webm", "video/quicktime", "video/x-matroska"];
  if (allowedMimes.includes(file.mimetype) || file.mimetype.startsWith("video/")) {
    cb(null, true);
  } else {
    cb(new Error("Only MP4 and WebM video files are allowed!"), false);
  }
};

const videoUpload = multer({
  storage: videoStorage,
  fileFilter: videoFilter,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB raw upload limit (will be compressed)
});

/* -------------------------------------------------------------------------- */
/*                          VIDEO COMPRESSION (FFmpeg)                         */
/* -------------------------------------------------------------------------- */
function compressVideo(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        "-vf", "scale='min(720,iw)':-2",  // Scale to max 720p width, keep aspect ratio
        "-t", "30",                         // Max 30 seconds
        "-b:v", "800k",                     // Video bitrate 800kbps
        "-b:a", "64k",                      // Audio bitrate 64kbps
        "-c:v", "libx264",                  // H.264 codec
        "-preset", "fast",                  // Fast encoding
        "-movflags", "+faststart",          // Streamable MP4
        "-f", "mp4",                        // Output format
      ])
      .output(outputPath)
      .on("start", (cmd) => {
        console.log("🎬 FFmpeg started:", cmd);
      })
      .on("end", () => {
        console.log("✅ Video compression complete");
        resolve(outputPath);
      })
      .on("error", (err) => {
        console.error("❌ FFmpeg error:", err.message);
        reject(err);
      })
      .run();
  });
}

/* -------------------------------------------------------------------------- */
/*                        UPLOAD TO CLOUDINARY                                 */
/* -------------------------------------------------------------------------- */
async function uploadToCloudinary(filePath) {
  try {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_large(filePath, {
        resource_type: "video",
        folder: "grievassist/videos",
        chunk_size: 6000000, // 6MB chunks for reliable upload on slow networks
        timeout: 180000,     // 3 minute timeout
      }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    });
    const url = result.secure_url || result.url;
    console.log(`☁️ Uploaded to Cloudinary: ${url}`);
    return url;
  } catch (err) {
    console.error("❌ Cloudinary upload error:", err.message || err);
    throw err;
  }
}

/* -------------------------------------------------------------------------- */
/*                      TRIGGER ML ANALYSIS (ASYNC)                            */
/* -------------------------------------------------------------------------- */
async function triggerMLAnalysis(complaintId, videoUrl) {
  try {
    console.log(`🧠 Triggering ML video analysis for complaint ${complaintId}...`);

    const mlRes = await fetch("http://localhost:8001/analyze-video", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ video_url: videoUrl, complaint_id: complaintId }),
    });

    if (mlRes.ok) {
      const data = await mlRes.json();
      console.log(`✅ ML video analysis result:`, data);

      // Update complaint in database
      await Complaint.findByIdAndUpdate(complaintId, {
        videoCategory: data.category || "unassigned",
        videoConfidence: data.confidence || 0,
        videoStatus: "completed",
        // Also update main category if not already set by text
        ...(data.category && { category: data.category }),
        ...(data.confidence && { modelConfidence: data.confidence }),
      });

      console.log(`📝 Complaint ${complaintId} updated with video analysis results`);
    } else {
      console.error(`❌ ML service returned ${mlRes.status}`);
      await Complaint.findByIdAndUpdate(complaintId, { videoStatus: "failed" });
    }
  } catch (err) {
    console.error(`❌ ML video analysis failed for ${complaintId}:`, err.message);
    await Complaint.findByIdAndUpdate(complaintId, { videoStatus: "failed" });
  }
}

/* -------------------------------------------------------------------------- */
/*                         CLEANUP TEMP FILES                                  */
/* -------------------------------------------------------------------------- */
function cleanupFile(filePath) {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️ Cleaned up: ${path.basename(filePath)}`);
    }
  } catch (err) {
    console.error(`⚠️ Cleanup warning: ${err.message}`);
  }
}

/* -------------------------------------------------------------------------- */
/*                      POST /api/video/upload                                 */
/* -------------------------------------------------------------------------- */
router.post("/upload", verifyToken, videoUpload.single("video"), async (req, res) => {
  let inputPath = null;
  let compressedPath = null;

  try {
    if (!req.file) {
      return res.status(400).json({ message: "No video file uploaded" });
    }

    inputPath = req.file.path;
    const fileSizeMB = req.file.size / (1024 * 1024);

    console.log(`📹 Video received: ${req.file.originalname} (${fileSizeMB.toFixed(2)} MB)`);

    // Validate file size (15MB after receiving)
    if (fileSizeMB > 15) {
      cleanupFile(inputPath);
      return res.status(400).json({
        message: "Video file too large. Maximum size is 15 MB.",
      });
    }

    // Step 1: Compress video with FFmpeg
    const compressedFilename = `video-${Date.now()}.mp4`;
    compressedPath = path.join(uploadDir, compressedFilename);
    console.log("🔧 Compressing video...");
    await compressVideo(inputPath, compressedPath);

    // Clean up original file (no longer needed after compression)
    cleanupFile(inputPath);
    inputPath = null;

    // Step 2: Build local URL for the video (works on same network)
    const protocol = req.protocol || "http";
    const host = req.get("host"); // e.g. 10.10.5.54:5000
    const localVideoUrl = `${protocol}://${host}/uploads/videos/${compressedFilename}`;

    // Try Cloudinary upload in the background (non-blocking), use local URL immediately
    let videoUrl = localVideoUrl;
    console.log(`📁 Video saved locally: ${localVideoUrl}`);

    // Attempt Cloudinary upload in background (optional, non-blocking)
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
      const cloudinaryPath = compressedPath; // keep reference before it gets nulled
      (async () => {
        try {
          console.log("☁️ Attempting background Cloudinary upload...");
          const cloudUrl = await uploadToCloudinary(cloudinaryPath);
          if (cloudUrl) {
            console.log(`☁️ Cloudinary upload succeeded: ${cloudUrl}`);
            // Update any complaints that used the local URL → Cloudinary URL
            await Complaint.updateMany(
              { videoUrl: localVideoUrl },
              { videoUrl: cloudUrl }
            );
          }
        } catch (cloudErr) {
          console.log(`⚠️ Cloudinary upload failed (using local URL): ${cloudErr.message}`);
          // Local URL is already saved, so this is fine
        }
      })();
    }

    // Step 3: Get complaint ID from request body or create association
    const complaintId = req.body.complaintId;

    if (complaintId) {
      // Update existing complaint with video URL
      const complaint = await Complaint.findByIdAndUpdate(
        complaintId,
        {
          videoUrl: videoUrl,
          videoStatus: "processing",
        },
        { new: true }
      );

      if (!complaint) {
        return res.status(404).json({ message: "Complaint not found" });
      }

      // Step 4: Trigger ML analysis asynchronously (non-blocking)
      triggerMLAnalysis(complaint._id, videoUrl).catch((err) =>
        console.error("Background ML analysis error:", err)
      );

      res.status(200).json({
        message: "Video uploaded successfully! Analysis in progress.",
        videoUrl: videoUrl,
        videoStatus: "processing",
        complaint: complaint,
      });
    } else {
      // Just return the URL if no complaint ID provided
      // (video will be attached during complaint creation)
      res.status(200).json({
        message: "Video uploaded successfully!",
        videoUrl: videoUrl,
        videoStatus: "uploaded",
      });
    }
  } catch (err) {
    console.error("❌ Video upload error:", err);
    // Clean up any remaining temp files on error
    cleanupFile(inputPath);
    cleanupFile(compressedPath);
    res.status(500).json({
      message: "Error processing video",
      error: err.message,
    });
  }
});

/* -------------------------------------------------------------------------- */
/*                   GET /api/video/status/:complaintId                        */
/* -------------------------------------------------------------------------- */
router.get("/status/:complaintId", verifyToken, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.complaintId);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }
    res.json({
      videoUrl: complaint.videoUrl,
      videoStatus: complaint.videoStatus,
      videoCategory: complaint.videoCategory,
      videoConfidence: complaint.videoConfidence,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching video status", error: err.message });
  }
});

module.exports = router;
