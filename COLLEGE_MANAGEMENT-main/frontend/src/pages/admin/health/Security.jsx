import React, { useState, useEffect } from 'react';
import { 
  ShieldCheckIcon, 
  UserGroupIcon, 
  ExclamationTriangleIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XMarkIcon, 
  PlusIcon, 
  MagnifyingGlassIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { incidentService } from '../../../services/healthSafetyService';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

const Security = () => {
  const [securityLogs, setSecurityLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('logs');
  const [showNewLogForm, setShowNewLogForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newLog, setNewLog] = useState({
    type: 'incident',
    location: '',
    personId: '',
    personName: '',
    details: '',
    status: 'reported',
    severity: 'medium',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: format(new Date(), 'HH:mm')
  });

  // Fetch security logs from Supabase
  useEffect(() => {
    const fetchSecurityLogs = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching security logs...');
        
        // Fetch incidents with proper error handling
        const incidents = await incidentService.getAll();
        console.log('Incidents from service:', incidents);
        
        // Transform the data to match the expected format
        const formattedLogs = incidents.map(incident => ({
          id: incident.id,
          type: 'incident',
          title: incident.title || 'No title',
          description: incident.description || 'No description',
          status: incident.status?.toLowerCase() || 'reported',
          severity: incident.priority?.toLowerCase() || 'medium',
          date: incident.incident_date ? format(new Date(incident.incident_date), 'yyyy-MM-dd') : format(new Date(incident.created_at), 'yyyy-MM-dd'),
          time: incident.incident_date ? format(new Date(incident.incident_date), 'HH:mm') : format(new Date(incident.created_at), 'HH:mm'),
          location: incident.location_id || 'Unknown location',
          reported_by: incident.reported_by || 'Unknown',
          created_at: incident.created_at
        }));

        console.log('Formatted logs:', formattedLogs);
        setSecurityLogs(formattedLogs);
      } catch (err) {
        console.error('Error in fetchSecurityLogs:', err);
        setError(`Error: ${err.message || 'Failed to load security logs'}`);
        toast.error('Failed to load security data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSecurityLogs();
  }, []);

  // Handle new security log submission
  const handleNewLog = async (e) => {
    e.preventDefault();
    try {
      const logData = {
        title: newLog.title || 'Untitled Incident',
        description: newLog.details,
        status: newLog.status.charAt(0).toUpperCase() + newLog.status.slice(1), // Capitalize first letter
        priority: newLog.severity,
        incident_date: new Date(`${newLog.date}T${newLog.time}`).toISOString(),
        location_id: newLog.location || null,
        reported_by: 'f61beaff-4e7d-4f6a-b4b5-fdc70791c229', // Replace with actual user ID from auth
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const newLogEntry = await incidentService.reportIncident(logData);
      
      // Add the new log to the beginning of the list
      setSecurityLogs(prev => [{
        ...logData,
        id: newLogEntry.id,
        type: 'incident',
        date: newLog.date,
        time: newLog.time
      }, ...prev]);
      
      // Reset form
      setNewLog({
        type: 'incident',
        title: '',
        location: '',
        details: '',
        status: 'reported',
        severity: 'medium',
        date: format(new Date(), 'yyyy-MM-dd'),
        time: format(new Date(), 'HH:mm')
      });
      setShowNewLogForm(false);
      
      toast.success('Security log created successfully');
    } catch (err) {
      console.error('Error creating security log:', err);
      toast.error('Failed to create security log');
    }
  };

  // Handle log status update
  const handleStatusUpdate = async (logId, newStatus) => {
    try {
      await incidentService.update(logId, { 
        status: newStatus,
        updated_at: new Date().toISOString()
      });
      
      setSecurityLogs(prev => 
        prev.map(log => 
          log.id === logId 
            ? { ...log, status: newStatus }
            : log
        )
      );
      
      toast.success('Log status updated');
    } catch (err) {
      console.error('Error updating log status:', err);
      toast.error('Failed to update log status');
    }
  };

  // Handle input change for new log form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewLog(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Mock data for CCTV incidents
  const [cctvIncidents, setCctvIncidents] = useState([
    {
      id: 1,
      date: '2025-10-18',
      time: '10:15',
      location: 'Parking Lot B - Camera 7',
      type: 'Suspicious Activity',
      status: 'Under Review',
      priority: 'High',
      assignedTo: 'Security Team A'
    },
    {
      id: 2,
      date: '2025-10-17',
      time: '23:45',
      location: 'Library Entrance - Camera 3',
      type: 'After Hours Access',
      status: 'Resolved',
      priority: 'Medium',
      assignedTo: 'Security Team B'
    },
  ]);

  const addSecurityLog = (log) => {
    setSecurityLogs([log, ...securityLogs]);
  };

  const updateIncidentStatus = (id, status) => {
    setCctvIncidents(cctvIncidents.map(incident => 
      incident.id === id ? { ...incident, status } : incident
    ));
  };

  const filteredLogs = securityLogs.filter(log => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (log.personName?.toLowerCase() || '').includes(searchLower) ||
      (log.personId?.toLowerCase() || '').includes(searchLower) ||
      (log.details?.toLowerCase() || '').includes(searchLower) ||
      (log.title?.toLowerCase() || '').includes(searchLower) ||
      (log.description?.toLowerCase() || '').includes(searchLower) ||
      (log.status?.toLowerCase() || '').includes(searchLower)
    );
  });

  const filteredIncidents = (cctvIncidents || []).filter(incident => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (incident.location?.toLowerCase() || '').includes(searchLower) ||
      (incident.type?.toLowerCase() || '').includes(searchLower) ||
      (incident.assignedTo?.toLowerCase() || '').includes(searchLower) ||
      (incident.description?.toLowerCase() || '').includes(searchLower)
    );
  });

  return (
    <div>
      {/* Search and Filter */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="relative rounded-md shadow-sm w-full sm:max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="Search logs/incidents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowNewLogForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            New Incident
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('logs')}
            className={`${activeTab === 'logs' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Security Logs
          </button>
          <button
            onClick={() => setActiveTab('cctv')}
            className={`${activeTab === 'cctv' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            CCTV Incidents
          </button>
        </nav>
      </div>

      {/* CCTV Incidents Tab */}
      {activeTab === 'cctv' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredIncidents.map((incident) => (
              <li key={incident.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {incident.type}
                        </div>
                        <div className="text-sm text-gray-500">
                          {incident.location} • {incident.date} {incident.time}
                        </div>
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        incident.status === 'Under Review' ? 'bg-yellow-100 text-yellow-800' :
                        incident.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {incident.status}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-between items-center">
                    <div className="flex items-center text-sm text-gray-500">
                      <span>Assigned to: {incident.assignedTo}</span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => updateIncidentStatus(incident.id, 'Under Review')}
                        className="text-xs font-medium text-yellow-600 hover:text-yellow-500"
                      >
                        Mark as Review
                      </button>
                      <button
                        onClick={() => updateIncidentStatus(incident.id, 'Resolved')}
                        className="text-xs font-medium text-green-600 hover:text-green-500"
                      >
                        Mark as Resolved
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Security Logs Tab */}
      {activeTab === 'logs' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredLogs.map((log) => (
              <li key={log.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${log.type === 'incident' ? 'bg-red-100 text-red-600' : log.type === 'entry' ? 'bg-blue-100 text-blue-600' : 'bg-yellow-100 text-yellow-600'}`}>
                        {log.type === 'incident' ? (
                          <ExclamationTriangleIcon className="h-6 w-6" aria-hidden="true" />
                        ) : log.type === 'entry' ? (
                          <UserGroupIcon className="h-6 w-6" aria-hidden="true" />
                        ) : (
                          <ShieldCheckIcon className="h-6 w-6" aria-hidden="true" />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {log.personName} <span className="text-gray-500">({log.personId})</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {log.location} • {log.date} {log.time}
                        </div>
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      {log.status === 'reported' && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Reported
                        </span>
                      )}
                      {log.status === 'resolved' && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Resolved
                        </span>
                      )}
                      {log.status === 'normal' && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          Normal
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">{log.details}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="px-4 py-4 bg-gray-50 text-right sm:px-6">
            <button
              onClick={() => setShowNewLogForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              New Incident
            </button>
          </div>
        </div>
      )}

      {/* New Incident Modal */}
      {showNewLogForm && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
              <div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">New Security Incident</h3>
                  <div className="mt-4">
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-3">
                        <label htmlFor="incidentType" className="block text-sm font-medium text-gray-700 text-left">
                          Incident Type
                        </label>
                        <select
                          id="incidentType"
                          name="incidentType"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                          <option>Select type</option>
                          <option>Suspicious Activity</option>
                          <option>Unauthorized Access</option>
                          <option>Theft</option>
                          <option>Vandalism</option>
                          <option>Medical Emergency</option>
                          <option>Other</option>
                        </select>
                      </div>
                      <div className="sm:col-span-3">
                        <label htmlFor="priority" className="block text-sm font-medium text-gray-700 text-left">
                          Priority
                        </label>
                        <select
                          id="priority"
                          name="priority"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                          <option>Select priority</option>
                          <option>High</option>
                          <option>Medium</option>
                          <option>Low</option>
                        </select>
                      </div>
                      <div className="sm:col-span-6">
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700 text-left">
                          Location
                        </label>
                        <input
                          type="text"
                          name="location"
                          id="location"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="Where did this incident occur?"
                        />
                      </div>
                      <div className="sm:col-span-6">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 text-left">
                          Description
                        </label>
                        <textarea
                          name="description"
                          id="description"
                          rows="3"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="Provide a detailed description of the incident"
                        ></textarea>
                      </div>
                      <div className="sm:col-span-6">
                        <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 text-left">
                          Assign To
                        </label>
                        <select
                          id="assignedTo"
                          name="assignedTo"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                          <option>Select team</option>
                          <option>Security Team A</option>
                          <option>Security Team B</option>
                          <option>Security Team C</option>
                          <option>Administration</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm"
                  onClick={handleNewLog}
                >
                  Report Incident
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  onClick={() => setShowNewLogForm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Security;
