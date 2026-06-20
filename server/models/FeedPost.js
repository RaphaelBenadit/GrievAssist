const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  userName: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const FeedPostSchema = new mongoose.Schema({
  complaint: { type: mongoose.Schema.Types.ObjectId, ref: "Complaint", required: true },
  complaintId: { type: String, required: true }, // Human-readable CMP-xxx id
  title: { type: String, required: true },
  description: { type: String, required: true },
  district: { type: String },
  category: { type: String },
  priority: { type: String },
  resolvedAt: { type: Date },

  // Proof media attached by admin
  proofImages: [{ type: String }],   // filenames in /uploads
  proofVideos: [{ type: String }],   // external URLs (Cloudinary etc.)
  proofText: { type: String },       // admin's resolution note / proof text

  // Social interactions
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments: [CommentSchema],

  publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // admin user
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("FeedPost", FeedPostSchema);
