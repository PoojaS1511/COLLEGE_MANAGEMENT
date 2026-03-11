import React, { useState, useEffect, Fragment } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Bars3Icon, 
  XMarkIcon, 
  ChevronDownIcon, 
  UserCircleIcon, 
  ArrowRightOnRectangleIcon, 
  EyeIcon, 
  EyeSlashIcon 
} from '@heroicons/react/24/outline';
import { Menu, Transition, Dialog } from '@headlessui/react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

// Navigation configuration
const NAVIGATION = {
  student: '/student',
  faculty: '/faculty',
  default: '/'
};

const Header = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentApp, setCurrentApp] = useState('main');
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const roles = [
    { 
      id: 'student', 
      name: 'Student Login', 
      path: '/student/login', 
      app: 'main',
      isExternal: false
    },
    { 
      id: 'faculty', 
      name: 'Faculty Login', 
      path: '/faculty/login',
      app: 'main',
      isExternal: false
    },
    { 
      id: 'admin', 
      name: 'Admin Login', 
      path: '/admin/login', 
      app: 'main',
      isExternal: false
    }
  ];

  const location = useLocation();

  // Detect current application based on URL
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/student')) {
      setCurrentApp('student');
    } else if (path.startsWith('/faculty')) {
      setCurrentApp('faculty');
    } else {
      setCurrentApp('main');
    }
  }, [location]);

  // Navigation items with internal routes
  const navigation = [
    { name: 'Home', href: '/', app: 'main' },
    { name: 'Student Portal', href: '/student', app: 'student' },
    { name: 'Faculty Portal', href: '/faculty', app: 'faculty' },
    { name: 'Admin', href: '/admin', app: 'admin' }
  ];

  const switchApp = (app) => {
    const path = NAVIGATION[app] || NAVIGATION.default;
    navigate(path);
  };

  // Function to handle navigation between different applications
  const handleNavigation = (e, item) => {
    e.preventDefault();
    
    // For login routes, always use internal navigation
    if (item.path && item.path.includes('login')) {
      navigate(item.path);
      return;
    }
    
    // For external URLs, use window.location
    if (item.isExternal) {
      window.location.href = item.path;
      return;
    }
    
    // If the target is in a different application
    if (item.app && item.app !== currentApp) {
      // If the href is already a full URL, use it directly
      if (item.href && item.href.startsWith('http')) {
        window.location.href = item.href;
      } else {
        // Get the base URL for the target application and append the path
        const baseUrl = NAVIGATION[item.app] || NAVIGATION.default;        
        // Ensure we don't have double slashes when joining URLs
        const path = item.href || item.path;
        const separator = path.startsWith('/') ? '' : '/';
        window.location.href = `${baseUrl}${separator}${path}`;
      }
    } else {
      // For same-app navigation, use the router
      navigate(item.href || item.path);
    }
  };

  const handleLogout = async () => {
    try {
      const result = await logout();
      if (result && result.success) {
        // Clear any remaining state
        window.localStorage.clear();
        // Force a full page reload to reset all states and ensure clean redirect
        window.location.href = '/';
      } else {
        throw new Error(result?.error || 'Failed to sign out');
      }
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('Failed to sign out. Please try again.');
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white shadow-md ${
      scrolled ? 'border-b border-gray-200' : ''
    }`}>
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              to="/"
              className="flex items-center space-x-3 group"
            >
              <div className="h-10 w-10 bg-[#032A51] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-[#032A51]">Cube Arts & Engineering</h1>
                <p className="text-sm text-gray-600">Excellence in Education</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-3 py-2 text-sm font-medium transition-all duration-300 relative group ${
                  currentApp === item.app
                    ? 'text-[#032A51] font-semibold'
                    : 'text-gray-700 hover:text-[#032A51]'
                }`}
                onClick={(e) => handleNavigation(e, item)}
              >
                {item.name}
                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-[#032A51] transform transition-transform duration-300 ${
                  currentApp === item.app ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                }`}></span>
              </Link>
            ))}

            {/* CTA Buttons */}
            <div className="flex items-center space-x-3">
              {/* Apply Now Button */}
              <Link
                to="/admissions"
                className="bg-[#032A51] hover:bg-opacity-90 text-white px-6 py-2 rounded-xl font-semibold text-sm transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform"
                onClick={(e) => {
                  if (currentApp !== 'main') {
                    e.preventDefault();
                    switchApp('main');
                    navigate('/admissions');
                  }
                }}
              >
                Apply Now
              </Link>

              {/* Login/User Menu */}
              {user ? (
                <Menu as="div" className="relative ml-3">
                  <div>
                    <Menu.Button className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                      <span className="absolute -inset-1.5" />
                      <span className="sr-only">Open user menu</span>
                      <UserCircleIcon className="h-8 w-8 text-gray-300" />
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleLogout}
                            className={`${active ? 'bg-gray-100' : ''} flex w-full px-4 py-2 text-sm text-gray-700`}
                          >
                            <ArrowRightOnRectangleIcon className="mr-2 h-5 w-5" />
                            Sign out
                          </button>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              ) : (
                <Menu as="div" className="relative ml-3">
                  <div>
                    <Menu.Button className="inline-flex items-center px-6 py-2 border-2 border-[#032A51] text-sm font-semibold rounded-xl shadow-md text-[#032A51] bg-white hover:bg-opacity-10 hover:bg-[#032A51] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#032A51] transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 transform">
                      Sign in
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="py-1">
                        {roles.map((role) => (
                          <Menu.Item key={role.id}>
                            {({ active }) => (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  navigate(role.path);
                                }}
                                className={`w-full text-left px-4 py-2 text-sm ${
                                  active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                }`}
                              >
                                {role.name}
                              </button>
                            )}
                          </Menu.Item>
                        ))}
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <Transition
          show={mobileMenuOpen}
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <div className="lg:hidden">
            <div className="space-y-1 pb-3 pt-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={(e) => handleNavigation(e, item)}
                  className={`block px-3 py-2 text-base font-medium ${
                    location.pathname === item.href
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                  } border-l-4`}
                >
                  {item.name}
                </Link>
              ))}

              {!user && (
                <div className="border-t border-gray-200 pt-4 pb-3">
                  <div className="space-y-2 px-4">
                    <h3 className="text-sm font-medium text-gray-500">Login as:</h3>
                    {roles.map((role) => (
                      <Link
                        key={role.id}
                        to={role.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      >
                        {role.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Transition>
      </nav>
    </header>
  );
};

export default Header;