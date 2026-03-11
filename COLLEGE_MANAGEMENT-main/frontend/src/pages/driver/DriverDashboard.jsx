import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TruckIcon, ClockIcon, MapPinIcon, UserGroupIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const DriverDashboard = () => {
  const navigate = useNavigate();
  const [isAvailable, setIsAvailable] = useState(true);
  
  // Mock data for driver's assigned route
  const currentRoute = {
    id: 'R001',
    name: 'Morning North Route',
    vehicle: 'Bus #45 (KA 01 AB 1234)',
    startTime: '07:30 AM',
    endTime: '09:30 AM',
    stops: [
      { id: 1, name: 'Main Bus Stand', time: '07:30 AM', students: 15 },
      { id: 2, name: 'City Center', time: '07:50 AM', students: 8 },
      { id: 3, name: 'Green Park', time: '08:10 AM', students: 12 },
      { id: 4, name: 'University', time: '08:45 AM', students: 0 },
    ]
  };

  const toggleAvailability = () => {
    setIsAvailable(!isAvailable);
    // In a real app, this would update the driver's status in the backend
    console.log(`Driver is now ${!isAvailable ? 'available' : 'unavailable'}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Driver Dashboard</h1>
              <p className="text-sm text-gray-500">Welcome back, John Doe</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={toggleAvailability}
                className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                  isAvailable 
                    ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                }`}
              >
                {isAvailable ? (
                  <>
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Available
                  </>
                ) : (
                  <>
                    <XCircleIcon className="h-5 w-5 mr-2" />
                    Unavailable
                  </>
                )}
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm font-medium text-gray-700"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          {/* Current Route Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Today's Schedule
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  In Progress
                </span>
              </div>
              
              <div className="mt-5 border-t border-gray-200 pt-5">
                <div className="flex items-center mb-4">
                  <TruckIcon className="h-6 w-6 text-gray-400 mr-3" />
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{currentRoute.name}</h4>
                    <p className="text-sm text-gray-500">{currentRoute.vehicle}</p>
                  </div>
                </div>
                
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <ClockIcon className="h-5 w-5 mr-1.5" />
                  <span>{currentRoute.startTime} - {currentRoute.endTime}</span>
                </div>
                
                <h4 className="text-sm font-medium text-gray-900 mb-2">Route Stops</h4>
                <div className="space-y-3">
                  {currentRoute.stops.map((stop, index) => (
                    <div key={stop.id} className="flex items-start">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <MapPinIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{stop.name}</div>
                        <div className="text-sm text-gray-500">{stop.time} • {stop.students} students</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                    <MapPinIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        View Full Route Map
                      </dt>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                    <UserGroupIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Student Roster
                      </dt>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                    <ClockIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Schedule Changes
                      </dt>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                    <TruckIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Vehicle Details
                      </dt>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
