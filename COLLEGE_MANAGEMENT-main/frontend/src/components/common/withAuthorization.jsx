import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Higher-Order Component for role-based authorization
 * @param {Array} allowedRoles - Array of roles that are allowed to access the component
 * @param {React.Component} WrappedComponent - The component to be rendered if authorized
 * @param {React.Component} FallbackComponent - Optional component to render if not authorized
 * @returns {React.Component} - The authorized component or fallback/redirect
 */
const withAuthorization = (allowedRoles, WrappedComponent, FallbackComponent = null) => {
  return function WithAuthorizationWrapper(props) {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    // If still loading auth state, show loading or nothing
    if (loading) {
      return <div>Loading...</div>; // Or a loading spinner
    }

    // Check if user has one of the allowed roles
    const isAuthorized = user && allowedRoles.includes(user.role);

    // If not authorized, show fallback component or redirect to unauthorized page
    if (!isAuthorized) {
      if (FallbackComponent) {
        return <FallbackComponent {...props} />;
      }
      
      // Optionally redirect to login or unauthorized page
      navigate('/unauthorized');
      return null;
    }

    // If authorized, render the wrapped component
    return <WrappedComponent {...props} />;
  };
};

export default withAuthorization;
