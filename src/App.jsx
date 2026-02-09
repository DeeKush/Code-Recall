// ==========================================
// MAIN APP COMPONENT (Day 4 - Dark Dashboard)
// ==========================================
// Routes between:
//   - Home (landing page)
//   - Login / Signup
//   - Dashboard
// ==========================================

import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Home from "./components/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import "./App.css";

// Inner component that uses auth context
function AppContent() {
  // Get auth state from context
  const { user, loading } = useAuth();

  // State for navigation
  const [currentPage, setCurrentPage] = useState("home"); // home, login, signup

  // Show loading screen while checking auth status
  if (loading) {
    return (
      <div className="loading-screen-dark">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // If user is logged in, show the Dashboard
  if (user) {
    return <Dashboard />;
  }

  // Show appropriate page based on state
  switch (currentPage) {
    case "login":
      return (
        <Login
          onSwitchToSignup={() => setCurrentPage("signup")}
          onBackToHome={() => setCurrentPage("home")}
        />
      );
    case "signup":
      return (
        <Signup
          onSwitchToLogin={() => setCurrentPage("login")}
          onBackToHome={() => setCurrentPage("home")}
        />
      );
    default:
      return (
        <Home
          onGetStarted={() => setCurrentPage("signup")}
          onLogin={() => setCurrentPage("login")}
        />
      );
  }
}

// Main App component wraps everything in AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
