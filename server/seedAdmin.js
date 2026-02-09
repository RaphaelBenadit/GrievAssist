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

    const adminEmail = process.env.ADMIN_LOGIN_EMAIL || "admin@grievassist.com";
    const adminPassword = process.env.ADMIN_LOGIN_PASSWORD || "admin123";

    const existing = await Admin.findOne({ email: adminEmail });
    if (existing) {
      console.log("ℹ️ Admin already exists. Updating password...");
      existing.password = adminPassword;
      await existing.save();
      console.log("✅ Admin credentials updated successfully!");
    } else {
      const admin = new Admin({
        email: adminEmail,
        password: adminPassword,
      });
      await admin.save();
      console.log("✅ New admin created successfully with email:", adminEmail);
    }
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding admin:", err.message);
    process.exit(1);
  }
};

seedAdmin();
