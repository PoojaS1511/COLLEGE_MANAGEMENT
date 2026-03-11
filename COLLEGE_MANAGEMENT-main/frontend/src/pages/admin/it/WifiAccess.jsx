import React, { useState } from 'react';
import { WifiIcon, UserCircleIcon, ClockIcon, CheckCircleIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const WifiAccess = () => {
  // Mock data for active connections
  const [activeConnections, setActiveConnections] = useState([
    {
      id: 1,
      userId: 'S2023001',
      userName: 'John Doe',
      deviceName: 'John\'s iPhone',
      macAddress: 'A4:83:E7:12:34:56',
      ipAddress: '192.168.1.45',
      connectedSince: '2025-10-18T08:15:30',
      dataUsed: '1.2 GB',
      connectionType: '5GHz'
    },
    {
      id: 2,
      userId: 'S2023002',
      userName: 'Jane Smith',
      deviceName: 'Jane\'s MacBook Pro',
      macAddress: 'B8:27:EB:78:90:12',
      ipAddress: '192.168.1.67',
      connectedSince: '2025-10-18T09:30:15',
      dataUsed: '2.7 GB',
      connectionType: '5GHz'
    },
    {
      id: 3,
      userId: 'F2023001',
      userName: 'Dr. Robert Johnson',
      deviceName: 'Robert\'s iPad',
      macAddress: 'C9:8A:BC:34:56:78',
      ipAddress: '192.168.1.89',
      connectedSince: '2025-10-18T10:45:20',
      dataUsed: '650 MB',
      connectionType: '2.4GHz'
    },
  ]);

  // Mock data for access requests
  const [accessRequests, setAccessRequests] = useState([
    {
      id: 1,
      userId: 'S2023010',
      userName: 'Alex Chen',
      deviceName: 'Alex\'s Laptop',
      macAddress: 'D1:2E:F4:56:78:90',
      requestTime: '2025-10-18T11:20:05',
      status: 'pending'
    },
    {
      id: 2,
      userId: 'S2023011',
      userName: 'Maria Garcia',
      deviceName: 'Maria\'s Phone',
      macAddress: 'E5:6F:AB:78:90:12',
      requestTime: '2025-10-18T11:35:40',
      status: 'pending'
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const [showNewDevice, setShowNewDevice] = useState(false);
  const [newDevice, setNewDevice] = useState({
    userId: '',
    userName: '',
    deviceName: '',
    macAddress: '',
    connectionType: '5GHz',
    duration: '1 day',
    notes: ''
  });

  const filteredConnections = activeConnections.filter(conn => 
    conn.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conn.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conn.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conn.macAddress.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRequests = accessRequests.filter(req => 
    (req.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.macAddress.toLowerCase().includes(searchTerm.toLowerCase())) &&
    req.status === 'pending'
  );

  const handleApproveRequest = (id) => {
    const request = accessRequests.find(req => req.id === id);
    if (request) {
      // Add to active connections
      setActiveConnections([
        ...activeConnections,
        {
          id: activeConnections.length + 1,
          userId: request.userId,
          userName: request.userName,
          deviceName: request.deviceName,
          macAddress: request.macAddress,
          ipAddress: `192.168.1.${Math.floor(Math.random() * 100) + 100}`,
          connectedSince: new Date().toISOString(),
          dataUsed: '0 MB',
          connectionType: '5GHz'
        }
      ]);
      
      // Remove from requests
      setAccessRequests(accessRequests.filter(req => req.id !== id));
    }
  };

  const handleRejectRequest = (id) => {
    setAccessRequests(accessRequests.filter(req => req.id !== id));
  };

  const handleDisconnect = (id) => {
    setActiveConnections(activeConnections.filter(conn => conn.id !== id));
  };

  const handleAddDevice = (e) => {
    e.preventDefault();
    // Add new device to active connections
    setActiveConnections([
      ...activeConnections,
      {
        id: activeConnections.length + 1,
        userId: newDevice.userId,
        userName: newDevice.userName,
        deviceName: newDevice.deviceName,
        macAddress: newDevice.macAddress,
        ipAddress: `192.168.1.${Math.floor(Math.random() * 100) + 100}`,
        connectedSince: new Date().toISOString(),
        dataUsed: '0 MB',
        connectionType: newDevice.connectionType
      }
    ]);
    
    // Reset form and close modal
    setNewDevice({
      userId: '',
      userName: '',
      deviceName: '',
      macAddress: '',
      connectionType: '5GHz',
      duration: '1 day',
      notes: ''
    });
    setShowNewDevice(false);
  };

  return (
    <div>
      {/* Search and Actions */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="relative rounded-md shadow-sm w-full sm:max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="Search users or devices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === 'active' 
                  ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Active Connections
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === 'requests' 
                  ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Access Requests
              {accessRequests.length > 0 && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                  {accessRequests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowNewDevice(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <WifiIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Add Device
            </button>
          </div>
        </div>
      </div>

      {/* Active Connections Tab */}
      {activeTab === 'active' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Active Wi-Fi Connections
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Currently connected devices to the campus Wi-Fi network
            </p>
          </div>
          <div className="border-t border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Device
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      MAC Address
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP Address
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Connected Since
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data Used
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredConnections.map((connection) => (
                    <tr key={connection.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-blue-100">
                            <UserCircleIcon className="h-6 w-6 text-blue-600" aria-hidden="true" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{connection.userName}</div>
                            <div className="text-sm text-gray-500">{connection.userId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{connection.deviceName}</div>
                        <div className="text-sm text-gray-500">{connection.connectionType}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {connection.macAddress}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {connection.ipAddress}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(connection.connectedSince).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(connection.connectedSince).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {connection.dataUsed}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDisconnect(connection.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Disconnect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Access Requests Tab */}
      {activeTab === 'requests' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Pending Access Requests
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Devices requesting access to the campus Wi-Fi network
            </p>
          </div>
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12 bg-gray-50">
              <WifiIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No pending requests</h3>
              <p className="mt-1 text-sm text-gray-500">All caught up! There are no pending Wi-Fi access requests.</p>
            </div>
          ) : (
            <div className="border-t border-gray-200">
              <ul className="divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <li key={request.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                            <WifiIcon className="h-6 w-6 text-yellow-600" aria-hidden="true" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {request.userName} <span className="text-gray-500">({request.userId})</span>
                            </div>
                            <div className="text-sm text-gray-500">{request.deviceName}</div>
                            <div className="mt-1 text-xs text-gray-500">
                              Requested at {new Date(request.requestTime).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex space-x-2">
                          <button
                            onClick={() => handleApproveRequest(request.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            <CheckCircleIcon className="-ml-1 mr-1 h-4 w-4" aria-hidden="true" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectRequest(request.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <XMarkIcon className="-ml-1 mr-1 h-4 w-4" aria-hidden="true" />
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Add Device Modal */}
      {showNewDevice && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Add New Device to Wi-Fi
                  </h3>
                  <div className="mt-4">
                    <form onSubmit={handleAddDevice}>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-6">
                          <div className="sm:col-span-3">
                            <label htmlFor="userId" className="block text-sm font-medium text-gray-700 text-left">
                              User ID
                            </label>
                            <input
                              type="text"
                              name="userId"
                              id="userId"
                              required
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              value={newDevice.userId}
                              onChange={(e) => setNewDevice({...newDevice, userId: e.target.value})}
                            />
                          </div>
                          <div className="sm:col-span-3">
                            <label htmlFor="userName" className="block text-sm font-medium text-gray-700 text-left">
                              User Name
                            </label>
                            <input
                              type="text"
                              name="userName"
                              id="userName"
                              required
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              value={newDevice.userName}
                              onChange={(e) => setNewDevice({...newDevice, userName: e.target.value})}
                            />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="deviceName" className="block text-sm font-medium text-gray-700 text-left">
                            Device Name
                          </label>
                          <input
                            type="text"
                            name="deviceName"
                            id="deviceName"
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={newDevice.deviceName}
                            onChange={(e) => setNewDevice({...newDevice, deviceName: e.target.value})}
                          />
                        </div>
                        <div>
                          <label htmlFor="macAddress" className="block text-sm font-medium text-gray-700 text-left">
                            MAC Address
                          </label>
                          <input
                            type="text"
                            name="macAddress"
                            id="macAddress"
                            required
                            placeholder="00:11:22:33:44:55"
                            pattern="^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={newDevice.macAddress}
                            onChange={(e) => setNewDevice({...newDevice, macAddress: e.target.value})}
                          />
                        </div>
                        <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                          <div>
                            <label htmlFor="connectionType" className="block text-sm font-medium text-gray-700 text-left">
                              Connection Type
                            </label>
                            <select
                              id="connectionType"
                              name="connectionType"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              value={newDevice.connectionType}
                              onChange={(e) => setNewDevice({...newDevice, connectionType: e.target.value})}
                            >
                              <option value="5GHz">5GHz</option>
                              <option value="2.4GHz">2.4GHz</option>
                              <option value="Ethernet">Wired (Ethernet)</option>
                            </select>
                          </div>
                          <div>
                            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 text-left">
                              Duration
                            </label>
                            <select
                              id="duration"
                              name="duration"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              value={newDevice.duration}
                              onChange={(e) => setNewDevice({...newDevice, duration: e.target.value})}
                            >
                              <option value="1 day">1 Day</option>
                              <option value="1 week">1 Week</option>
                              <option value="30 days">30 Days</option>
                              <option value="90 days">90 Days</option>
                              <option value="1 year">1 Year</option>
                              <option value="permanent">Permanent</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 text-left">
                            Notes (Optional)
                          </label>
                          <textarea
                            id="notes"
                            name="notes"
                            rows="2"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={newDevice.notes}
                            onChange={(e) => setNewDevice({...newDevice, notes: e.target.value})}
                          />
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
                          onClick={() => setShowNewDevice(false)}
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

export default WifiAccess;
