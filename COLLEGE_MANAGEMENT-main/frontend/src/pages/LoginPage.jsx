import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user, isAuthenticated } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMagicLinkSent, setIsMagicLinkSent] = useState(false);
  const [isPasswordLogin, setIsPasswordLogin] = useState(true);
  
  const loginTitle = 'Login';

  // Handle redirection after successful authentication
  useEffect(() => {
    if (isAuthenticated && user) {
      const role = user.role || 'student'; // Default to student if role is not set
      const rolePaths = {
        admin: '/admin/dashboard',
        student: '/student/dashboard',
        faculty: '/faculty/dashboard',
        parent: '/parent/dashboard',
        driver: '/driver/dashboard'
      };
      
      const targetPath = rolePaths[role] || '/student/dashboard';
      
      // Only redirect if we're not already on the target path
      if (window.location.pathname !== targetPath) {
        console.log(`Redirecting ${role} to ${targetPath}`);
        window.location.href = targetPath;
      }
    }
  }, [isAuthenticated, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!isPasswordLogin) {
        setError('Password login is required');
        setLoading(false);
        return;
      }

      console.log('[LoginPage] Starting login process...');

      // Call the login function from AuthContext
      const result = await login(email, password);

      console.log('[LoginPage] Login result:', result);

      if (!result?.success) {
        throw new Error(result?.error || 'Login failed');
      }

      const loggedInUser = result.user || {};
      console.log('[LoginPage] Login successful, user:', loggedInUser);

      // Get role with fallback to 'student' if not set
      const userRole = loggedInUser.role || 'student';

      // Show success message
      toast.success(`Login successful! Redirecting to ${userRole} dashboard...`);

      // Define role paths
      const rolePaths = {
        admin: '/admin/dashboard',
        student: '/student/dashboard',
        faculty: '/faculty/dashboard',
        parent: '/parent/dashboard',
        driver: '/driver/dashboard'
      };

      // Get target path with fallback to student dashboard
      const targetPath = rolePaths[userRole] || '/student/dashboard';

      console.log('[LoginPage] Redirecting to:', targetPath);

      // Use a small delay to ensure state is updated before redirect
      setTimeout(() => {
        navigate(targetPath, { replace: true });
      }, 100);

    } catch (err) {
      console.error('[LoginPage] Login error:', err);
      setError(err.message || 'An error occurred during login');
      toast.error(err.message || 'Login failed');
      // Sign out from Supabase if there's an error
      await supabase.auth.signOut();
      setLoading(false);
    }
  };

  if (isMagicLinkSent) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {loginTitle}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We've sent a magic link to <span className="font-medium">{email}</span>.
            <br />
            Click the link to sign in to your account.
          </p>
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsMagicLinkSent(false);
                setError('');
              }}
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Back to login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {loginTitle}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            {isPasswordLogin && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required={isPasswordLogin}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              {isPasswordLogin && (
                <div className="text-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPasswordLogin(false);
                      setError('');
                    }}
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Use magic link
                  </button>
                </div>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading 
                  ? 'Signing in...' 
                  : isPasswordLogin 
                    ? 'Sign in with password' 
                    : 'Send magic link'}
              </button>
            </div>
          </form>

          {!isPasswordLogin && (
            <div className="mt-4 text-center text-sm">
              <button
                type="button"
                onClick={() => {
                  setIsPasswordLogin(true);
                  setError('');
                }}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign in with password instead
              </button>
            </div>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div>
                <button
                  type="button"
                  onClick={() => {
                    supabase.auth.signInWithOAuth({
                      provider: 'google',
                      options: {
                        redirectTo: `${window.location.origin}/auth/callback`,
                        queryParams: {
                          access_type: 'offline',
                          prompt: 'consent',
                        },
                      },
                    });
                  }}
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Sign in with Google</span>
                  <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                  </svg>
                </button>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => {
                    supabase.auth.signInWithOAuth({
                      provider: 'azure',
                      options: {
                        redirectTo: `${window.location.origin}/auth/callback`,
                      },
                    });
                  }}
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Sign in with Microsoft</span>
                  <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M7.462 0H0v7.19h7.465c3.213 0 4.29-1.55 4.29-3.595C11.756 1.39 10.674 0 7.462 0zM7.1 5.5H2.456V1.6H7.1c1.477 0 2.41.65 2.41 1.974C9.51 4.852 8.577 5.5 7.1 5.5zM7.462 8.81H0V16h7.465c3.213 0 4.29-1.55 4.29-3.595 0-2.045-1.076-3.595-4.293-3.595zM7.1 14.4H2.456v-3.9H7.1c1.476 0 2.41.65 2.41 1.973C9.51 13.75 8.577 14.4 7.1 14.4zM16 8.81h-4.5v1.6h4.5v1.6h-4.5v1.6h4.5V16h-4.5v-1.6h4.5V8.81z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
