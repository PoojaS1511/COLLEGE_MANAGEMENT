import React, { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { API_URL } from '../../config';

const LoginForm = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { role: urlRole } = useParams();
  const { login: authLogin } = useAuth();

  const getRoleTitle = () => {
    const role = urlRole || 'student';
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'teacher':
        return 'Faculty';
      case 'student':
        return 'Student';
      case 'parent':
        return 'Parent';
      case 'driver':
        return 'Driver';
      case 'transport_admin':
        return 'Transport Admin';
      default:
        return 'User';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!userId) {
      setError('Please enter a User ID or Email');
      setLoading(false);
      return;
    }

    // Check if password is required (for non-admin logins)
    const isAdminLogin = userId.toLowerCase().includes('admin');
    if (!isAdminLogin && !password) {
      setError('Password is required');
      setLoading(false);
      return;
    }

    try {
      // First try to authenticate with Supabase directly
      try {
        await authLogin(userId, password);
      } catch (error) {
        // If Supabase auth fails with invalid credentials, try the Flask API as fallback
        if (error.message.includes('incorrect') || error.message.includes('Invalid login')) {
          console.log('Supabase auth failed, trying Flask API...');
          
          const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: userId.trim(),
              password: isAdminLogin ? (password || 'dummy-password') : password.trim()
            })
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Login failed');
          }

          const result = await response.json();

          if (!result.success) {
            throw new Error(result.message || 'Login failed');
          }

          // Extract user data from response
          const { user, session } = result;
          const role = user.role || 'student';
          const name = user.name || user.full_name || 'User';

          // Show success message
          toast.success(`Welcome, ${name}!`);

          // Handle role-specific redirects
          if (role === 'teacher' || role === 'faculty') {
            const redirectUrl = import.meta.env.VITE_FACULTY_APP_URL || 'http://localhost:8081';
            console.log('Redirecting to faculty app:', redirectUrl);
            // Store user data before redirect
            const userData = {
              id: user.id || userId,
              email: user.email || `${userId}@${role}.com`,
              role: role,
              full_name: name,
              isAuthenticated: true
            };
            sessionStorage.setItem('userData', JSON.stringify(userData));
            localStorage.setItem('userData', JSON.stringify(userData));
            window.location.replace(redirectUrl);
            return;
          }

          // Verify role if specified in URL
          if (urlRole && role !== urlRole && urlRole !== 'faculty') {
            throw new Error(`You don't have permission to access the ${getRoleTitle()} portal`);
          }
        } else {
          // Re-throw other Supabase errors
          throw error;
        }
      }

    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const roleTitle = getRoleTitle();
  const pageTitle = urlRole ? `${roleTitle} Login` : 'Login';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {pageTitle}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your {roleTitle} account
          </p>
        </div>
        
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="user-id" className="sr-only">
                User ID
              </label>
              <input
                id="user-id"
                name="user_id"
                type="text"
                autoComplete="username"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="User ID (e.g., STU202510001 or admin@college.edu)"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm pr-10"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <EyeIcon className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#1d395e] hover:bg-[#0f1f3a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1d395e] ${
                loading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign in with Password'
              )}
            </button>
          </div>
        </form>
        
        <div className="text-center text-sm">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <a href="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
