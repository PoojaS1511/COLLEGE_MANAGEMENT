import React, { useState, useEffect } from 'react';
import { 
  CalendarIcon, 
  ClockIcon, 
  UserGroupIcon, 
  MapPinIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  PencilIcon, 
  TrashIcon, 
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { auditoriumService } from '../../../services/infrastructureService';

// Format time range for display
const formatTimeRange = (startTime, endTime) => {
  if (!startTime || !endTime) return '';
  
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
};

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const statusStyles = {
  available: 'bg-green-100 text-green-800',
  booked: 'bg-yellow-100 text-yellow-800',
  under_maintenance: 'bg-red-100 text-red-800',
  pending: 'bg-blue-100 text-blue-800'
};

const statusLabels = {
  available: 'Available',
  booked: 'Booked',
  under_maintenance: 'Under Maintenance',
  pending: 'Pending Approval'
};
const AuditoriumBooking = () => {
  const [auditoriums, setAuditoriums] = useState([]);
  const [filters, setFilters] = useState({
    status: 'all',
    capacity: 'all',
    search: ''
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedAuditorium, setSelectedAuditorium] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch auditoriums from Supabase
  const fetchAuditoriums = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Prepare filters for the API call
      const apiFilters = {};
      if (filters.status !== 'all') apiFilters.status = filters.status;
      if (filters.capacity !== 'all') apiFilters.capacity = parseInt(filters.capacity);
      if (filters.search) apiFilters.search = filters.search;

      const data = await auditoriumService.getAuditoriums(apiFilters);
      setAuditoriums(data);
    } catch (err) {
      console.error('Error fetching auditoriums:', err);
      setError('Failed to load auditoriums. Please try again later.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchAuditoriums();
  }, [filters]);

  // Filter auditoriums based on filters (client-side filtering as fallback)
  const filteredAuditoriums = auditoriums.filter(auditorium => {
    return (
      (filters.status === 'all' || auditorium.status === filters.status) &&
      (filters.capacity === 'all' || auditorium.capacity >= parseInt(filters.capacity)) &&
      (filters.search === '' || 
       (auditorium.name && auditorium.name.toLowerCase().includes(filters.search.toLowerCase())) ||
       (auditorium.location && auditorium.location.toLowerCase().includes(filters.search.toLowerCase())))
    );
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const refreshData = () => {
    setIsRefreshing(true);
    fetchAuditoriums();
  };

  const handleBookNow = async (auditorium) => {
    try {
      setSelectedAuditorium(auditorium);
      setShowBookingForm(true);
    } catch (error) {
      console.error('Error preparing booking form:', error);
      setError('Failed to load booking form. Please try again.');
    }
  };

  const handleViewDetails = async (auditorium) => {
    try {
      // Fetch the latest auditorium data with bookings
      const updatedAuditorium = await auditoriumService.getAuditoriumById(auditorium.id);
      setSelectedAuditorium(updatedAuditorium);
      setShowDetails(true);
    } catch (error) {
      console.error('Error fetching auditorium details:', error);
      setError('Failed to load auditorium details. Please try again.');
    }
  };

  const handleCloseModal = () => {
    setShowBookingForm(false);
    setShowDetails(false);
    setSelectedAuditorium(null);
    setError(null);
  };

  // Handle booking submission
  const handleSubmitBooking = async (bookingData) => {
    try {
      setIsLoading(true);
      await auditoriumService.createBooking({
        ...bookingData,
        auditoriumId: selectedAuditorium.id
      });
      
      // Refresh the auditorium data
      await fetchAuditoriums();
      setShowBookingForm(false);
      setSelectedAuditorium(null);
      
      // Show success message or notification
      alert('Booking request submitted successfully!');
    } catch (error) {
      console.error('Error submitting booking:', error);
      setError('Failed to submit booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle status update
  const handleUpdateStatus = async (auditoriumId, newStatus) => {
    try {
      setIsLoading(true);
      await auditoriumService.updateAuditoriumStatus(auditoriumId, newStatus);
      
      // Refresh the auditorium data
      await fetchAuditoriums();
      
      // If we're viewing details, update the selected auditorium
      if (selectedAuditorium && selectedAuditorium.id === auditoriumId) {
        const updated = await auditoriumService.getAuditoriumById(auditoriumId);
        setSelectedAuditorium(updated);
      }
    } catch (error) {
      console.error('Error updating auditorium status:', error);
      setError('Failed to update auditorium status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Render loading state
  if (isLoading && !isRefreshing) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <ArrowPathIcon className="h-12 w-12 mx-auto text-indigo-500 animate-spin" />
          <p className="mt-2 text-gray-600">Loading auditoriums...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
            <div className="mt-2">
              <button
                type="button"
                onClick={refreshData}
                className="rounded-md bg-red-50 px-2 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Auditorium Booking</h1>
            <p className="text-gray-600">Manage and book auditorium spaces for events</p>
          </div>
          <div className="flex space-x-3 w-full sm:w-auto">
            <button
              onClick={refreshData}
              disabled={isRefreshing}
              className={`inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <ArrowPathIcon className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              onClick={() => {
                // Handle new auditorium creation
                // This would open a form to add a new auditorium
                // For now, just show a message
                alert('Feature coming soon: Add new auditorium');
              }}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Auditorium
            </button>
          </div>
        </div>

        {/* Filters */}
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
                <option value="available">Available</option>
                <option value="booked">Booked</option>
                <option value="under_maintenance">Under Maintenance</option>
              </select>
            </div>
            <div>
              <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">Min Capacity</label>
              <select
                id="capacity"
                name="capacity"
                value={filters.capacity}
                onChange={handleFilterChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="all">Any Capacity</option>
                <option value="100">100+</option>
                <option value="200">200+</option>
                <option value="300">300+</option>
                <option value="500">500+</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="search"
                  id="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Search by name or location..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Auditorium List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {filteredAuditoriums.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400">
                <CalendarIcon className="mx-auto h-12 w-12" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No auditoriums found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {filters.status !== 'all' || filters.capacity !== 'all' || filters.search
                    ? 'Try adjusting your filters.'
                    : 'No auditoriums are currently available.'}
                </p>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredAuditoriums.map((auditorium) => {
                const upcomingBookings = auditorium.bookings || [];
                
                return (
                  <li key={auditorium.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="text-2xl mr-4">🎭</div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{auditorium.name}</h3>
                          <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
                            <div className="mt-2 flex items-center text-sm text-gray-500">
                              <MapPinIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                              {auditorium.location || 'Location not specified'}
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-500">
                              <UserGroupIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                              {auditorium.capacity || 'N/A'} people
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[auditorium.status] || 'bg-gray-100 text-gray-800'}`}>
                          {statusLabels[auditorium.status] || 'Unknown'}
                        </span>
                        {auditorium.status === 'available' && (
                          <button
                            onClick={() => handleUpdateStatus(auditorium.id, 'under_maintenance')}
                            className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
                            title="Mark as Under Maintenance"
                          >
                            <ExclamationTriangleIcon className="h-4 w-4" />
                          </button>
                        )}
                        {auditorium.status === 'under_maintenance' && (
                          <button
                            onClick={() => handleUpdateStatus(auditorium.id, 'available')}
                            className="text-green-600 hover:text-green-800 text-sm font-medium"
                            title="Mark as Available"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => handleViewDetails(auditorium)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <PencilIcon className="-ml-0.5 mr-2 h-4 w-4" />
                        View Details
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBookNow(auditorium)}
                        disabled={auditorium.status !== 'available'}
                        className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md text-white ${
                          auditorium.status === 'available' 
                            ? 'bg-indigo-600 hover:bg-indigo-700' 
                            : 'bg-gray-300 cursor-not-allowed'
                        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                      >
                        <CalendarIcon className="-ml-0.5 mr-2 h-4 w-4" />
                        Book Now
                      </button>
                    </div>
                    {upcomingBookings.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Upcoming Bookings</h4>
                        <div className="space-y-2">
                          {upcomingBookings.slice(0, 2).map(booking => (
                            <div key={booking.id} className="bg-gray-50 p-3 rounded-md">
                              <div className="flex justify-between">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{booking.event_name}</p>
                                  <p className="text-sm text-gray-500">
                                    {formatDate(booking.start_time)} • {formatTimeRange(booking.start_time, booking.end_time)}
                                  </p>
                                </div>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  booking.status === 'approved' ? 'bg-green-100 text-green-800' :
                                  booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                </span>
                              </div>
                            </div>
                          ))}
                          {upcomingBookings.length > 2 && (
                            <p className="text-sm text-indigo-600">+{upcomingBookings.length - 2} more bookings</p>
                          )}
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && selectedAuditorium && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100">
                  <CalendarIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Book {selectedAuditorium.name}
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Please fill in the details below to book this auditorium.
                    </p>
                  </div>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label htmlFor="eventName" className="block text-sm font-medium text-gray-700 text-left">
                        Event Name
                      </label>
                      <input
                        type="text"
                        name="eventName"
                        id="eventName"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Enter event name"
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 text-left">
                          Start Date
                        </label>
                        <input
                          type="datetime-local"
                          name="startDate"
                          id="startDate"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 text-left">
                          End Date
                        </label>
                        <input
                          type="datetime-local"
                          name="endDate"
                          id="endDate"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="organizerName" className="block text-sm font-medium text-gray-700 text-left">
                        Organizer Name
                      </label>
                      <input
                        type="text"
                        name="organizerName"
                        id="organizerName"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Enter organizer name"
                      />
                    </div>
                    <div>
                      <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 text-left">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        name="contactEmail"
                        id="contactEmail"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Enter contact email"
                      />
                    </div>
                    <div>
                      <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 text-left">
                        Purpose
                      </label>
                      <textarea
                        name="purpose"
                        id="purpose"
                        rows={3}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Briefly describe the purpose of this booking"
                        defaultValue={''}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  onClick={() => {
                    // Handle form submission
                    const form = document.getElementById('bookingForm');
                    const formData = new FormData(form);
                    const bookingData = {
                      eventName: formData.get('eventName'),
                      startTime: formData.get('startDate'),
                      endTime: formData.get('endDate'),
                      organizerName: formData.get('organizerName'),
                      contactEmail: formData.get('contactEmail'),
                      purpose: formData.get('purpose')
                    };
                    handleSubmitBooking(bookingData);
                  }}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                >
                  Submit Booking
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auditorium Details Modal */}
      {showDetails && selectedAuditorium && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {selectedAuditorium.name} Details
                  </h3>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <span className="sr-only">Close</span>
                    <XCircleIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="mt-4 space-y-4">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Location</p>
                        <p className="mt-1 text-sm text-gray-900">{selectedAuditorium.location || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Capacity</p>
                        <p className="mt-1 text-sm text-gray-900">{selectedAuditorium.capacity || 'N/A'} people</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Status</p>
                        <p className="mt-1">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            statusStyles[selectedAuditorium.status] || 'bg-gray-100 text-gray-800'
                          }`}>
                            {statusLabels[selectedAuditorium.status] || selectedAuditorium.status}
                          </span>
                        </p>
                      </div>
                      {selectedAuditorium.equipment && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Equipment</p>
                          <p className="mt-1 text-sm text-gray-900">{selectedAuditorium.equipment}</p>
                        </div>
                      )}
                    </div>
                    {selectedAuditorium.description && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-500">Description</p>
                        <p className="mt-1 text-sm text-gray-900">{selectedAuditorium.description}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Upcoming Bookings</h4>
                    {selectedAuditorium.bookings && selectedAuditorium.bookings.length > 0 ? (
                      <div className="space-y-2">
                        {selectedAuditorium.bookings.map(booking => (
                          <div key={booking.id} className="border border-gray-200 rounded-md p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{booking.event_name}</p>
                                <p className="text-sm text-gray-500">
                                  {formatDate(booking.start_time)} • {formatTimeRange(booking.start_time, booking.end_time)}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                  Organized by: {booking.organizer_name}
                                </p>
                                {booking.purpose && (
                                  <p className="text-sm text-gray-500 mt-1">
                                    Purpose: {booking.purpose}
                                  </p>
                                )}
                              </div>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                booking.status === 'approved' ? 'bg-green-100 text-green-800' :
                                booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </span>
                            </div>
                            {booking.contact_email && (
                              <div className="mt-2">
                                <a
                                  href={`mailto:${booking.contact_email}`}
                                  className="text-sm text-indigo-600 hover:text-indigo-500"
                                >
                                  {booking.contact_email}
                                </a>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-500">No upcoming bookings</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditoriumBooking;