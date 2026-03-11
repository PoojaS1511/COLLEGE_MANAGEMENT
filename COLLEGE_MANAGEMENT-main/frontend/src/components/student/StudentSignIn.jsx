import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaLinkedin, FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const StudentSignIn = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email) => {
    // More comprehensive email regex that handles most common cases
    const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return re.test(email);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Prevent default behavior that might trigger browser validation
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Convert email to lowercase and trim whitespace
    const email = formData.email.trim().toLowerCase();
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address (e.g., example@domain.com)';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling
    
    // Manually validate the form
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // TODO: Replace with actual authentication logic
      console.log('Login attempt with:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // On successful login
      toast.success('Login successful!');
      navigate('/dashboard'); // Redirect to dashboard on success
      
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-indigo-600">Cube Arts & Engineering</h1>
            <span className="ml-4 text-gray-500">Excellence in Education</span>
          </div>
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-700 hover:text-indigo-600">Home</Link>
            <Link to="/admissions" className="text-gray-700 hover:text-indigo-600">Admissions</Link>
            <Link to="/about" className="text-gray-700 hover:text-indigo-600">About Us</Link>
            <Link to="/apply" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Apply Now</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Cube Arts & Engineering</h2>
            <p className="text-xl text-gray-600">Excellence in Education</p>
          </div>

          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-8">
              <h3 className="text-2xl font-semibold text-gray-800 text-center mb-8">Student Sign in</h3>
              <p className="text-center text-gray-600 mb-6">Or <span className="text-indigo-600 font-medium">select a different login type</span></p>
              
              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    {errors.email && (
                      <span className="text-sm text-red-600">{errors.email}</span>
                    )}
                  </div>
                  <input
                    type="text"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    } rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                    placeholder="Enter your email"
                    autoComplete="username"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'email-error' : ''}
                  />
                  {errors.email && (
                    <p id="email-error" className="mt-1 text-sm text-red-600">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <a href="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-500">
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border ${
                        errors.password ? 'border-red-500' : 'border-gray-300'
                      } rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pr-10`}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      aria-invalid={!!errors.password}
                      aria-describedby={errors.password ? 'password-error' : ''}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.password && (
                    <p id="password-error" className="mt-1 text-sm text-red-600">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                      Keep me signed in
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    isLoading
                      ? 'bg-indigo-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </button>
                
                <div className="text-center text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                    Sign up
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Cube Arts & Engineering</h3>
              <p className="text-gray-300">
                Empowering students with quality technical education and industry-ready skills for a successful career in engineering and technology.
              </p>
              <div className="flex space-x-4 mt-4">
                <a href="#" className="text-gray-300 hover:text-white">
                  <FaFacebook size={20} />
                </a>
                <a href="#" className="text-gray-300 hover:text-white">
                  <FaTwitter size={20} />
                </a>
                <a href="#" className="text-gray-300 hover:text-white">
                  <FaLinkedin size={20} />
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="/admissions" className="text-gray-300 hover:text-white">Admissions</a></li>
                <li><a href="/results" className="text-gray-300 hover:text-white">Results</a></li>
                <li><a href="/fee-portal" className="text-gray-300 hover:text-white">Fee Portal</a></li>
                <li><a href="/library" className="text-gray-300 hover:text-white">Library</a></li>
                <li><a href="/placements" className="text-gray-300 hover:text-white">Placements</a></li>
                <li><a href="/alumni" className="text-gray-300 hover:text-white">Alumni</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Departments</h4>
              <ul className="space-y-2">
                <li><a href="/departments/computer-science" className="text-gray-300 hover:text-white">Computer Science</a></li>
                <li><a href="/departments/electronics" className="text-gray-300 hover:text-white">Electronics & Communication</a></li>
                <li><a href="/departments/mechanical" className="text-gray-300 hover:text-white">Mechanical Engineering</a></li>
                <li><a href="/departments/civil" className="text-gray-300 hover:text-white">Civil Engineering</a></li>
                <li><a href="/departments/electrical" className="text-gray-300 hover:text-white">Electrical Engineering</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
              <address className="not-italic">
                <p className="text-gray-300">Cube Arts and Engineering College</p>
                <p className="text-gray-300">123 Education Street</p>
                <p className="text-gray-300">Chennai, Tamil Nadu 600001</p>
                <p className="text-gray-300 mt-2">+91 44 1234 5678</p>
                <p className="text-gray-300">info@cubearts.edu.in</p>
              </address>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-300 text-sm">© 2025 Cube Arts and Engineering College. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="/privacy-policy" className="text-gray-300 hover:text-white text-sm">Privacy Policy</a>
              <span className="text-gray-500">•</span>
              <a href="/terms" className="text-gray-300 hover:text-white text-sm">Terms of Service</a>
              <span className="text-gray-500">•</span>
              <a href="/sitemap" className="text-gray-300 hover:text-white text-sm">Sitemap</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StudentSignIn;
