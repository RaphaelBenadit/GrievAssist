const express = require("express");
const Notification = require("../models/Notification");
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// Get all notifications (Admin only)
router.get("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const notifications = await Notification.find()
      .populate('complaintId', 'complaintId description status')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: "Error fetching notifications", error: err.message });
  }
});

// Mark notification as read
router.put("/:id/read", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.json({ message: "Notification marked as read", notification });
  } catch (err) {
    res.status(500).json({ message: "Error updating notification", error: err.message });
  }
});

// Mark all notifications as read
router.put("/read-all", verifyToken, verifyAdmin, async (req, res) => {
  try {
    await Notification.updateMany({}, { read: true });
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Error updating notifications", error: err.message });
  }
});

// Create notification (internal use)
router.post("/", async (req, res) => {
  try {
    const notification = new Notification(req.body);
    await notification.save();
    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ message: "Error creating notification", error: err.message });
  }
});

module.exports = router;
