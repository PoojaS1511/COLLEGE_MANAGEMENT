import React, { Suspense, lazy, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import FacultyDashboard from '../pages/faculty/FacultyDashboard';
import FacultyLogin from '../pages/faculty/FacultyLogin';
import Students from '../pages/faculty/Students';
import TakeAttendance from '../pages/faculty/TakeAttendance';
import MarkInternals from '../pages/faculty/MarkInternals';
import ExamTimetable from '../pages/faculty/ExamTimetable';
import MySchedule from '../pages/faculty/MySchedule';
import MyResearchPapers from '../pages/faculty/MyResearchPapers';
import FacultyNotificationsPage from '../pages/faculty/FacultyNotificationsPage';
import FacultyCertificates from '../pages/faculty/FacultyCertificates';
import { useAuth } from '../contexts/AuthContext';
import RelievingRequest from '../components/faculty/RelievingRequest';
import Clearance from '../pages/faculty/Clearance';

// Lazy load components
const FacultyProfile = lazy(() => import('../components/faculty/Profile/FacultyProfile'));
const MyClass = lazy(() => import('../components/faculty/MyClass/MyClass'));
const FacultyAttendanceRecords = lazy(() => import('../components/faculty/Attendance/FacultyAttendanceRecords'));

// Wrapper component to fetch faculty data and pass to RelievingRequest
const RelievingRequestWrapper = () => {
  const { user, userData } = useAuth();
  const [facultyData, setFacultyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFacultyData = async () => {
      try {
        setLoading(true);
        
        // First, check if we have faculty data in userData
        if (userData?.faculty) {
          setFacultyData(userData.faculty);
          return;
        }

        // If not, try to fetch from faculties table using user's email
        if (user?.email) {
          const { data: facultyData, error: fetchError } = await supabase
            .from('faculties')
            .select(`
              id,
              employee_id,
              full_name,
              designation,
              department_id,
              departments (name)
            `)
            .eq('email', user.email)
            .single();

          if (fetchError) {
            console.error('Error fetching faculty data:', fetchError);
            throw new Error('Failed to load faculty profile. Please try again later.');
          }

          if (!facultyData) {
            throw new Error('Faculty profile not found. Please complete your profile first.');
          }

          const facultyInfo = {
            id: facultyData.id,
            employee_id: facultyData.employee_id,
            full_name: facultyData.full_name,
            designation: facultyData.designation,
            department_id: facultyData.department_id,
            department_name: facultyData.departments?.name || 'N/A'
          };

          setFacultyData(facultyInfo);
        } else {
          throw new Error('User email not found. Please sign in again.');
        }
      } catch (err) {
        console.error('Error in fetchFacultyData:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFacultyData();
  }, [user?.email, userData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        <p className="font-medium">Error loading faculty data</p>
        <p className="text-sm mb-2">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!facultyData) {
    return (
      <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md">
        <p className="font-medium">Profile Incomplete</p>
        <p className="mb-2">Please complete your faculty profile before submitting a relieving request.</p>
        <a 
          href="/faculty/profile" 
          className="inline-block px-4 py-2 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 text-sm"
        >
          Complete Profile
        </a>
      </div>
    );
  }

  return (
    <RelievingRequest 
      faculty={facultyData}
      existingRequest={null}
      onRefresh={() => window.location.reload()}
    />
  );
};

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/faculty/login" state={{ from: location }} replace />;
  }

  // ALLOW BOTH 'faculty' AND 'hod'
  if (!['faculty', 'hod'].includes(user?.role)) {
    return <Navigate to="/faculty/login" state={{ from: location }} replace />;
  }

  return children;
};

// Dashboard components
const DashboardHome = () => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h2 className="text-xl font-semibold mb-4">Welcome to Faculty Dashboard</h2>
    <p className="text-gray-600">Manage your courses, attendance, and grades from here.</p>
  </div>
);

const Courses = () => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h2 className="text-xl font-semibold mb-4">My Courses</h2>
    <p className="text-gray-600">View and manage your courses.</p>
  </div>
);

const Grades = () => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h2 className="text-xl font-semibold mb-4">Gradebook</h2>
    <p className="text-gray-600">Manage student grades.</p>
  </div>
);

const FacultyRoutes = () => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    }>
      <Routes>
        {/* Public routes */}
        <Route path="login" element={<FacultyLogin />} />
        
        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <FacultyDashboard />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="dashboard" element={<Navigate to="/faculty/profile" replace />} />
          <Route path="courses" element={<Courses />} />
          <Route path="attendance" element={
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            }>
              <FacultyAttendanceRecords />
            </Suspense>
          } />
          <Route path="take-attendance" element={
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            }>
              <TakeAttendance />
            </Suspense>
          } />
          <Route path="class" element={
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            }>
              <MyClass />
            </Suspense>
          } />
          <Route path="grades" element={<Grades />} />
          <Route path="profile" element={
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            }>
              <FacultyProfile />
            </Suspense>
          } />
          <Route path="profile/setup" element={
            <Suspense fallback={<div>Loading setup...</div>}>
              <FacultyProfile setupMode={true} />
            </Suspense>
          } />
          <Route path="students" element={
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            }>
              <Students />
            </Suspense>
          } />
          <Route path="mark-internals" element={
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            }>
              <MarkInternals />
            </Suspense>
          } />
          <Route path="exam-timetable" element={
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            }>
              <ExamTimetable />
            </Suspense>
          } />
          <Route path="my-schedule" element={
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            }>
              <MySchedule />
            </Suspense>
          } />
          <Route path="schedule" element={<MySchedule />} />
          <Route path="research-papers" element={<MyResearchPapers />} />
          <Route path="notifications" element={
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            }>
              <FacultyNotificationsPage />
            </Suspense>
          } />
          <Route path="relieving/form" element={
            <ProtectedRoute>
              <Suspense fallback={
                <div className="flex items-center justify-center min-h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              }>
                <RelievingRequestWrapper />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="certificates" element={
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            }>
              <FacultyCertificates />
            </Suspense>
          } />
          <Route path="clearance" element={
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            }>
              <Clearance />
            </Suspense>
          } />
          <Route path="*" element={<Navigate to="/faculty" replace />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/faculty" replace />} />
      </Routes>
    </Suspense>
  );
};

export default FacultyRoutes;