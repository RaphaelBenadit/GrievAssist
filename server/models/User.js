const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number },
  phone: { type: String },
  email: { type: String, required: true, unique: true },
  district: { type: String },
  address: { type: String },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" }
});

module.exports = mongoose.model("User", UserSchema);
