import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Import simple HomePage
import HomePage from './pages/HomePage-simple.jsx';

// Simple test components
const AboutPage = () => <div style={{ padding: '20px' }}><h1>About Us</h1></div>;
const AdmissionsPage = () => <div style={{ padding: '20px' }}><h1>Admissions</h1></div>;
const AdminLoginPage = () => <div style={{ padding: '20px' }}><h1>Admin Login</h1></div>;
const StudentLoginPage = () => <div style={{ padding: '20px' }}><h1>Student Login</h1></div>;

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/admissions" element={<AdmissionsPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/student/login" element={<StudentLoginPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
