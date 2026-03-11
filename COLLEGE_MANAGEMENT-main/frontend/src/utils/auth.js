import { supabase } from '../lib/supabase';

// Set up auth state change listener
export const setupAuthStateChange = (supabaseClient) => {
  console.log('Setting up auth state change listener...');
  
  // Set up the auth state change listener
  const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
    async (event, session) => {
      console.log('Auth state changed:', { event, session });
      
      try {
        switch (event) {
          case 'INITIAL_SESSION':
            console.log('Initial session check');
            // No need to do anything here, just log
            break;
            
          case 'SIGNED_IN':
          case 'TOKEN_REFRESHED':
            console.log('Session updated, setting session...');
            if (session) {
              // The session is automatically persisted by the client
              console.log('Session set successfully');
            }
            break;
            
          case 'SIGNED_OUT':
            console.log('User signed out, clearing session...');
            // The session is automatically cleared by the client
            break;
            
          case 'USER_UPDATED':
            console.log('User data updated');
            break;
            
          case 'PASSWORD_RECOVERY':
            console.log('Password recovery requested');
            break;
            
          default:
            console.log('Unhandled auth event:', event);
        }
      } catch (error) {
        console.error('Error in auth state change handler:', error);
      }
    }
  );

  // Return the subscription so it can be unsubscribed later if needed
  return () => {
    console.log('Cleaning up auth state change listener');
    if (subscription?.unsubscribe) {
      subscription.unsubscribe();
    }
  };
};

// Check if user is authenticated
export const isAuthenticated = async () => {
  try {
    console.log('Checking if user is authenticated...');
    
    // First check if we have a session in memory
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting session:', error);
      return false;
    }
    
    // If no session, check if we have a stored session
    if (!session) {
      const storageKey = `sb-${new URL(supabase.supabaseUrl).hostname}-auth-token`;
      const storedSession = localStorage.getItem(storageKey);
      
      if (storedSession) {
        try {
          const parsedSession = JSON.parse(storedSession);
          console.log('Found stored session, setting it...');
          await supabase.auth.setSession(parsedSession);
          return true;
        } catch (e) {
          console.error('Error parsing stored session:', e);
          return false;
        }
      }
    }
    
    console.log('Session check result:', { hasSession: !!session });
    return !!session;
  } catch (error) {
    console.error('Error in isAuthenticated:', error);
    return false;
  }
};

// Get current user
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  // Fetch additional user data from profiles table
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
    
  if (error) {
    console.error('Error fetching user profile:', error);
    return { ...user, role: 'student' }; // Default role
  }
  
  return { ...user, ...profile };
};

// Check if user has specific role
export const hasRole = async (role) => {
  const user = await getCurrentUser();
  return user?.role === role;
};

// Check if user has any of the specified roles
export const hasAnyRole = async (roles) => {
  const user = await getCurrentUser();
  return roles.includes(user?.role);
};

// Sign out user
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Sign in with email and password
export const signInWithEmail = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
};

// Sign up with email and password
export const signUpWithEmail = async (email, password, userData) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: userData.fullName,
        role: userData.role || 'student', // Default role
      },
    },
  });

  if (error) throw error;
  return data;
};

/**
 * Get the authentication token from Supabase session
 * Checks Supabase session first, then falls back to legacy keys
 * @returns {string|null} The authentication token or null if not found
 */
export const getAuthToken = () => {
  try {
    // First try to get from Supabase session storage
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (supabaseUrl) {
      const url = new URL(supabaseUrl);
      const storageKey = `sb-${url.hostname}-auth-token`;
      const storedSession = localStorage.getItem(storageKey);

      if (storedSession) {
        const session = JSON.parse(storedSession);
        if (session.access_token) {
          return session.access_token;
        }
      }
    }
  } catch (error) {
    console.warn('Error getting token from Supabase session:', error);
  }

  // Fallback to legacy keys
  return localStorage.getItem('access_token') || localStorage.getItem('token') || null;
};

/**
 * Get authorization headers for API requests
 * @returns {Object} Headers object with Authorization header if token exists
 */
export const getAuthHeaders = () => {
  // Get the token from localStorage
  const token = getAuthToken();
  
  if (!token) {
    console.warn('No authentication token found');
    return {};
  }
  
  // Log the token for debugging (remove in production)
  console.log('Using token for API request:', token.substring(0, 10) + '...');
  
  // Return headers with the token in the Authorization header
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'X-Requested-With': 'XMLHttpRequest'
  };
};
