import React, { useEffect, useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Memoize the user ID to prevent unnecessary re-renders
  const userId = user?.id;
  const userRole = user?.role;
  const pathname = location.pathname;

  // Debug logging - only log when relevant values change
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Auth state changed:', { 
        userId,
        userRole,
        loading,
        currentPath: pathname,
        allowedRoles: [...allowedRoles] // Create new array reference for comparison
      });
    }
  }, [userId, userRole, loading, pathname, JSON.stringify(allowedRoles)]);

  // Memoize the redirect logic to prevent unnecessary recalculations
  const content = useMemo(() => {
    if (loading) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Auth loading...');
      }
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-royal-600"></div>
        </div>
      );
    }

    if (!user) {
      if (process.env.NODE_ENV === 'development') {
        console.log('No user found, redirecting to login');
      }
      return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check if user has any of the allowed roles
    const hasRequiredRole = allowedRoles.length === 0 || 
                          (userRole && allowedRoles.includes(userRole));

    if (!hasRequiredRole) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Access denied. User role:', userRole, 'Required roles:', allowedRoles);
      }
      
      // If no specific role is required but user is authenticated, let them through
      if (allowedRoles.length === 0 && user) {
        return children;
      }
      
      // Handle role-based redirections
      let redirectPath = '/';
      
      if (userRole) {
        // Don't redirect if we're already on an analytics page
        if (location.pathname.startsWith('/admin/analytics')) {
          return children;
        }
        
        switch(userRole) {
          case 'admin':
            redirectPath = '/admin/dashboard';
            break;
          case 'student':
            redirectPath = '/student/dashboard';
            break;
          case 'teacher':
          case 'faculty':
            redirectPath = '/faculty/dashboard';
            break;
          case 'transport_admin':
            window.location.href = 'http://localhost:3001';
            return null;
          case 'driver':
            window.location.href = 'http://localhost:3001/driver';
            return null;
          default:
            redirectPath = '/';
        }
      }
      
      // If already on the redirect path, don't redirect again
      if (location.pathname !== redirectPath) {
        return <Navigate to={redirectPath} replace state={{ from: location }} />;
      }
      
      return children;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('Access granted for role:', userRole);
    }
    
    return children;
  }, [user, userRole, loading, pathname, allowedRoles, children, location]);

  return content;
};

export default React.memo(ProtectedRoute);
