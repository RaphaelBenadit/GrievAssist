// routes/complaintRoutes.js
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const fetch = require("node-fetch");
const multer = require("multer");

const Complaint = require("../models/Complaint");
const Notification = require("../models/Notification");
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");
const sendEmail = require("../utils/sendEmail");
const upload = require("../multerConfig");

const router = express.Router();

/* -------------------------------------------------------------------------- */
/*                                EMAIL REPLY                                 */
/* -------------------------------------------------------------------------- */
const replyUpload = multer({ dest: path.join(__dirname, "../uploads") });

router.post(
  "/reply",
  verifyToken,
  verifyAdmin,
  replyUpload.single("attachment"),
  async (req, res) => {
    try {
      // Only allow admin to send emails from the configured address
      const adminEmail = process.env.ADMIN_EMAIL;
      if (!adminEmail) {
        return res.status(500).json({ success: false, message: "Admin email not configured." });
      }

      const { to, message, complaintId } = req.body;
      if (!to || !message || !complaintId) {
        return res.status(400).json({ success: false, message: "Missing required fields." });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(to)) {
        return res.status(400).json({ success: false, message: "Invalid email format." });
      }

      let attachments = [];
      if (req.file) {
        attachments.push({
          filename: req.file.originalname,
          path: req.file.path,
        });
      }

      console.log(`📧 Sending reply email for complaint ${complaintId} to ${to}`);

      await sendEmail({
        to,
        subject: `Reply to your complaint (${complaintId})`,
        text: message,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">GrievAssist - Complaint Reply</h2>
            <p><strong>Complaint ID:</strong> ${complaintId}</p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; line-height: 1.6;">${message.replace(/\n/g, '<br>')}</p>
            </div>
            <p style="color: #6b7280; font-size: 14px;">
              This is an automated reply from GrievAssist. Please do not reply to this email.
            </p>
          </div>
        `,
        attachments,
      });

      console.log(`✅ Reply email sent successfully for complaint ${complaintId}`);
      res.json({ success: true, message: "Reply email sent successfully." });
    } catch (err) {
      console.error("❌ Error sending reply email:", err);

      // Provide more specific error messages
      let errorMessage = "Failed to send email";
      if (err.message.includes("Invalid login")) {
        errorMessage = "Email authentication failed. Please check email credentials.";
      } else if (err.message.includes("Invalid email")) {
        errorMessage = "Invalid email address format.";
      } else if (err.message.includes("timeout")) {
        errorMessage = "Email sending timed out. Please try again.";
      }

      res.status(500).json({
        success: false,
        message: errorMessage,
        error: err.message,
        details: err.response || err.toString(),
      });
    }
  }
);

/* -------------------------------------------------------------------------- */
/*                            COMPLAINT CREATION                              */
/* -------------------------------------------------------------------------- */

// Generate Unique Complaint ID
function generateComplaintId() {
  const timestamp = Date.now().toString().slice(-5);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `CMP-${timestamp}-${random}`;
}

// Create a new complaint (with image + voice upload)
router.post("/", verifyToken, upload.fields([
  { name: "image", maxCount: 1 },
  { name: "voiceRecording", maxCount: 1 }
]), async (req, res) => {
  try {
    let location = undefined;
    if (req.body.location) {
      try {
        location =
          typeof req.body.location === "string"
            ? JSON.parse(req.body.location)
            : req.body.location;
      } catch {
        location = undefined;
      }
    }

    const imageFile = req.files?.image?.[0];
    const voiceFile = req.files?.voiceRecording?.[0];

    const newComplaint = new Complaint({
      ...req.body,
      user: req.user._id,
      complaintId: generateComplaintId(),
      status: "pending",
      createdAt: new Date(),
      image: imageFile ? imageFile.filename : undefined,
      voiceRecording: voiceFile ? voiceFile.filename : undefined,
      location,
      videoUrl: req.body.videoUrl || undefined,
      videoStatus: req.body.videoUrl ? "processing" : undefined,
    });

    // 🔍 Call ML Service
    let mlClassificationSuccess = false;
    console.log(`🔍 Attempting ML classification for: "${req.body.description}"`);

    try {
      const mlRes = await fetch("http://localhost:8001/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: req.body.description, top_k: 3 }),
      });

      console.log(`📡 ML Service Response Status: ${mlRes.status}`);

      if (mlRes.ok) {
        const data = await mlRes.json();
        console.log(`📊 ML Service Response Data:`, data);
        newComplaint.category = data.category || "unassigned";
        newComplaint.priority = data.priority || "low";
        newComplaint.modelConfidence = data.confidence ?? null;
        newComplaint.isFakeScore = data.isFakeScore ?? null;
        mlClassificationSuccess = true;
        console.log(
          `✅ ML Prediction: Category = ${data.category}, Priority = ${data.priority}`
        );
      } else {
        console.log(`❌ ML Service Error: ${mlRes.status} - ${mlRes.statusText}`);
      }
    } catch (e) {
      console.log("⚠️ ML service offline, using fallback categorization");
      const desc = req.body.description.toLowerCase();
      if (
        desc.includes("road") ||
        desc.includes("street") ||
        desc.includes("pothole") ||
        desc.includes("drainage")
      ) {
        newComplaint.category = "roads";
        newComplaint.priority = "medium";
      } else if (
        desc.includes("garbage") ||
        desc.includes("waste") ||
        desc.includes("trash") ||
        desc.includes("clean")
      ) {
        newComplaint.category = "garbage";
        newComplaint.priority = "medium";
      } else if (
        desc.includes("water") ||
        desc.includes("electricity") ||
        desc.includes("power") ||
        desc.includes("light")
      ) {
        newComplaint.category = "utilities";
        newComplaint.priority = "high";
      } else {
        newComplaint.category = "unassigned";
        newComplaint.priority = "low";
      }
      newComplaint.modelConfidence = 0.5;
      newComplaint.isFakeScore = 0.1;
    }

    await newComplaint.save();

    // 🎥 Trigger async video ML analysis + aggregate all predictions
    if (newComplaint.videoUrl) {
      (async () => {
        try {
          console.log(`🎥 Triggering async video analysis for ${newComplaint.complaintId}...`);
          const videoMlRes = await fetch("http://localhost:8001/analyze-video", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              video_url: newComplaint.videoUrl,
              complaint_id: newComplaint._id.toString(),
            }),
          });

          let videoCategory = null;
          let videoConfidence = 0;
          let videoStatus = "failed";

          if (videoMlRes.ok) {
            const videoData = await videoMlRes.json();
            videoCategory = videoData.category || null;
            videoConfidence = videoData.confidence || 0;
            videoStatus = "completed";
            console.log(`✅ Video analysis completed: ${videoData.category} (${videoData.confidence})`);
          }

          // Fetch latest complaint state (may have voice analysis too now)
          const latestComplaint = await Complaint.findById(newComplaint._id);

          // --- AGGREGATE PREDICTIONS: text + voice + video ---
          const predictions = [];

          // Text ML prediction (weight: 0.5)
          if (latestComplaint.category && latestComplaint.category !== "unassigned") {
            predictions.push({
              source: "text",
              category: latestComplaint.category,
              priority: latestComplaint.priority || "low",
              confidence: latestComplaint.modelConfidence || 0.5,
              weight: 0.5,
            });
          }

          // Voice prediction (weight: 0.3)
          if (latestComplaint.voiceSummary?.detectedCategory && latestComplaint.voiceSummary.detectedCategory !== "other") {
            predictions.push({
              source: "voice",
              category: latestComplaint.voiceSummary.detectedCategory,
              priority: latestComplaint.voiceSummary.detectedPriority || "low",
              confidence: latestComplaint.voiceSummary.confidence || 0.5,
              weight: 0.3,
            });
          }

          // Video prediction (weight: 0.2)
          if (videoCategory && videoCategory !== "unassigned") {
            predictions.push({
              source: "video",
              category: videoCategory,
              priority: "medium", // video analysis doesn't predict priority directly
              confidence: videoConfidence,
              weight: 0.2,
            });
          }

          // Weighted majority voting for category
          let finalCategory = latestComplaint.category || "unassigned";
          let finalPriority = latestComplaint.priority || "low";
          let finalConfidence = latestComplaint.modelConfidence || 0;

          if (predictions.length > 1) {
            // Category: weighted vote
            const categoryScores = {};
            for (const pred of predictions) {
              const score = pred.weight * pred.confidence;
              categoryScores[pred.category] = (categoryScores[pred.category] || 0) + score;
            }
            finalCategory = Object.entries(categoryScores).sort((a, b) => b[1] - a[1])[0][0];

            // Priority: weighted average (high=3, medium=2, low=1)
            const prioMap = { high: 3, medium: 2, low: 1 };
            const prioReverseMap = { 3: "high", 2: "medium", 1: "low" };
            let totalWeight = 0;
            let prioScore = 0;
            for (const pred of predictions) {
              prioScore += (prioMap[pred.priority] || 1) * pred.weight;
              totalWeight += pred.weight;
            }
            const avgPrio = Math.round(prioScore / totalWeight);
            finalPriority = prioReverseMap[avgPrio] || "low";

            // Confidence: weighted average
            totalWeight = 0;
            let confSum = 0;
            for (const pred of predictions) {
              confSum += pred.confidence * pred.weight;
              totalWeight += pred.weight;
            }
            finalConfidence = confSum / totalWeight;

            console.log(`🧮 Aggregated from ${predictions.map(p => p.source).join("+")}: category=${finalCategory}, priority=${finalPriority}, confidence=${finalConfidence.toFixed(2)}`);
          }

          // Update complaint with video results + aggregated final
          await Complaint.findByIdAndUpdate(newComplaint._id, {
            videoCategory,
            videoConfidence,
            videoStatus,
            category: latestComplaint.humanCorrection || finalCategory,
            priority: finalPriority,
            modelConfidence: parseFloat(finalConfidence.toFixed(4)),
          });

        } catch (videoErr) {
          console.error("⚠️ Video analysis failed:", videoErr.message);
          await Complaint.findByIdAndUpdate(newComplaint._id, { videoStatus: "failed" });
        }
      })();
    }

    // Notification
    try {
      const notification = new Notification({
        type: "new_complaint",
        title: "New Complaint Submitted",
        message: `New complaint ${newComplaint.complaintId} has been submitted and categorized as "${newComplaint.category}"`,
        complaintId: newComplaint._id,
        read: false,
      });
      await notification.save();
    } catch (notificationError) {
      console.error("Error creating notification:", notificationError);
    }

    res.status(201).json({
      message: "Complaint submitted successfully!",
      complaint: newComplaint,
      mlClassificationSuccess,
    });
  } catch (err) {
    console.error("Error storing complaint:", err);
    res.status(500).json({
      message: "Error submitting complaint",
      error: err.message,
    });
  }
});

/* -------------------------------------------------------------------------- */
/*                            FETCH COMPLAINT ROUTES                          */
/* -------------------------------------------------------------------------- */

// Logged-in user's complaints
router.get("/", verifyToken, async (req, res) => {
  try {
    // Find complaints by user ObjectId or by email
    const complaints = await Complaint.find({
      $or: [
        { user: req.user._id },
        { email: req.user.email }
      ]
    });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: "Error fetching complaints" });
  }
});

// Admin: all complaints
router.get("/all", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const complaints = await Complaint.find().populate("user", "name email");
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: "Error fetching complaints" });
  }
});

// Grouped by category
router.get("/grouped/category", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const docs = await Complaint.aggregate([
      {
        $group: {
          _id: { $ifNull: ["$humanCorrection", "$category"] },
          count: { $sum: 1 },
          complaints: { $push: "$$ROOT" },
        },
      },
      { $project: { _id: 0, category: "$_id", count: 1, complaints: 1 } },
      { $sort: { category: 1 } },
    ]);

    // Populate user info
    for (const group of docs) {
      for (let i = 0; i < group.complaints.length; i++) {
        group.complaints[i] = await Complaint.populate(group.complaints[i], {
          path: "user",
          select: "name email phone district",
        });
      }
    }

    res.json(docs);
  } catch (err) {
    console.error("Error grouping complaints:", err);
    res
      .status(500)
      .json({ message: "Error grouping complaints", error: err.message });
  }
});

/* -------------------------------------------------------------------------- */
/*                            ADMIN RECLASSIFY                                */
/* -------------------------------------------------------------------------- */
router.post("/reclassify", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { onlyUnassigned = true } = req.body || {};
    const query = onlyUnassigned
      ? {
        $or: [
          { category: { $in: [null, "", "unassigned"] } },
          { priority: { $in: [null, ""] } },
        ],
      }
      : {};

    const complaints = await Complaint.find(query).limit(2000);
    let updated = 0;

    for (const c of complaints) {
      try {
        const mlRes = await fetch("http://localhost:8001/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: c.description || "", top_k: 3 }),
        });
        if (!mlRes.ok) continue;
        const data = await mlRes.json();
        c.category = data.category || "unassigned";
        c.priority = data.priority || "low";
        c.modelConfidence = data.confidence ?? null;
        c.isFakeScore = data.isFakeScore ?? null;
        await c.save();
        updated += 1;
      } catch (e) {
        continue;
      }
    }

    res.json({
      message: "Reclassification complete",
      total: complaints.length,
      updated,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error during reclassification",
      error: err.message,
    });
  }
});

/* -------------------------------------------------------------------------- */
/*                              STATUS UPDATE                                 */
/* -------------------------------------------------------------------------- */
router.put("/:id/status", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "in progress", "resolved"];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status value",
        error: `Status must be one of: ${validStatuses.join(", ")}`,
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid complaint ID format" });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.json({ message: "Status updated successfully", complaint });
  } catch (err) {
    res.status(500).json({
      message: "Error updating complaint",
      error: err.message,
    });
  }
});

/* -------------------------------------------------------------------------- */
/*                            DELETE COMPLAINT                                */
/* -------------------------------------------------------------------------- */
router.delete("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }
    res.json({ message: "Complaint deleted successfully", complaint });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting complaint", error: err.message });
  }
});

/* -------------------------------------------------------------------------- */
/*                       FIND SIMILAR/"DUPLICATE" COMPLAINTS                  */
/* -------------------------------------------------------------------------- */
async function findSimilarComplaints(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid complaint ID format" });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    const allComplaints = await Complaint.find({
      _id: { $ne: id },
      status: { $ne: "resolved" }
    }).populate("user", "name email");

    const matches = [];
    const description = complaint.description?.toLowerCase() || "";

    for (const otherComplaint of allComplaints) {
      const otherDescription = otherComplaint.description?.toLowerCase() || "";

      const words1 = description.split(/\s+/).filter(word => word.length > 3);
      const words2 = otherDescription.split(/\s+/).filter(word => word.length > 3);

      const commonWords = words1.filter(word => words2.includes(word));
      const similarity = commonWords.length / Math.max(words1.length, words2.length || 1);

      const isExactMatch = (
        complaint.user?.email === otherComplaint.user?.email ||
        complaint.email === otherComplaint.email
      ) && (
          complaint.district === otherComplaint.district ||
          complaint.address === otherComplaint.address
        );

      if (similarity > 0.3 || isExactMatch) {
        matches.push({
          ...otherComplaint.toObject(),
          similarity: Math.round(similarity * 100),
          matchType: isExactMatch ? 'exact' : 'similar'
        });
      }
    }

    matches.sort((a, b) => b.similarity - a.similarity);

    res.json({
      original: complaint,
      duplicates: matches.slice(0, 10),
      totalFound: matches.length
    });
  } catch (err) {
    console.error("Error finding duplicates:", err);
    res.status(500).json({
      message: "Error finding duplicates",
      error: err.message,
    });
  }
}

router.get("/duplicates/:id", verifyToken, verifyAdmin, findSimilarComplaints);
router.get("/similar/:id", verifyToken, verifyAdmin, findSimilarComplaints);

/* -------------------------------------------------------------------------- */
/*                       VOICE RECORDING SUMMARIZATION                        */
/* -------------------------------------------------------------------------- */
router.post("/:id/summarize-audio", verifyToken, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (!complaint.voiceRecording) {
      return res.status(400).json({ message: "No voice recording found for this complaint" });
    }

    const audioPath = path.join(__dirname, "../uploads", complaint.voiceRecording);
    if (!fs.existsSync(audioPath)) {
      return res.status(404).json({ message: "Audio file not found on server" });
    }

    // Send audio file to local ML service (Whisper transcription)
    const FormData = (await import("form-data")).default;
    const formData = new FormData();
    formData.append("audio", fs.createReadStream(audioPath), {
      filename: complaint.voiceRecording,
      contentType: "audio/webm",
    });

    console.log(`🎙️ Sending audio to Whisper ML service for complaint ${complaint.complaintId}...`);

    const mlRes = await fetch("http://localhost:8001/transcribe", {
      method: "POST",
      body: formData,
      headers: formData.getHeaders(),
    });

    if (!mlRes.ok) {
      const errorData = await mlRes.text();
      console.error("ML Service error:", errorData);
      return res.status(500).json({ message: "Failed to analyze audio via ML service", error: errorData });
    }

    const analysis = await mlRes.json();

    // Save to database
    complaint.voiceSummary = {
      transcription: analysis.transcription || "",
      summary: analysis.summary || "",
      detectedCategory: analysis.detectedCategory || "other",
      detectedPriority: analysis.detectedPriority || "medium",
      detectedLanguage: analysis.detectedLanguage || "unknown",
      analyzedAt: new Date(),
    };

    // --- Aggregate text + voice + video predictions ---
    const predictions = [];

    // Text prediction (weight: 0.5)
    if (complaint.category && complaint.category !== "unassigned") {
      predictions.push({
        source: "text",
        category: complaint.category,
        priority: complaint.priority || "low",
        confidence: complaint.modelConfidence || 0.5,
        weight: 0.5,
      });
    }

    // Voice prediction (weight: 0.3)
    const voiceCat = analysis.detectedCategory;
    if (voiceCat && voiceCat !== "other") {
      predictions.push({
        source: "voice",
        category: voiceCat,
        priority: analysis.detectedPriority || "low",
        confidence: analysis.confidence || 0.5,
        weight: 0.3,
      });
    }

    // Video prediction (weight: 0.2)
    if (complaint.videoCategory && complaint.videoCategory !== "unassigned" && complaint.videoStatus === "completed") {
      predictions.push({
        source: "video",
        category: complaint.videoCategory,
        priority: "medium",
        confidence: complaint.videoConfidence || 0.5,
        weight: 0.2,
      });
    }

    // Perform weighted aggregation if multiple sources exist
    if (predictions.length > 1) {
      const categoryScores = {};
      for (const pred of predictions) {
        const score = pred.weight * pred.confidence;
        categoryScores[pred.category] = (categoryScores[pred.category] || 0) + score;
      }
      complaint.category = complaint.humanCorrection || Object.entries(categoryScores).sort((a, b) => b[1] - a[1])[0][0];

      const prioMap = { high: 3, medium: 2, low: 1 };
      const prioReverseMap = { 3: "high", 2: "medium", 1: "low" };
      let totalWeight = 0, prioScore = 0;
      for (const pred of predictions) {
        prioScore += (prioMap[pred.priority] || 1) * pred.weight;
        totalWeight += pred.weight;
      }
      complaint.priority = prioReverseMap[Math.round(prioScore / totalWeight)] || "low";

      totalWeight = 0;
      let confSum = 0;
      for (const pred of predictions) {
        confSum += pred.confidence * pred.weight;
        totalWeight += pred.weight;
      }
      complaint.modelConfidence = parseFloat((confSum / totalWeight).toFixed(4));

      console.log(`🧮 Aggregated from ${predictions.map(p => p.source).join("+")}: category=${complaint.category}, priority=${complaint.priority}`);
    }

    await complaint.save();

    console.log(`✅ Audio summarized for complaint ${complaint.complaintId} (via Whisper)`);
    res.json({
      success: true,
      message: "Audio analyzed successfully",
      voiceSummary: complaint.voiceSummary,
    });
  } catch (err) {
    console.error("Error summarizing audio:", err);
    res.status(500).json({
      message: "Error analyzing audio recording",
      error: err.message,
    });
  }
});

module.exports = router;
