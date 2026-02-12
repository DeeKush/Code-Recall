// ==========================================
// MAIN APP COMPONENT (Day 4 - Dark Dashboard)
// ==========================================
// Routes between:
//   - Home (landing page)
//   - Login / Signup
//   - Dashboard
// ==========================================

import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Landing from "./components/Landing";
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
  const [currentPage, setCurrentPage] = useState("landing"); // landing, login, signup

  // Auth Protection & Direct URL Handling
  useEffect(() => {
    const path = window.location.pathname;

    // If not logged in and trying to access protected route -> redirect to login (or landing)
    // Protected routes: /dashboard, /snippets, /recall, /home, /settings
    // Public routes: /, /login, /signup
    const isProtected = ["/dashboard", "/snippets", "/recall", "/home", "/settings"].some(p => path.startsWith(p));

    if (!loading && !user && isProtected) {
      // Force to landing or login
      window.history.replaceState(null, "", "/");
      setCurrentPage("landing");
    }
  }, [user, loading]);

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
  // Dashboard handles its own internal routing (home, snippets, recall, etc.)
  if (user) {
    return <Dashboard />;
  }

  // Show appropriate public page based on state
  switch (currentPage) {
    case "login":
      return (
        <Login
          onSwitchToSignup={() => setCurrentPage("signup")}
          onBackToHome={() => setCurrentPage("landing")}
        />
      );
    case "signup":
      return (
        <Signup
          onSwitchToLogin={() => setCurrentPage("login")}
          onBackToHome={() => setCurrentPage("landing")}
        />
      );
    default:
      return (
        <Landing
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
