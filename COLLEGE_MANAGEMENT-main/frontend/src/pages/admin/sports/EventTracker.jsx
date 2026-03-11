import React, { useState } from 'react';
import { 
  CalendarIcon, 
  ClockIcon, 
  MapPinIcon, 
  UsersIcon, 
  TrophyIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  CheckCircleIcon,
  XMarkIcon,
  UserGroupIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const EventTracker = () => {
  // Mock data for events
  const [events, setEvents] = useState([
    {
      id: 1,
      title: 'Annual Sports Day',
      type: 'Tournament',
      sport: 'Multiple',
      date: '2025-11-15',
      startTime: '09:00',
      endTime: '17:00',
      location: 'Main Sports Complex',
      organizer: 'Sports Department',
      description: 'Annual inter-department sports competition featuring various events.',
      status: 'upcoming',
      participants: [
        { id: 1, name: 'John Doe', department: 'Computer Science', role: 'Player' },
        { id: 2, name: 'Jane Smith', department: 'Electronics', role: 'Player' },
        { id: 3, name: 'Dr. Robert Johnson', department: 'Sports', role: 'Referee' }
      ],
      results: null
    }
  ]);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [resultFormData, setResultFormData] = useState({
    winner: '',
    runnerUp: '',
    highlights: ''
  });

  const closeModal = () => {
    setSelectedEvent(null);
    setShowEventForm(false);
  };

  const handleResultInputChange = (e) => {
    const { name, value } = e.target;
    setResultFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const submitResult = (e) => {
    e.preventDefault();
    // Handle form submission
    closeModal();
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Sports Events Tracker</h1>
        <button
          onClick={() => setShowEventForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
          Add New Event
        </button>
      </div>

      {/* Event List */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                  <TrophyIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {event.type}
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {event.title}
                    </div>
                  </dd>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-gray-500">
                  <CalendarIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                  {event.date} • {event.startTime} - {event.endTime}
                </div>
                <div className="mt-1 flex items-center text-sm text-gray-500">
                  <MapPinIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                  {event.location}
                </div>
                <div className="mt-1 flex items-center text-sm text-gray-500">
                  <UsersIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                  {event.participants.length} participants
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => setSelectedEvent(event)}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  View details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
              <div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {selectedEvent.title}
                    </h3>
                    <button
                      type="button"
                      className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                      onClick={closeModal}
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {selectedEvent.description}
                    </p>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center text-sm text-gray-500">
                        <CalendarIcon className="flex-shrink-0 mr-2 h-5 w-5 text-gray-400" />
                        {selectedEvent.date} • {selectedEvent.startTime} - {selectedEvent.endTime}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPinIcon className="flex-shrink-0 mr-2 h-5 w-5 text-gray-400" />
                        {selectedEvent.location}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <UserGroupIcon className="flex-shrink-0 mr-2 h-5 w-5 text-gray-400" />
                        Organized by {selectedEvent.organizer}
                      </div>
                    </div>
                    
                    {selectedEvent.participants.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-900">Participants</h4>
                        <ul className="mt-2 space-y-2">
                          {selectedEvent.participants.map((participant) => (
                            <li key={participant.id} className="flex items-center text-sm text-gray-500">
                              <UserIcon className="flex-shrink-0 mr-2 h-4 w-4 text-gray-400" />
                              {participant.name} ({participant.department}) - {participant.role}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {selectedEvent.status === 'upcoming' && (
                      <div className="mt-4">
                        <button
                          type="button"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          onClick={() => setShowEventForm(true)}
                        >
                          Add Results
                        </button>
                      </div>
                    )}
                    
                    {selectedEvent.results && (
                      <div className="mt-4 border-t border-gray-200 pt-4">
                        <h4 className="text-sm font-medium text-gray-900">Results</h4>
                        <div className="mt-2 space-y-2">
                          <p className="text-sm text-gray-500">
                            <span className="font-medium">Winner:</span> {selectedEvent.results.winner}
                          </p>
                          <p className="text-sm text-gray-500">
                            <span className="font-medium">Runner-up:</span> {selectedEvent.results.runnerUp}
                          </p>
                          {selectedEvent.results.highlights && (
                            <div className="mt-2">
                              <p className="text-sm font-medium text-gray-900">Highlights:</p>
                              <p className="text-sm text-gray-500">{selectedEvent.results.highlights}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Results Modal */}
      {selectedEvent && selectedEvent.status === 'upcoming' && showEventForm && (
        <div className="fixed z-20 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
              <div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Add Results for {selectedEvent.title}
                    </h3>
                    <button
                      type="button"
                      className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                      onClick={closeModal}
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                  <div className="mt-2">
                    <form onSubmit={submitResult}>
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="winner" className="block text-sm font-medium text-gray-700">
                            Winner
                          </label>
                          <input
                            type="text"
                            name="winner"
                            id="winner"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={resultFormData.winner}
                            onChange={handleResultInputChange}
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="runnerUp" className="block text-sm font-medium text-gray-700">
                            Runner-up
                          </label>
                          <input
                            type="text"
                            name="runnerUp"
                            id="runnerUp"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={resultFormData.runnerUp}
                            onChange={handleResultInputChange}
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="highlights" className="block text-sm font-medium text-gray-700">
                            Highlights (Optional)
                          </label>
                          <textarea
                            id="highlights"
                            name="highlights"
                            rows={3}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={resultFormData.highlights}
                            onChange={handleResultInputChange}
                          />
                        </div>
                      </div>
                      <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                        <button
                          type="submit"
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:col-start-2 sm:text-sm"
                        >
                          Save Results
                        </button>
                        <button
                          type="button"
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                          onClick={closeModal}
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

export default EventTracker;