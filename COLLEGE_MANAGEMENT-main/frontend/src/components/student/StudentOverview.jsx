import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudent } from '../../contexts/StudentContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import {
  BookOpenIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  UserCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CalendarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

// Memoized StatCard component
const StatCard = React.memo(({ icon: Icon, title, value, color }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
    <div className="flex items-center">
      <div className={`p-2 rounded-full ${color} bg-opacity-10`}>
        <Icon className={`h-6 w-6 ${color}`} />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-lg font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
));

const StudentOverview = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);
  const navigate = useNavigate();
  
  const { user } = useAuth();
  const { student, loading: studentLoading, error: studentError, refreshData } = useStudent();
  
  // Quick actions data
  const quickActions = [
    { name: 'View Timetable', icon: CalendarIcon, href: '/student/timetable', color: 'indigo' },
    { name: 'Check Results', icon: ChartBarIcon, href: '/student/marks', color: 'green' },
    { name: 'Pay Fees', icon: CurrencyDollarIcon, href: '/student/fees', color: 'red' },
    { name: 'Apply Leave', icon: DocumentTextIcon, href: '/student/leave-application', color: 'yellow' },
  ];
  
  // Handle refresh button click
  const handleRefresh = async () => {
    try {
      await refreshData();
    } catch (err) {
      console.error('Error refreshing data:', err);
    }
  };
  
  // Stats data will be defined after we have student data
  
  // Debug log student data
  useEffect(() => {
    console.log('Student data in Overview:', { 
      currentUserEmail: user?.email,
      studentEmail: student?.email,
      studentLoading, 
      studentError,
      hasUserId: !!student?.user_id,
      hasId: !!student?.id,
      isEmailMatching: user?.email?.toLowerCase() === student?.email?.toLowerCase()
    });
  }, [user, student, studentLoading, studentError]);

  // Process student data when it's available
  useEffect(() => {
    if (!student || Object.keys(student).length === 0) {
      setLoading(true);
      return;
    }
    
    // Verify the student email matches the logged-in user's email
    if (user?.email?.toLowerCase() !== student?.email?.toLowerCase()) {
      console.log('Email mismatch - not processing data for:', student.email);
      setLoading(false);
      setError({ 
        message: 'Data mismatch',
        details: 'The student data does not match the logged-in user.'
      });
      return;
    }

    try {
      // Process the data from context
      const processedData = {
        ...student,
        attendancePercentage: calculateAttendance(student.attendance || []),
        cgpa: calculateCGPA(student.marks || [])
      };

      console.log('Processed student data:', processedData);
      
      if (isMounted.current) {
        setDashboardData(processedData);
        setError(null);
        setLoading(false);
      }
    } catch (err) {
      console.error('Error processing student data:', err);
      if (isMounted.current) {
        setError({
          message: 'Failed to process student data',
          details: err.message
        });
        setLoading(false);
      }
    }

    return () => {
      isMounted.current = false;
    };
  }, [student]);

  // Calculate attendance percentage
  const calculateAttendance = (attendance) => {
    const presentCount = attendance.filter(a => a.status === 'present').length;
    return attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0;
  };

  // Calculate CGPA from marks
  const calculateCGPA = (marks) => {
    if (!marks.length) return 0;
    const totalMarks = marks.reduce((sum, mark) => {
      return sum + (parseFloat(mark.scored_marks) || 0);
    }, 0);
    const average = totalMarks / marks.length;
    return (average / 10).toFixed(2); // Assuming 100 is max marks
  };

  // Handle retry
  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // Force a re-fetch by changing the dependency in the effect
    setDashboardData(null);
  };

  // Loading state
  if (loading || studentLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600">Loading your dashboard...</p>
      </div>
    );
  }

  // Error state
  if (error || studentError) {
    const errorToShow = error || studentError;
    return (
      <div className="p-6">
        {/* Welcome Section */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {student?.name || 'Student'}!</h1>
            <div className="flex items-center mt-2 text-sm text-gray-600">
              <span className="mr-4">
                <span className="font-medium">Department:</span> {student?.department || 'N/A'}
              </span>
              <span>
                <span className="font-medium">ID:</span> {student?.id || 'N/A'}
              </span>
            </div>
          </div>
          <div className="flex items-center">
            <button
              onClick={handleRefresh}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat, index) => (
            <div 
              key={index}
              onClick={() => navigate(stat.link)}
              className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 rounded-md p-3 ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{stat.value}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-4">
                  <div className={`text-sm ${stat.changeType === 'positive' ? 'text-green-600' : stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-500'}`}>
                    {stat.change}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action, index) => (
              <div 
                key={index}
                onClick={() => navigate(action.href)}
                className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-5">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 rounded-md p-3 bg-${action.color}-100`}>
                      <action.icon className={`h-6 w-6 text-${action.color}-600`} aria-hidden="true" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-900">{action.name}</h3>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
              <p className="ml-2 text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          {errorToShow?.message || 'An error occurred'}
        </h3>
        {errorToShow?.details && (
          <p className="mt-2 text-sm text-gray-500">{errorToShow.details}</p>
        )}
        <div className="mt-6">
          <button
            onClick={handleRetry}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowPathIcon className="-ml-1 mr-2 h-4 w-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No data state or email mismatch
  if (!student || Object.keys(student).length === 0 || 
      (user?.email?.toLowerCase() !== student?.email?.toLowerCase())) {
    return (
      <div className="text-center p-8">
        <UserCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          {!student || Object.keys(student).length === 0 
            ? 'No student data found' 
            : 'User data mismatch'}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {!student || Object.keys(student).length === 0
            ? 'Your student profile could not be found.'
            : 'The student data does not match the logged-in user.'}
        </p>
        <div className="mt-6">
          <button
            onClick={() => navigate('/student/profile-setup')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            {!student || Object.keys(student).length === 0 
              ? 'Set Up Profile' 
              : 'Contact Support'}
          </button>
        </div>
      </div>
    );
  }

  // Use student data from context directly
  const studentData = student || dashboardData || {};
  
  // Calculate upcoming fee
  const upcomingFee = studentData.fees?.find(fee => fee.status === 'pending') || null;
  
  // Stats cards data
  const stats = [
    {
      title: 'Email',
      value: studentData.email || 'N/A',
      icon: BookOpenIcon,
      color: 'text-blue-500'
    },
    {
      title: 'Phone',
      value: studentData.phone || 'N/A',
      icon: ChartBarIcon,
      color: 'text-green-500'
    },
    {
      title: 'Status',
      value: studentData.status || 'Active',
      icon: ChartBarIcon,
      color: 'text-purple-500'
    },
    {
      title: 'Account',
      value: studentData.role || 'Student',
      icon: CurrencyDollarIcon,
      color: 'text-yellow-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Welcome back, {dashboardData.full_name || 'Student'}!
            </h1>
            <p className="text-gray-600 mt-1">
              {dashboardData.branch || 'N/A'} • Year {dashboardData.year || 'N/A'} • {dashboardData.section || 'N/A'}
            </p>
          </div>
          {dashboardData.profile_picture_url ? (
            <img
              className="h-12 w-12 rounded-full"
              src={dashboardData.profile_picture_url}
              alt="Profile"
            />
          ) : (
            <UserCircleIcon className="h-12 w-12 text-gray-400" />
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            icon={stat.icon}
            title={stat.title}
            value={stat.value}
            color={stat.color}
          />
        ))}
      </div>

      {/* Quick Links Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Subjects Card */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">My Subjects</h3>
          <p className="text-3xl font-bold text-blue-700">
            {dashboardData.subjects?.length || 0}
          </p>
          <p className="text-sm text-blue-600 mt-1">Enrolled this semester</p>
        </div>

        {/* Upcoming Exams */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
          <h3 className="font-semibold text-purple-900 mb-2">Upcoming Exams</h3>
          <p className="text-3xl font-bold text-purple-700">
            {dashboardData.exams?.length || 0}
          </p>
          <p className="text-sm text-purple-600 mt-1">Scheduled exams</p>
        </div>

        {/* Fee Status */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
          <h3 className="font-semibold text-green-900 mb-2">Fee Status</h3>
          <p className="text-xl font-bold text-green-700">
            {upcomingFee 
              ? `₹${upcomingFee.total_amount} due`
              : 'No dues pending'}
          </p>
          {upcomingFee && (
            <p className="text-sm text-green-600 mt-1">
              Due {new Date(upcomingFee.due_date).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentOverview;
