import React from "react";
import { Link } from "react-router-dom";

const UserNavbar = () => (
  <nav className="w-full bg-white shadow-md py-4 px-8 flex items-center justify-between fixed top-0 left-0 z-30">
    <div className="flex items-center gap-4">
      <Link to="/userhome" className="text-2xl font-extrabold text-blue-700 tracking-tight">GrievAssist</Link>
      <Link to="/my-complaints" className="text-blue-700 font-semibold hover:underline">My Complaints</Link>
      <Link to="/complaint" className="text-blue-700 font-semibold hover:underline">Post Complaint</Link>
    </div>
    <div>
      <Link to="/" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition">Logout</Link>
    </div>
  </nav>
);

export default UserNavbar;
