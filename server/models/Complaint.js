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


  // Location (lat, lng)
  location: {
    lat: { type: Number },
    lng: { type: Number }
  },

  // Complaint status
  status: { type: String, default: "pending" },

  // New AI fields:
  category: { type: String, default: 'unassigned', index: true },
  priority: { type: String, enum: ['low','medium','high'], default: 'low' },
  modelConfidence: { type: Number, default: null },
  isFakeScore: { type: Number, default: null },      // anomaly score, lower -> more anomalous
  humanCorrection: { type: String, default: null },  // admin-corrected category
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Complaint", ComplaintSchema);
