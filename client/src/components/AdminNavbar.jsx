import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext";

// Icons
const DashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
  </svg>
);

const CategoryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const SparkleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
  </svg>
);

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const FeedPublishIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3" />
  </svg>
);

const ADMIN_LINKS = [
  { label: "Dashboard", path: "/admin/dashboard", key: "complaints", icon: DashboardIcon },
  { label: "Categories", path: "/admin/categories", key: "category", icon: CategoryIcon },
  { label: "Users", path: "/admin/users", key: "users", icon: UsersIcon },
  { label: "Feed Publisher", path: "/admin/feed", key: "feed", icon: FeedPublishIcon },
];

function AdminNavbar({ active }) {
  const navigate = useNavigate();
  const { unreadCount, markAllAsRead } = useNotifications();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleNotificationClick = () => {
    if (unreadCount > 0) {
      markAllAsRead();
    }
  };

  const handleNavClick = (path, key) => {
    navigate(path);
    if (key === "complaints" && unreadCount > 0) {
      handleNotificationClick();
    }
    setMobileOpen(false);
  };

  // Get admin name from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <>
      {/* Mobile Hamburger Button - visible only on small screens */}
      <button
        className="admin-mobile-toggle md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle admin menu"
      >
        {mobileOpen ? <CloseIcon /> : <MenuIcon />}
      </button>

      {/* Mobile Overlay Backdrop */}
      {mobileOpen && (
        <div
          className="admin-mobile-overlay md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`admin-sidebar w-72 fixed top-0 left-0 h-full z-50 flex flex-col py-8 px-6 ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Logo Section */}
        <div
          className="flex items-center gap-3 cursor-pointer group mb-10 px-2"
          onClick={() => { navigate("/admin/dashboard"); setMobileOpen(false); }}
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1B6B3A] to-[#4A90D9] flex items-center justify-center shadow-lg group-hover:shadow-[#1B6B3A]/40 transition-all duration-300 group-hover:scale-110">
            <SparkleIcon />
          </div>
          <div>
            <h1 className="text-xl font-extrabold">
              <span className="text-gradient">Griev</span>
              <span className="text-white">Assist</span>
            </h1>
            <p className="text-xs text-[#64748B]">Admin Panel</p>
          </div>
        </div>

        {/* Admin Info Card */}
        <div className="glass-card !rounded-xl p-4 mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#1B6B3A] to-[#4A90D9]"></div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2C5F8A] to-[#3A7B5C] flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div>
              <p className="text-white font-semibold text-sm">{user?.name || "Admin"}</p>
              <p className="text-[#64748B] text-xs">Administrator</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-[#1B6B3A] rounded-full animate-pulse"></span>
            <span className="text-xs text-[#1B6B3A]">Online</span>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="mb-4">
          <p className="text-xs text-[#64748B] font-semibold uppercase tracking-wider px-2 mb-3">Main Menu</p>
        </div>

        <nav className="flex-1 space-y-2">
          {ADMIN_LINKS.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.path}
                className={`sidebar-link w-full text-left ${active === item.path ? "active" : ""
                  }`}
                onClick={() => handleNavClick(item.path, item.key)}
              >
                <span className={`${active === item.path ? 'text-[#1B6B3A]' : 'text-[#94A3B8]'} transition-colors`}>
                  <IconComponent />
                </span>
                <span>{item.label}</span>
                {item.key === "complaints" && unreadCount > 0 && (
                  <span className="absolute top-1/2 right-4 -translate-y-1/2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center animate-pulse shadow-lg shadow-red-500/30">
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Settings Section */}
        <div className="mb-4">
          <p className="text-xs text-[#64748B] font-semibold uppercase tracking-wider px-2 mb-3">Settings</p>
        </div>

        <button className="sidebar-link w-full text-left mb-4">
          <span className="text-[#94A3B8]">
            <SettingsIcon />
          </span>
          <span>Preferences</span>
        </button>

        {/* Logout Button */}
        <button
          onClick={() => { handleLogout(); setMobileOpen(false); }}
          className="flex items-center justify-center gap-3 bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:border-red-500 hover:text-white px-5 py-4 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-red-500/30"
        >
          <LogoutIcon />
          <span>Logout</span>
        </button>

        {/* Version Badge */}
        <div className="mt-6 text-center">
          <span className="text-xs text-[#64748B]">Version 2.0.0</span>
        </div>
      </aside>
    </>
  );
}

export default AdminNavbar;
