import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminOverview from '../components/admin/AdminOverview';

// Loading component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
);

const AdminRoutes = () => {
  console.log('AdminRoutes component is being rendered!');
  
  return (
    <AdminDashboard>
      <Routes>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={
          <Suspense fallback={<LoadingFallback />}>
            <AdminOverview />
          </Suspense>
        } />
        
        {/* Test Route */}
        <Route
          path="test-attendance"
          element={
            <div className="p-4 bg-yellow-100 border border-yellow-500 rounded">
              <h1 className="text-2xl font-bold mb-4">Test Route - This should appear</h1>
              <p>If you can see this, routing is working!</p>
              <button
                onClick={() => alert('Test button clicked!')}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Test Button
              </button>
            </div>
          }
        />

        {/* Direct test route for dashboard visibility */}
        <Route
          path="test-dashboard"
          element={
            <div className="p-6 bg-green-50 border border-green-500 rounded-lg">
              <h1 className="text-3xl font-bold mb-4 text-green-800">ADMIN DASHBOARD TEST</h1>
              <p className="text-lg mb-4">If you can see this page, the admin dashboard routing is working!</p>
              <div className="bg-white p-4 rounded shadow">
                <h2 className="text-xl font-semibold mb-2">Test Information:</h2>
                <ul className="list-disc list-inside space-y-1">
                  <li>Authentication: Bypassed for testing</li>
                  <li>Route: /admin/test-dashboard</li>
                  <li>Layout: AdminDashboard with sidebar</li>
                  <li>Status: ✅ Working</li>
                </ul>
              </div>
              <button
                onClick={() => window.location.href = '/admin/dashboard'}
                className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              >
                Go to Main Dashboard
              </button>
            </div>
          }
        />

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </AdminDashboard>
  );
};

export default AdminRoutes;
