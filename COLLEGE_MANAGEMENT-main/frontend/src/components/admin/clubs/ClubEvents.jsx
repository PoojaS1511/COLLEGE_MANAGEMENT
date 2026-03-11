import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  CalendarIcon, 
  PlusIcon, 
  ClockIcon, 
  MapPinIcon, 
  UserGroupIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XMarkIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { format, parseISO, isBefore, isAfter, isToday } from 'date-fns';
import ApiService from '../../../services/api';

const eventStatus = {
  upcoming: 'bg-blue-100 text-blue-800',
  ongoing: 'bg-green-100 text-green-800',
  past: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
};

const eventTypeStyles = {
  meeting: 'bg-purple-100 text-purple-800',
  workshop: 'bg-yellow-100 text-yellow-800',
  competition: 'bg-red-100 text-red-800',
  social: 'bg-blue-100 text-blue-800',
  other: 'bg-gray-100 text-gray-800',
};

const ClubEvents = () => {
  const { id: clubId } = useParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [clubId]);

  const fetchEvents = async () => {
    // Check if clubId is available before making API call
    if (!clubId || clubId === 'undefined' || clubId === 'null' || clubId === '') {
      console.log('No valid clubId available, skipping fetch');
      setError('Invalid club ID. Please select a valid club.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      console.log('Fetching events for clubId:', clubId);
      const response = await ApiService.getClubEvents(clubId);
      if (response.success) {
        // Process events to add status and format dates
        const processedEvents = (response.data || []).map(event => ({
          ...event,
          start_date: event.start_date,
          end_date: event.end_date,
          status: getEventStatus(event),
          formattedStartDate: format(parseISO(event.start_date), 'MMM d, yyyy h:mm a'),
          formattedEndDate: format(parseISO(event.end_date), 'MMM d, yyyy h:mm a'),
          isToday: isToday(parseISO(event.start_date)),
        }));
        setEvents(processedEvents);
      } else {
        setError(response.message || 'Failed to load events');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const getEventStatus = (event) => {
    const now = new Date();
    const startDate = new Date(event.start_date);
    const endDate = new Date(event.end_date);
    
    if (event.status === 'cancelled') return 'cancelled';
    if (isBefore(now, startDate)) return 'upcoming';
    if (isAfter(now, endDate)) return 'past';
    return 'ongoing';
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      setIsDeleting(true);
      const response = await ApiService.deleteEvent(eventId);
      if (response.success) {
        // Remove the event from the local state
        setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    } finally {
      setShowDeleteModal(null);
      setIsDeleting(false);
    }
  };

  const toggleEventStatus = async (event) => {
    const newStatus = event.status === 'cancelled' ? 'upcoming' : 'cancelled';
    
    try {
      const response = await ApiService.updateEvent(event.id, { status: newStatus });
      if (response.success) {
        // Update the local state
        setEvents(prevEvents => 
          prevEvents.map(evt => 
            evt.id === event.id 
              ? { 
                  ...evt, 
                  status: newStatus,
                  statusText: newStatus === 'cancelled' ? 'Cancelled' : 'Upcoming'
                } 
              : evt
          )
        );
      }
    } catch (error) {
      console.error('Error updating event status:', error);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    const matchesType = typeFilter === 'all' || event.event_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const upcomingEvents = filteredEvents.filter(event => event.status === 'upcoming');
  const ongoingEvents = filteredEvents.filter(event => event.status === 'ongoing');
  const pastEvents = filteredEvents.filter(event => event.status === 'past');
  const cancelledEvents = filteredEvents.filter(event => event.status === 'cancelled');

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <XMarkIcon className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
            {error.includes('Invalid club ID') ? (
              <div className="mt-2">
                <Link
                  to="/admin/academics/clubs"
                  className="text-sm font-medium text-red-700 hover:text-red-600"
                >
                  Go back to Clubs &larr;
                </Link>
              </div>
            ) : (
              <button
                onClick={fetchEvents}
                className="mt-2 text-sm font-medium text-red-700 hover:text-red-600"
              >
                Retry <span aria-hidden="true">&rarr;</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Club Events</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage and track all club events and activities.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            to={`/admin/clubs/${clubId}/events/new`}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            New Event
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                Search events
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="search"
                  id="search"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Search by title or description"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="status"
                name="status"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="past">Past</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                Event Type
              </label>
              <select
                id="type"
                name="type"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="meeting">Meeting</option>
                <option value="workshop">Workshop</option>
                <option value="competition">Competition</option>
                <option value="social">Social</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Events list */}
      <div className="space-y-8">
        {ongoingEvents.length > 0 && (
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              Happening Now ({ongoingEvents.length})
            </h2>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {ongoingEvents.map((event) => (
                  <EventItem 
                    key={event.id} 
                    event={event} 
                    onToggleStatus={toggleEventStatus}
                    onDeleteClick={() => setShowDeleteModal(event.id)}
                    clubId={clubId}
                  />
                ))}
              </ul>
            </div>
          </div>
        )}

        {upcomingEvents.length > 0 && (
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Upcoming Events ({upcomingEvents.length})
            </h2>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {upcomingEvents.map((event) => (
                  <EventItem 
                    key={event.id} 
                    event={event} 
                    onToggleStatus={toggleEventStatus}
                    onDeleteClick={() => setShowDeleteModal(event.id)}
                    clubId={clubId}
                  />
                ))}
              </ul>
            </div>
          </div>
        )}

        {pastEvents.length > 0 && (
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Past Events ({pastEvents.length})
            </h2>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {pastEvents.map((event) => (
                  <EventItem 
                    key={event.id} 
                    event={event} 
                    onToggleStatus={toggleEventStatus}
                    onDeleteClick={() => setShowDeleteModal(event.id)}
                    clubId={clubId}
                  />
                ))}
              </ul>
            </div>
          </div>
        )}

        {cancelledEvents.length > 0 && (
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Cancelled Events ({cancelledEvents.length})
            </h2>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {cancelledEvents.map((event) => (
                  <EventItem 
                    key={event.id} 
                    event={event} 
                    onToggleStatus={toggleEventStatus}
                    onDeleteClick={() => setShowDeleteModal(event.id)}
                    clubId={clubId}
                  />
                ))}
              </ul>
            </div>
          </div>
        )}

        {filteredEvents.length === 0 && (
          <div className="text-center py-12 bg-white shadow sm:rounded-lg">
            <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No events found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'No events match your search criteria.'
                : 'Get started by creating a new event.'}
            </p>
            <div className="mt-6">
              <Link
                to={`/admin/academics/clubs/${clubId}/events/new`}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                New Event
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal !== null && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <XMarkIcon className="h-6 w-6 text-red-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Event</h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete this event? This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => handleDeleteEvent(showDeleteModal)}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={() => setShowDeleteModal(null)}
                  disabled={isDeleting}
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

const EventItem = ({ event, onToggleStatus, onDeleteClick, clubId }) => {
  const statusText = {
    upcoming: 'Upcoming',
    ongoing: 'Happening Now',
    past: 'Past Event',
    cancelled: 'Cancelled'
  };

  const eventTypeLabels = {
    meeting: 'Meeting',
    workshop: 'Workshop',
    competition: 'Competition',
    social: 'Social',
    other: 'Other'
  };

  return (
    <li>
      <div className="px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${eventTypeStyles[event.event_type] || 'bg-gray-100'}`}>
                <CalendarIcon className="h-6 w-6" />
              </div>
            </div>
            <div className="ml-4">
              <div className="flex items-center">
                <Link 
                  to={`/admin/academics/clubs/${clubId}/events/${event.id}`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  {event.title}
                </Link>
                <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${eventTypeStyles[event.event_type] || 'bg-gray-100 text-gray-800'}`}>
                  {eventTypeLabels[event.event_type] || 'Event'}
                </span>
              </div>
              <div className="mt-1 text-sm text-gray-500">
                <div className="flex items-center">
                  <ClockIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                  <span>{event.formattedStartDate} - {event.formattedEndDate}</span>
                </div>
                {event.location && (
                  <div className="flex items-center mt-1">
                    <MapPinIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                    <span>{event.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${eventStatus[event.status] || 'bg-gray-100 text-gray-800'}`}>
              {statusText[event.status] || event.status}
            </span>
            <div className="flex space-x-1">
              <Link
                to={`/admin/academics/clubs/${clubId}/events/${event.id}/edit`}
                className="text-blue-600 hover:text-blue-900"
                title="Edit event"
              >
                <PencilIcon className="h-5 w-5" />
              </Link>
              <button
                onClick={() => onToggleStatus(event)}
                className={`${event.status === 'cancelled' ? 'text-green-600 hover:text-green-900' : 'text-yellow-600 hover:text-yellow-900'}`}
                title={event.status === 'cancelled' ? 'Re-activate event' : 'Cancel event'}
              >
                {event.status === 'cancelled' ? (
                  <CheckCircleIcon className="h-5 w-5" />
                ) : (
                  <XMarkIcon className="h-5 w-5" />
                )}
              </button>
              <button
                onClick={onDeleteClick}
                className="text-red-600 hover:text-red-900"
                title="Delete event"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        {event.description && (
          <div className="mt-2 text-sm text-gray-600 line-clamp-2">
            {event.description}
          </div>
        )}
      </div>
    </li>
  );
};

export default ClubEvents;
