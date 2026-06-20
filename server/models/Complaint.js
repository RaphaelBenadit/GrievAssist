const mongoose = require("mongoose");

const ComplaintSchema = new mongoose.Schema({
  // Unique Complaint ID
  complaintId: { type: String, required: true, unique: true },

  // Link complaint to user
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // Personal Details
  name: { type: String, required: true },
  age: { type: Number },
  dob: { type: Date },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String },


  // Complaint Details
  description: { type: String, required: true },
  district: { type: String, required: true },
  suggestions: { type: String },

  // Image filename (optional)
  image: { type: String },

  // Voice recording filename (optional)
  voiceRecording: { type: String },

  // AI analysis of voice recording
  voiceSummary: {
    transcription: { type: String, default: null },
    summary: { type: String, default: null },
    detectedCategory: { type: String, default: null },
    detectedPriority: { type: String, default: null },
    detectedLanguage: { type: String, default: null },
    analyzedAt: { type: Date, default: null }
  },


  // Location (lat, lng)
  location: {
    lat: { type: Number },
    lng: { type: Number }
  },

  // Complaint status
  status: { type: String, default: "pending" },

  // New AI fields:
  category: { type: String, default: 'unassigned', index: true },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
  modelConfidence: { type: Number, default: null },
  isFakeScore: { type: Number, default: null },      // anomaly score, lower -> more anomalous
  humanCorrection: { type: String, default: null },  // admin-corrected category

  // Video complaint fields
  videoUrl: { type: String, default: null },          // Cloudinary secure URL
  videoCategory: { type: String, default: null },     // ML-predicted category from video
  videoConfidence: { type: Number, default: null },   // ML confidence score for video
  videoStatus: { type: String, enum: ['processing', 'completed', 'failed', null], default: null },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Complaint", ComplaintSchema);
