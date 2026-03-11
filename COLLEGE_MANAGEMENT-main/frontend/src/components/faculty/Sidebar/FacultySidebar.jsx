import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const FacultySidebar = ({ user, onLogout }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isRelievingOpen, setIsRelievingOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);
  const toggleRelieving = () => setIsRelievingOpen(!isRelievingOpen);

  const getUserInitials = (name) => {
    if (!name) return 'F';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    navigate('/faculty/login');
  };

  return (
    <div className="w-64 bg-[#1d395e] shadow-lg flex flex-col text-white">
      <div className="p-4">
        <h1 className="text-xl font-bold text-white">Faculty Portal</h1>
      </div>
      
      {/* Profile Section */}
      <div className="px-4 py-3 border-t border-b border-gray-500">
        <button 
          onClick={toggleProfile}
          className="w-full flex items-center justify-between text-left hover:bg-[#2a4a75] rounded-lg p-2 transition-colors duration-200"
        >
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-white text-[#1d395e] flex items-center justify-center">
              <span className="text-sm font-medium">
                {getUserInitials(user?.userData?.name || '')}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-white">
                {user?.userData?.name || 'Faculty Member'}
              </p>
              <p className="text-xs text-gray-300">
                {user?.email || 'faculty@example.com'}
              </p>
            </div>
          </div>
          {isProfileOpen ? (
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>
        
        {/* Profile Dropdown */}
        {isProfileOpen && (
          <div className="mt-2 pl-4 py-2 space-y-2">
            <div className="text-sm text-gray-700">
              <p className="font-medium">Department:</p>
              <p className="text-gray-600">{user?.userData?.department || 'Not specified'}</p>
            </div>
            <div className="text-sm text-gray-700">
              <p className="font-medium">Employee ID:</p>
              <p className="text-gray-600">{user?.userData?.employeeId || 'N/A'}</p>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <Link 
                to="/faculty/profile" 
                className="flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                View Full Profile
              </Link>
            </div>
          </div>
        )}
      </div>
      
      <nav className="flex-1 overflow-y-auto">
        <ul className="px-2 py-4 space-y-1">
          <li>
            <Link
              to="/faculty/profile"
              className={`flex items-center px-4 py-2 text-sm rounded-lg transition-colors duration-200 ${
                location.pathname === '/faculty/profile'
                  ? 'bg-white/20 text-white'
                  : 'text-gray-200 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile
              </div>
            </Link>
          </li>
          <li>
            <Link
              to="/faculty/students"
              className={`flex items-center px-4 py-2 text-sm rounded-lg transition-colors duration-200 ${
                location.pathname.startsWith('/faculty/students')
                  ? 'bg-white/20 text-white'
                  : 'text-gray-200 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                My Students
              </div>
            </Link>
          </li>
          <li>
            <Link
              to="/faculty/take-attendance"
              className={`flex items-center px-4 py-2 text-sm rounded-lg transition-colors duration-200 ${
                location.pathname.startsWith('/faculty/take-attendance')
                  ? 'bg-white/20 text-white'
                  : 'text-gray-200 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Take Attendance
              </div>
            </Link>
          </li>
          <li>
            <Link
              to="/faculty/mark-internals"
              className={`flex items-center px-4 py-2 text-sm rounded-lg transition-colors duration-200 ${
                location.pathname.startsWith('/faculty/mark-internals')
                  ? 'bg-white/20 text-white'
                  : 'text-gray-200 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Mark Internals
              </div>
            </Link>
          </li>
          <li>
            <Link
              to="/faculty/exam-timetable"
              className={`flex items-center px-4 py-2 text-sm rounded-lg transition-colors duration-200 ${
                location.pathname.startsWith('/faculty/exam-timetable')
                  ? 'bg-white/20 text-white'
                  : 'text-gray-200 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Exam Timetable
              </div>
            </Link>
          </li>
          <li>
            <Link
              to="/faculty/class"
              className={`flex items-center px-4 py-2 text-sm rounded-lg transition-colors duration-200 ${
                location.pathname.startsWith('/faculty/class')
                  ? 'bg-white/20 text-white'
                  : 'text-gray-200 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                My Class & Subjects
              </div>
            </Link>
          </li>
          <li>
            <Link
              to="/faculty/my-schedule"
              className={`flex items-center px-4 py-2 text-sm rounded-lg transition-colors duration-200 ${
                location.pathname.startsWith('/faculty/my-schedule')
                  ? 'bg-white/20 text-white'
                  : 'text-gray-200 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                My Schedule
              </div>
            </Link>
          </li>
          <li>
            <Link
              to="/faculty/attendance"
              className={`flex items-center px-4 py-2 text-sm rounded-lg transition-colors duration-200 ${
                location.pathname.startsWith('/faculty/attendance')
                  ? 'bg-white/20 text-white'
                  : 'text-gray-200 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                My Attendance
              </div>
            </Link>
          </li>
          <li>
            <Link
              to="/faculty/research-papers"
              className={`flex items-center px-4 py-2 text-sm rounded-lg transition-colors duration-200 ${
                location.pathname.startsWith('/faculty/research-papers')
                  ? 'bg-white/20 text-white'
                  : 'text-gray-200 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                My Research Papers
              </div>
            </Link>
          </li>
          <li>
            <Link
              to="/faculty/notifications"
              className={`flex items-center px-4 py-2 text-sm rounded-lg transition-colors duration-200 ${
                location.pathname.startsWith('/faculty/notifications')
                  ? 'bg-white/20 text-white'
                  : 'text-gray-200 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                Notifications
              </div>
            </Link>
          </li>
          <li>
            <div>
              <button
                onClick={toggleRelieving}
                className={`w-full flex items-center justify-between px-4 py-2 text-sm rounded-lg transition-colors duration-200 ${
                  location.pathname.startsWith('/faculty/relieving')
                    ? 'bg-white/20 text-white'
                    : 'text-gray-200 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Relieving
                </div>
                <svg 
                  className={`w-4 h-4 transition-transform duration-200 ${isRelievingOpen ? 'transform rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Relieving Submenu */}
              {isRelievingOpen && (
                <div className="ml-6 mt-1 space-y-1">
                  <Link
                    to="/faculty/relieving/form"
                    className={`block px-4 py-2 text-sm rounded-lg transition-colors duration-200 ${
                      location.pathname === '/faculty/relieving/form'
                        ? 'bg-white/20 text-white'
                        : 'text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-2"></span>
                      Relieving Form
                    </div>
                  </Link>
                  <Link
                    to="/faculty/clearance"
                    className={`block px-4 py-2 text-sm rounded-lg transition-colors duration-200 ${
                      location.pathname === '/faculty/clearance'
                        ? 'bg-white/20 text-white'
                        : 'text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-2"></span>
                      Academic Clearance
                    </div>
                  </Link>
                  <Link
                    to="/faculty/certificates"
                    className={`block px-4 py-2 text-sm rounded-lg transition-colors duration-200 ${
                      location.pathname === '/faculty/certificates'
                        ? 'bg-white/20 text-white'
                        : 'text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-2"></span>
                      Certificates
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </li>
        </ul>
      </nav>
      
      {/* Logout Button */}
      <div className="p-4 border-t border-gray-500">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center px-4 py-2 text-sm text-white hover:bg-white/10 rounded-lg transition-colors duration-200"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default FacultySidebar;
