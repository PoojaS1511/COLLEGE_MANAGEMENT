import React, { useState, useEffect } from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon, 
  ExclamationCircleIcon,
  ArrowPathIcon 
} from '@heroicons/react/24/outline';
import HostelService from '../../services/hostelService';

const MessStatus = () => {
  const [messStatus, setMessStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchMessStatus = async () => {
    try {
      setLoading(true);
      const data = await HostelService.getMessStatus();
      setMessStatus(data);
      setLastUpdated(new Date().toLocaleTimeString());
      setError(null);
    } catch (err) {
      console.error('Error fetching mess status:', err);
      setError('Failed to load mess status. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessStatus();
  }, []);

  const getStatusIcon = (status) => {
    const statusIcons = {
      'serving': <CheckCircleIcon className="h-5 w-5 text-green-500" />,
      'not_serving': <XCircleIcon className="h-5 w-5 text-red-500" />,
      'preparing': <ClockIcon className="h-5 w-5 text-yellow-500" />,
      'delayed': <ExclamationCircleIcon className="h-5 w-5 text-orange-500" />
    };
    return statusIcons[status] || <ClockIcon className="h-5 w-5 text-gray-400" />;
  };

  const getStatusText = (status) => {
    const statusTexts = {
      'serving': 'Serving',
      'not_serving': 'Not Serving',
      'preparing': 'Preparing',
      'delayed': 'Delayed'
    };
    return statusTexts[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      'serving': 'bg-green-100 text-green-800',
      'not_serving': 'bg-red-100 text-red-800',
      'preparing': 'bg-yellow-100 text-yellow-800',
      'delayed': 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getMealTiming = (mealType) => {
    const timings = {
      'breakfast': '7:00 AM - 10:00 AM',
      'lunch': '12:30 PM - 2:30 PM',
      'dinner': '7:30 PM - 9:30 PM'
    };
    return timings[mealType.toLowerCase()] || '';
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Mess Status</h2>
        <div className="flex items-center space-x-2">
          {lastUpdated && (
            <span className="text-sm text-gray-500">
              Last updated: {lastUpdated}
            </span>
          )}
          <button
            onClick={fetchMessStatus}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
            title="Refresh"
          >
            <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircleIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={fetchMessStatus}
                className="mt-2 text-sm font-medium text-red-700 hover:text-red-600"
              >
                Retry <span aria-hidden="true">&rarr;</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Meal
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timings
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Updated
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                  Loading mess status...
                </td>
              </tr>
            ) : messStatus.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                  No mess status information available.
                </td>
              </tr>
            ) : (
              messStatus.map((item) => (
                <tr key={item.meal_type} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-blue-100">
                        <span className="text-blue-600 font-medium">
                          {item.meal_type.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 capitalize">
                          {item.meal_type}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(item.status)}
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {getStatusText(item.status)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getMealTiming(item.meal_type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(item.updated_at).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="mt-6 border-t border-gray-200 pt-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Status Legend:</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-xs text-gray-600">Serving</span>
          </div>
          <div className="flex items-center">
            <XCircleIcon className="h-4 w-4 text-red-500 mr-1" />
            <span className="text-xs text-gray-600">Not Serving</span>
          </div>
          <div className="flex items-center">
            <ClockIcon className="h-4 w-4 text-yellow-500 mr-1" />
            <span className="text-xs text-gray-600">Preparing</span>
          </div>
          <div className="flex items-center">
            <ExclamationCircleIcon className="h-4 w-4 text-orange-500 mr-1" />
            <span className="text-xs text-gray-600">Delayed</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessStatus;
