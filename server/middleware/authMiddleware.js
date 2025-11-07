const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Admin = require("../models/Admin");

// Middleware to protect routes (works for both User & Admin)
const verifyToken = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      let entity;

      // First try finding user
      entity = await User.findById(decoded.id).select("-password");

      // If not user, try admin
      if (!entity) {
        entity = await Admin.findById(decoded.id).select("-password");
      }

      if (!entity) {
        return res.status(401).json({ message: "User/Admin not found" });
      }

      // Attach role and entity data
      req.user = { ...entity.toObject(), role: decoded.role };

      return next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "No token provided, not authorized" });
  }
};

// Middleware to check Admin role
const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ message: "Admin access only" });
};

module.exports = { verifyToken, verifyAdmin };
