// src/components/ProtectedRoute.js
import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem("token");
  const storedRole = localStorage.getItem("role"); // 'user' or 'admin'

  // not logged in → redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // role-based check
  if (role && storedRole !== role) {
    // if role mismatch, send them home
    return <Navigate to="/" replace />;
  }

  return children; // ✅ allowed
};

export default ProtectedRoute;