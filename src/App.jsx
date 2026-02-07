// ==========================================
// MAIN APP COMPONENT
// ==========================================
// The root component of our application.
// Handles routing between auth screens and dashboard.
// ==========================================

import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import "./App.css";

// Inner component that uses auth context
function AppContent() {
  // Get auth state from context
  const { user, loading } = useAuth();

  // State to track which auth screen to show (login or signup)
  const [isLoginScreen, setIsLoginScreen] = useState(true);

  // Show loading screen while checking auth status
  if (loading) {
    return (
      <div className="loading-screen">
        <p>Loading...</p>
      </div>
    );
  }

  // If user is logged in, show the Dashboard
  if (user) {
    return <Dashboard />;
  }

  // If not logged in, show Login or Signup based on state
  return isLoginScreen ? (
    <Login onSwitchToSignup={() => setIsLoginScreen(false)} />
  ) : (
    <Signup onSwitchToLogin={() => setIsLoginScreen(true)} />
  );
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
