import { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export const AuthContext = createContext(null);

export const ROLES = {
  ADMIN: 'admin',
  FACULTY: 'faculty',
  STUDENT: 'student',
  PARENT: 'parent',
  DRIVER: 'driver'
};

// Cache for user data to prevent duplicate fetches
const userDataCache = new Map();

const fetchUserData = async (userId, userEmail) => {
  if (!userId) return { role: null, userData: null };
  
  const cacheKey = `${userId}:${userEmail}`;
  
  // Return cached data if available
  if (userDataCache.has(cacheKey)) {
    console.log('[Auth] Using cached user data for:', cacheKey);
    return userDataCache.get(cacheKey);
  }
  
  try {
    console.log(`[Auth] Fetching user data for ID: ${userId}`);
    
    // Get the current session first
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.warn('[Auth] No active session found');
      return { role: null, userData: null };
    }
    
    if (!userEmail) {
      userEmail = session.user?.email;
      if (!userEmail) {
        console.warn('[Auth] No email found in session');
        return { role: null, userData: null };
      }
    }
    
    // Get user's role from app_metadata or user_metadata
    const userRole = session.user?.user_metadata?.role || 
                    session.user?.app_metadata?.role ||
                    (userEmail.endsWith('@college.edu') ? 'admin' : 'student');
    
    // For admin users, return early with admin role
    if (userRole === 'admin') {
      const adminData = {
        role: 'admin',
        userData: {
          id: userId,
          email: userEmail,
          role: 'admin',
          name: session.user.user_metadata?.full_name || userEmail.split('@')[0]
        }
      };
      userDataCache.set(cacheKey, adminData);
      return adminData;
    }
    
    // For non-admin users, check the students table
    console.log('[Auth] Checking students table for user:', userEmail);    
    const { data: studentData, error: studentError } = await supabase      
      .from('students')
      .select('id, name, email, user_id')
      .eq('email', userEmail)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (studentError) {
      console.warn('[Auth] Student query error:', studentError);
      return { role: null, userData: null };
    }
    
    if (studentData) {
      const result = { 
        role: 'student',
        userData: { 
          id: studentData.id,
          name: studentData.name,
          email: studentData.email,
          role: 'student',
          user_id: studentData.user_id
        }
      };
      userDataCache.set(cacheKey, result);
      return result;
    }
    
    // Check faculty table if not found in students table
    console.log('[Auth] Checking faculty table for user:', userEmail);     
    const { data: facultyData, error: facultyError } = await supabase      
      .from('faculties')
      .select('id, full_name, email, user_id, designation')
      .eq('email', userEmail)
      .maybeSingle();
    
    if (facultyError) {
      console.warn('[Auth] Faculty query error:', facultyError);
      return { role: null, userData: null };
    }
    
    if (facultyData) {
      const result = { 
        role: 'faculty',
        userData: { 
          id: facultyData.id,
          name: facultyData.full_name,
          email: facultyData.email,
          role: 'faculty',
          user_id: facultyData.user_id,
          designation: facultyData.designation
        }
      };
      userDataCache.set(cacheKey, result);
      return result;
    }
    
    // If we get here, the user is authenticated but not in any role table 
    console.log('[Auth] User not found in any role table');
    return { role: null, userData: null };
    
  } catch (error) {
    console.error('Error in fetchUserData:', error);
    return { role: null, userData: null };
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isMounted = useRef(true);
  const authListener = useRef(null);

  const updateUserState = useCallback(async (newSession) => {
    if (!isMounted.current) return null;
    
    setLoading(true);
    
    try {
      // If no session, clear everything
      if (!newSession?.user) {
        setUser(null);
        setSession(null);
        return null;
      }

      // Store the access token in localStorage
      const accessToken = newSession.access_token || newSession.session?.access_token;
      if (accessToken) {
        localStorage.setItem('access_token', accessToken);
      }
      
      const userEmail = newSession.user.email?.toLowerCase();
      const authUserId = newSession.user.id;
      
      // First, check if this is a FACULTY
      const { data: facultyData, error: facultyError } = await supabase
        .from('faculties')
        .select('id, full_name, employee_id, designation, is_hod, department_id, status')
        .eq('user_id', authUserId)
        .single();

      if (facultyData && !facultyError) {
        // This is a faculty member!
        const facultyUser = {
          ...newSession.user,
          role: facultyData.is_hod ? 'hod' : 'faculty',
          name: facultyData.full_name,
          email: userEmail,
          id: facultyData.id,
          faculty: {
            id: facultyData.id,
            full_name: facultyData.full_name,
            employee_id: facultyData.employee_id,
            designation: facultyData.designation,
            is_hod: facultyData.is_hod,
            department_id: facultyData.department_id,
            status: facultyData.status
          }
        };

        if (isMounted.current) {
          setUser(facultyUser);
          setSession(newSession);

          // Redirect to faculty dashboard if not already there
          const currentPath = window.location.pathname;
          if (!currentPath.startsWith('/faculty')) {
            navigate('/faculty/dashboard', { replace: true });
          }
        }
        
        return facultyUser;
      }
      
      // If not faculty, check if it's a student
      const { role, userData } = await fetchUserData(newSession.user.id, userEmail);
      const userWithRole = {
        ...newSession.user,
        role: role || 'user',
        ...(userData || {})
      };
      
      if (isMounted.current) {
        setUser(userWithRole);
        setSession(newSession);
        
        // Role-based redirection
        const currentPath = window.location.pathname;
        const userRole = userWithRole.role?.toLowerCase();
        
        // Only redirect if not already on a role-specific route
        if (!currentPath.startsWith(`/${userRole}`) && userRole) {
          switch(userRole) {
            case 'admin':
            case 'student':
              navigate(`/${userRole}/dashboard`, { replace: true });
              break;
            default:
              // For users with no specific role, redirect to login        
              setUser(null);
              setSession(null);
              navigate('/login');
              throw new Error('Access denied: Invalid role');
          }
        }
      }
      
      return userWithRole;
      
    } catch (error) {
      console.error('Error updating user state:', error);
      if (isMounted.current) {
        setUser(null);
        setSession(null);
      }
      return null;
    } finally {
      if (isMounted.current) {
        if (!isInitialized) {
          setIsInitialized(true);
        }
        setLoading(false);
      }
    }
  }, [isInitialized, navigate]);

  const login = useCallback(async (email, password) => {
    if (!email || !password) {
      const errorMsg = 'Email and password are required';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
    
    // Clear any previous errors and set loading state
    setError('');
    setLoading(true);
    
    try {
      // Trim and normalize email
      email = email.trim().toLowerCase();
      console.log('[Auth] Attempting login for:', email);
      
      // 1. First, try to authenticate with Supabase
      const { data: authData, error: signInError } = await Promise.race([
        supabase.auth.signInWithPassword({
          email,
          password: password.trim(),
        }),
        // Add a timeout to prevent hanging
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Login request timed out')), 10000)
        ),
      ]);

      if (signInError) {
        console.error('[Auth] Sign in error:', signInError);
        let errorMsg = 'An error occurred during login';

        // Handle specific error cases
        if (signInError.message?.includes('Invalid login credentials')) {
          errorMsg = 'Invalid email or password';
        } else if (signInError.message?.includes('Email not confirmed')) {
          errorMsg = 'Please verify your email before logging in';
        } else if (signInError.message) {
          errorMsg = signInError.message;
        }

        throw new Error(errorMsg);
      }

      if (!authData?.session) {
        throw new Error('No session returned from authentication');
      }

      updateUserState(authData.session).catch(console.error);

      return {
        success: true,
        user: {
          id: authData.session.user.id,
          email,
        },
        session: authData.session,
      };
    } catch (error) {
      console.error('Login error:', error);
      if (isMounted.current) {
        setError(error.message || 'An unexpected error occurred during login');
      }
      // Ensure we're signed out if there was an error
      await supabase.auth.signOut();
      throw error;
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [updateUserState]);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      userDataCache.clear();
      await supabase.auth.signOut();
      if (isMounted.current) {
        setUser(null);
        setSession(null);
        setError('');
        localStorage.removeItem('access_token');
      }
      navigate('/login', { replace: true });
      return { success: true };
    } catch (e) {
      if (isMounted.current) {
        setError(e?.message || 'Failed to log out');
      }
      return { success: false, error: e?.message || 'Failed to log out' };
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [navigate]);

  const signUp = useCallback(async (email, password, userData = {}) => {
    setLoading(true);
    setError('');
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email?.trim()?.toLowerCase(),
        password: password?.trim(),
        options: { data: userData },
      });
      if (signUpError) throw signUpError;
      userDataCache.clear();
      return { success: true, user: data.user, session: data.session };
    } catch (e) {
      if (isMounted.current) setError(e?.message || 'Failed to create account');
      return { success: false, error: e?.message || 'Failed to create account' };
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted && session) {
          await updateUserState(session);
        }
      } finally {
        if (mounted) setIsInitialized(true);
      }
    };

    init();

    const { data } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!mounted) return;
      await updateUserState(newSession);
    });

    authListener.current = data;

    return () => {
      mounted = false;
      if (authListener.current?.subscription) {
        authListener.current.subscription.unsubscribe();
      }
    };
  }, [updateUserState]);

  const hasAnyRole = useCallback((roles) => {
    if (!user?.role) return false;
    if (!Array.isArray(roles)) roles = [roles];
    if (user.role === ROLES.ADMIN) return true;
    return roles.some((role) => role === user.role);
  }, [user]);

  const hasRole = useCallback((role) => hasAnyRole(role), [hasAnyRole]);

  const value = useMemo(() => ({
    user,
    session,
    loading,
    isLoading: loading,
    error,
    login,
    logout,
    signUp,
    updateUser: updateUserState,
    isAuthenticated: !!user,
    isInitialized,
    isInitializing: !isInitialized,
    hasAnyRole,
    hasRole,
  }), [user, session, loading, error, login, logout, signUp, updateUserState, isInitialized, hasAnyRole, hasRole]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const withAuth = (Component, allowedRoles = []) => {
  return function WithAuthWrapper(props) {
    const { isAuthenticated, loading, hasAnyRole } = useAuth();

    if (loading) return <div>Loading...</div>;
    if (!isAuthenticated) return null;
    if (allowedRoles.length > 0 && !hasAnyRole(allowedRoles)) {
      return <div>You don't have permission to access this page.</div>;
    }

    return <Component {...props} />;
  };
};

export default AuthContext;