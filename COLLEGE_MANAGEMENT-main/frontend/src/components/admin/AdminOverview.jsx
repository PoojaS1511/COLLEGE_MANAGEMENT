import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
  UserGroupIcon,
  AcademicCapIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  UserIcon,
  UserCircleIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import { Box, Typography, Paper, CircularProgress, Button } from '@mui/material';
import { API_URL } from '../../config';
import { useAuth } from '../../contexts/AuthContext';

// Color constants for consistent theming
const COLORS = {
  blue: { bg: 'blue-100', text: 'blue-600', border: 'blue-200' },
  green: { bg: 'green-100', text: 'green-600', border: 'green-200' },
  purple: { bg: 'purple-100', text: 'purple-600', border: 'purple-200' },
  red: { bg: 'red-100', text: 'red-600', border: 'red-200' },
  indigo: { bg: 'indigo-100', text: 'indigo-600', border: 'indigo-200' },
  pink: { bg: 'pink-100', text: 'pink-600', border: 'pink-200' },
  yellow: { bg: 'yellow-100', text: 'yellow-600', border: 'yellow-200' },
  gray: { bg: 'gray-100', text: 'gray-600', border: 'gray-200' }
};

// Default data for when API is not available
const DEFAULT_STATS = [
  { name: 'Total Staff', value: '150', icon: UserGroupIcon, color: 'blue' },
  { name: 'Monthly Payroll', value: '₹2,50,000', icon: CurrencyDollarIcon, color: 'green' },
  { name: 'Active Employees', value: '145', icon: UserIcon, color: 'indigo' },
  { name: 'Departments', value: '8', icon: BuildingOfficeIcon, color: 'purple' },
  { name: 'Pending Payments', value: '12', icon: ExclamationTriangleIcon, color: 'red' },
];

const QUICK_ACTIONS = [
  { 
    name: 'Add Student', 
    description: 'Register a new student', 
    icon: UserGroupIcon, 
    color: 'blue', 
    href: '/admin/students/add' 
  },
  { 
    name: 'Schedule Class', 
    description: 'Create a new class schedule', 
    icon: CalendarDaysIcon, 
    color: 'green', 
    href: '/admin/classes/schedule' 
  },
  { 
    name: 'View Reports', 
    description: 'Generate and view reports', 
    icon: DocumentTextIcon, 
    color: 'purple', 
    href: '/admin/reports' 
  },
  { 
    name: 'Settings', 
    description: 'System configuration', 
    icon: Cog6ToothIcon, 
    color: 'gray', 
    href: '/admin/settings' 
  }
];

const RECENT_ACTIVITIES = [
  { 
    id: 1, 
    type: 'enrollment', 
    action: 'New student enrolled', 
    user: 'John Doe', 
    time: '10 minutes ago' 
  },
  { 
    id: 2, 
    type: 'payment', 
    action: 'Fee payment received', 
    user: 'Jane Smith', 
    time: '1 hour ago' 
  },
  { 
    id: 3, 
    type: 'attendance', 
    action: 'Attendance marked', 
    user: 'Class 10A', 
    time: '2 hours ago' 
  },
  { 
    id: 4, 
    type: 'exam', 
    action: 'Exam results published', 
    user: 'Term 1 Exams', 
    time: '1 day ago' 
  }
];

// Helper function to get activity icon
const getActivityIcon = (type) => {
  switch (type) {
    case 'enrollment':
      return <UserGroupIcon className="h-5 w-5 text-blue-500" />;
    case 'payment':
      return <CurrencyDollarIcon className="h-5 w-5 text-green-500" />;
    case 'attendance':
      return <CheckCircleIcon className="h-5 w-5 text-yellow-500" />;
    case 'exam':
      return <DocumentTextIcon className="h-5 w-5 text-purple-500" />;
    default:
      return <QuestionMarkCircleIcon className="h-5 w-5 text-gray-500" />;
  }
};

// Stat Card Component
const StatCard = ({ name, value, icon: Icon, color }) => (
  <Paper className="p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
    <div className="flex items-center">
      <div className={`p-3 rounded-full bg-${color}-100 mr-4`}>
        <Icon className={`h-6 w-6 text-${color}-600`} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{name}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  </Paper>
);

