import { useAuth } from '../contexts/AuthContext';
import { hasPermission, hasAnyPermission, hasAllPermissions } from '../constants/roles';

/**
 * Custom hook to check user permissions
 * @returns {Object} Object with permission checking functions
 */
const usePermissions = () => {
  const { user } = useAuth();

  /**
   * Check if the current user has a specific permission
   * @param {string} permission - The permission to check
   * @returns {boolean} Whether the user has the permission
   */
  const can = (permission) => {
    return hasPermission(user, permission);
  };

  /**
   * Check if the current user has any of the specified permissions
   * @param {string[]} permissions - Array of permissions to check
   * @returns {boolean} Whether the user has any of the permissions
   */
  const canAny = (permissions) => {
    return hasAnyPermission(user, permissions);
  };

  /**
   * Check if the current user has all of the specified permissions
   * @param {string[]} permissions - Array of permissions to check
   * @returns {boolean} Whether the user has all of the permissions
   */
  const canAll = (permissions) => {
    return hasAllPermissions(user, permissions);
  };

  return {
    can,
    canAny,
    canAll,
  };
};

export default usePermissions;
