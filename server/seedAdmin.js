// seedAdmin.js
const mongoose = require("mongoose");
require("dotenv").config();
const Admin = require("./models/Admin");

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const existing = await Admin.findOne({ email: "admin@grievassist.com" });
    if (existing) {
      console.log("⚠️ Admin already exists with email:", existing.email);
      process.exit(0);
    }

    const admin = new Admin({
      email: "admin@grievassist.com",
      password: "admin123", // will be auto-hashed
    });

    await admin.save();
    console.log("✅ Default admin created successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding admin:", err.message);
    process.exit(1);
  }
};

seedAdmin();
