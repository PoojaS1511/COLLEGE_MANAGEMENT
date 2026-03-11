import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  AcademicCapIcon, 
  CalendarIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon, 
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/outline';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const StatCard = ({ title, value, icon: Icon, color = 'indigo', link = '#' }) => {
  const colorClasses = {
    indigo: 'bg-indigo-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
  };

  return (
    <Link to={link} className="block">
      <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200">
        <div className="p-5">
          <div className="flex items-center">
            <div className={`flex-shrink-0 rounded-md p-3 ${colorClasses[color]} bg-opacity-10`}>
              <Icon className={`h-6 w-6 text-${color}-600`} aria-hidden="true" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  {title}
                </dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">
                    {value}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            <span className="font-medium text-indigo-600 hover:text-indigo-500">
              View details
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

const RecentActivityItem = ({ type, title, description, time, status = 'info' }) => {
  const statusIcons = {
    success: <CheckCircleIcon className="h-5 w-5 text-green-500" />,
    warning: <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />,
    error: <XCircleIcon className="h-5 w-5 text-red-500" />,
    info: <CalendarIcon className="h-5 w-5 text-blue-500" />
  };

  return (
    <div className="relative pb-8">
      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
      <div className="relative flex space-x-3">
        <div>
          <span className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
            {statusIcons[status] || statusIcons.info}
          </span>
        </div>
        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
          <div>
            <p className="text-sm text-gray-500">
              {title}{' '}
              <span className="font-medium text-gray-900">{description}</span>
            </p>
          </div>
          <div className="text-right text-sm whitespace-nowrap text-gray-500">
            <time dateTime={time}>{time}</time>
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardOverview = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    attendance: 0,
    upcomingExams: 0,
    pendingFees: 0,
    cgpa: 0,
    recentActivities: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard stats
        const { data: dashboardData, error } = await supabase
          .rpc('get_student_dashboard_stats', { 
            student_id: currentUser.id 
          });

        if (error) throw error;

        if (dashboardData && dashboardData.length > 0) {
          setStats({
            attendance: dashboardData[0].attendance_percentage || 0,
            upcomingExams: dashboardData[0].upcoming_exams_count || 0,
            pendingFees: dashboardData[0].pending_fees || 0,
            cgpa: dashboardData[0].cgpa || 0,
            recentActivities: dashboardData[0].recent_activities || []
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchDashboardData();
    }
  }, [currentUser]);

  // Mock data for demonstration
  const mockActivities = [
    {
      id: 1,
      type: 'exam',
      title: 'Upcoming exam:',
      description: 'Mathematics Midterm',
      time: '2 days from now',
      status: 'warning'
    },
    {
      id: 2,
      type: 'attendance',
      title: 'Attendance marked',
      description: 'Present in Physics class',
      time: '1 hour ago',
      status: 'success'
    },
    {
      id: 3,
      type: 'fee',
      title: 'Fee payment due',
      description: 'Tuition fee for March',
      time: '3 days remaining',
      status: 'error'
    },
    {
      id: 4,
      type: 'grade',
      title: 'New grade posted',
      description: 'A in Computer Science',
      time: '2 days ago',
      status: 'success'
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {currentUser?.first_name || 'Student'}!</h1>
        <p className="mt-1 text-sm text-gray-500">Here's what's happening with your academics today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 mt-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Attendance" 
          value={`${stats.attendance}%`} 
          icon={CalendarIcon} 
          color="blue"
          link="/student/attendance"
        />
        <StatCard 
          title="Upcoming Exams" 
          value={stats.upcomingExams} 
          icon={AcademicCapIcon} 
          color="green"
          link="/student/academics"
        />
        <StatCard 
          title="Pending Fees" 
          value={`$${stats.pendingFees.toLocaleString()}`} 
          icon={CurrencyDollarIcon} 
          color="yellow"
          link="/student/fees"
        />
        <StatCard 
          title="Current CGPA" 
          value={stats.cgpa > 0 ? stats.cgpa.toFixed(2) : 'N/A'} 
          icon={ChartBarIcon} 
          color="purple"
          link="/student/academics"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 mt-8 lg:grid-cols-3">
        {/* Upcoming Deadlines */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Upcoming Deadlines</h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="flow-root">
              <ul role="list" className="-mb-8">
                {mockActivities.map((activity, activityIdx) => (
                  <RecentActivityItem
                    key={activity.id}
                    type={activity.type}
                    title={activity.title}
                    description={activity.description}
                    time={activity.time}
                    status={activity.status}
                  />
                ))}
              </ul>
            </div>
            <div className="mt-6">
              <Link
                to="/student/academics"
                className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                View all
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-4">
              <Link
                to="/student/academics/register"
                className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
              >
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <AcademicCapIcon className="h-6 w-6 text-indigo-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="absolute inset-0" aria-hidden="true" />
                  <p className="text-sm font-medium text-gray-900">Course Registration</p>
                  <p className="text-sm text-gray-500 truncate">Register for next semester</p>
                </div>
              </Link>

              <Link
                to="/student/fees/pay"
                className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
              >
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="absolute inset-0" aria-hidden="true" />
                  <p className="text-sm font-medium text-gray-900">Pay Fees</p>
                  <p className="text-sm text-gray-500 truncate">Make a payment</p>
                </div>
              </Link>

              <Link
                to="/student/internships/apply"
                className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
              >
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <BriefcaseIcon className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="absolute inset-0" aria-hidden="true" />
                  <p className="text-sm font-medium text-gray-900">Apply for Internship</p>
                  <p className="text-sm text-gray-500 truncate">Submit new internship application</p>
                </div>
              </Link>

              <Link
                to="/student/documents/request"
                className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
              >
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                    <DocumentTextIcon className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="absolute inset-0" aria-hidden="true" />
                  <p className="text-sm font-medium text-gray-900">Request Documents</p>
                  <p className="text-sm text-gray-500 truncate">Transcripts, certificates, etc.</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Academic Progress */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Academic Progress</h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-500">Current Semester GPA</h4>
                <span className="text-sm font-medium text-indigo-600">{stats.cgpa > 0 ? stats.cgpa.toFixed(2) : 'N/A'}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-indigo-600 h-2.5 rounded-full" 
                  style={{ width: `${(stats.cgpa / 4) * 100}%` }}
                ></div>
              </div>
              <p className="mt-1 text-xs text-gray-500">Out of 4.0 scale</p>
            </div>

            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Attendance Rate</h4>
              <div className="flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-2.5 mr-4">
                  <div 
                    className="bg-green-600 h-2.5 rounded-full" 
                    style={{ width: `${stats.attendance}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{stats.attendance}%</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">Overall attendance this semester</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Credits Completed</h4>
              <div className="flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-2.5 mr-4">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: '65%' }} // This would come from your data
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">78/120</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">65% of program requirements completed</p>
            </div>

            <div className="mt-6">
              <Link
                to="/student/academics/progress"
                className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                View Detailed Progress
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
