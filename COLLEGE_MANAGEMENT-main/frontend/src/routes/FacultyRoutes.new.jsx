import React, { Suspense } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import LoadingScreen from '../components/common/LoadingScreen';
import FacultyDashboard from '../pages/faculty/FacultyDashboard';

// Simple component to avoid lazy loading for now
const FacultyLogin = () => <div>Faculty Login Page</div>;

const FacultyLayout = () => {
  return (
    <FacultyDashboard>
      <Suspense fallback={<LoadingScreen />}>
        <Outlet />
      </Suspense>
    </FacultyDashboard>
  );
};

const FacultyRoutes = () => {
  return (
    <Routes>
      <Route path="login" element={<FacultyLogin />} />
      <Route path="/" element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<FacultyLayout />}>
        <Route index element={<div>Welcome to Faculty Dashboard</div>} />
      </Route>
      <Route path="*" element={<div>Page not found</div>} />
    </Routes>
  );
};

export default FacultyRoutes;
