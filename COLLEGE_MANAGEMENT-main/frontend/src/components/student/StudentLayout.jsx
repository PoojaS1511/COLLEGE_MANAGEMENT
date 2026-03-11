import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  AcademicCapIcon,
  BookOpenIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CogIcon,
  DocumentTextIcon,
  HomeIcon,
  UserCircleIcon,
  BriefcaseIcon,
  LogoutIcon,
  MenuIcon,
  XIcon,
  BellIcon,
  SearchIcon
} from '@heroicons/react/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useStudent } from '../../contexts/StudentContext';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const StudentLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [notifications, setNotifications] = useState([]);
  const { logout } = useAuth();
  const { student } = useStudent();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setCurrentPath(location.pathname);
  }, [location]);

  const navigation = [
    { name: 'Dashboard', href: '/student/dashboard', icon: HomeIcon, current: currentPath === '/student/dashboard' },
    { name: 'Profile', href: '/student/profile', icon: UserCircleIcon, current: currentPath === '/student/profile' },
    { name: 'Attendance', href: '/student/attendance', icon: CalendarIcon, current: currentPath === '/student/attendance' },
    { name: 'Academic Overview', href: '/student/academic-overview', icon: AcademicCapIcon, current: currentPath === '/student/academic-overview' },
    { name: 'Examinations', href: '/student/examinations', icon: BookOpenIcon, current: currentPath === '/student/examinations' },
    { name: 'Marks & Results', href: '/student/marks', icon: ChartBarIcon, current: currentPath === '/student/marks' },
    { name: 'Timetable', href: '/student/timetable', icon: CalendarIcon, current: currentPath === '/student/timetable' },
    { name: 'Fees & Admission', href: '/student/fees', icon: CurrencyDollarIcon, current: currentPath === '/student/fees' },
    { name: 'Hostel', href: '/student/hostel', icon: HomeIcon, current: currentPath === '/student/hostel' },
    { name: 'Transport', href: '/student/transport', icon: BriefcaseIcon, current: currentPath === '/student/transport' },
    { name: 'Calendar', href: '/student/calendar', icon: CalendarIcon, current: currentPath === '/student/calendar' },
    { name: 'Notifications', href: '/student/notifications', icon: BellIcon, current: currentPath === '/student/notifications' },
    { name: 'Internships', href: '/student/internships', icon: BriefcaseIcon, current: currentPath === '/student/internships' },
    { name: 'Career Insights', href: '/student/career-insights', icon: ChartBarIcon, current: currentPath === '/student/career-insights' },
    { name: 'Settings', href: '/student/settings', icon: CogIcon, current: currentPath === '/student/settings' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden bg-gray-100">
      {/* Mobile sidebar */}
      <div className="md:hidden">
        <div className={`fixed inset-0 flex z-50 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
          <div className="fixed inset-0">
            <div className="absolute inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
          </div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <XIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </button>
            </div>
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <h1 className="text-white text-xl font-bold">Student Portal</h1>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={classNames(
                      item.current
                        ? 'bg-indigo-800 text-white'
                        : 'text-indigo-100 hover:bg-indigo-600',
                      'group flex items-center px-2 py-2 text-base font-medium rounded-md'
                    )}
                  >
                    <item.icon
                      className={classNames(
                        item.current ? 'text-indigo-300' : 'text-indigo-200 group-hover:text-white',
                        'mr-4 flex-shrink-0 h-6 w-6'
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-indigo-800 p-4">
              <button
                onClick={handleLogout}
                className="flex-shrink-0 w-full group block"
              >
                <div className="flex items-center">
                  <div>
                    <LogoutIcon className="h-6 w-6 text-indigo-200 group-hover:text-white" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-white group-hover:text-white">Sign out</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
          <div className="flex-shrink-0 w-14">
            {/* Force sidebar to shrink to fit close icon */}
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 border-r border-gray-200 bg-indigo-700">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-white text-xl font-bold">Student Portal</h1>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={classNames(
                    item.current
                      ? 'bg-indigo-800 text-white'
                      : 'text-indigo-100 hover:bg-indigo-600',
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                  )}
                >
                  <item.icon
                    className={classNames(
                      item.current ? 'text-indigo-300' : 'text-indigo-200 group-hover:text-white',
                      'mr-3 flex-shrink-0 h-6 w-6'
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-indigo-800 p-4">
            <button
              onClick={handleLogout}
              className="flex-shrink-0 w-full group block"
            >
              <div className="flex items-center">
                <div>
                  <LogoutIcon className="h-6 w-6 text-indigo-200 group-hover:text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white group-hover:text-white">Sign out</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Mobile menu button */}
        <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="flex items-center h-16 px-2 sm:px-4">
            <button
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <MenuIcon className="block h-6 w-6" aria-hidden="true" />
            </button>
            <div className="flex-1 flex justify-center md:justify-start ml-2">
              <h1 className="text-xl font-semibold text-gray-900">Student Portal</h1>
            </div>
          </div>
        </div>
        
        {/* Main content area */}
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none bg-gray-50">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
