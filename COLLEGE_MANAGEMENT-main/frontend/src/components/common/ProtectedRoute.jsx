import React from 'react';
import { useLocation, Navigate, useNavigate, useMatch } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import { ROLES } from '../../constants/roles';

// Cache for route access checks
const routeAccessCache = new Map();

/**
 * ErrorBoundary component to catch errors in child components
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error in ProtectedRoute:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">
          <h2 className="font-bold text-lg mb-2">Something went wrong</h2>
          <p>{this.state.error?.message || 'An unknown error occurred'}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * ProtectedRoute component that handles authentication and authorization
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @param {string[]} [props.allowedRoles=[]] - Array of allowed roles (optional)
 * @param {boolean} [props.redirectToLogin=true] - Whether to redirect to login if not authenticated
 * @param {string} [props.redirectPath='/admin/login'] - Path to redirect to if not authenticated
 * @param {string} [props.unauthorizedPath='/unauthorized'] - Path to redirect to if not authorized
 * @returns {JSX.Element} Protected route component
 */
const ProtectedRoute = ({
  children,
  allowedRoles = [],
  redirectToLogin = true,
  redirectPath = '/admin/login',
  unauthorizedPath = '/unauthorized',
}) => {
  const { user, isAuthenticated, isLoading, hasAnyRole, isInitializing } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const match = useMatch(location.pathname);
  const [error, setError] = useState(null);

  // Clear cache when user changes (login/logout)
  useEffect(() => {
    try {
      routeAccessCache.clear();
    } catch (err) {
      console.error('Error clearing route cache:', err);
      setError(err);
    }
  }, [user?.id]);

  // Memoize the route access check
  const hasAccess = useMemo(() => {
    try {
      // If we're still initializing, return false to prevent flash of content
      if (isInitializing) return false;
      
      // If not authenticated, no access
      if (!isAuthenticated) return false;
      
      // If no roles required, allow access
      if (allowedRoles.length === 0) return true;

      // Check if user has any of the allowed roles
      const hasRole = hasAnyRole(allowedRoles);
      
      // Debug logging
      if (process.env.NODE_ENV === 'development') {
        console.log('ProtectedRoute - User role:', user?.role);
        console.log('ProtectedRoute - Allowed roles:', allowedRoles);
        console.log('ProtectedRoute - Has access:', hasRole);
      }

      return hasRole;
    } catch (err) {
      console.error('Error in access check:', err);
      setError(err);
      return false;
    }
  }, [isAuthenticated, allowedRoles, hasAnyRole, user?.role, isInitializing]);

  // Handle redirections in a useEffect to prevent navigation during render
  useEffect(() => {
    if (isInitializing || isLoading) return;

    try {
      // Create a cache key based on the current path and user role
      const cacheKey = `${location.pathname}:${user?.role || 'anonymous'}`;
      
      // Check if we've already processed this route for the current user
      if (routeAccessCache.has(cacheKey)) {
        const cachedAccess = routeAccessCache.get(cacheKey);
        if (!cachedAccess.hasAccess) {
          navigate(cachedAccess.redirectPath, { 
            state: { from: location },
            replace: true 
          });
        }
        return;
      }

      // Redirect to login if not authenticated and redirectToLogin is true
      if (!isAuthenticated && redirectToLogin) {
        const redirect = redirectPath || '/login';
        routeAccessCache.set(cacheKey, { hasAccess: false, redirectPath: redirect });
        navigate(redirect, { 
          state: { from: location },
          replace: true 
        });
        return;
      }

      // If specific roles are required but user doesn't have any
      if (isAuthenticated && allowedRoles.length > 0 && !hasAccess) {
        console.log('ProtectedRoute - User does not have required role');
        console.log('User role:', user?.role, 'Allowed roles:', allowedRoles);
        
        // If user is authenticated but doesn't have the right role, redirect to appropriate page
        let redirectTo;
        
        // Determine the redirect path based on user role
        if (user?.role === ROLES.ADMIN) {
          redirectTo = '/admin/dashboard';
        } else if (user?.role === ROLES.STUDENT) {
          redirectTo = '/student/dashboard';
        } else if (user?.role === ROLES.FACULTY) {
          redirectTo = '/faculty';
        } else {
          redirectTo = unauthorizedPath;
        }
      
        console.log('Redirecting to:', redirectTo);
        routeAccessCache.set(cacheKey, { hasAccess: false, redirectPath: redirectTo });
        
        // Use navigate for all users to prevent full page reload issues
        navigate(redirectTo, { 
          replace: true,
          state: { from: location }
        });
        return;
      }

      // Cache successful access
      routeAccessCache.set(cacheKey, { hasAccess: true });
    } catch (error) {
      console.error('Error in ProtectedRoute navigation:', error);
      setError(error);
    }
  }, [
    isLoading, 
    isInitializing, 
    isAuthenticated, 
    hasAccess, 
    allowedRoles, 
    hasAnyRole, 
    navigate, 
    redirectPath, 
    redirectToLogin, 
    unauthorizedPath, 
    location, 
    user?.role
  ]);

  // Show loading state only during initial authentication check
  if (isInitializing || (isLoading && !isAuthenticated)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If not authenticated and login is required, show loading (redirect is handled in useEffect)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If no specific roles required, just check if authenticated
  if (allowedRoles.length === 0) {
    return children;
  }

  // Check if user has any of the allowed roles
  const hasRequiredRole = hasAccess;

  // If user doesn't have required role, redirect to unauthorized or home
  if (!hasRequiredRole) {
    // If user is admin but not in allowed roles, redirect to admin dashboard
    if (user?.role === ROLES.ADMIN) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    
    // For other users, redirect to unauthorized page or home
    return (
      <Navigate 
        to={unauthorizedPath} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // If we get here, user is authenticated and has required role
  return children;
};

export default ProtectedRoute;
