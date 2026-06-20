import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

// SVG Icons as components
const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const ComplaintsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const AboutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ContactIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const LoginIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
  </svg>
);

const SparkleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </svg>
);

const FeedIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
  </svg>
);

function Navbar() {
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed && parsed.name ? parsed : null);
      } catch {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    setUser(null);
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header
      className={`navbar-glass py-4 px-6 lg:px-12 transition-all duration-300 ${scrolled ? "scrolled" : ""
        }`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => navigate("/")}
        >
          <img src="/logo.png" alt="GrievAssist Logo" className="w-12 h-12 object-contain group-hover:scale-110 transition-transform duration-300" />
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
            <span className="text-gradient">Griev</span>
            <span className="text-white">Assist</span>
          </h1>
          <span className="hidden lg:inline-flex items-center gap-1 bg-gradient-to-r from-[#1B6B3A]/20 to-[#4A90D9]/20 border border-[#1B6B3A]/30 text-[#1B6B3A] text-xs font-semibold px-3 py-1 rounded-full ml-2">
            <span className="w-2 h-2 bg-[#1B6B3A] rounded-full animate-pulse"></span>
            AI Powered
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-2">
          <button
            className={`nav-link ${isActive("/") || isActive("/userhome") ? "active" : ""}`}
            onClick={() => navigate(user ? "/userhome" : "/")}
          >
            <HomeIcon />
            <span>Home</span>
          </button>

          {user && localStorage.getItem("role") !== "admin" && (
            <Link
              to="/my-complaints"
              className={`nav-link ${isActive("/my-complaints") ? "active" : ""}`}
            >
              <ComplaintsIcon />
              <span>My Complaints</span>
            </Link>
          )}

          <Link
            to="/about"
            className={`nav-link ${isActive("/about") ? "active" : ""}`}
          >
            <AboutIcon />
            <span>About</span>
          </Link>

          <Link
            to="/contact"
            className={`nav-link ${isActive("/contact") ? "active" : ""}`}
          >
            <ContactIcon />
            <span>Contact</span>
          </Link>

          <Link
            to="/feed"
            className={`nav-link ${isActive("/feed") ? "active" : ""} relative`}
          >
            <FeedIcon />
            <span>Public Feed</span>
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#00E68A] rounded-full animate-pulse" />
          </Link>
        </nav>

        {/* User Section */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              {/* User Avatar & Name */}
              <div className="hidden md:flex items-center gap-3 bg-white/5 rounded-full py-2 px-4 border border-white/10">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1B6B3A] to-[#4A90D9] flex items-center justify-center text-white font-bold text-sm">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <span className="text-white/90 font-medium text-sm">
                  {user?.name || "User"}
                </span>
              </div>

              {/* Logout Button */}
              <button
                className="flex items-center gap-2 bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-red-500/30"
                onClick={handleLogout}
              >
                <LogoutIcon />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 bg-gradient-to-r from-[#1B6B3A] to-[#4A90D9] text-white px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-[#1B6B3A]/40 hover:scale-105"
            >
              <LoginIcon />
              <span>Sign In</span>
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-white/80 hover:text-white transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop overlay — tap to close */}
          <div
            className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-[90]"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="lg:hidden mt-4 pt-4 border-t border-white/10 mobile-menu-enter relative z-[100]">
            <nav className="flex flex-col gap-2">
              <button
                className={`nav-link justify-center ${isActive("/") || isActive("/userhome") ? "active" : ""}`}
                onClick={() => {
                  navigate(user ? "/userhome" : "/");
                  setMobileMenuOpen(false);
                }}
              >
                <HomeIcon />
                <span>Home</span>
              </button>

              {user && localStorage.getItem("role") !== "admin" && (
                <Link
                  to="/my-complaints"
                  className={`nav-link justify-center ${isActive("/my-complaints") ? "active" : ""}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ComplaintsIcon />
                  <span>My Complaints</span>
                </Link>
              )}

              <Link
                to="/about"
                className={`nav-link justify-center ${isActive("/about") ? "active" : ""}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <AboutIcon />
                <span>About</span>
              </Link>

              <Link
                to="/contact"
                className={`nav-link justify-center ${isActive("/contact") ? "active" : ""}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <ContactIcon />
                <span>Contact</span>
              </Link>

              <Link
                to="/feed"
                className={`nav-link justify-center ${isActive("/feed") ? "active" : ""}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <FeedIcon />
                <span>Public Feed</span>
              </Link>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}

export default Navbar;
