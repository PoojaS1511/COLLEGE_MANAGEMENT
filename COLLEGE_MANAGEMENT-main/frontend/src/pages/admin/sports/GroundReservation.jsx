import React, { useState } from 'react';
import { CalendarIcon, ClockIcon, CheckCircleIcon, XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import { addDays, format, isWithinInterval, parseISO } from 'date-fns';

const GroundReservation = () => {
  // Mock data for sports grounds
  const [grounds, setGrounds] = useState([
    {
      id: 1,
      name: 'Main Football Field',
      location: 'Sports Complex A',
      capacity: 100,
      available: true,
      reservations: [
        { 
          id: 1, 
          teamName: 'College A Team', 
          contactPerson: 'John Coach', 
          contactEmail: 'john.coach@example.com',
          startDate: '2025-10-20T14:00:00', 
          endDate: '2025-10-20T16:00:00',
          status: 'approved',
          purpose: 'Practice match'
        }
      ]
    },
    {
      id: 2,
      name: 'Tennis Court 1',
      location: 'Sports Complex B',
      capacity: 4,
      available: true,
      reservations: []
    },
    {
      id: 3,
      name: 'Basketball Court',
      location: 'Indoor Stadium',
      capacity: 30,
      available: true,
      reservations: [
        { 
          id: 2, 
          teamName: 'Basketball Varsity', 
          contactPerson: 'Sarah Johnson', 
          contactEmail: 'sarah.j@example.com',
          startDate: '2025-10-19T16:00:00', 
          endDate: '2025-10-19T18:00:00',
          status: 'pending',
          purpose: 'Team practice'
        }
      ]
    },
  ]);

  const [selectedGround, setSelectedGround] = useState(null);
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [newReservation, setNewReservation] = useState({
    teamName: '',
    contactPerson: '',
    contactEmail: '',
    startTime: '',
    endTime: '',
    purpose: ''
  });

  // Generate time slots (8 AM to 8 PM)
  const timeSlots = [];
  for (let hour = 8; hour <= 20; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
  }

  const isTimeSlotAvailable = (ground, date, startTime, endTime) => {
    if (!ground.available) return false;
    
    const selectedStart = new Date(`${date}T${startTime}:00`);
    const selectedEnd = new Date(`${date}T${endTime}:00`);
    
    // Check if the selected time slot is in the past
    if (selectedStart < new Date()) return false;
    
    // Check for overlapping reservations
    return !ground.reservations.some(reservation => {
      const resStart = new Date(reservation.startDate);
      const resEnd = new Date(reservation.endDate);
      
      return (
        (selectedStart >= resStart && selectedStart < resEnd) ||
        (selectedEnd > resStart && selectedEnd <= resEnd) ||
        (selectedStart <= resStart && selectedEnd >= resEnd)
      ) && reservation.status !== 'rejected';
    });
  };

  const handleReserveGround = (ground) => {
    setSelectedGround(ground);
    setShowReservationForm(true);
  };

  const handleSubmitReservation = (e) => {
    e.preventDefault();
    
    const reservation = {
      id: Math.max(0, ...selectedGround.reservations.map(r => r.id)) + 1,
      teamName: newReservation.teamName,
      contactPerson: newReservation.contactPerson,
      contactEmail: newReservation.contactEmail,
      startDate: `${format(selectedDate, 'yyyy-MM-dd')}T${newReservation.startTime}:00`,
      endDate: `${format(selectedDate, 'yyyy-MM-dd')}T${newReservation.endTime}:00`,
      status: 'pending',
      purpose: newReservation.purpose
    };

    const updatedGrounds = grounds.map(ground => {
      if (ground.id === selectedGround.id) {
        return {
          ...ground,
          reservations: [...ground.reservations, reservation]
        };
      }
      return ground;
    });

    setGrounds(updatedGrounds);
    setShowReservationForm(false);
    setNewReservation({
      teamName: '',
      contactPerson: '',
      contactEmail: '',
      startTime: '',
      endTime: '',
      purpose: ''
    });
  };

  const handleApproveReservation = (groundId, reservationId) => {
    const updatedGrounds = grounds.map(ground => {
      if (ground.id === groundId) {
        const updatedReservations = ground.reservations.map(reservation => {
          if (reservation.id === reservationId) {
            return { ...reservation, status: 'approved' };
          }
          return reservation;
        });
        return { ...ground, reservations: updatedReservations };
      }
      return ground;
    });
    setGrounds(updatedGrounds);
  };

  const handleRejectReservation = (groundId, reservationId) => {
    const updatedGrounds = grounds.map(ground => {
      if (ground.id === groundId) {
        const updatedReservations = ground.reservations.map(reservation => {
          if (reservation.id === reservationId) {
            return { ...reservation, status: 'rejected' };
          }
          return reservation;
        });
        return { ...ground, reservations: updatedReservations };
      }
      return ground;
    });
    setGrounds(updatedGrounds);
  };

  const getReservationsForDate = (ground, date) => {
    return ground.reservations.filter(reservation => {
      const resDate = new Date(reservation.startDate).toDateString();
      return resDate === date.toDateString() && reservation.status !== 'rejected';
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">Sports Ground Reservations</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <span className="text-sm text-gray-600">Available</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
            <span className="text-sm text-gray-600">Booked</span>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center space-x-4 overflow-x-auto pb-2">
          {[...Array(7)].map((_, index) => {
            const date = addDays(selectedDate, index - 3);
            const isToday = date.toDateString() === new Date().toDateString();
            const isSelected = date.toDateString() === selectedDate.toDateString();
            
            return (
              <button
                key={index}
                className={`flex flex-col items-center justify-center w-16 h-20 rounded-lg ${
                  isSelected ? 'bg-blue-100 border-2 border-blue-500' : 'bg-white border border-gray-200'
                } ${isToday ? 'ring-2 ring-offset-2 ring-blue-300' : ''}`}
                onClick={() => setSelectedDate(date)}
              >
                <span className="text-sm font-medium text-gray-900">
                  {format(date, 'EEE')}
                </span>
                <span className={`text-2xl font-bold ${
                  isToday ? 'text-blue-600' : 'text-gray-900'
                }`}>
                  {format(date, 'd')}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {grounds.map((ground) => {
          const reservationsToday = getReservationsForDate(ground, selectedDate);
          const isAvailable = ground.available && 
            !reservationsToday.some(r => r.status === 'approved');
          
          return (
            <div 
              key={ground.id} 
              className={`bg-white overflow-hidden shadow rounded-lg ${
                !ground.available ? 'opacity-70' : ''
              }`}
            >
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 rounded-md p-3 ${
                    isAvailable ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    <CalendarIcon className="h-6 w-6" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{ground.name}</h3>
                    <p className="text-sm text-gray-500">{ground.location}</p>
                    <p className="text-sm text-gray-500">Capacity: {ground.capacity} people</p>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </h4>
                  
                  {reservationsToday.length > 0 ? (
                    <ul className="space-y-2">
                      {reservationsToday.map((reservation) => (
                        <li 
                          key={reservation.id}
                          className="bg-gray-50 p-3 rounded-md border border-gray-200"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {reservation.teamName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(reservation.startDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                                {new Date(reservation.endDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {reservation.contactPerson} • {reservation.contactEmail}
                              </p>
                              {reservation.purpose && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Purpose: {reservation.purpose}
                                </p>
                              )}
                            </div>
                            <div className="flex space-x-1">
                              {reservation.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleApproveReservation(ground.id, reservation.id)}
                                    className="text-green-600 hover:text-green-800"
                                    title="Approve"
                                  >
                                    <CheckCircleIcon className="h-5 w-5" />
                                  </button>
                                  <button
                                    onClick={() => handleRejectReservation(ground.id, reservation.id)}
                                    className="text-red-600 hover:text-red-800"
                                    title="Reject"
                                  >
                                    <XMarkIcon className="h-5 w-5" />
                                  </button>
                                </>
                              )}
                              {reservation.status === 'approved' && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                  Approved
                                </span>
                              )}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No reservations for this date</p>
                  )}
                </div>

                <div className="mt-4">
                  <button
                    type="button"
                    className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md ${
                      isAvailable 
                        ? 'text-blue-700 bg-blue-100 hover:bg-blue-200' 
                        : 'text-gray-500 bg-gray-100 cursor-not-allowed'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                    onClick={() => handleReserveGround(ground)}
                    disabled={!isAvailable}
                  >
                    <PlusIcon className="-ml-0.5 mr-2 h-4 w-4" />
                    Make Reservation
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reservation Form Modal */}
      {showReservationForm && selectedGround && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Reserve {selectedGround.name}
                  </h3>
                  <div className="mt-2">
                    <form onSubmit={handleSubmitReservation}>
                      <div className="mb-4">
                        <label htmlFor="teamName" className="block text-sm font-medium text-gray-700">
                          Team/Group Name
                        </label>
                        <input
                          type="text"
                          id="teamName"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          value={newReservation.teamName}
                          onChange={(e) => setNewReservation({...newReservation, teamName: e.target.value})}
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                            Start Time
                          </label>
                          <select
                            id="startTime"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={newReservation.startTime}
                            onChange={(e) => setNewReservation({...newReservation, startTime: e.target.value})}
                            required
                          >
                            <option value="">Select start time</option>
                            {timeSlots.map((time, index) => {
                              // Only show time slots that are in the future for the selected date
                              const slotTime = new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${time}:00`);
                              const isPast = slotTime < new Date();
                              const isAvailable = isTimeSlotAvailable(
                                selectedGround, 
                                format(selectedDate, 'yyyy-MM-dd'), 
                                time,
                                timeSlots[timeSlots.indexOf(time) + 1] || '23:59'
                              );
                              
                              return (
                                <option 
                                  key={index} 
                                  value={time}
                                  disabled={isPast || !isAvailable}
                                >
                                  {time} {!isAvailable && '(Booked)'}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                        
                        <div>
                          <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                            End Time
                          </label>
                          <select
                            id="endTime"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={newReservation.endTime}
                            onChange={(e) => setNewReservation({...newReservation, endTime: e.target.value})}
                            required
                            disabled={!newReservation.startTime}
                          >
                            <option value="">Select end time</option>
                            {timeSlots
                              .filter(time => {
                                if (!newReservation.startTime) return false;
                                const startIndex = timeSlots.indexOf(newReservation.startTime);
                                return timeSlots.indexOf(time) > startIndex;
                              })
                              .map((time, index) => {
                                const isAvailable = isTimeSlotAvailable(
                                  selectedGround,
                                  format(selectedDate, 'yyyy-MM-dd'),
                                  newReservation.startTime,
                                  time
                                );
                                
                                return (
                                  <option 
                                    key={index} 
                                    value={time}
                                    disabled={!isAvailable}
                                  >
                                    {time} {!isAvailable && '(Unavailable)'}
                                  </option>
                                );
                              })}
                          </select>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700">
                          Contact Person
                        </label>
                        <input
                          type="text"
                          id="contactPerson"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          value={newReservation.contactPerson}
                          onChange={(e) => setNewReservation({...newReservation, contactPerson: e.target.value})}
                          required
                        />
                      </div>
                      
                      <div className="mb-4">
                        <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
                          Contact Email
                        </label>
                        <input
                          type="email"
                          id="contactEmail"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          value={newReservation.contactEmail}
                          onChange={(e) => setNewReservation({...newReservation, contactEmail: e.target.value})}
                          required
                        />
                      </div>
                      
                      <div className="mb-4">
                        <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">
                          Purpose (Optional)
                        </label>
                        <textarea
                          id="purpose"
                          rows="2"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          value={newReservation.purpose}
                          onChange={(e) => setNewReservation({...newReservation, purpose: e.target.value})}
                        />
                      </div>
                      
                      <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                        <button
                          type="submit"
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm"
                          disabled={!newReservation.startTime || !newReservation.endTime}
                        >
                          Submit Reservation
                        </button>
                        <button
                          type="button"
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                          onClick={() => setShowReservationForm(false)}
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

export default GroundReservation;
