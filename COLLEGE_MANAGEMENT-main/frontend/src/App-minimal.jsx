import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Student Management System</h1>
      <Routes>
        <Route path="/" element={<div>Home Page</div>} />
        <Route path="/admin" element={<div>Admin Page</div>} />
        <Route path="/admin/dashboard" element={<div>Admin Dashboard Working!</div>} />
        <Route path="/student" element={<div>Student Page</div>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
