import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout
import AdminDashboard from '../pages/admin/AdminDashboard';

// Loading component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
);

// Simple test component for now
const AdminOverview = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
    <p>Welcome to the admin dashboard!</p>
  </div>
);

const AdminRoutes = () => {
  console.log('AdminRoutes component is being rendered!');
  
  return (
    <Routes>
      <Route element={<AdminDashboard />}>
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

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
