import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Mock data for labs
const labs = [
  { id: 1, name: 'Computer Lab 1', capacity: 30, type: 'Computer' },
  { id: 2, name: 'Chemistry Lab', capacity: 24, type: 'Science' },
  { id: 3, name: 'Physics Lab', capacity: 20, type: 'Science' },
  { id: 4, name: 'Electronics Lab', capacity: 18, type: 'Engineering' },
];

// Mock data for equipment
const equipment = [
  { id: 1, name: 'Microscope', total: 15, available: 10, labId: 2 },
  { id: 2, name: 'Oscilloscope', total: 8, available: 5, labId: 4 },
  { id: 3, name: 'Desktop Computers', total: 30, available: 28, labId: 1 },
  { id: 4, name: 'Bunsen Burner', total: 25, available: 25, labId: 2 },
];

// Mock data for bookings
const events = [
  {
    id: 1,
    title: 'Computer Networks Lab',
    start: new Date(2025, 9, 18, 9, 0), // year, month (0-11), day, hour, minute
    end: new Date(2025, 9, 18, 11, 0),
    labId: 1,
    instructor: 'Dr. Smith',
    course: 'CS401',
    status: 'confirmed',
  },
  {
    id: 2,
    title: 'Organic Chemistry',
    start: new Date(2025, 9, 18, 10, 0),
    end: new Date(2025, 9, 18, 12, 0),
    labId: 2,
    instructor: 'Dr. Johnson',
    course: 'CHEM301',
    status: 'confirmed',
  },
  // Add more mock bookings as needed
];

const localizer = momentLocalizer(moment);

const LaboratoryScheduling = () => {
  const [selectedLab, setSelectedLab] = useState(labs[0].id);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState('week');
  const [showNewBooking, setShowNewBooking] = useState(false);
  const [showConsumables, setShowConsumables] = useState(false);

  // Filter events for the selected lab
  const filteredEvents = events.filter(event => event.labId === selectedLab);
  
  // Get current lab equipment
  const labEquipment = equipment.filter(eq => eq.labId === selectedLab);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Laboratory Scheduling</h1>
        <p className="text-gray-600">Manage lab bookings, equipment, and consumables</p>
      </div>

      {/* Lab Selector */}
      <div className="mb-6">
        <label htmlFor="lab-select" className="block text-sm font-medium text-gray-700 mb-2">
          Select Laboratory
        </label>
        <div className="flex flex-wrap gap-3">
          {labs.map((lab) => (
            <button
              key={lab.id}
              onClick={() => setSelectedLab(lab.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                selectedLab === lab.id
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {lab.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              {labs.find(l => l.id === selectedLab)?.name} Schedule
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setView('day')}
                className={`px-3 py-1 text-sm rounded ${
                  view === 'day' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                }`}
              >
                Day
              </button>
              <button
                onClick={() => setView('week')}
                className={`px-3 py-1 text-sm rounded ${
                  view === 'week' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setView('month')}
                className={`px-3 py-1 text-sm rounded ${
                  view === 'month' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setShowNewBooking(true)}
                className="ml-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                + New Booking
              </button>
            </div>
          </div>

          <div style={{ height: '600px' }}>
            <Calendar
              localizer={localizer}
              events={filteredEvents}
              startAccessor="start"
              endAccessor="end"
              defaultView={view}
              view={view}
              onView={setView}
              date={selectedDate}
              onNavigate={setSelectedDate}
              style={{ height: '100%' }}
              eventPropGetter={(event) => ({
                style: {
                  backgroundColor: event.status === 'confirmed' ? '#3b82f6' : '#6b7280',
                  borderRadius: '4px',
                  opacity: 0.8,
                  color: 'white',
                  border: '0px',
                  display: 'block',
                  fontSize: '0.8rem',
                  padding: '2px 4px',
                },
              })}
            />
          </div>
        </div>

        {/* Lab Details and Equipment */}
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Lab Information</h2>
            {labs.filter(lab => lab.id === selectedLab).map((lab) => (
              <div key={lab.id} className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{lab.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Type</dt>
                  <dd className="mt-1 text-sm text-gray-900">{lab.type} Lab</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Capacity</dt>
                  <dd className="mt-1 text-sm text-gray-900">{lab.capacity} students</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Operational
                    </span>
                  </dd>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Equipment</h2>
              <button
                onClick={() => setShowConsumables(!showConsumables)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {showConsumables ? 'Hide Consumables' : 'Show Consumables'}
              </button>
            </div>
            
            <div className="space-y-3">
              {labEquipment.map((item) => (
                <div key={item.id} className="p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                      <p className="text-xs text-gray-500">
                        {item.available} of {item.total} available
                      </p>
                    </div>
                    <div className="w-24 bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${(item.available / item.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
              
              {showConsumables && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Consumables</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 bg-yellow-50 rounded-md">
                      <span className="text-sm text-yellow-800">Test Tubes</span>
                      <span className="text-sm font-medium text-yellow-800">125 pcs</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-yellow-50 rounded-md">
                      <span className="text-sm text-yellow-800">Beakers (250ml)</span>
                      <span className="text-sm font-medium text-yellow-800">45 pcs</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-yellow-50 rounded-md">
                      <span className="text-sm text-yellow-800">Safety Goggles</span>
                      <span className="text-sm font-medium text-yellow-800">30 pairs</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Equipment/Consumable
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Upcoming Bookings</h2>
            <div className="space-y-3">
              {filteredEvents
                .filter(event => new Date(event.start) > new Date())
                .sort((a, b) => new Date(a.start) - new Date(b.start))
                .slice(0, 3)
                .map(event => (
                  <div key={event.id} className="p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{event.title}</h3>
                        <p className="text-xs text-gray-500">{event.course} - {event.instructor}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-gray-900">
                          {moment(event.start).format('h:mm A')} - {moment(event.end).format('h:mm A')}
                        </p>
                        <p className="text-xs text-gray-500">{moment(event.start).format('MMM D, YYYY')}</p>
                      </div>
                    </div>
                  </div>
                ))}
              {filteredEvents.filter(event => new Date(event.start) > new Date()).length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No upcoming bookings</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* New Booking Modal */}
      {showNewBooking && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">New Lab Booking</h2>
                <button
                  onClick={() => setShowNewBooking(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="lab" className="block text-sm font-medium text-gray-700">Lab</label>
                    <select
                      id="lab"
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      defaultValue={selectedLab}
                    >
                      {labs.map(lab => (
                        <option key={lab.id} value={lab.id}>
                          {lab.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="course" className="block text-sm font-medium text-gray-700">Course</label>
                    <input
                      type="text"
                      id="course"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="e.g., CS401"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="instructor" className="block text-sm font-medium text-gray-700">Instructor</label>
                    <input
                      type="text"
                      id="instructor"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Instructor name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                    <input
                      type="date"
                      id="date"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      defaultValue={moment().format('YYYY-MM-DD')}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="start-time" className="block text-sm font-medium text-gray-700">Start Time</label>
                    <input
                      type="time"
                      id="start-time"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      defaultValue="09:00"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="end-time" className="block text-sm font-medium text-gray-700">End Time</label>
                    <input
                      type="time"
                      id="end-time"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      defaultValue="11:00"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    id="notes"
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Any special requirements or notes..."
                    defaultValue={''}
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowNewBooking(false)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Create Booking
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LaboratoryScheduling;
