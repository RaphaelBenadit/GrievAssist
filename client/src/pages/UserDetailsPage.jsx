import React from "react";
import AdminNavbar from "../components/AdminNavbar";
import UserDetails from "./UserDetails";

function UserDetailsPage() {
  return (
    <div className="flex min-h-screen bg-[#0F1B2D]">
      {/* Animated Background */}
      <div className="animated-bg"></div>

      {/* Sidebar */}
      <AdminNavbar active="/admin/users" />

      {/* Main Content */}
      <main className="flex-1 md:ml-72 p-4 md:p-8 relative z-10 pt-20 md:pt-8">
        <UserDetails />
      </main>
    </div>
  );
}

export default UserDetailsPage;
