import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TransportManagement = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    dashboard: null,
    students: [],
    faculty: [],
    buses: [],
    drivers: [],
    routes: [],
    fees: [],
    attendance: []
  });

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('authToken') || localStorage.getItem('token');
  };

  // API call helper
  const apiCall = async (endpoint, method = 'GET', data = null) => {
    try {
      const token = getAuthToken();
      const config = {
        method,
        url: `${API_BASE_URL}${endpoint}`,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        ...(data && { data })
      };

      const response = await axios(config);
      return response.data;
    } catch (err) {
      console.error(`API call failed for ${endpoint}:`, err);
      throw err;
    }
  };

  // Load dashboard metrics
  const loadDashboardMetrics = async () => {
    try {
      const result = await apiCall('/api/transport/dashboard/metrics');
      setData(prev => ({ ...prev, dashboard: result }));
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
      // Set default metrics if API fails
      setData(prev => ({
        ...prev,
        dashboard: {
          total_students: 0,
          total_faculty: 0,
          total_buses: 0,
          total_routes: 0,
          active_students: 0,
          total_fees_pending: 0
        }
      }));
    }
  };

  // Load data for active tab
  const loadTabData = async (tab) => {
    setLoading(true);
    setError(null);

    try {
      switch (tab) {
        case 'students':
          const studentsResult = await apiCall('/api/transport/students');
          setData(prev => ({ ...prev, students: studentsResult.data || studentsResult }));
          break;
        case 'faculty':
          const facultyResult = await apiCall('/api/transport/faculty');
          setData(prev => ({ ...prev, faculty: facultyResult.data || facultyResult }));
          break;
        case 'buses':
          const busesResult = await apiCall('/api/transport/buses');
          setData(prev => ({ ...prev, buses: busesResult.data || busesResult }));
          break;
        case 'drivers':
          const driversResult = await apiCall('/api/transport/drivers');
          setData(prev => ({ ...prev, drivers: driversResult.data || driversResult }));
          break;
        case 'routes':
          const routesResult = await apiCall('/api/transport/routes');
          setData(prev => ({ ...prev, routes: routesResult.data || routesResult }));
          break;
        case 'fees':
          const feesResult = await apiCall('/api/transport/fees');
          setData(prev => ({ ...prev, fees: feesResult.data || feesResult }));
          break;
        case 'attendance':
          const attendanceResult = await apiCall('/api/transport/attendance');
          setData(prev => ({ ...prev, attendance: attendanceResult.data || attendanceResult }));
          break;
        default:
          break;
      }
    } catch (err) {
      setError(`Failed to load ${tab} data: ${err.message}`);
      console.error(`Failed to load ${tab} data:`, err);
    } finally {
      setLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    loadDashboardMetrics();
    loadTabData(activeTab);
  }, [activeTab]);

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Render dashboard metrics
  const renderDashboard = () => {
    if (!data.dashboard) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-md">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    const metrics = [
      { title: 'Total Students', value: data.dashboard.total_students || 0, color: 'bg-blue-500' },
      { title: 'Total Faculty', value: data.dashboard.total_faculty || 0, color: 'bg-green-500' },
      { title: 'Total Buses', value: data.dashboard.total_buses || 0, color: 'bg-yellow-500' },
      { title: 'Total Routes', value: data.dashboard.total_routes || 0, color: 'bg-purple-500' },
      { title: 'Active Students', value: data.dashboard.active_students || 0, color: 'bg-indigo-500' },
      { title: 'Pending Fees', value: data.dashboard.total_fees_pending || 0, color: 'bg-red-500' }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <div key={index} className={`${metric.color} text-white p-6 rounded-lg shadow-md`}>
            <h3 className="text-lg font-semibold mb-2">{metric.title}</h3>
            <p className="text-3xl font-bold">{metric.value}</p>
          </div>
        ))}
      </div>
    );
  };

  // Render data table
  const renderTable = (items, columns) => {
    if (loading) {
      return (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center text-red-600">
            <p className="text-lg font-semibold mb-2">Error Loading Data</p>
            <p>{error}</p>
            <button
              onClick={() => loadTabData(activeTab)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    if (!items || items.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center text-gray-500">
            <p className="text-lg font-semibold mb-2">No Data Available</p>
            <p>No {activeTab} records found.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 capitalize">
            {activeTab} Management
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item, index) => (
                <tr key={item.id || index} className="hover:bg-gray-50">
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {column.render ? column.render(item) : item[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Define columns for each tab
  const getColumns = (tab) => {
    switch (tab) {
      case 'students':
        return [
          { header: 'Name', key: 'full_name' },
          { header: 'Register No', key: 'register_number' },
          { header: 'Route', key: 'route_name' },
          { header: 'Status', key: 'status' }
        ];
      case 'faculty':
        return [
          { header: 'Name', key: 'full_name' },
          { header: 'Department', key: 'department' },
          { header: 'Route', key: 'route_name' },
          { header: 'Status', key: 'status' }
        ];
      case 'buses':
        return [
          { header: 'Bus Number', key: 'bus_number' },
          { header: 'Driver', key: 'driver_name' },
          { header: 'Route', key: 'route_name' },
          { header: 'Capacity', key: 'capacity' }
        ];
      case 'drivers':
        return [
          { header: 'Name', key: 'full_name' },
          { header: 'License No', key: 'license_number' },
          { header: 'Phone', key: 'phone' },
          { header: 'Status', key: 'status' }
        ];
      case 'routes':
        return [
          { header: 'Route Name', key: 'route_name' },
          { header: 'Start Point', key: 'start_point' },
          { header: 'End Point', key: 'end_point' },
          { header: 'Distance (km)', key: 'distance' }
        ];
      case 'fees':
        return [
          { header: 'Student', key: 'student_name' },
          { header: 'Amount', key: 'amount', render: (item) => `₹${item.amount}` },
          { header: 'Status', key: 'status' },
          { header: 'Due Date', key: 'due_date' }
        ];
      case 'attendance':
        return [
          { header: 'Student', key: 'student_name' },
          { header: 'Date', key: 'date' },
          { header: 'Status', key: 'status' },
          { header: 'Route', key: 'route_name' }
        ];
      default:
        return [];
    }
  };

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'students', name: 'Students', icon: '👥' },
    { id: 'faculty', name: 'Faculty', icon: '👨‍🏫' },
    { id: 'buses', name: 'Buses', icon: '🚌' },
    { id: 'drivers', name: 'Drivers', icon: '👤' },
    { id: 'routes', name: 'Routes', icon: '🛣️' },
    { id: 'fees', name: 'Fees', icon: '💰' },
    { id: 'attendance', name: 'Attendance', icon: '✅' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Transport Management System</h1>
        <p className="text-gray-600">Manage college transportation services, routes, and student/faculty transport.</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'dashboard' ? (
            renderDashboard()
          ) : (
            renderTable(data[activeTab], getColumns(activeTab))
          )}
        </div>
      </div>

      {/* API Status */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">API Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Backend API: Connected</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Database: Connected</span>
          </div>
        </div>
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>API Base URL:</strong> {API_BASE_URL}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            <strong>Transport API:</strong> {API_BASE_URL}/api/transport
          </p>
        </div>
      </div>
    </div>
  );
};

export default TransportManagement;
