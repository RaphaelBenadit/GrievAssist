import React, { useEffect, useState } from "react";
import axios from "axios";

// Icons
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);

const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const EmailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const LocationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const AllUsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // grid or table

  useEffect(() => {
    axios.get("/api/auth/users")
      .then(res => {
        setUsers(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError("Failed to fetch users");
        setLoading(false);
      });
  }, []);

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.district?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats
  const totalUsers = users.length;
  const adminCount = users.filter(u => u.role === "admin").length;
  const userCount = users.filter(u => u.role === "user").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-10 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-red-400 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in-up">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold mb-2">
            <span className="text-white">User </span>
            <span className="text-gradient">Management</span>
          </h1>
          <p className="text-[#94A3B8]">View and manage all registered users</p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1 border border-white/10">
          <button
            onClick={() => setViewMode("grid")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === "grid"
                ? "bg-gradient-to-r from-[#1B6B3A] to-[#4A90D9] text-white"
                : "text-[#94A3B8] hover:text-white"
              }`}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === "table"
                ? "bg-gradient-to-r from-[#1B6B3A] to-[#4A90D9] text-white"
                : "text-[#94A3B8] hover:text-white"
              }`}
          >
            Table
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card !rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1B6B3A] to-[#4A90D9]"></div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#64748B] text-sm mb-1">Total Users</p>
              <p className="text-3xl font-bold text-gradient">{totalUsers}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1B6B3A] to-[#4A90D9] flex items-center justify-center">
              <UsersIcon />
            </div>
          </div>
        </div>

        <div className="glass-card !rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2C5F8A] to-[#3A7B5C]"></div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#64748B] text-sm mb-1">Administrators</p>
              <p className="text-3xl font-bold text-[#2C5F8A]">{adminCount}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2C5F8A] to-[#3A7B5C] flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="glass-card !rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#4A90D9] to-[#1B6B3A]"></div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#64748B] text-sm mb-1">Regular Users</p>
              <p className="text-3xl font-bold text-[#4A90D9]">{userCount}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4A90D9] to-[#1B6B3A] flex items-center justify-center">
              <UserIcon />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="glass-card !rounded-xl p-4">
        <div className="relative w-full max-w-md">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]">
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder="Search by name, email, district..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#64748B] focus:outline-none focus:border-[#1B6B3A] focus:ring-1 focus:ring-[#1B6B3A] transition-all"
          />
        </div>
        <p className="text-sm text-[#64748B] mt-2">
          Showing {filteredUsers.length} of {totalUsers} users
        </p>
      </div>

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredUsers.length === 0 ? (
            <div className="col-span-full glass-card p-10 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-white/5 flex items-center justify-center mb-4">
                <UsersIcon />
              </div>
              <p className="text-[#64748B]">No users found</p>
            </div>
          ) : (
            filteredUsers.map(user => (
              <div key={user._id} className="glass-card !rounded-xl p-6 relative overflow-hidden hover:scale-[1.02] transition-transform">
                <div className={`absolute top-0 left-0 right-0 h-1 ${user.role === "admin"
                    ? "bg-gradient-to-r from-[#2C5F8A] to-[#3A7B5C]"
                    : "bg-gradient-to-r from-[#1B6B3A] to-[#4A90D9]"
                  }`}></div>

                {/* Header */}
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold text-white ${user.role === "admin"
                      ? "bg-gradient-to-br from-[#2C5F8A] to-[#3A7B5C]"
                      : "bg-gradient-to-br from-[#1B6B3A] to-[#4A90D9]"
                    }`}>
                    {user.name?.charAt(0)?.toUpperCase() || user.username?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{user.name || user.username || "-"}</h3>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${user.role === "admin"
                        ? "bg-[#2C5F8A]/20 text-[#2C5F8A]"
                        : "bg-[#1B6B3A]/20 text-[#1B6B3A]"
                      }`}>
                      {user.role || "user"}
                    </span>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-white/10 my-4"></div>

                {/* Details */}
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 text-[#94A3B8]">
                    <EmailIcon />
                    <span className="truncate">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-3 text-[#94A3B8]">
                      <PhoneIcon />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  {user.district && (
                    <div className="flex items-center gap-3 text-[#94A3B8]">
                      <LocationIcon />
                      <span>{user.district}</span>
                    </div>
                  )}
                  {user.age && (
                    <div className="flex items-center gap-3 text-[#94A3B8]">
                      <UserIcon />
                      <span>Age: {user.age}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Table View */}
      {viewMode === "table" && (
        <div className="glass-card !rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Age</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>District</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                          <UsersIcon />
                        </div>
                        <p className="text-[#64748B]">No users found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, idx) => (
                    <tr key={user._id || idx}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${user.role === "admin"
                              ? "bg-gradient-to-br from-[#2C5F8A] to-[#3A7B5C]"
                              : "bg-gradient-to-br from-[#1B6B3A] to-[#4A90D9]"
                            }`}>
                            {user.name?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                          <div>
                            <p className="font-medium text-white">{user.name || user.username || "-"}</p>
                            {user.address && (
                              <p className="text-xs text-[#64748B] truncate max-w-[200px]">{user.address}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>{user.age || "-"}</td>
                      <td>{user.phone || "-"}</td>
                      <td>
                        <a href={`mailto:${user.email}`} className="text-[#4A90D9] hover:underline">
                          {user.email}
                        </a>
                      </td>
                      <td>{user.district || "-"}</td>
                      <td>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${user.role === "admin"
                            ? "bg-[#2C5F8A]/20 text-[#2C5F8A] border border-[#2C5F8A]/30"
                            : "bg-[#1B6B3A]/20 text-[#1B6B3A] border border-[#1B6B3A]/30"
                          }`}>
                          {user.role || "user"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllUsersList;