// Quick Action Component
const QuickAction = ({ name, description, icon: Icon, color, href }) => (
  <Link 
    to={href}
    className="block p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
  >
    <div className="flex items-center">
      <div className={`p-2 rounded-md bg-${color}-100 mr-3`}>
        <Icon className={`h-5 w-5 text-${color}-600`} />
      </div>
      <div>
        <h3 className="font-medium text-gray-900">{name}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  </Link>
);

// Recent Activity Item Component
const ActivityItem = ({ type, action, user, time }) => (
  <div className="flex items-start py-3 border-b border-gray-100 last:border-0">
    <div className="flex-shrink-0 mt-1">
      {getActivityIcon(type)}
    </div>
    <div className="ml-3">
      <p className="text-sm font-medium text-gray-900">{action}</p>
      <div className="flex items-center text-xs text-gray-500">
        <span>{user}</span>
        <span className="mx-2">•</span>
        <span>{time}</span>
      </div>
    </div>
  </div>
);

// Main AdminOverview Component
const AdminOverview = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(DEFAULT_STATS);
  const { session, loading: authLoading, isInitialized } = useAuth();
  
  const formatStats = useCallback((data) => {
    if (!data) return DEFAULT_STATS;
    
    return [
      { 
        name: 'Total Students', 
        value: data.total?.toLocaleString() || '0', 
        icon: UserGroupIcon, 
        color: 'blue' 
      },
      { 
        name: 'Male', 
        value: data.male?.toLocaleString() || '0', 
        icon: UserIcon, 
        color: 'indigo' 
      },
      { 
        name: 'Female', 
        value: data.female?.toLocaleString() || '0', 
        icon: UserCircleIcon, 
        color: 'pink' 
      },
      { 
        name: 'Departments', 
        value: data.departments?.toLocaleString() || '0', 
        icon: BuildingOfficeIcon, 
        color: 'purple' 
      },
      { 
        name: 'Faculty Members', 
        value: data.faculty?.toLocaleString() || '0', 
        icon: AcademicCapIcon, 
        color: 'green' 
      },
    ];
  }, []);
  
  const fetchWithRetry = useCallback(async (url, options = {}, retries = 1) => {
    try {
      // Get the current session directly from localStorage to ensure we have the latest token
      const sessionStr = localStorage.getItem('sb-qkaaoeismqnhjyikgkme-auth-token');
      let token = null;
      
      if (sessionStr) {
        try {
          const sessionData = JSON.parse(sessionStr);
          token = sessionData?.access_token || null;
        } catch (e) {
          console.error('Error parsing session data:', e);
        }
      }
      
      if (!token) {
        // If no token in localStorage, try to get it from supabase
        const { data: { session } } = await supabase.auth.getSession();
        token = session?.access_token;
        
        if (!token) {
          throw new Error('No authentication token found. Please log in again.');
        }
      }

      // Set up headers with the token
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...(options.headers || {})
      };

      console.log('Making request to:', url);
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Request failed with status ${response.status}:`, errorText);
        
        // If unauthorized, try to refresh the session once
        if (response.status === 401 && retries > 0) {
          console.log('Session may be expired, attempting to refresh...');
          const { data: { session: newSession }, error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshError || !newSession?.access_token) {
            console.error('Failed to refresh session:', refreshError?.message || 'No session data');
            // Clear the invalid session
            await supabase.auth.signOut();
            throw new Error('Your session has expired. Please log in again.');
          }
          
          console.log('Token refreshed, retrying request...');
          // Update the token with the new one
          const newToken = newSession.access_token;
          
          return fetchWithRetry(url, {
            ...options,
            headers: {
              ...options.headers,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${newToken}`
            }
          }, retries - 1);
        }
        
        // For 422 errors, include more details
        if (response.status === 422) {
          let errorDetails = 'Invalid request';
          try {
            const errorData = JSON.parse(errorText);
            errorDetails = errorData.msg || errorText;
          } catch (e) {
            errorDetails = errorText;
          }
          throw new Error(`Validation error: ${errorDetails}`);
        }
        
        throw new Error(`Request failed with status ${response.status}: ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error in fetchWithRetry:', error);
      
      // If it's a 401 or token-related error, clear the session
      if (error.message.includes('401') || 
          error.message.includes('token') || 
          error.message.includes('session')) {
        await supabase.auth.signOut();
        // Force a page reload to reset the application state
        window.location.href = '/login';
      }
      
      throw error;
    }
  }, []);
  
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Remove the duplicate /api since API_URL already includes it
      const statsEndpoint = `${API_URL}/admin/dashboard`;
      console.log('Fetching stats from:', statsEndpoint);

      // First, ensure we have a valid session
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !currentSession?.access_token) {
        console.error('No valid session:', sessionError?.message || 'No access token');
        throw new Error('Session expired. Please log in again.');
      }

      // Get the token directly from localStorage as a fallback
      const sessionStr = localStorage.getItem('sb-qkaaoeismqnhjyikgkme-auth-token');
      let token = currentSession.access_token;

      if (sessionStr) {
        try {
          const sessionData = JSON.parse(sessionStr);
          if (sessionData?.access_token) {
            token = sessionData.access_token;
          }
        } catch (e) {
          console.warn('Error parsing session data from localStorage:', e);
        }
      }

      console.log('Using access token:', token ? '***' + token.slice(-8) : 'none');

      // Make the request with the token
      const response = await fetch(statsEndpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);

        // Handle 401 Unauthorized
        if (response.status === 401) {
          // Try to refresh the session
          console.log('Session may be expired, attempting to refresh...');
          const { data: { session: newSession }, error: refreshError } = await supabase.auth.refreshSession();

          if (refreshError || !newSession?.access_token) {
            console.error('Failed to refresh session:', refreshError?.message || 'No session data');
            await supabase.auth.signOut();
            throw new Error('Your session has expired. Please log in again.');
          }

          // Retry with the new token
          console.log('Retrying with new token...');
          const retryResponse = await fetch(statsEndpoint, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${newSession.access_token}`
            },
            credentials: 'include'
          });

          if (!retryResponse.ok) {
            const retryError = await retryResponse.text();
            throw new Error(`Failed to load stats: ${retryError}`);
          }

          const retryData = await retryResponse.json();
          setStats(formatStats(retryData.data || retryData));
          return;
        }

        // Handle 422 Unprocessable Entity (signature verification failed)
        if (response.status === 422) {
          console.warn('Token validation failed, signing out...');
          await supabase.auth.signOut();
          window.location.href = '/login';
          return;
        }

        throw new Error(`Failed to load stats: ${errorText}`);
      }

      const data = await response.json();
      console.log('Stats data received:', data);

      if (!data) {
        throw new Error('No data received from server');
      }

      setStats(formatStats(data.data || data));

    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setError(error.message || 'Failed to load statistics. Please try again later.');
      setStats(DEFAULT_STATS);

      // If it's an auth error, redirect to login
      if (error.message.includes('session') ||
          error.message.includes('auth') ||
          error.message.includes('token') ||
          error.message.includes('401') ||
          error.message.includes('422')) {
        console.warn('Auth error detected, redirecting to login');
        await supabase.auth.signOut();
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  }, [formatStats]);

  // Fetch stats when session is available and component is ready
  useEffect(() => {
    // Only proceed if auth is initialized and not loading
    if (!isInitialized || authLoading) return;
    
    if (session?.access_token) {
      console.log('Session available, fetching stats...');
      fetchStats();
    } else {
      console.log('No active session, showing error');
      setError('No active session. Please log in again.');
      setLoading(false);
    }
  }, [session, authLoading, isInitialized, fetchStats]);

  // Show loading state while auth is being checked
  if (authLoading || !isInitialized) {
    return (
      <Box className="flex items-center justify-center h-64">
        <CircularProgress />
        <Typography className="ml-4">Loading dashboard...</Typography>
      </Box>
    );
  }
  
  // If no session after initialization, show error
  if (!session) {
    return (
      <Box className="flex flex-col items-center justify-center h-64">
        <ExclamationTriangleIcon className="h-12 w-12 text-yellow-500 mb-4" />
        <Typography variant="h6" className="mb-2">Session Expired</Typography>
        <Typography className="mb-4">Please log in again to continue.</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => window.location.href = '/login'}
        >
          Go to Login
        </Button>
      </Box>
    );
  }

  // Loading state
  if (loading) {
    return (
      <Box className="flex items-center justify-center h-64">
        <CircularProgress />
        <Typography className="ml-4">Loading dashboard...</Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box className="p-6 bg-red-50 rounded-lg">
        <div className="flex items-center">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
          <Typography color="error">{error}</Typography>
        </div>
        <button 
          onClick={fetchStats}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Retry
        </button>
      </Box>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {QUICK_ACTIONS.map((action, index) => (
              <QuickAction key={index} {...action} />
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {RECENT_ACTIVITIES.map((activity) => (
                <ActivityItem key={activity.id} {...activity} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
