import React, { useEffect, useState, useCallback } from 'react';
import { useStudent } from '../../contexts/StudentContext';
import { useAuth } from '../../contexts/AuthContext';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import StudentSidebar from '../../components/student/StudentSidebar';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

// Loading fallback
const LoadingFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
    <p className="text-gray-600">Loading your dashboard...</p>
  </div>
);

// Error fallback
const ErrorFallback = ({ error, onRetry }) => {
  useEffect(() => {
    console.error('Dashboard Error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
      <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-md text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Dashboard</h3>
        <p className="text-gray-600 mb-6">
          {error?.message || 'Failed to load your dashboard. Please try again.'}
        </p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Refresh Page
          </button>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const StudentDashboard = () => {
  const { student, loading: studentLoading, error: studentError, fetchStudentData } = useStudent();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  

  // Handle retry logic
  const handleRetry = useCallback(async () => {
    if (user?.id) {
      setError(null);
      setRetryCount(prev => prev + 1);
      await fetchStudentData(user.id, true); // Force refresh
    }
  }, [user?.id, fetchStudentData]);
  
  // Handle errors
  useEffect(() => {
    if (studentError) {
      console.error('Student data error:', studentError);
      setError(studentError);
      
      // If we've retried less than 3 times, try again
      if (retryCount < 3) {
        const timer = setTimeout(() => {
          handleRetry();
        }, 1000 * (retryCount + 1)); // Exponential backoff
        
        return () => clearTimeout(timer);
      }
    }
  }, [studentError, retryCount, handleRetry]);

  // Handle error state with retry logic
  useEffect(() => {
    if (error) {
      console.error('Student Dashboard Error:', error);
      toast.error(error.message || 'Failed to load student data');
    }
  }, [error]);

  // Redirect to profile setup if required
  useEffect(() => {
    if (student && !student.profile_complete && !location.pathname.endsWith('/profile-setup')) {
      navigate('/student/profile-setup');
    }
  }, [student, location.pathname, navigate]);

  // Show loading state
  // Show loading state
  if (studentLoading) {
    return <LoadingFallback />;
  }

  // Show error state
  if ((studentError || error) && retryCount >= 3) {
    return (
      <ErrorFallback 
        error={error || studentError} 
        onRetry={handleRetry}
      />
    );
  }

  // Show no data state if student data is missing
  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-6 max-w-md w-full">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
            <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Student Data</h3>
          <p className="text-gray-600 mb-6">
            We couldn't find any student data associated with your account.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleRetry}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <StudentSidebar />

      {/* Main content */}
      <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
        {/* Top navigation */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between bg-white border-b border-gray-200 px-4 py-2">
            <button
              type="button"
              className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </button>
            <div className="flex-1 flex justify-between px-4">
              <div className="flex-1 flex">
                <h1 className="text-lg font-medium text-gray-900">
                  {location.pathname.split('/').pop() === 'dashboard' ? 'Dashboard' : 
                   location.pathname.includes('profile') ? 'Profile' :
                   location.pathname.split('/').pop().charAt(0).toUpperCase() + location.pathname.split('/').pop().slice(1)}
                </h1>
              </div>
              <div className="ml-4 flex items-center md:ml-6">
                <button
                  type="button"
                  className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={handleRetry}
                >
                  <ArrowPathIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Page title and actions */}
              <div className="md:flex md:items-center md:justify-between mb-6">
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                    {location.pathname.split('/').pop() === 'dashboard' ? 'Dashboard' : 
                     location.pathname.includes('profile') ? 'Profile' :
                     location.pathname.split('/').pop().charAt(0).toUpperCase() + location.pathname.split('/').pop().slice(1)}
                  </h2>
                </div>
                <div className="mt-4 flex-shrink-0 flex md:mt-0 md:ml-4">
                  <button
                    type="button"
                    className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={handleRetry}
                  >
                    <ArrowPathIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                    Refresh
                  </button>
                </div>
              </div>

              {/* Main content area */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <Outlet />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(StudentDashboard);
