import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ComputerDesktopIcon,
  WifiIcon,
  VideoCameraIcon,
  SpeakerWaveIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  Battery50Icon,
  SignalIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  WrenchScrewdriverIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import SmartClassroomService from '../../../services/smartClassroomService';
import { toast } from 'react-hot-toast';

const StatusBadge = ({ status }) => {
  const statusConfig = {
    active: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      icon: <CheckCircleIcon className="h-4 w-4" />,
      label: 'Active'
    },
    idle: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      icon: <ClockIcon className="h-4 w-4" />,
      label: 'Idle'
    },
    maintenance: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      icon: <WrenchScrewdriverIcon className="h-4 w-4" />,
      label: 'Maintenance'
    },
    offline: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      icon: <XCircleIcon className="h-4 w-4" />,
      label: 'Offline'
    }
  };

  const config = statusConfig[status] || statusConfig.offline;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.icon}
      <span className="ml-1">{config.label}</span>
    </span>
  );
};

const EquipmentStatus = ({ status }) => {
  const statusIcons = {
    online: <CheckCircleIcon className="h-5 w-5 text-green-500" />,
    offline: <XCircleIcon className="h-5 w-5 text-red-500" />,
    warning: <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />,
    maintenance: <WrenchScrewdriverIcon className="h-5 w-5 text-blue-500" />
  };

  return statusIcons[status] || statusIcons.offline;
};

const SmartClassroomTracking = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    building: 'all',
    search: ''
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch classrooms data from Supabase
  const fetchClassrooms = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await SmartClassroomService.getSmartClassrooms();

      if (response.success) {
        setClassrooms(response.data);
      } else {
        setError(response.error);
        toast.error('Failed to load smart classrooms');
      }
    } catch (error) {
      console.error('Error fetching classrooms:', error);
      setError('Failed to load smart classrooms');
      toast.error('Failed to load smart classrooms');
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchClassrooms();
  }, []);

  // Filter classrooms based on filters
  const filteredClassrooms = classrooms.filter(classroom => {
    return (
      (filters.status === 'all' || classroom.status === filters.status) &&
      (filters.building === 'all' || classroom.building === filters.building) &&
      (filters.search === '' ||
       classroom.name.toLowerCase().includes(filters.search.toLowerCase()) ||
       (classroom.currentClass && classroom.currentClass.name.toLowerCase().includes(filters.search.toLowerCase())))
    );
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    await fetchClassrooms();
    setIsRefreshing(false);
  };

  const getBuildingClassrooms = (building) => {
    return classrooms.filter(c => c.building === building);
  };

  const buildings = [...new Set(classrooms.map(c => c.building))];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Smart Classroom Tracking</h1>
            <p className="text-gray-600">Monitor and manage smart classroom equipment in real-time</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={refreshData}
              disabled={isRefreshing}
              className={`inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <ArrowPathIcon className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-2 text-gray-600">Loading smart classrooms...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <XCircleIcon className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Filters - only show when not loading */}
        {!loading && !error && (
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  id="status"
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="idle">Idle</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
              <div>
                <label htmlFor="building" className="block text-sm font-medium text-gray-700 mb-1">Building</label>
                <select
                  id="building"
                  name="building"
                  value={filters.building}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="all">All Buildings</option>
                  {buildings.map(building => (
                    <option key={building} value={building}>Building {building}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="search"
                    id="search"
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    placeholder="Search classrooms or classes..."
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Classrooms Grid - only show when not loading and no error */}
        {!loading && !error && (
          <>
            {/* Classrooms Grid */}
            <div className="grid grid-cols-1 gap-6">
              {filteredClassrooms.map(classroom => (
                <div key={classroom.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                  <div className="p-5">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-100 text-indigo-600">
                            <ComputerDesktopIcon className="h-6 w-6" />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center">
                            <h3 className="text-lg font-semibold text-gray-900">{classroom.name}</h3>
                            <span className="ml-2">
                              <StatusBadge status={classroom.status} />
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            Building {classroom.building}, Floor {classroom.floor} • Last active: {classroom.last_active ? new Date(classroom.last_active).toLocaleString() : 'Never'}
                          </p>
                        </div>
                      </div>

                      {classroom.currentClass ? (
                        <div className="mt-4 md:mt-0 md:ml-4 md:flex-shrink-0">
                          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            <div className="flex-shrink-0 -ml-0.5 mr-1.5 h-2 w-2 rounded-full bg-green-500"></div>
                            In Use
                          </div>
                          <p className="mt-1 text-sm text-gray-600">
                            {classroom.currentClass.name} • {classroom.currentClass.faculty}
                          </p>
                          <p className="text-xs text-gray-500">
                            {classroom.currentClass.time} • {classroom.currentClass.days}
                          </p>
                        </div>
                      ) : (
                        <div className="mt-4 md:mt-0 md:ml-4 md:flex-shrink-0">
                          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                            <div className="flex-shrink-0 -ml-0.5 mr-1.5 h-2 w-2 rounded-full bg-gray-400"></div>
                            Available
                          </div>
                          {classroom.nextClass && (
                            <p className="mt-1 text-sm text-gray-600">
                              Next: {classroom.nextClass.name} at {classroom.nextClass.time}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Equipment Status */}
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Equipment Status</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {classroom.equipment?.map((equip, index) => (
                          <div key={index} className="flex items-center p-3 bg-gray-50 rounded-md">
                            <div className="flex-shrink-0">
                              <EquipmentStatus status={equip.status} />
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">{equip.name}</p>
                              <p className="text-xs text-gray-500">{equip.status.charAt(0).toUpperCase() + equip.status.slice(1)}</p>
                            </div>
                          </div>
                        )) || (
                          <p className="text-sm text-gray-500 col-span-full">No equipment data available</p>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 pt-5 border-t border-gray-200">
                      <div className="flex justify-end space-x-3">
                        <button
                          type="button"
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <WrenchScrewdriverIcon className="h-4 w-4 mr-2" />
                          Maintenance
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <PencilIcon className="h-4 w-4 mr-2" />
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredClassrooms.length === 0 && (
              <div className="text-center py-12">
                <ComputerDesktopIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No smart classrooms found</h3>
                <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SmartClassroomTracking;
