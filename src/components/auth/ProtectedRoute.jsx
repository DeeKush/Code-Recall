import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthListener from '../../hooks/useAuthListener';
import Loading from '../common/Loading';

/**
 * ProtectedRoute component for managing authenticated and public-only routes.
 * 
 * Props:
 * - children: The component to render if conditions are met.
 * - authenticationRequired: If true, redirects guests to /login (default).
 * - guestOnly: If true, redirects authenticated users to /dashboard.
 */
const ProtectedRoute = ({ children, authenticationRequired = true, guestOnly = false }) => {
  const { user, loading } = useAuthListener();
  const location = useLocation();

  // Show loading screen while auth state is initializing to prevent flicker
  if (loading) {
    return <Loading />;
  }

  // Case 1: Route requires authentication but user is not logged in
  if (authenticationRequired && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Case 2: Route is for guests only (like Login/Signup) but user is logged in
  if (guestOnly && user) {
    return <Navigate to="/dashboard" replace />;
  }

  // Case 3: Conditions met, render the content
  return children;
};

export default ProtectedRoute;
