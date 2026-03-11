import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ROLES } from './constants/roles';
import ProtectedRoute from './components/common/ProtectedRoute';
import UserMenu from './components/common/UserMenu';
import StudentSettings from './components/student/StudentSettings';        
import StudentAnnouncements from './components/student/StudentAnnouncements';
import StudentRoutes from './routes/StudentRoutes';
import StudentContext, { StudentProvider, useStudent } from './contexts/StudentContext';

// Layout Components
const Header = lazy(() => import('./components/layout/Header'));
const Footer = lazy(() => import('./components/layout/Footer'));
const AdminSidebar = lazy(() => import('./components/admin/AdminSidebar'));

// Lazy load page components
const HomePage = lazy(() => import('./pages/HomePage'));
const AboutUsPage = lazy(() => import('./pages/AboutUsPage'));
const AdmissionsPage = lazy(() => import('./pages/NewAdmissionsPage'));    
const LoginPage = lazy(() => import('./pages/LoginPage'));
const StudentLoginComponent = lazy(async () => {
  const module = await import('./components/student/StudentLogin');        
  return { default: module.default };
});

// Student Components
const StudentDashboard = lazy(() => import('./components/student/StudentDashboard'));
const StudentOverview = lazy(() => import('./pages/student/StudentOverview'));
const StudentProfile = lazy(() => import('./components/student/StudentProfile'));
const StudentAcademic = lazy(() => import('./components/student/StudentAcademicOverview'));
const StudentAttendance = lazy(() => import('./components/student/StudentAttendance'));
const StudentExaminations = lazy(() => import('./components/student/StudentExaminations'));
const StudentFees = lazy(() => import('./components/student/StudentFees'));
const StudentHostel = lazy(() => import('./components/student/StudentHostel'));
const StudentTransport = lazy(() => import('./components/student/StudentTransport'));
const StudentCareerInsights = lazy(() => import('./components/student/StudentCareerInsights'));
const ResumeUpload = lazy(() => import('./components/student/ResumeUpload'));
const StudentInternships = lazy(() => import('./components/student/StudentInternships'));
const CareerPrepCourses = lazy(() => import('./components/student/CareerPrepCourses'));
const StudentCareerAssistant = lazy(() => import('./components/student/StudentCareerAssistant'));
const StudentNotifications = lazy(() => import('./components/student/StudentNotifications'));
const FacultyDashboard = lazy(() => import('./pages/faculty/FacultyDashboard'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard')); 
const AdminOverview = lazy(() => import('./components/admin/AdminOverview'));
const DriverDashboard = lazy(() => import('./pages/driver/DriverDashboard'));
const AddStudent = lazy(() => import('./components/admin/AddStudent'));

const AdminRoutes = lazy(async () => {
  try {
    const module = await import('./routes/AdminRoutes');
    return { default: module.default };
  } catch (error) {
    console.error('Failed to load AdminRoutes:', error);
    return {
      default: () => (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">
          <h2 className="font-bold text-lg mb-2">Error Loading Admin Panel</h2>
          <p>Failed to load the admin interface. Please try refreshing the page.</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh Page
          </button>
        </div>
      )
    };
  }
});

const FacultyRoutes = lazy(() => import('./routes/FacultyRoutes'));        

// Loading component
const LoadingScreen = ({ fullScreen = true }) => (
  <div className={`flex items-center justify-center ${fullScreen ? 'min-h-screen' : 'py-12'} bg-gray-50`}>
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

// Public route wrapper
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  return children;
};

// Admin layout with sidebar
const AdminLayout = () => (
  <div className="flex min-h-screen bg-gray-50">
    <Suspense fallback={<LoadingScreen />}>
      <div className="fixed inset-y-0 left-0 z-20 w-64 bg-[#1d395e] shadow-lg">
        <div className="h-full bg-[#1d395e]">
          <AdminSidebar />
        </div>
      </div>
    </Suspense>
    <div className="flex-1 flex flex-col min-h-screen ml-64">
      <div className="sticky top-0 z-10 bg-white shadow-sm">
        <Header />
      </div>
      <main className="flex-1 p-6 overflow-y-auto">
        <Suspense fallback={<LoadingScreen fullScreen={false} />}>
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </Suspense>
      </main>
    </div>
    <Toaster position="top-right" />
  </div>
);

// Main app layout
const AppLayout = () => (
  <div className="flex flex-col min-h-screen">
    <Header />
    <main className="flex-grow">
      <Suspense fallback={<LoadingScreen />}>
        <Outlet />
      </Suspense>
    </main>
    <Footer />
    <Toaster position="top-right" />
  </div>
);

// App content with routes
const AppContent = () => {
  const { user } = useAuth();
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutUsPage />} />
        <Route path="admissions" element={<AdmissionsPage />} />
        
        {/* Login Redirects */}
        <Route path="login" element={<Navigate to="/student/login" replace />} />
        <Route path="login/admin" element={<Navigate to="/admin/login" replace />} />
        <Route path="login/student" element={<Navigate to="/student/login" replace />} />
        
        {/* Student Login */}
        <Route 
          path="student/login" 
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <PublicRoute>
                <StudentLoginComponent />
              </PublicRoute>
            </Suspense>
          } 
        />
        
        {/* Admin Login */}
        <Route 
          path="admin/login" 
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } 
        />
        
        {/* Login redirects for consistency */}
        <Route path="login/faculty" element={<Navigate to="/faculty/login" replace />} />
        
        {/* Protected Admin Routes */}
        <Route 
          path="admin/*" 
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]} redirectPath="/admin/login">
              <AdminRoutes />
            </ProtectedRoute>
          }
        />
        
        {/* Faculty Routes - No protection at this level, protection is handled inside FacultyRoutes */}
        <Route 
          path="faculty/*" 
          element={
            <Suspense fallback={<div>Loading faculty portal...</div>}>
              <FacultyRoutes />
            </Suspense>
          }
        />
        
        {/* Student Routes */}
        <Route
          path="student"
          element={
            <ProtectedRoute allowedRoles={[ROLES.STUDENT]} redirectPath="/student/login">
              <StudentProvider>
                <Suspense fallback={<div>Loading student dashboard...</div>}>
                  <StudentDashboard />
                </Suspense>
              </StudentProvider>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/student/dashboard" replace />} />
          <Route path="*" element={<StudentRoutes />} />
        </Route>
        
        {/* Driver Routes */}
        <Route
          path="driver/*"
          element={
            <ProtectedRoute allowedRoles={[ROLES.DRIVER]} redirectPath="/driver/login">
              <DriverDashboard />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
};

// Main App component
const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;