import React, { memo, useEffect, Suspense } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';

// Memoize the component to prevent unnecessary re-renders
const AdminDashboard = memo(({ children }) => {
  const location = useLocation();

  // Debug: Log the current path (only in development)
  useEffect(() => {
    console.log('AdminDashboard - Current path:', location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminHeader />
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="hidden md:block w-64 bg-[#1d395e] border-r border-gray-200">
          <AdminSidebar />
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden pt-4">
          {/* Scrollable Content Area */}
          <main className="flex-1 overflow-y-auto p-6 pt-2">
            <Suspense fallback={
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            }>
              <Outlet />
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  );
});

// Add display name for better debugging
AdminDashboard.displayName = 'AdminDashboard';

export default AdminDashboard;
