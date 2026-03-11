import { useState } from 'react';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import { useStudent } from '../../contexts/StudentContext';
import StudentSidebar from './StudentSidebar';
import { 
  AcademicCapIcon, 
  BookOpenIcon, 
  CalendarIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon, 
  UserCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  HomeIcon,
  TruckIcon,
  UserIcon,
  BuildingOfficeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

// Define color constants for consistent theming
const COLORS = {
  blue: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' },
  green: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200' },
  red: { bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-200' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-200' },
  indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600', border: 'border-indigo-200' },
  teal: { bg: 'bg-teal-100', text: 'text-teal-600', border: 'border-teal-200' },
  yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600', border: 'border-yellow-200' },
  pink: { bg: 'bg-pink-100', text: 'text-pink-600', border: 'border-pink-200' },
  gray: { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' }
};

function StudentDashboard() {
  const { student, loading, error, refreshData } = useStudent();
  const navigate = useNavigate();
  
  // Handle refresh button click
  const handleRefresh = async () => {
    try {
      await refreshData();
    } catch (err) {
      console.error('Error refreshing data:', err);
    }
  };

  // Stats data
  const [stats] = useState([
    { 
      name: 'Attendance', 
      value: '85%', 
      change: '+2.5%', 
      changeType: 'positive', 
      icon: ChartBarIcon, 
      color: 'blue',
      link: '/student/attendance'
    },
    { 
      name: 'CGPA', 
      value: '8.7', 
      change: '+0.2', 
      changeType: 'positive', 
      icon: AcademicCapIcon, 
      color: 'green',
      link: '/student/marks'
    },
    { 
      name: 'Pending Fees', 
      value: '₹12,500', 
      change: 'Due in 15 days', 
      changeType: 'negative', 
      icon: CurrencyDollarIcon, 
      color: 'red',
      link: '/student/fees'
    },
    { 
      name: 'Upcoming Exams', 
      value: '3', 
      change: 'Next: DSA on 15th Nov', 
      changeType: 'neutral', 
      icon: CalendarIcon, 
      color: 'purple',
      link: '/student/examinations'
    },
  ]);

  const quickActions = [
    { name: 'View Timetable', icon: CalendarIcon, href: '/student/timetable', color: 'indigo' },
    { name: 'Check Results', icon: ChartBarIcon, href: '/student/marks', color: 'green' },
    { name: 'Pay Fees', icon: CurrencyDollarIcon, href: '/student/fees', color: 'red' },
    { name: 'Apply Leave', icon: DocumentTextIcon, href: '/student/leave-application', color: 'yellow' },
  ];

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="hidden md:flex md:flex-shrink-0">
          <StudentSidebar />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="hidden md:flex md:flex-shrink-0">
          <StudentSidebar />
        </div>
        <div className="flex-1 p-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <StudentSidebar />
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button className="md:hidden mr-4 text-gray-500 hover:text-gray-900">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Student Portal</h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleRefresh}
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <ArrowPathIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Refresh
              </button>
            </div>
          </div>
        </header>
        
        {/* Page content */}
        <main className="flex-1 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default StudentDashboard;
