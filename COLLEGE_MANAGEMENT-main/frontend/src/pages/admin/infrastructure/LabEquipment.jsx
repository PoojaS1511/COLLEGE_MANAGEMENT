import React, { useState, useEffect } from 'react';
import { 
  BeakerIcon, 
  ComputerDesktopIcon, 
  EyeIcon, 
  WrenchScrewdriverIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  UserGroupIcon,
  CalendarIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';

// Mock data for lab equipment
const mockEquipment = [
  {
    id: 1,
    name: 'Microscope X-2000',
    type: 'Microscope',
    lab: 'Biology Lab 101',
    status: 'available',
    lastMaintenance: '2023-10-10',
    nextMaintenance: '2024-01-10',
    bookings: [
      { id: 1, user: 'Dr. Smith', date: '2023-10-20', time: '10:00 - 12:00', status: 'confirmed' },
      { id: 2, user: 'Dr. Johnson', date: '2023-10-21', time: '14:00 - 16:00', status: 'pending' }
    ]
  },
  {
    id: 2,
    name: 'Centrifuge C-500',
    type: 'Centrifuge',
    lab: 'Chemistry Lab 201',
    status: 'in-use',
    lastMaintenance: '2023-09-15',
    nextMaintenance: '2023-12-15',
    currentUser: 'Dr. Williams',
    bookings: []
  },
  {
    id: 3,
    name: 'Spectrophotometer SP-1000',
    type: 'Spectrophotometer',
    lab: 'Physics Lab 301',
    status: 'maintenance',
    lastMaintenance: '2023-10-05',
    nextMaintenance: '2023-10-25',
    maintenanceNotes: 'Calibration in progress',
    bookings: []
  },
  {
    id: 4,
    name: 'PCR Machine',
    type: 'Thermocycler',
    lab: 'Genetics Lab 102',
    status: 'available',
    lastMaintenance: '2023-09-20',
    nextMaintenance: '2023-12-20',
    bookings: [
      { id: 3, user: 'Dr. Brown', date: '2023-10-22', time: '09:00 - 11:00', status: 'confirmed' }
    ]
  }
];

const statusStyles = {
  available: 'bg-green-100 text-green-800',
  'in-use': 'bg-yellow-100 text-yellow-800',
  maintenance: 'bg-blue-100 text-blue-800',
  'out-of-order': 'bg-red-100 text-red-800'
};

const equipmentTypes = ['All', 'Microscope', 'Centrifuge', 'Spectrophotometer', 'Thermocycler', 'Other'];
const labLocations = ['All', 'Biology Lab 101', 'Chemistry Lab 201', 'Physics Lab 301', 'Genetics Lab 102'];

const LabEquipment = () => {
  const [equipment, setEquipment] = useState(mockEquipment);
  const [filters, setFilters] = useState({
    type: 'All',
    lab: 'All',
    status: 'All',
    search: ''
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newEquipment, setNewEquipment] = useState({
    name: '',
    type: '',
    lab: '',
    status: 'available',
    lastMaintenance: new Date().toISOString().split('T')[0],
    nextMaintenance: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0]
  });

  // Filter equipment based on filters
  const filteredEquipment = equipment.filter(item => {
    return (
      (filters.type === 'All' || item.type === filters.type) &&
      (filters.lab === 'All' || item.lab === filters.lab) &&
      (filters.status === 'All' || item.status === filters.status) &&
      (filters.search === '' || 
       item.name.toLowerCase().includes(filters.search.toLowerCase()) ||
       item.type.toLowerCase().includes(filters.search.toLowerCase()))
    );
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEquipment(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddEquipment = (e) => {
    e.preventDefault();
    const newId = Math.max(...equipment.map(e => e.id), 0) + 1;
    setEquipment([...equipment, { ...newEquipment, id: newId, bookings: [] }]);
    setShowAddModal(false);
    // Reset form
    setNewEquipment({
      name: '',
      type: '',
      lab: '',
      status: 'available',
      lastMaintenance: new Date().toISOString().split('T')[0],
      nextMaintenance: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0]
    });
  };

  const handleDeleteEquipment = (id) => {
    if (window.confirm('Are you sure you want to delete this equipment?')) {
      setEquipment(equipment.filter(item => item.id !== id));
    }
  };

  const refreshData = () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const getEquipmentIcon = (type) => {
    switch(type.toLowerCase()) {
      case 'microscope':
        return <EyeIcon className="h-6 w-6 text-indigo-600" />;
      case 'centrifuge':
        return <ArrowPathIcon className="h-6 w-6 text-blue-600" />;
      case 'spectrophotometer':
        return <BeakerIcon className="h-6 w-6 text-purple-600" />;
      case 'thermocycler':
        return <ComputerDesktopIcon className="h-6 w-6 text-green-600" />;
      default:
        return <BeakerIcon className="h-6 w-6 text-gray-600" />;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Lab Equipment Management</h1>
            <p className="text-gray-600">Manage and track laboratory equipment across all departments</p>
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
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Add Equipment
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Equipment Type</label>
              <select
                id="type"
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                {equipmentTypes.map(type => (
                  <option key={type} value={type}>{type === 'All' ? 'All Types' : type}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="lab" className="block text-sm font-medium text-gray-700 mb-1">Lab Location</label>
              <select
                id="lab"
                name="lab"
                value={filters.lab}
                onChange={handleFilterChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                {labLocations.map(lab => (
                  <option key={lab} value={lab === 'All' ? 'All' : lab}>
                    {lab === 'All' ? 'All Labs' : lab}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                id="status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="All">All Statuses</option>
                <option value="available">Available</option>
                <option value="in-use">In Use</option>
                <option value="maintenance">Maintenance</option>
                <option value="out-of-order">Out of Order</option>
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
                  placeholder="Search equipment or lab..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Equipment Grid */}
        <div className="grid grid-cols-1 gap-6">
          {filteredEquipment.map(item => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
              <div className="p-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-100">
                        {getEquipmentIcon(item.type)}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center">
                        <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[item.status]}">
                          {item.status === 'available' && <CheckCircleIcon className="h-3 w-3 mr-1" />}
                          {item.status === 'in-use' && <ClockIcon className="h-3 w-3 mr-1" />}
                          {item.status === 'maintenance' && <WrenchScrewdriverIcon className="h-3 w-3 mr-1" />}
                          {item.status === 'out-of-order' && <XCircleIcon className="h-3 w-3 mr-1" />}
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1).replace('-', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{item.type}</p>
                      <p className="text-sm text-gray-500">{item.lab}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 md:mt-0 flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedEquipment(item);
                        setShowBookingModal(true);
                      }}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      Book
                    </button>
                    <button
                      className="text-indigo-600 hover:text-indigo-900"
                      onClick={() => {
                        // Edit functionality would go here
                        setNewEquipment({
                          ...item,
                          lastMaintenance: item.lastMaintenance || new Date().toISOString().split('T')[0],
                          nextMaintenance: item.nextMaintenance || new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0]
                        });
                        setShowAddModal(true);
                      }}
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteEquipment(item.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Equipment Details */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Maintenance</h4>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Last Maintenance:</span> {item.lastMaintenance}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Next Maintenance:</span> {item.nextMaintenance}
                      </p>
                      {item.maintenanceNotes && (
                        <p className="text-sm text-yellow-700 bg-yellow-50 p-2 rounded">
                          <span className="font-medium">Notes:</span> {item.maintenanceNotes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Current Status</h4>
                    <div className="space-y-2">
                      {item.status === 'in-use' && item.currentUser && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">In use by:</span> {item.currentUser}
                        </p>
                      )}
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Status:</span> {item.status}
                      </p>
                      {item.status === 'maintenance' && (
                        <p className="text-sm text-blue-700 bg-blue-50 p-2 rounded">
                          <WrenchScrewdriverIcon className="h-4 w-4 inline mr-1" />
                          {item.maintenanceNotes || 'Under maintenance'}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Upcoming Bookings</h4>
                    {item.bookings && item.bookings.length > 0 ? (
                      <ul className="space-y-2">
                        {item.bookings.slice(0, 2).map(booking => (
                          <li key={booking.id} className="text-sm text-gray-600">
                            <div className="flex items-center">
                              <CalendarIcon className="h-4 w-4 text-indigo-500 mr-2" />
                              <div>
                                <div>{booking.date} • {booking.time}</div>
                                <div className="text-xs text-gray-500">{booking.user}</div>
                              </div>
                              {booking.status === 'confirmed' ? (
                                <CheckCircleIcon className="h-4 w-4 text-green-500 ml-auto" />
                              ) : (
                                <ClockIcon className="h-4 w-4 text-yellow-500 ml-auto" />
                              )}
                            </div>
                          </li>
                        ))}
                        {item.bookings.length > 2 && (
                          <li className="text-xs text-indigo-600 mt-1">
                            +{item.bookings.length - 2} more booking{ item.bookings.length > 3 ? 's' : ''}
                          </li>
                        )}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No upcoming bookings</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredEquipment.length === 0 && (
          <div className="text-center py-12">
            <BeakerIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No lab equipment found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Equipment Modal */}
      {showAddModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100">
                  <BeakerIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {newEquipment.id ? 'Edit Equipment' : 'Add New Equipment'}
                  </h3>
                  <div className="mt-2">
                    <form onSubmit={handleAddEquipment}>
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 text-left">Equipment Name</label>
                          <input
                            type="text"
                            name="name"
                            id="name"
                            required
                            value={newEquipment.name}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="e.g., Microscope X-2000"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700 text-left">Type</label>
                            <select
                              id="type"
                              name="type"
                              required
                              value={newEquipment.type}
                              onChange={handleInputChange}
                              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                            >
                              <option value="">Select a type</option>
                              {equipmentTypes.filter(t => t !== 'All').map(type => (
                                <option key={type} value={type}>{type}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label htmlFor="lab" className="block text-sm font-medium text-gray-700 text-left">Lab Location</label>
                            <select
                              id="lab"
                              name="lab"
                              required
                              value={newEquipment.lab}
                              onChange={handleInputChange}
                              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                            >
                              <option value="">Select a lab</option>
                              {labLocations.filter(l => l !== 'All').map(lab => (
                                <option key={lab} value={lab}>{lab}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="lastMaintenance" className="block text-sm font-medium text-gray-700 text-left">Last Maintenance</label>
                            <input
                              type="date"
                              name="lastMaintenance"
                              id="lastMaintenance"
                              required
                              value={newEquipment.lastMaintenance}
                              onChange={handleInputChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label htmlFor="nextMaintenance" className="block text-sm font-medium text-gray-700 text-left">Next Maintenance</label>
                            <input
                              type="date"
                              name="nextMaintenance"
                              id="nextMaintenance"
                              required
                              value={newEquipment.nextMaintenance}
                              onChange={handleInputChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="status" className="block text-sm font-medium text-gray-700 text-left">Status</label>
                          <select
                            id="status"
                            name="status"
                            required
                            value={newEquipment.status}
                            onChange={handleInputChange}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                          >
                            <option value="available">Available</option>
                            <option value="in-use">In Use</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="out-of-order">Out of Order</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                        <button
                          type="submit"
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                        >
                          {newEquipment.id ? 'Update Equipment' : 'Add Equipment'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddModal(false);
                            setNewEquipment({
                              name: '',
                              type: '',
                              lab: '',
                              status: 'available',
                              lastMaintenance: new Date().toISOString().split('T')[0],
                              nextMaintenance: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0]
                            });
                          }}
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
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

      {/* Booking Modal */}
      {showBookingModal && selectedEquipment && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                  <CalendarIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Book {selectedEquipment.name}
                  </h3>
                  <div className="mt-4">
                    <div className="bg-white">
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="bookingDate" className="block text-sm font-medium text-gray-700 text-left">Date</label>
                          <input
                            type="date"
                            id="bookingDate"
                            name="bookingDate"
                            min={new Date().toISOString().split('T')[0]}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label htmlFor="bookingTime" className="block text-sm font-medium text-gray-700 text-left">Time Slot</label>
                          <select
                            id="bookingTime"
                            name="bookingTime"
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                          >
                            <option>09:00 - 10:30</option>
                            <option>10:45 - 12:15</option>
                            <option>13:30 - 15:00</option>
                            <option>15:15 - 16:45</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 text-left">Purpose</label>
                          <textarea
                            id="purpose"
                            name="purpose"
                            rows={3}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Briefly describe the purpose of this booking"
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                  onClick={() => {
                    // Handle booking submission
                    setShowBookingModal(false);
                  }}
                >
                  Confirm Booking
                </button>
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
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

export default LabEquipment;
