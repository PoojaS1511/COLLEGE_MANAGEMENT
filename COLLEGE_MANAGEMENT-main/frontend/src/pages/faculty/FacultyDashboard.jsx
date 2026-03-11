import React, { memo, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import FacultySidebar from '../../components/faculty/Sidebar';

const FacultyDashboard = memo(({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  }, [logout]);

  // Get page title based on current route
  const getPageTitle = useCallback(() => {
    if (location.pathname === '/faculty/dashboard') return 'Dashboard';    
    if (location.pathname.startsWith('/faculty/courses')) return 'My Courses';
    if (location.pathname.startsWith('/faculty/attendance')) return 'Attendance';
    if (location.pathname.startsWith('/faculty/grades')) return 'Gradebook';
    if (location.pathname.startsWith('/faculty/profile')) return 'My Profile';
    return 'Faculty Portal';
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-gray-100">
      <FacultySidebar user={user} onLogout={handleLogout} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between p-4">
            <h2 className="text-lg font-semibold text-gray-800">
              {getPageTitle()}
            </h2>
            <div className="flex items-center space-x-4">
              <button 
                className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-full" 
                aria-label="Notifications"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <div className="flex items-center space-x-3">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium text-gray-700">     
                    {user?.userData?.name || 'Faculty Member'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {user?.email || ''}
                  </span>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {user?.userData?.name ? 
                      (user.userData.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)) : 
                      'F'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
});

export default FacultyDashboard;