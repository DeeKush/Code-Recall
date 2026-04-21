import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ErrorBoundary from "./components/common/ErrorBoundary";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Loading from "./components/common/Loading";
import "./App.css";

// Lazy load pages for performance and academic best practices
const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Dashboard = lazy(() => import("./pages/Dashboard"));

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<Loading />}>
            <Routes>
              {/* Public Routes */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute authenticationRequired={false} guestOnly={true}>
                    <Landing />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/login" 
                element={
                  <ProtectedRoute authenticationRequired={false} guestOnly={true}>
                    <Login />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/signup" 
                element={
                  <ProtectedRoute authenticationRequired={false} guestOnly={true}>
                    <Signup />
                  </ProtectedRoute>
                } 
              />

              {/* Protected Dashboard Routes */}
              {/* Note: Nested routes handled within Dashboard.jsx */}
              <Route 
                path="/dashboard/*" 
                element={
                  <ProtectedRoute>
                    <ErrorBoundary>
                      <Dashboard />
                    </ErrorBoundary>
                  </ProtectedRoute>
                } 
              />

              {/* Fallback Redirects */}
              <Route path="/home" element={<Navigate to="/" replace />} />
              <Route path="/recall" element={<Navigate to="/dashboard/recall" replace />} />
              <Route path="/snippets" element={<Navigate to="/dashboard/snippets" replace />} />
              <Route path="/settings" element={<Navigate to="/dashboard/settings" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;

