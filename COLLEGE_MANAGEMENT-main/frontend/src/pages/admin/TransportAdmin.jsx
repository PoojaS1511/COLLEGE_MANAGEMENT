import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { 
  TruckIcon, 
  MapPinIcon, 
  UserGroupIcon, 
  UserIcon, 
  HomeIcon, 
  ArrowPathIcon, 
  ExclamationTriangleIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';

const TransportAdmin = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const fleetFlowUrl = 'http://localhost:3000/dashboard';
  
  // Check if Fleet Flow is accessible
  useEffect(() => {
    const checkFleetFlow = async () => {
      try {
        // Try to fetch the root URL first
        const response = await fetch('http://localhost:3000', { 
          method: 'GET',
          mode: 'no-cors', // This is important for CORS issues
          cache: 'no-cache'
        });
        
        // If we get here, the server is running
        const newWindow = window.open(fleetFlowUrl, '_blank');
        
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
          // Fallback to current window if popup is blocked
          window.location.href = fleetFlowUrl;
        } else {
          // Small delay before navigating back to ensure the new tab has focus
          setTimeout(() => {
            navigate('/admin/dashboard');
          }, 1000);
        }
      } catch (err) {
        console.error('Error connecting to Fleet Flow:', err);
        setError('Unable to connect to the Fleet Flow application. Please ensure it is running on http://localhost:3000');
      } finally {
        setIsLoading(false);
      }
    };

    checkFleetFlow();
  }, [navigate]);

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    window.location.reload();
  };

  const handleOpenInNewTab = () => {
    window.open(fleetFlowUrl, '_blank');
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin/transport', icon: HomeIcon, current: true },
    { name: 'Routes', href: '/admin/transport/routes', icon: MapPinIcon, current: false },
    { name: 'Vehicles', href: '/admin/transport/vehicles', icon: TruckIcon, current: false },
    { name: 'Drivers', href: '/admin/transport/drivers', icon: UserIcon, current: false },
    { name: 'Students', href: '/admin/transport/students', icon: UserGroupIcon, current: false },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <ArrowPathIcon className="mx-auto h-12 w-12 text-royal-500 animate-spin" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Connecting to Fleet Flow...</h3>
          <p className="mt-1 text-sm text-gray-500">Please wait while we connect to the transport management system.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-600" aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Connection Error</h2>
          <p className="text-gray-600">
            {error}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-royal-600 hover:bg-royal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-royal-500"
            >
              <ArrowPathIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Try again
            </button>
            <button
              type="button"
              onClick={handleOpenInNewTab}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-royal-500"
            >
              <ArrowTopRightOnSquareIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Open in new tab
            </button>
          </div>
          <div className="mt-6 text-sm text-gray-500">
            <p>If the issue persists, please verify that:</p>
            <ul className="list-disc text-left mt-2 space-y-1 max-w-xs mx-auto">
              <li>The Fleet Flow server is running on port 3000</li>
              <li>You have the correct URL: <code className="bg-gray-100 px-1 rounded">http://localhost:3000</code></li>
              <li>There are no browser extensions blocking the connection</li>
              <li>Your network connection is stable</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-xl font-bold text-gray-900">Transport Management</h1>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1 bg-white">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    item.current
                      ? 'bg-royal-50 text-royal-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                >
                  <item.icon
                    className={`${
                      item.current ? 'text-royal-500' : 'text-gray-400 group-hover:text-gray-500'
                    } mr-3 flex-shrink-0 h-6 w-6`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto focus:outline-none">
        <main className="flex-1 relative pb-8 z-0 overflow-y-auto">
          <div className="bg-white shadow">
            <div className="px-4 sm:px-6 lg:max-w-7xl lg:mx-auto lg:px-8">
              <div className="py-6 md:flex md:items-center md:justify-between">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                    Transport Management
                  </h1>
                </div>
                <div className="mt-4 flex md:mt-0 md:ml-4">
                  <Link
                    to="/admin/transport/add-route"
                    className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-royal-600 hover:bg-royal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-royal-500"
                  >
                    Add New Route
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <Outlet />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TransportAdmin;
