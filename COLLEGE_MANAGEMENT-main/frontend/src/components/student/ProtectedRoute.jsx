import { Navigate, Outlet } from 'react-router-dom';
import { useStudent } from '../../contexts/StudentContext';

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useStudent();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/student/login" replace />;
};

export default ProtectedRoute;
