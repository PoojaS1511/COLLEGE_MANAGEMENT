import React, { useState } from 'react';
import { 
  UserCircleIcon, 
  ClockIcon, 
  FireIcon, 
  HeartIcon, 
  ScaleIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowsRightLeftIcon
} from '@heroicons/react/24/outline';

const FitnessLog = () => {
  // Mock data for fitness logs
  const [logs, setLogs] = useState([
    {
      id: 1,
      studentId: 'S2023001',
      studentName: 'John Doe',
      date: '2025-10-17',
      activity: 'Running',
      duration: 45, // in minutes
      caloriesBurned: 320,
      heartRate: {
        avg: 145,
        max: 165,
        min: 75
      },
      notes: 'Morning run around the campus',
      verified: true
    },
    {
      id: 2,
      studentId: 'S2023002',
      studentName: 'Jane Smith',
      date: '2025-10-17',
      activity: 'Weight Training',
      duration: 60,
      caloriesBurned: 280,
      heartRate: {
        avg: 130,
        max: 155,
        min: 80
      },
      notes: 'Chest and triceps workout',
      verified: true
    },
    {
      id: 3,
      studentId: 'S2023003',
      studentName: 'Alex Chen',
      date: '2025-10-16',
      activity: 'Swimming',
      duration: 30,
      caloriesBurned: 250,
      heartRate: {
        avg: 140,
        max: 160,
        min: 70
      },
      notes: 'Freestyle laps',
      verified: false
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [activityFilter, setActivityFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');

  const [newLog, setNewLog] = useState({
    studentId: '',
    studentName: '',
    date: new Date().toISOString().split('T')[0],
    activity: '',
    duration: '',
    caloriesBurned: '',
    heartRate: {
      avg: '',
      max: '',
      min: ''
    },
    notes: ''
  });

  const activities = ['Running', 'Weight Training', 'Swimming', 'Cycling', 'Yoga', 'Basketball', 'Football', 'Other'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('heartRate.')) {
      const heartRateField = name.split('.')[1];
      setNewLog({
        ...newLog,
        heartRate: {
          ...newLog.heartRate,
          [heartRateField]: value ? parseInt(value) : ''
        }
      });
    } else {
      setNewLog({
        ...newLog,
        [name]: name === 'duration' || name === 'caloriesBurned' ? (value ? parseInt(value) : '') : value
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingLog) {
      // Update existing log
      const updatedLogs = logs.map(log => 
        log.id === editingLog.id 
          ? { ...newLog, id: editingLog.id, verified: editingLog.verified }
          : log
      );
      setLogs(updatedLogs);
      setEditingLog(null);
    } else {
      // Add new log
      const newEntry = {
        ...newLog,
        id: Math.max(0, ...logs.map(log => log.id)) + 1,
        verified: false
      };
      setLogs([...logs, newEntry]);
    }
    
    // Reset form
    setNewLog({
      studentId: '',
      studentName: '',
      date: new Date().toISOString().split('T')[0],
      activity: '',
      duration: '',
      caloriesBurned: '',
      heartRate: {
        avg: '',
        max: '',
        min: ''
      },
      notes: ''
    });
    
    setShowAddForm(false);
  };

  const handleEdit = (log) => {
    setNewLog({
      studentId: log.studentId,
      studentName: log.studentName,
      date: log.date,
      activity: log.activity,
      duration: log.duration,
      caloriesBurned: log.caloriesBurned,
      heartRate: { ...log.heartRate },
      notes: log.notes
    });
    setEditingLog(log);
    setShowAddForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this fitness log?')) {
      setLogs(logs.filter(log => log.id !== id));
    }
  };

  const toggleVerification = (id) => {
    setLogs(logs.map(log => 
      log.id === id ? { ...log, verified: !log.verified } : log
    ));
  };

  // Filter logs based on search term and filters
  const filteredLogs = logs.filter(log => {
    // Check if log and its properties exist before accessing them
    if (!log || !log.studentName || !log.studentId || !log.activity) return false;
    
    const matchesSearch = 
      String(log.studentName).toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(log.studentId).toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(log.activity).toLowerCase().includes(searchTerm.toLowerCase());
    
    // Date filtering logic
    const matchesDate = (() => {
      if (!log.date) return false;
      if (dateFilter === 'all') return true;
      
      if (dateFilter === 'today') {
        return log.date === new Date().toISOString().split('T')[0];
      }
      
      if (dateFilter === 'week') {
        try {
          const logDate = new Date(log.date);
          if (isNaN(logDate.getTime())) return false; // Invalid date
          
          const today = new Date();
          const firstDayOfWeek = new Date(today);
          firstDayOfWeek.setDate(today.getDate() - today.getDay());
          firstDayOfWeek.setHours(0, 0, 0, 0);
          
          logDate.setHours(0, 0, 0, 0);
          return logDate >= firstDayOfWeek;
        } catch (e) {
          console.error('Error processing date:', e);
          return false;
        }
      }
      
      return true;
    })();
    
    const matchesActivity = activityFilter === 'all' || log.activity === activityFilter;
    const matchesVerification = 
      verificationFilter === 'all' || 
      (verificationFilter === 'verified' && log.verified) ||
      (verificationFilter === 'unverified' && !log.verified);
    
    return matchesSearch && matchesDate && matchesActivity && matchesVerification;
  });

  // Calculate statistics
  const totalWorkouts = filteredLogs.length;
  const totalDuration = filteredLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
  const totalCalories = filteredLogs.reduce((sum, log) => sum + (log.caloriesBurned || 0), 0);
  const avgHeartRate = filteredLogs.length > 0 
    ? Math.round(filteredLogs.reduce((sum, log) => sum + (log.heartRate.avg || 0), 0) / filteredLogs.length)
    : 0;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Fitness Activity Logs</h2>
          <p className="text-sm text-gray-500 mt-1">
            Track and manage student fitness activities and progress
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mt-4 sm:mt-0"
          onClick={() => {
            setEditingLog(null);
            setShowAddForm(true);
          }}
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
          Add Fitness Log
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <ClockIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Workouts</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{totalWorkouts}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <ClockIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Duration</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{totalDuration}</div>
                    <span className="ml-2 text-sm font-medium text-gray-500">minutes</span>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <FireIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Calories Burned</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{totalCalories}</div>
                    <span className="ml-2 text-sm font-medium text-gray-500">kcal</span>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                <HeartIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Avg. Heart Rate</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{avgHeartRate}</div>
                    <span className="ml-2 text-sm font-medium text-gray-500">bpm</span>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              id="search"
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Search by name, ID, or activity..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div>
            <label htmlFor="date-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <select
              id="date-filter"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="activity-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Activity Type
            </label>
            <select
              id="activity-filter"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={activityFilter}
              onChange={(e) => setActivityFilter(e.target.value)}
            >
              <option value="all">All Activities</option>
              {[...new Set(logs.map(log => log.activity))].map((activity, index) => (
                <option key={index} value={activity}>{activity}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="verification-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Verification Status
            </label>
            <select
              id="verification-filter"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="verified">Verified Only</option>
              <option value="unverified">Unverified Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Fitness Logs Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Calories
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Heart Rate
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className={!log.verified ? 'bg-yellow-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <UserCircleIcon className="h-10 w-10 text-gray-400" aria-hidden="true" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{log.studentName}</div>
                          <div className="text-sm text-gray-500">{log.studentId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{log.activity}</div>
                      {log.notes && (
                        <div className="text-xs text-gray-500 truncate max-w-xs">{log.notes}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(log.date).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {log.duration} minutes
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{log.duration} min</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FireIcon className="h-4 w-4 text-red-500 mr-1" />
                        <span className="text-sm text-gray-900">{log.caloriesBurned} kcal</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <HeartIcon className="h-4 w-4 text-red-500 mr-1" />
                        <div className="text-sm">
                          <div className="flex items-center">
                            <span className="text-gray-900">{log.heartRate.avg}</span>
                            <span className="mx-1 text-gray-400">/</span>
                            <span className="text-red-500">{log.heartRate.max}</span>
                            <ArrowsRightLeftIcon className="h-3 w-3 mx-1 text-gray-400" />
                            <span className="text-blue-500">{log.heartRate.min}</span>
                            <span className="ml-1 text-xs text-gray-500">bpm</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        log.verified 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {log.verified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(log)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toggleVerification(log.id)}
                          className={log.verified ? "text-yellow-600 hover:text-yellow-900" : "text-green-600 hover:text-green-900"}
                          title={log.verified ? "Mark as Unverified" : "Verify"}
                        >
                          {log.verified ? (
                            <ArrowTrendingDownIcon className="h-4 w-4" />
                          ) : (
                            <ArrowTrendingUpIcon className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(log.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                    No fitness logs found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
              <div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    {editingLog ? 'Edit Fitness Log' : 'Add New Fitness Log'}
                  </h3>
                  <div className="mt-2">
                    <form onSubmit={handleSubmit}>
                      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-3">
                          <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">
                            Student ID <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="studentId"
                            id="studentId"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={newLog.studentId}
                            onChange={handleInputChange}
                            required
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label htmlFor="studentName" className="block text-sm font-medium text-gray-700">
                            Student Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="studentName"
                            id="studentName"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={newLog.studentName}
                            onChange={handleInputChange}
                            required
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                            Date <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            name="date"
                            id="date"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={newLog.date}
                            onChange={handleInputChange}
                            max={new Date().toISOString().split('T')[0]}
                            required
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label htmlFor="activity" className="block text-sm font-medium text-gray-700">
                            Activity Type <span className="text-red-500">*</span>
                          </label>
                          <select
                            id="activity"
                            name="activity"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={newLog.activity}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">Select an activity</option>
                            {activities.map((activity, index) => (
                              <option key={index} value={activity}>
                                {activity}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                            Duration (minutes) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            name="duration"
                            id="duration"
                            min="1"
                            max="1000"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={newLog.duration}
                            onChange={handleInputChange}
                            required
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label htmlFor="caloriesBurned" className="block text-sm font-medium text-gray-700">
                            Calories Burned
                          </label>
                          <input
                            type="number"
                            name="caloriesBurned"
                            id="caloriesBurned"
                            min="0"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={newLog.caloriesBurned}
                            onChange={handleInputChange}
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Heart Rate (bpm)
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label htmlFor="heartRate.avg" className="sr-only">Average</label>
                              <input
                                type="number"
                                name="heartRate.avg"
                                id="heartRate.avg"
                                placeholder="Avg"
                                min="40"
                                max="220"
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                value={newLog.heartRate.avg}
                                onChange={handleInputChange}
                              />
                            </div>
                            <div>
                              <label htmlFor="heartRate.max" className="sr-only">Max</label>
                              <input
                                type="number"
                                name="heartRate.max"
                                id="heartRate.max"
                                placeholder="Max"
                                min="40"
                                max="220"
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                value={newLog.heartRate.max}
                                onChange={handleInputChange}
                              />
                            </div>
                            <div>
                              <label htmlFor="heartRate.min" className="sr-only">Min</label>
                              <input
                                type="number"
                                name="heartRate.min"
                                id="heartRate.min"
                                placeholder="Min"
                                min="40"
                                max="220"
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                value={newLog.heartRate.min}
                                onChange={handleInputChange}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="sm:col-span-6">
                          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                            Notes
                          </label>
                          <div className="mt-1">
                            <textarea
                              id="notes"
                              name="notes"
                              rows={3}
                              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                              value={newLog.notes}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                        <button
                          type="submit"
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm"
                        >
                          {editingLog ? 'Update Log' : 'Add Log'}
                        </button>
                        <button
                          type="button"
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                          onClick={() => {
                            setShowAddForm(false);
                            setEditingLog(null);
                          }}
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

export default FitnessLog;
