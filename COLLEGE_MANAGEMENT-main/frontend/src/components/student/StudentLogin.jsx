import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

function StudentLogin() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const from = location.state?.from?.pathname || '/student/dashboard';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // Prevent multiple submissions

    setLoading(true);
    setError('');

    try {
      console.log('[StudentLogin] Starting login process...');

      // Use the AuthContext's login function
      const { success, error: loginError, user } = await login(formData.email, formData.password);

      console.log('[StudentLogin] Login result:', { success, user });

      if (!success) {
        throw new Error(loginError || 'Login failed. Please check your credentials.');
      }

      // If we get here, authentication was successful
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('email', formData.email.trim().toLowerCase())
        .single();

      console.log('[StudentLogin] Student data:', studentData);

      // Check if student exists
      if (studentError || !studentData) {
        console.warn('[StudentLogin] Student not found in database:', studentError);
        await supabase.auth.signOut(); // Sign out if student not found
        throw new Error('No student found with this email.');
      }

      // Update last login time (don't wait for this to complete)
      supabase
        .from('students')
        .update({ last_login: new Date().toISOString() })
        .eq('email', formData.email.trim().toLowerCase())
        .then(({ error: updateError }) => {
          if (updateError) {
            console.warn('Failed to update last login time:', updateError);
          }
        });

      // Show success message
      toast.success('Login successful! Redirecting to dashboard...');

      // Redirect based on user role
      const redirectPath = user?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard';

      console.log('[StudentLogin] Redirecting to:', redirectPath);

      // Use a small delay to ensure state is updated before redirect
      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 100);

    } catch (err) {
      console.error('[StudentLogin] Login error:', err);
      setError(err.message || 'Failed to login. Please check your credentials.');
      toast.error(err.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Student Login
          </h2>
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export { StudentLogin as default };
