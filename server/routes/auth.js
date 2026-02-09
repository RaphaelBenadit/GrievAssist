
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Admin = require("../models/Admin"); // ✅ import admin model
require("dotenv").config();

const router = express.Router();

// =======================
// Get current user (for AuthContext)
// =======================
router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ msg: "No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    let user;
    if (decoded.role === "admin") {
      user = await Admin.findById(decoded.id, "email role username");
      if (user) user = { ...user._doc, username: user.username || "Admin" };
    } else {
      user = await User.findById(decoded.id, "name email role");
    }
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(401).json({ msg: "Invalid token" });
  }
});

// =======================
// Signup (Users Only)
// =======================
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ msg: "User registered successfully" });
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// =======================
// Login (User + Admin)
// =======================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ First check Admin
    let admin = await Admin.findOne({ email });
    if (admin) {
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

      const token = jwt.sign(
        { id: admin._id, role: "admin" },
        process.env.JWT_SECRET,
        { expiresIn: "2h" }
      );

      return res.json({
        token,
        role: "admin",
        user: { id: admin._id, username: admin.username, email: admin.email },
      });
    }

    // 2️⃣ If not admin, check normal user
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: "user" },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.json({
      token,
      role: "user",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// =======================
// Get all users (Admin only, but for now open)
// =======================
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, "name age phone email district address role");
    const Complaint = require("../models/Complaint");
    // Get all complaints
    const complaints = await Complaint.find({}, "email age phone address district");
    // Merge all relevant fields from complaints if email matches
    const mergedUsers = users.map(user => {
      // Find complaint with matching email
      const complaint = complaints.find(c => c.email === user.email);
      // If complaint has relevant fields, override user's fields
      const merged = { ...user._doc };
      if (complaint) {
        if (complaint.age) merged.age = complaint.age;
        if (complaint.phone) merged.phone = complaint.phone;
        if (complaint.address) merged.address = complaint.address;
        if (complaint.district) merged.district = complaint.district;
      }
      return merged;
    });
    res.json(mergedUsers);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
