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
import ErrorBoundary from "./components/ErrorBoundary";
import "./App.css";

// Inner component that uses auth context
function AppContent() {
  // Get auth state from context
  const { user, loading } = useAuth();

  // State for navigation
  const [currentPage, setCurrentPage] = useState("home"); // home, login, signup

  // Auth Protection: Redirect to login if accessing protected route while unlogged
  useEffect(() => {
    const path = window.location.pathname;
    if (["/dashboard", "/snippets", "/ai-insights", "/settings"].includes(path)) {
      setCurrentPage("login");
    }
  }, []);

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

// Main App component wraps everything in AuthProvider and ErrorBoundary
function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
