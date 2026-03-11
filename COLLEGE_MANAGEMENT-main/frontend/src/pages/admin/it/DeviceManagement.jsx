import React, { useState } from 'react';
import { 
  DevicePhoneMobileIcon, 
  ComputerDesktopIcon, 
  DeviceTabletIcon, 
  PrinterIcon,
  ClockIcon,
  CheckCircleIcon,
  XMarkIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const DeviceManagement = () => {
  // Mock data for devices
  const [devices, setDevices] = useState([
    {
      id: 1,
      deviceId: 'DEV-2023-001',
      name: 'Dell XPS 15',
      type: 'Laptop',
      model: 'XPS 15 9520',
      serialNumber: 'CN-1234567-7890-AB',
      status: 'Available',
      assignedTo: null,
      location: 'Computer Lab A',
      lastChecked: '2025-10-15T14:30:00',
      warrantyExpiry: '2026-05-20',
      os: 'Windows 11 Pro',
      ram: '32GB',
      storage: '1TB SSD',
      processor: 'Intel i9-12900H',
      purchaseDate: '2023-05-20',
      purchaseCost: 2499.99,
      notes: 'Excellent condition, no issues reported.'
    },
    {
      id: 2,
      deviceId: 'DEV-2023-002',
      name: 'iPad Pro 12.9"',
      type: 'Tablet',
      model: 'A2377',
      serialNumber: 'DLXK12ABCDEF',
      status: 'Assigned',
      assignedTo: 'S2023001 - John Doe',
      location: 'Faculty Office B12',
      lastChecked: '2025-10-16T09:15:00',
      warrantyExpiry: '2025-11-15',
      os: 'iPadOS 17',
      ram: '8GB',
      storage: '256GB',
      processor: 'Apple M1',
      purchaseDate: '2023-01-15',
      purchaseCost: 1099.99,
      notes: 'Assigned to faculty member. Screen protector applied.'
    },
    {
      id: 3,
      deviceId: 'DEV-2023-003',
      name: 'HP LaserJet Pro',
      type: 'Printer',
      model: 'M404dn',
      serialNumber: 'CN1234ABCD5678',
      status: 'Maintenance',
      assignedTo: null,
      location: 'Library - 2nd Floor',
      lastChecked: '2025-10-10T11:20:00',
      warrantyExpiry: '2024-03-10',
      os: 'N/A',
      ram: '256MB',
      storage: 'N/A',
      processor: '600 MHz',
      purchaseDate: '2023-03-10',
      purchaseCost: 349.99,
      notes: 'Paper jam issue reported. Scheduled for maintenance on 2025-10-20.'
    },
    {
      id: 4,
      deviceId: 'DEV-2023-004',
      name: 'Lenovo ThinkPad X1 Carbon',
      type: 'Laptop',
      model: '20R1S00E00',
      serialNumber: 'PF-3ABCDE',
      status: 'In Use',
      assignedTo: 'F2023001 - Dr. Sarah Chen',
      location: 'Science Building - Room 205',
      lastChecked: '2025-10-17T16:45:00',
      warrantyExpiry: '2025-08-22',
      os: 'Windows 11 Pro',
      ram: '16GB',
      storage: '512GB SSD',
      processor: 'Intel i7-1260P',
      purchaseDate: '2023-02-22',
      purchaseCost: 1899.99,
      notes: 'Standard faculty issue laptop. No reported issues.'
    },
    {
      id: 5,
      deviceId: 'DEV-2023-005',
      name: 'Apple MacBook Air',
      type: 'Laptop',
      model: 'A2337',
      serialNumber: 'C02X1234JHD5',
      status: 'Available',
      assignedTo: null,
      location: 'IT Department',
      lastChecked: '2025-10-18T10:30:00',
      warrantyExpiry: '2026-01-15',
      os: 'macOS Ventura',
      ram: '8GB',
      storage: '256GB SSD',
      processor: 'Apple M2',
      purchaseDate: '2024-01-15',
      purchaseCost: 999.99,
      notes: 'New device, ready for assignment.'
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    location: 'all',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [view, setView] = useState('list'); // 'list' or 'grid'
  const [sortConfig, setSortConfig] = useState({ key: 'deviceId', direction: 'asc' });

  // Get unique values for filters
  const deviceTypes = ['all', ...new Set(devices.map(device => device.type))];
  const statuses = ['all', 'Available', 'Assigned', 'In Use', 'Maintenance', 'Retired'];
  const locations = ['all', ...new Set(devices.map(device => device.location).filter(Boolean))];

  // Apply filters and search
  const filteredDevices = devices.filter(device => {
    const matchesSearch = 
      device.deviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (device.assignedTo && device.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filters.type === 'all' || device.type === filters.type;
    const matchesStatus = filters.status === 'all' || device.status === filters.status;
    const matchesLocation = filters.location === 'all' || device.location === filters.location;
    
    return matchesSearch && matchesType && matchesStatus && matchesLocation;
  });

  // Sort devices
  const sortedDevices = [...filteredDevices].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const resetFilters = () => {
    setFilters({
      type: 'all',
      status: 'all',
      location: 'all',
    });
    setSearchTerm('');
  };

  const handleStatusChange = (deviceId, newStatus) => {
    setDevices(devices.map(device => 
      device.id === deviceId ? { ...device, status: newStatus } : device
    ));
  };

  const handleCheckIn = (deviceId) => {
    setDevices(devices.map(device => 
      device.id === deviceId 
        ? { 
            ...device, 
            status: 'Available',
            assignedTo: null,
            lastChecked: new Date().toISOString()
          } 
        : device
    ));
  };

  const handleCheckOut = (device) => {
    const userName = prompt('Enter the name of the person checking out this device:');
    if (userName) {
      setDevices(devices.map(d => 
        d.id === device.id 
          ? { 
              ...d, 
              status: 'Assigned',
              assignedTo: userName,
              lastChecked: new Date().toISOString()
            } 
          : d
      ));
    }
  };

  const handleDelete = (deviceId) => {
    if (window.confirm('Are you sure you want to delete this device? This action cannot be undone.')) {
      setDevices(devices.filter(device => device.id !== deviceId));
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-800';
      case 'Assigned':
      case 'In Use':
        return 'bg-blue-100 text-blue-800';
      case 'Maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'Retired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDeviceIcon = (type) => {
    switch (type) {
      case 'Laptop':
        return <ComputerDesktopIcon className="h-6 w-6 text-blue-500" />;
      case 'Tablet':
        return <DeviceTabletIcon className="h-6 w-6 text-purple-500" />;
      case 'Printer':
        return <PrinterIcon className="h-6 w-6 text-gray-500" />;
      case 'Phone':
        return <DevicePhoneMobileIcon className="h-6 w-6 text-green-500" />;
      default:
        return <DevicePhoneMobileIcon className="h-6 w-6 text-gray-400" />;
    }
  };

  return (
    <div>
      {/* Search, Filters, and Actions */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="relative rounded-md shadow-sm w-full sm:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="Search devices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FunnelIcon className="-ml-1 mr-2 h-5 w-5 text-gray-400" />
              Filters
            </button>
            <div className="relative inline-block text-left">
              <div>
                <button
                  type="button"
                  className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-blue-500"
                  onClick={() => setView(view === 'list' ? 'grid' : 'list')}
                >
                  {view === 'list' ? 'Grid View' : 'List View'}
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowAddDevice(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Add Device
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 bg-white p-4 rounded-lg shadow">
            <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-3">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  Device Type
                </label>
                <select
                  id="type"
                  name="type"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={filters.type}
                  onChange={handleFilterChange}
                >
                  <option value="all">All Types</option>
                  {deviceTypes.filter(type => type !== 'all').map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={filters.status}
                  onChange={handleFilterChange}
                >
                  <option value="all">All Statuses</option>
                  {statuses.filter(status => status !== 'all').map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <select
                  id="location"
                  name="location"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={filters.location}
                  onChange={handleFilterChange}
                >
                  <option value="all">All Locations</option>
                  {locations.filter(location => location !== 'all').map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ArrowPathIcon className="-ml-1 mr-1 h-4 w-4" />
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {[
          { 
            label: 'Total Devices', 
            value: devices.length,
            icon: <DevicePhoneMobileIcon className="h-6 w-6 text-blue-600" />,
            change: '+2',
            changeType: 'increase'
          },
          { 
            label: 'Available', 
            value: devices.filter(d => d.status === 'Available').length,
            icon: <CheckCircleIcon className="h-6 w-6 text-green-600" />,
            change: '+1',
            changeType: 'increase'
          },
          { 
            label: 'In Use / Assigned', 
            value: devices.filter(d => d.status === 'In Use' || d.status === 'Assigned').length,
            icon: <ClockIcon className="h-6 w-6 text-yellow-600" />,
            change: '-1',
            changeType: 'decrease'
          },
          { 
            label: 'Maintenance', 
            value: devices.filter(d => d.status === 'Maintenance').length,
            icon: <XMarkIcon className="h-6 w-6 text-red-600" />,
            change: '0',
            changeType: 'neutral'
          },
        ].map((stat, index) => (
          <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {stat.icon}
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.label}
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {stat.value}
                        {stat.change !== '0' && (
                          <span className={`ml-2 text-sm font-normal ${stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                            {stat.change} {stat.changeType === 'increase' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Device List/Grid View */}
      {view === 'list' ? (
        <div className="flex flex-col">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                        onClick={() => requestSort('deviceId')}
                      >
                        <div className="flex items-center">
                          Device ID
                          {sortConfig.key === 'deviceId' && (
                            <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                        onClick={() => requestSort('name')}
                      >
                        <div className="flex items-center">
                          Device
                          {sortConfig.key === 'name' && (
                            <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                        onClick={() => requestSort('type')}
                      >
                        <div className="flex items-center">
                          Type
                          {sortConfig.key === 'type' && (
                            <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                        onClick={() => requestSort('status')}
                      >
                        <div className="flex items-center">
                          Status
                          {sortConfig.key === 'status' && (
                            <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                        onClick={() => requestSort('assignedTo')}
                      >
                        <div className="flex items-center">
                          Assigned To
                          {sortConfig.key === 'assignedTo' && (
                            <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                        onClick={() => requestSort('location')}
                      >
                        <div className="flex items-center">
                          Location
                          {sortConfig.key === 'location' && (
                            <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedDevices.length > 0 ? (
                      sortedDevices.map((device) => (
                        <tr key={device.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {device.deviceId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center">
                                {getDeviceIcon(device.type)}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{device.name}</div>
                                <div className="text-sm text-gray-500">{device.model}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {device.type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(device.status)}`}>
                              {device.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {device.assignedTo || 'Unassigned'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {device.location}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setSelectedDevice(device)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                View
                              </button>
                              {device.status === 'Available' ? (
                                <button
                                  onClick={() => handleCheckOut(device)}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  Check Out
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleCheckIn(device.id)}
                                  className="text-yellow-600 hover:text-yellow-900"
                                >
                                  Check In
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(device.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                          No devices found matching your criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Grid View
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortedDevices.length > 0 ? (
            sortedDevices.map((device) => (
              <div key={device.id} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {getDeviceIcon(device.type)}
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <div className="flex justify-between">
                        <h3 className="text-lg font-medium text-gray-900">{device.name}</h3>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(device.status)}`}>
                          {device.status}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-gray-500">{device.model}</div>
                      <div className="mt-1 text-sm text-gray-500">{device.deviceId}</div>
                      
                      <div className="mt-2 text-sm text-gray-700">
                        <div className="truncate">
                          <span className="font-medium">Assigned to:</span> {device.assignedTo || 'Unassigned'}
                        </div>
                        <div className="truncate">
                          <span className="font-medium">Location:</span> {device.location || 'N/A'}
                        </div>
                        <div className="truncate">
                          <span className="font-medium">Last Checked:</span> {new Date(device.lastChecked).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="mt-3 flex space-x-2">
                        <button
                          onClick={() => setSelectedDevice(device)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          View Details
                        </button>
                        {device.status === 'Available' ? (
                          <button
                            onClick={() => handleCheckOut(device)}
                            className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            Check Out
                          </button>
                        ) : (
                          <button
                            onClick={() => handleCheckIn(device.id)}
                            className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                          >
                            Check In
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-gray-500">No devices found matching your criteria.</p>
            </div>
          )}
        </div>
      )}

      {/* Device Detail Modal */}
      {selectedDevice && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {selectedDevice.name} - {selectedDevice.model}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {selectedDevice.deviceId} • {selectedDevice.type}
                    </p>
                  </div>
                  <div className="ml-3 h-7 flex items-center">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(selectedDevice.status)}`}>
                      {selectedDevice.status}
                    </span>
                  </div>
                </div>
                
                <div className="mt-6 border-t border-gray-200 pt-4">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Serial Number</dt>
                      <dd className="mt-1 text-sm text-gray-900">{selectedDevice.serialNumber}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Assigned To</dt>
                      <dd className="mt-1 text-sm text-gray-900">{selectedDevice.assignedTo || 'Unassigned'}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Location</dt>
                      <dd className="mt-1 text-sm text-gray-900">{selectedDevice.location || 'N/A'}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Last Checked</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(selectedDevice.lastChecked).toLocaleString()}
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Warranty Expiry</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {selectedDevice.warrantyExpiry ? new Date(selectedDevice.warrantyExpiry).toLocaleDateString() : 'N/A'}
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Purchase Date</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {selectedDevice.purchaseDate ? new Date(selectedDevice.purchaseDate).toLocaleDateString() : 'N/A'}
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Purchase Cost</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {selectedDevice.purchaseCost ? `$${selectedDevice.purchaseCost.toFixed(2)}` : 'N/A'}
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Operating System</dt>
                      <dd className="mt-1 text-sm text-gray-900">{selectedDevice.os || 'N/A'}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">RAM</dt>
                      <dd className="mt-1 text-sm text-gray-900">{selectedDevice.ram || 'N/A'}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Storage</dt>
                      <dd className="mt-1 text-sm text-gray-900">{selectedDevice.storage || 'N/A'}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Processor</dt>
                      <dd className="mt-1 text-sm text-gray-900">{selectedDevice.processor || 'N/A'}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Notes</dt>
                      <dd className="mt-1 text-sm text-gray-900">{selectedDevice.notes || 'No additional notes.'}</dd>
                    </div>
                  </dl>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm"
                  onClick={() => setSelectedDevice(null)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  onClick={() => {
                    // Handle edit functionality
                    console.log('Edit device:', selectedDevice.id);
                  }}
                >
                  Edit Device
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Device Modal */}
      {showAddDevice && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
              <div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Add New Device
                  </h3>
                  <div className="mt-4">
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      // Handle form submission
                      const newId = Math.max(...devices.map(d => d.id), 0) + 1;
                      const newDevice = {
                        id: newId,
                        deviceId: `DEV-2023-${String(newId).padStart(3, '0')}`,
                        name: e.target.deviceName.value,
                        type: e.target.deviceType.value,
                        model: e.target.model.value,
                        serialNumber: e.target.serialNumber.value,
                        status: 'Available',
                        assignedTo: null,
                        location: e.target.location.value,
                        lastChecked: new Date().toISOString(),
                        warrantyExpiry: e.target.warrantyExpiry.value || null,
                        os: e.target.os.value || 'N/A',
                        ram: e.target.ram.value || 'N/A',
                        storage: e.target.storage.value || 'N/A',
                        processor: e.target.processor.value || 'N/A',
                        purchaseDate: e.target.purchaseDate.value || null,
                        purchaseCost: parseFloat(e.target.purchaseCost.value) || 0,
                        notes: e.target.notes.value || ''
                      };
                      setDevices([...devices, newDevice]);
                      setShowAddDevice(false);
                    }}>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                          <div>
                            <label htmlFor="deviceName" className="block text-sm font-medium text-gray-700 text-left">
                              Device Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="deviceName"
                              id="deviceName"
                              required
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label htmlFor="deviceType" className="block text-sm font-medium text-gray-700 text-left">
                              Device Type <span className="text-red-500">*</span>
                            </label>
                            <select
                              id="deviceType"
                              name="deviceType"
                              required
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              defaultValue="Laptop"
                            >
                              <option value="Laptop">Laptop</option>
                              <option value="Tablet">Tablet</option>
                              <option value="Desktop">Desktop</option>
                              <option value="Printer">Printer</option>
                              <option value="Phone">Phone</option>
                              <option value="Server">Server</option>
                              <option value="Network Device">Network Device</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                          <div>
                            <label htmlFor="model" className="block text-sm font-medium text-gray-700 text-left">
                              Model <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="model"
                              id="model"
                              required
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label htmlFor="serialNumber" className="block text-sm font-medium text-gray-700 text-left">
                              Serial Number <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="serialNumber"
                              id="serialNumber"
                              required
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label htmlFor="location" className="block text-sm font-medium text-gray-700 text-left">
                              Location
                            </label>
                            <input
                              type="text"
                              name="location"
                              id="location"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700 text-left">
                              Purchase Date
                            </label>
                            <input
                              type="date"
                              name="purchaseDate"
                              id="purchaseDate"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label htmlFor="warrantyExpiry" className="block text-sm font-medium text-gray-700 text-left">
                              Warranty Expiry
                            </label>
                            <input
                              type="date"
                              name="warrantyExpiry"
                              id="warrantyExpiry"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label htmlFor="purchaseCost" className="block text-sm font-medium text-gray-700 text-left">
                              Purchase Cost ($)
                            </label>
                            <input
                              type="number"
                              name="purchaseCost"
                              id="purchaseCost"
                              step="0.01"
                              min="0"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label htmlFor="os" className="block text-sm font-medium text-gray-700 text-left">
                              Operating System
                            </label>
                            <input
                              type="text"
                              name="os"
                              id="os"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label htmlFor="ram" className="block text-sm font-medium text-gray-700 text-left">
                              RAM
                            </label>
                            <input
                              type="text"
                              name="ram"
                              id="ram"
                              placeholder="e.g., 16GB"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label htmlFor="storage" className="block text-sm font-medium text-gray-700 text-left">
                              Storage
                            </label>
                            <input
                              type="text"
                              name="storage"
                              id="storage"
                              placeholder="e.g., 512GB SSD"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label htmlFor="processor" className="block text-sm font-medium text-gray-700 text-left">
                              Processor
                            </label>
                            <input
                              type="text"
                              name="processor"
                              id="processor"
                              placeholder="e.g., Intel i7-1165G7"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 text-left">
                            Notes
                          </label>
                          <textarea
                            id="notes"
                            name="notes"
                            rows="3"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Any additional information about the device..."
                          ></textarea>
                        </div>
                      </div>
                      <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                        <button
                          type="submit"
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm"
                        >
                          Add Device
                        </button>
                        <button
                          type="button"
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                          onClick={() => setShowAddDevice(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceManagement;
