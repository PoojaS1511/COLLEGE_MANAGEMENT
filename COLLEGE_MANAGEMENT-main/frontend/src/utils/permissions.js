import { useAuth } from '../contexts/AuthContext';

// Define all available permissions
export const PERMISSIONS = {
  // User management
  MANAGE_USERS: 'manage_users',
  VIEW_USERS: 'view_users',
  
  // Course management
  MANAGE_COURSES: 'manage_courses',
  VIEW_COURSES: 'view_courses',
  
  // Subject management
  MANAGE_SUBJECTS: 'manage_subjects',
  VIEW_SUBJECTS: 'view_subjects',
  
  // Faculty management
  MANAGE_FACULTY: 'manage_faculty',
  VIEW_FACULTY: 'view_faculty',
  
  // Student management
  MANAGE_STUDENTS: 'manage_students',
  VIEW_STUDENTS: 'view_students',
  
  // Exam management
  MANAGE_EXAMS: 'manage_exams',
  VIEW_EXAMS: 'view_exams',
  
  // Marks management
  MANAGE_MARKS: 'manage_marks',
  VIEW_MARKS: 'view_marks',
  
  // Attendance management
  MANAGE_ATTENDANCE: 'manage_attendance',
  VIEW_ATTENDANCE: 'view_attendance',
  
  // Fee management
  MANAGE_FEES: 'manage_fees',
  VIEW_FEES: 'view_fees',
  
  // Payment management
  MANAGE_PAYMENTS: 'manage_payments',
  VIEW_PAYMENTS: 'view_payments',
  
  // Reports
  VIEW_REPORTS: 'view_reports',
  
  // Notifications
  MANAGE_NOTIFICATIONS: 'manage_notifications',
  SEND_NOTIFICATIONS: 'send_notifications',
  
  // Settings
  MANAGE_SETTINGS: 'manage_settings',
};

// Hook to check if current user has a specific permission
export const usePermission = (permission) => {
  const { user } = useAuth();
  
  if (!user || !user.permissions) {
    return false;
  }
  
  return user.permissions[permission] === true;
};

// Component to conditionally render based on permissions
export const RequirePermission = ({ permission, children, fallback = null }) => {
  const hasPermission = usePermission(permission);
  
  if (!hasPermission) {
    return fallback;
  }
  
  return children;
};

// HOC for class components
export const withPermission = (permission) => (WrappedComponent) => {
  return function WithPermission(props) {
    const hasPermission = usePermission(permission);
    
    if (!hasPermission) {
      return null;
    }
    
    return <WrappedComponent {...props} />;
  };
};
