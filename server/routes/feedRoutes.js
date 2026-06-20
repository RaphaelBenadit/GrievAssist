// routes/feedRoutes.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const FeedPost = require("../models/FeedPost");
const Complaint = require("../models/Complaint");
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// Multer for proof images uploaded by admin
const proofUpload = multer({
  dest: path.join(__dirname, "../uploads"),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error("Only image files are allowed for proof uploads"));
  },
});

/* ==========================================================================
   PUBLIC: GET /api/feed  — list all feed posts (newest first)
   Optional query: ?limit=10&skip=0
   ========================================================================== */
router.get("/", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const skip = parseInt(req.query.skip) || 0;

    const posts = await FeedPost.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await FeedPost.countDocuments();
    res.json({ posts, total });
  } catch (err) {
    res.status(500).json({ message: "Error fetching feed", error: err.message });
  }
});

/* ==========================================================================
   PUBLIC: GET /api/feed/:id  — single feed post
   ========================================================================== */
router.get("/:id", async (req, res) => {
  try {
    const post = await FeedPost.findById(req.params.id).lean();
    if (!post) return res.status(404).json({ message: "Feed post not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: "Error fetching post", error: err.message });
  }
});

/* ==========================================================================
   ADMIN: POST /api/feed  — publish a resolved complaint to the feed
   Body (multipart): complaintId (mongo _id), title, description, proofText
   Files: proofImages[] (up to 5 images)
   Also accepts proofVideoUrl (single video URL) in body
   ========================================================================== */
router.post(
  "/",
  verifyToken,
  verifyAdmin,
  proofUpload.array("proofImages", 5),
  async (req, res) => {
    try {
      const { complaintId, title, description, proofText, proofVideoUrl } = req.body;

      if (!complaintId || !title || !description) {
        return res.status(400).json({ message: "complaintId, title, and description are required" });
      }

      const complaint = await Complaint.findById(complaintId);
      if (!complaint) {
        return res.status(404).json({ message: "Complaint not found" });
      }

      const proofImages = (req.files || []).map((f) => f.filename);
      const proofVideos = proofVideoUrl
        ? Array.isArray(proofVideoUrl)
          ? proofVideoUrl
          : [proofVideoUrl]
        : [];

      const feedPost = new FeedPost({
        complaint: complaint._id,
        complaintId: complaint.complaintId,
        title,
        description,
        district: complaint.district,
        category: complaint.humanCorrection || complaint.category,
        priority: complaint.priority,
        resolvedAt: complaint.status === "resolved" ? new Date() : undefined,
        proofImages,
        proofVideos,
        proofText: proofText || "",
        upvotes: [],
        comments: [],
        publishedBy: req.user._id,
      });

      await feedPost.save();
      res.status(201).json({ message: "Feed post published", feedPost });
    } catch (err) {
      console.error("Error publishing feed post:", err);
      res.status(500).json({ message: "Error publishing feed post", error: err.message });
    }
  }
);

/* ==========================================================================
   ADMIN: DELETE /api/feed/:id  — remove a feed post
   ========================================================================== */
router.delete("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const post = await FeedPost.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: "Feed post not found" });
    res.json({ message: "Feed post deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting feed post", error: err.message });
  }
});

/* ==========================================================================
   AUTH USER: POST /api/feed/:id/upvote  — toggle upvote
   ========================================================================== */
router.post("/:id/upvote", verifyToken, async (req, res) => {
  try {
    const post = await FeedPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Feed post not found" });

    const userId = req.user._id.toString();
    const alreadyUpvoted = post.upvotes.map((u) => u.toString()).includes(userId);

    if (alreadyUpvoted) {
      post.upvotes = post.upvotes.filter((u) => u.toString() !== userId);
    } else {
      post.upvotes.push(req.user._id);
    }

    await post.save();
    res.json({ upvotes: post.upvotes.length, upvoted: !alreadyUpvoted });
  } catch (err) {
    res.status(500).json({ message: "Error toggling upvote", error: err.message });
  }
});

/* ==========================================================================
   AUTH USER: POST /api/feed/:id/comment  — add a comment
   Body: { text }
   ========================================================================== */
router.post("/:id/comment", verifyToken, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const post = await FeedPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Feed post not found" });

    const comment = {
      user: req.user._id,
      userName: req.user.name || "Anonymous",
      text: text.trim(),
      createdAt: new Date(),
    };

    post.comments.push(comment);
    await post.save();

    res.status(201).json({ message: "Comment added", comment });
  } catch (err) {
    res.status(500).json({ message: "Error adding comment", error: err.message });
  }
});

/* ==========================================================================
   AUTH USER: DELETE /api/feed/:id/comment/:commentId
   Admin can delete any; user can delete their own
   ========================================================================== */
router.delete("/:id/comment/:commentId", verifyToken, async (req, res) => {
  try {
    const post = await FeedPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Feed post not found" });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const isAdmin = req.user.role === "admin";
    const isOwner = comment.user?.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    comment.deleteOne();
    await post.save();
    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting comment", error: err.message });
  }
});

module.exports = router;
