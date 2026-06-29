import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Loading skeleton state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amazon-dark text-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-amazon-orange border-t-transparent rounded-full animate-spin"></div>
          <p className="text-amazon-gold font-medium animate-pulse">Loading ShyamEats...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Determine which login route to redirect to
    if (location.pathname.startsWith('/admin')) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    if (location.pathname.startsWith('/restaurant')) {
      return <Navigate to="/restaurant/login" state={{ from: location }} replace />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role validation check
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Role mismatch redirection
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (user.role === 'restaurant') {
      return <Navigate to="/restaurant/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
