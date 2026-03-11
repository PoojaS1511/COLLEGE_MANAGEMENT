import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// Create the auth context
const AuthContext = createContext(null);

// Define roles and their permissions
const ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
  PARENT: 'parent',
  TRANSPORT_ADMIN: 'transport_admin',
  DRIVER: 'driver'
};

// Define permissions for each role
const PERMISSIONS = {
  [ROLES.ADMIN]: {
    canViewDashboard: true,
    canManageStudents: true,
    canManageTeachers: true,
    canManageParents: true,
    canManageAttendance: true,
    canManageAcademics: true,
    canManageTransport: true,
    canManageFees: true,
    canViewReports: true,
  },
  [ROLES.TEACHER]: {
    canViewDashboard: true,
    canManageAttendance: true,
    canViewStudents: true,
    canViewReports: true,
  },
  [ROLES.STUDENT]: {
    canViewDashboard: true,
    canViewAttendance: true,
    canViewTimetable: true,
  },
  [ROLES.PARENT]: {
    canViewDashboard: true,
    canViewChildAttendance: true,
    canViewChildProgress: true,
    canViewReports: true,
    canSendNotifications: false,
    canViewTransport: true
  },
  [ROLES.TRANSPORT_ADMIN]: {
    canViewDashboard: true,
    canManageTransport: true,
    canManageRoutes: true,
    canManageDrivers: true,
    canViewReports: true,
    redirectTo: '/admin/transport'
  },
  [ROLES.DRIVER]: {
    canViewDashboard: true,
    canViewRoutes: true,
    canUpdateStatus: true,
    redirectTo: '/driver/dashboard'
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Initialize from localStorage if available
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState({});
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Update permissions when user changes
  const updatePermissions = useCallback((role) => {
    setPermissions(PERMISSIONS[role] || {});
  }, []);

  // Get redirect path based on role
  const getRedirectPath = (role) => {
    switch(role) {
      case 'admin': return '/admin/dashboard';
      case 'teacher':
      case 'faculty': return '/faculty/dashboard';
      case 'student': return '/student/dashboard';
      case 'parent': return '/parent/dashboard';
      case 'transport_admin': return '/admin/transport';
      case 'driver': return '/driver/dashboard';
      default: return '/';
    }
  };

  // Handle user session
  const handleUserSession = useCallback(async (currentSession) => {
    if (!currentSession) {
      console.log('No active session found');
      setUser(null);
      setSession(null);
      setPermissions({});
      localStorage.removeItem('user');
      localStorage.removeItem('access_token');
      localStorage.removeItem('isLoggedIn');
      return;
    }

    try {
      console.log('Processing session:', currentSession);
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      if (!currentUser) throw new Error('No user data available');
      
      const userRole = (currentUser.user_metadata?.role || ROLES.STUDENT).toLowerCase();
      
      // Fetch additional user data if needed
      const { data: userData } = await supabase
        .from('students')
        .select('*')
        .eq('email', currentUser.email)
        .single()
        .catch(() => ({}));
      
      const userObj = {
        id: currentUser.id,
        email: currentUser.email,
        role: userRole,
        full_name: userData?.full_name || currentUser.user_metadata?.full_name || currentUser.email.split('@')[0],
        access_token: currentSession.access_token,
        refresh_token: currentSession.refresh_token,
        user_metadata: {
          ...(currentUser.user_metadata || {}),
          ...(userData || {})
        },
        isAuthenticated: true
      };

      console.log('Setting user session:', userObj);
      
      setUser(userObj);
      setSession(currentSession);
      updatePermissions(userRole);
      
      // Store in localStorage
      localStorage.setItem('user', JSON.stringify(userObj));
      localStorage.setItem('access_token', currentSession.access_token);
      localStorage.setItem('isLoggedIn', 'true');
      
      // Redirect based on role if needed
      if (!initialized) {
        const redirectPath = getRedirectPath(userRole);
        if (redirectPath && window.location.pathname !== redirectPath) {
          console.log('Redirecting to:', redirectPath);
          navigate(redirectPath);
        }
        setInitialized(true);
      }
    } catch (error) {
      console.error('Error handling user session:', error);
      // Clear session on error
      await supabase.auth.signOut();
      localStorage.removeItem('user');
      localStorage.removeItem('access_token');
      localStorage.removeItem('isLoggedIn');
    } finally {
      if (!initialized) {
        setLoading(false);
        setInitialized(true);
      }
    }
  }, [updatePermissions, initialized, navigate]);

  // Login function
  const login = useCallback(async (email, password) => {
    console.log('Starting login process...');
    setLoading(true);
    setError('');
    
    try {
      // Basic validation
      if (!email || !password) {
        throw new Error('Please provide both email and password');
      }

      // Trim and validate email and password
      const trimmedEmail = email.trim().toLowerCase();
      const trimmedPassword = password.trim();
      
      if (!trimmedEmail) {
        throw new Error('Please enter a valid email address');
      }
      
      // Sign in with email and password
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: trimmedPassword
      });

      if (authError) {
        console.error('Auth error:', authError);
        throw new Error(authError.message || 'Failed to sign in');
      }

      if (!data || !data.user || !data.session) {
        throw new Error('Incomplete authentication data received');
      }

      // Handle the session
      await handleUserSession(data.session);
      
      return data.user;
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Failed to sign in');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [handleUserSession]);

  // Logout function
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
        throw error;
      }
      
      // Clear all auth state
      setUser(null);
      setSession(null);
      setPermissions({});
      
      // Clear localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('access_token');
      localStorage.removeItem('isLoggedIn');
      
      // Navigate to login page
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Check if user is authenticated
  const isAuthenticated = useCallback(() => {
    return !!user || !!localStorage.getItem('isLoggedIn');
  }, [user]);

  // Check if user has specific role
  const hasRole = useCallback((requiredRole) => {
    return user?.role === requiredRole;
  }, [user]);

  // Check if user has specific permission
  const hasPermission = useCallback((permission) => {
    return permissions[permission] === true;
  }, [permissions]);

  // Initialize auth state on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          throw error;
        }
        
        if (currentSession) {
          await handleUserSession(currentSession);
        } else {
          setLoading(false);
          setInitialized(true);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setLoading(false);
        setInitialized(true);
      }
    };

    checkSession();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log('Auth state changed:', event);
      
      if (['SIGNED_IN', 'INITIAL_SESSION', 'TOKEN_REFRESHED'].includes(event)) {
        await handleUserSession(currentSession);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setSession(null);
        setPermissions({});
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
        localStorage.removeItem('isLoggedIn');
        navigate('/login');
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [handleUserSession, navigate]);

  // Context value
  const value = {
    user,
    session,
    loading,
    error,
    isAuthenticated,
    hasRole,
    hasPermission,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
