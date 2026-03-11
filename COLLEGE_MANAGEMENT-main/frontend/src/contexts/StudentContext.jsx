import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { useAuth } from './AuthContext';

export const StudentContext = createContext();

// This is the main provider component
const StudentProvider = ({ children }) => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Clear student data
  const clearStudentData = useCallback(() => {
    setStudent(null);
    setLoading(true);
    setError(null);
    if (user?.id) {
      localStorage.removeItem(`student_${user.id}`);
    }
  }, [user?.id]);

  // Fetch student data with retry logic
  const fetchStudentData = useCallback(async (userId, forceRefresh = false) => {
    // Skip if no user ID or if user is an admin
    if (!userId || user?.role === 'admin') {
      console.log('Skipping student data fetch for admin user');
      setLoading(false);
      return null;
    }
    
    // Always use the auth user's ID from the session, not the student ID
    const { data: { session } } = await supabase.auth.getSession();
    const authUserId = session?.user?.id;
    
    if (!authUserId) {
      console.error('No authenticated user found');
      clearStudentData();
      return null;
    }
    
    // Use auth user ID for cache key
    const cacheKey = `student_${authUserId}`;
    
    // Check cache first if not forcing refresh
    if (!forceRefresh) {
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        console.log('Using cached student data for auth user:', authUserId);
        setStudent(parsedData);
        setLoading(false);
        return parsedData;
      }
    }
    
    try {
      // Get the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('No active session found:', sessionError);
        clearStudentData();
        navigate('/login');
        return null;
      }
      
      // Get the auth user's email for fallback lookup
      console.log('Getting auth user for email lookup');
      const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('Error getting auth user:', userError);
        throw userError;
      }
      
      const userEmail = authUser?.email?.toLowerCase();
      console.log('Auth user email:', userEmail);
      
      if (!userEmail) {
        throw new Error('No email found in user session');
      }
      
      // Always fetch by auth user_id first
      console.log('Fetching student data for auth user:', { authUserId, userEmail });
      
      // First try to get by auth user_id
      let { data, error } = await supabase
        .from('students')
        .select(`
          *,
          fees(*),
          marks(*)
        `)
        .eq('user_id', authUserId)
        .single();
        
      // If not found by user_id, try by email (this handles legacy cases)
      if (!data && userEmail) {
        console.log('Student not found by user_id, trying email');
        const { data: emailData, error: emailError } = await supabase
          .from('students')
          .select(`
            *,
            fees(*),
            marks(*)
          `)
          .eq('email', userEmail)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
          
        if (emailError) throw emailError;
        data = emailData;
      }
      
      console.log('Student lookup result:', { data, error });
      
      if (error) throw error;
      if (!data || data.length === 0) throw new Error('Student data not found');
      
      if (!data) {
        throw new Error('Student data not found');
      }
      
      const studentData = data;
      
      // If we found a record by email, update its user_id to match auth user
      if (studentData.user_id !== authUserId) {
        console.log('Updating student record with auth user_id:', authUserId);
        const { error: updateError } = await supabase
          .from('students')
          .update({ user_id: authUserId })
          .eq('id', studentData.id);
          
        if (updateError) {
          console.error('Error updating student user_id:', updateError);
        } else {
          console.log('Successfully updated student record with auth user_id');
          studentData.user_id = authUserId;
        }
      }
      
      console.log('Fetched student data:', studentData);
      
      // Cache the result
      localStorage.setItem(cacheKey, JSON.stringify(studentData));
      if (studentData.email) {
        localStorage.setItem(`student_email_${studentData.email}`, JSON.stringify(studentData));
      }
      
      // Update the state
      setStudent(studentData);
      setError(null);
      
      return studentData;
      
    } catch (error) {
      console.error('Error in fetchStudentData:', error);
      setError(error);
      
      // If we have a 404 or no data found, but we have a user, try to create a profile
      if (error.code === 'PGRST116' || error.message === 'Student data not found') {
        console.log('No student profile found');
        // Only redirect if the user is actually a student
        if (user?.role === 'student') {
          navigate('/student/profile-setup');
        }
      }
      
      throw error;
    }
  }, [clearStudentData, navigate]);

  // Track if we're already fetching data
  const isFetchingRef = useRef(false);
  
  // Memoize the fetch function to prevent unnecessary re-renders
  const fetchStudentDataMemoized = useCallback(fetchStudentData, [user?.id, user?.email]);
  
  // Effect to fetch student data when user changes
  useEffect(() => {
    let isMounted = true;
    let shouldFetch = true;
    
    const fetchData = async () => {
      // Only fetch if we have an authenticated user
      const { data: { session } } = await supabase.auth.getSession();
      const authUser = session?.user;
      
      // Skip if no user or if user is an admin
      if (!authUser?.id || user?.role === 'admin') {
        if (isMounted) {
          setLoading(false);
          clearStudentData();
        }
        return;
      }

      if (isFetchingRef.current) {
        console.log('Already fetching student data, skipping duplicate request');
        return;
      }

      console.log('Fetching student data for authenticated user ID:', user.id, 'Email:', user.email);
      isFetchingRef.current = true;
      setLoading(true);
      
      try {
        // Use the auth user ID to fetch student data
        // Pass forceRefresh as false to use cached data if available
        const studentData = await fetchStudentData(authUser.id, false);
        
        if (isMounted && studentData) {
          setStudent(studentData);
          setError(null);
        }
      } catch (error) {
        console.error('Error in fetchData:', error);
        
        if (isMounted) {
          const errorMessage = error?.message || 'An error occurred while loading student data.';
          setError(errorMessage);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          isFetchingRef.current = false;
        }
      }
    };
    
    // Add a small delay to prevent race conditions with auth initialization
    const timer = setTimeout(() => {
      if (shouldFetch && user?.id && !isFetchingRef.current) {
        fetchData();
      }
    }, 100);
    
    // Cleanup function
    return () => {
      isMounted = false;
      shouldFetch = false;
      clearTimeout(timer);
    };
  }, [user?.id, user?.email, navigate, fetchStudentData]);

  // Login function (if needed)
  const login = async (studentData) => {
    try {
      setStudent(studentData);
      if (studentData?.id) {
        localStorage.setItem(`student_${studentData.id}`, JSON.stringify(studentData));
      }
      return true;
    } catch (err) {
      console.error('Error in student login:', err);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    clearStudentData();
    navigate('/login');
  };

  const value = {
    student,
    loading,
    error,
    isAuthenticated: !!student,
    login,
    logout,
    refreshData: () => user?.id && fetchStudentData(user.id, true),
  };

  return (
    <StudentContext.Provider value={value}>
      {children}
    </StudentContext.Provider>
  );
};

// Custom hook to use the student context
export const useStudent = () => {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error('useStudent must be used within a StudentProvider');
  }
  return context;
};

export { StudentProvider };
export default StudentContext;
