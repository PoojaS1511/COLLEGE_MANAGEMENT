import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Simple test version of AdminRoutes
const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<div>Admin Routes Working!</div>} />
    </Routes>
  );
};

export default AdminRoutes;
