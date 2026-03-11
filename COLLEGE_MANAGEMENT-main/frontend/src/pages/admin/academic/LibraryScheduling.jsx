import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  BookOpenIcon,
  UserGroupIcon,
  ClockIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

// Initialize the localizer with moment
const localizer = momentLocalizer(moment);

// Mock data for library rooms
const libraryRooms = [
  { id: 1, name: 'Study Room A', capacity: 6, floor: '1st Floor' },
  { id: 2, name: 'Study Room B', capacity: 8, floor: '1st Floor' },
  { id: 3, name: 'Group Study Room', capacity: 12, floor: '2nd Floor' },
  { id: 4, name: 'Quiet Study Area', capacity: 20, floor: '2nd Floor' },
];

// Mock data for scheduled bookings
const initialEvents = [
  {
    id: 1,
    title: 'Study Group - CS101',
    start: new Date(2025, 9, 20, 10, 0), // year, month (0-11), day, hour, minute
    end: new Date(2025, 9, 20, 12, 0),
    roomId: 1,
    bookedBy: 'John Doe',
    status: 'confirmed',
  },
  {
    id: 2,
    title: 'Research Meeting',
    start: new Date(2025, 9, 20, 14, 0),
    end: new Date(2025, 9, 20, 16, 0),
    roomId: 3,
    bookedBy: 'Sarah Johnson',
    status: 'confirmed',
  },
];

const LibraryScheduling = () => {
  const [events, setEvents] = useState(initialEvents);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSelectEvent = (event) => {
    // Handle event selection (view/edit)
    console.log('Selected event:', event);
  };

  const handleSelectSlot = ({ start, end }) => {
    // Handle slot selection (create new booking)
    setSelectedRoom(1); // Default to first room for new booking
    setShowBookingForm(true);
    console.log('Selected slot:', { start, end });
  };

  const filteredRooms = libraryRooms.filter(room =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.floor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Library Room Scheduling</h1>
        <button
          onClick={() => setShowBookingForm(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Booking
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Room List */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow p-4">
          <div className="mb-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search rooms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-3">
            {filteredRooms.map((room) => (
              <div 
                key={room.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedRoom === room.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedRoom(room.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{room.name}</h3>
                    <p className="text-sm text-gray-500">{room.floor}</p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {room.capacity} seats
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Calendar View */}
        <div className="lg:col-span-3 bg-white rounded-lg shadow p-4">
          <div style={{ height: '70vh' }}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              selectable
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
              defaultView="week"
              views={['day', 'week', 'month']}
              step={30}
              timeslots={2}
              min={new Date(2025, 0, 1, 8, 0)} // 8:00 AM
              max={new Date(2025, 0, 1, 20, 0)} // 8:00 PM
            />
          </div>
        </div>
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">New Booking</h2>
              <button 
                onClick={() => setShowBookingForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={selectedRoom || ''}
                  onChange={(e) => setSelectedRoom(parseInt(e.target.value))}
                >
                  <option value="">Select a room</option>
                  {libraryRooms.map(room => (
                    <option key={room.id} value={room.id}>
                      {room.name} ({room.capacity} seats)
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title/Description</label>
                <input 
                  type="text" 
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="E.g., Study Group - CS101"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input 
                    type="datetime-local" 
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input 
                    type="datetime-local" 
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBookingForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Book Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryScheduling;
