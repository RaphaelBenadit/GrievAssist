import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import UserHome from "./pages/UserHome";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ComplaintForm from "./pages/ComplaintForm";
import ProtectedRoute from "./components/ProtectedRoute";
import About from "./pages/About";
import Contact from "./pages/Contact";
import AdminDashboard from "./pages/AdminDashboard";
import MyComplaints from "./pages/MyComplaints";
import CategoryPage from "./pages/CategoryPage";
import UserDetailsPage from "./pages/UserDetailsPage";
import AdminWrapper from "./components/AdminWrapper";
import Chatbot from "./components/Chatbot";
import PublicFeed from "./pages/PublicFeed";
import AdminFeedPublisher from "./pages/AdminFeedPublisher";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/feed" element={<PublicFeed />} />

        {/* User routes */}
        <Route
          path="/complaint"
          element={
            <ProtectedRoute>
              <ComplaintForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-complaints"
          element={
            <ProtectedRoute>
              <MyComplaints />
            </ProtectedRoute>
          }
        />
        <Route
          path="/userhome"
          element={
            <ProtectedRoute>
              <UserHome />
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute role="admin">
              <AdminWrapper>
                <AdminDashboard />
              </AdminWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <ProtectedRoute role="admin">
              <AdminWrapper>
                <CategoryPage />
              </AdminWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute role="admin">
              <AdminWrapper>
                <UserDetailsPage />
              </AdminWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/feed"
          element={
            <ProtectedRoute role="admin">
              <AdminWrapper>
                <AdminFeedPublisher />
              </AdminWrapper>
            </ProtectedRoute>
          }
        />
      </Routes>
      {/* Chatbot - inside Router for navigation access */}
      <Chatbot />
    </Router>
  );
}

export default App;

