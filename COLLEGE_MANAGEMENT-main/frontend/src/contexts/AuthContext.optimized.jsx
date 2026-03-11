import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// Create the auth context
const AuthContext = createContext();

// Role definitions
const ROLES = {
  ADMIN: 'admin',
  STUDENT: 'student',
  FACULTY: 'faculty',
  DRIVER: 'driver'
};

// Default permissions for each role
const DEFAULT_PERMISSIONS = {
  [ROLES.ADMIN]: {
    canViewDashboard: true,
    canManageUsers: true,
    canManageCourses: true,
    canViewReports: true
  },
  [ROLES.STUDENT]: {
    canViewDashboard: true,
    canViewCourses: true,
    canViewAttendance: true,
    canViewGrades: true
  },
  [ROLES.FACULTY]: {
    canViewDashboard: true,
    canManageAttendance: true,
    canManageGrades: true,
    canViewStudents: true
  },
  [ROLES.DRIVER]: {
    canViewRoutes: true,
    canUpdateLocation: true
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Update permissions based on user role
  const updatePermissions = useCallback((role) => {
    setPermissions(DEFAULT_PERMISSIONS[role] || {});
  }, []);

  // Get redirect path based on user role
  const getRedirectPath = useCallback((role) => {
    const paths = {
      [ROLES.ADMIN]: '/admin/dashboard',
      [ROLES.STUDENT]: '/student/dashboard',
      [ROLES.FACULTY]: '/faculty/dashboard',
      [ROLES.DRIVER]: '/driver/dashboard'
    };
    return paths[role] || '/';
  }, []);

  // Handle user session - optimized version
  const handleUserSession = useCallback(async (currentSession) => {
    if (!currentSession) {
      if (user) {
        setUser(null);
        setSession(null);
        setPermissions({});
        setError(null);
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
        localStorage.removeItem('isLoggedIn');
      }
      return;
    }

    try {
      // Skip if session hasn't changed
      if (session?.access_token === currentSession.access_token) {
        return;
      }

      // Get user data in parallel
      const [userResult] = await Promise.all([
        supabase.auth.getUser(),
      ]);

      const { data: { user: currentUser }, error: userError } = userResult;
      if (userError) throw userError;
      if (!currentUser) throw new Error('No user data available');

      const userRole = (currentUser.user_metadata?.role || ROLES.STUDENT).toLowerCase();

      // Create minimal user object
      const userObj = {
        id: currentUser.id,
        email: currentUser.email,
        role: userRole,
        full_name: currentUser.user_metadata?.full_name || currentUser.email.split('@')[0],
        access_token: currentSession.access_token,
        refresh_token: currentSession.refresh_token,
        user_metadata: { ...(currentUser.user_metadata || {}) },
        isAuthenticated: true
      };

      // Update state immediately
      setUser(userObj);
      setSession(currentSession);
      updatePermissions(userRole);

      // Store in localStorage
      localStorage.setItem('user', JSON.stringify(userObj));
      localStorage.setItem('access_token', currentSession.access_token);
      localStorage.setItem('isLoggedIn', 'true');

      // Fetch additional data in background
      const fetchAdditionalData = async () => {
        try {
          const { data, error } = await supabase
            .from('students')
            .select('*')
            .eq('email', currentUser.email)
            .single();

          if (!error && data) {
            const updatedUser = {
              ...userObj,
              full_name: data.full_name || userObj.full_name,
              user_metadata: { ...userObj.user_metadata, ...data }
            };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
        } catch (err) {
          console.warn('Could not fetch additional user data:', err.message);
        }
      };
      
      fetchAdditionalData();

    } catch (error) {
      console.error('Error handling user session:', error);
      setError(error.message || 'Failed to process user session');
      await supabase.auth.signOut();
      localStorage.removeItem('user');
      localStorage.removeItem('access_token');
      localStorage.removeItem('isLoggedIn');
    }
  }, [session, updatePermissions]);

  // Login function
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError('');
    
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim()
      });

      if (authError) throw authError;
      if (!data?.user || !data?.session) throw new Error('Incomplete authentication data');

      // Update UI immediately
      const userRole = (data.user.user_metadata?.role || ROLES.STUDENT).toLowerCase();
      const userObj = {
        id: data.user.id,
        email: data.user.email,
        role: userRole,
        full_name: data.user.user_metadata?.full_name || data.user.email.split('@')[0],
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        isAuthenticated: true
      };
      
      setUser(userObj);
      setSession(data.session);
      updatePermissions(userRole);
      
      localStorage.setItem('user', JSON.stringify(userObj));
      localStorage.setItem('access_token', data.session.access_token);
      localStorage.setItem('isLoggedIn', 'true');
      
      return data.user;
      
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Failed to sign in');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [updatePermissions]);

  // Logout function
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      
      setUser(null);
      setSession(null);
      setPermissions({});
      
      localStorage.removeItem('user');
      localStorage.removeItem('access_token');
      localStorage.removeItem('isLoggedIn');
      
      navigate('/login');
      
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Initialize auth state
  useEffect(() => {
    let isMounted = true;
    let authSubscription = null;

    const initializeFromLocalStorage = () => {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('access_token');
      
      if (storedUser && storedToken) {
        try {
          const userData = JSON.parse(storedUser);
          if (isMounted) {
            setUser(userData);
            setSession({ access_token: storedToken });
            updatePermissions(userData.role);
          }
          return true;
        } catch (e) {
          console.warn('Failed to parse stored user data', e);
          localStorage.removeItem('user');
          localStorage.removeItem('access_token');
        }
      }
      return false;
    };

    const initializeAuth = async () => {
      try {
        // First try to initialize from localStorage for instant UI
        const hasLocalSession = initializeFromLocalStorage();
        
        // Then verify with server
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (error) {
          console.warn('Session check error:', error);
          if (!hasLocalSession) throw error;
          return;
        }
        
        if (currentSession) {
          await handleUserSession(currentSession);
        } else if (!hasLocalSession) {
          throw new Error('No active session found');
        }
        
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (isMounted) {
          setUser(null);
          setSession(null);
          setPermissions({});
          localStorage.removeItem('user');
          localStorage.removeItem('access_token');
          localStorage.removeItem('isLoggedIn');
        }
      } finally {
        if (isMounted) {
          setInitialized(true);
          setLoading(false);
        }
      }
    };
    
    // Set up auth state change listener
    const setupAuthListener = () => {
      if (authSubscription?.unsubscribe) {
        authSubscription.unsubscribe();
      }
      
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (['SIGNED_IN', 'TOKEN_REFRESHED', 'USER_UPDATED', 'SIGNED_OUT'].includes(event)) {
            if (event === 'SIGNED_OUT') {
              setUser(null);
              setSession(null);
              setPermissions({});
              localStorage.removeItem('user');
              localStorage.removeItem('access_token');
              localStorage.removeItem('isLoggedIn');
            } else if (session) {
              await handleUserSession(session);
            }
          }
        }
      );
      
      return subscription;
    };
    
    // Initialize
    initializeAuth().then(() => {
      if (isMounted) {
        authSubscription = setupAuthListener();
      }
    });
    
    return () => {
      isMounted = false;
      if (authSubscription?.unsubscribe) {
        authSubscription.unsubscribe();
      }
    };
  }, [handleUserSession, updatePermissions]);

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

  // Public routes that don't need loading screen
  const publicRoutes = ['/', '/home', '/about', '/admissions', '/contact', '/login', '/signup', '/forgot-password'];
  const currentPath = location.pathname;
  const isPublicRoute = publicRoutes.some(route => 
    route === currentPath || currentPath.startsWith(route + '/')
  );

  // Skip loading for public routes
  const showLoading = loading && !isPublicRoute && !initialized;

  const value = {
    user,
    session,
    loading: showLoading,
    error,
    isAuthenticated,
    hasRole,
    hasPermission,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {showLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
