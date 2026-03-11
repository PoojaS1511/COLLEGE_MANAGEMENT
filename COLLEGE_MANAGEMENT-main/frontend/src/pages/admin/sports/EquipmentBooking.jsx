import React, { useState } from 'react';
import { CheckCircleIcon, XMarkIcon, ClockIcon, PlusIcon, PencilIcon, TrashIcon, TrophyIcon } from '@heroicons/react/24/outline';

const EquipmentBooking = () => {
  // Mock data for equipment
  const [equipment, setEquipment] = useState([
    {
      id: 1,
      name: 'Basketball',
      quantity: 10,
      available: 6,
      condition: 'Good',
      category: 'Basketball',
      bookings: [
        { id: 1, studentId: 'S2023001', studentName: 'John Doe', startDate: '2025-10-18T10:00:00', endDate: '2025-10-18T12:00:00', status: 'approved' },
        { id: 2, studentId: 'S2023002', studentName: 'Jane Smith', startDate: '2025-10-18T14:00:00', endDate: '2025-10-18T16:00:00', status: 'pending' },
      ]
    },
    {
      id: 2,
      name: 'Tennis Racket',
      quantity: 8,
      available: 3,
      condition: 'Good',
      category: 'Tennis',
      bookings: [
        { id: 3, studentId: 'S2023003', studentName: 'Alex Chen', startDate: '2025-10-18T09:00:00', endDate: '2025-10-18T11:00:00', status: 'approved' },
      ]
    },
    {
      id: 3,
      name: 'Soccer Ball',
      quantity: 12,
      available: 9,
      condition: 'Fair',
      category: 'Soccer',
      bookings: []
    },
  ]);

  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [newBooking, setNewBooking] = useState({
    studentId: '',
    studentName: '',
    startDate: '',
    endDate: '',
    purpose: ''
  });

  const handleBookEquipment = (equip) => {
    setSelectedEquipment(equip);
    setShowBookingForm(true);
  };

  const handleSubmitBooking = (e) => {
    e.preventDefault();
    // In a real app, you would make an API call here
    const updatedEquipment = equipment.map(item => {
      if (item.id === selectedEquipment.id) {
        const newBookingItem = {
          id: Math.max(0, ...item.bookings.map(b => b.id)) + 1,
          ...newBooking,
          status: 'pending'
        };
        return {
          ...item,
          available: item.available - 1,
          bookings: [...item.bookings, newBookingItem]
        };
      }
      return item;
    });
    
    setEquipment(updatedEquipment);
    setShowBookingForm(false);
    setNewBooking({
      studentId: '',
      studentName: '',
      startDate: '',
      endDate: '',
      purpose: ''
    });
  };

  const handleApproveBooking = (equipId, bookingId) => {
    const updatedEquipment = equipment.map(item => {
      if (item.id === equipId) {
        const updatedBookings = item.bookings.map(booking => {
          if (booking.id === bookingId) {
            return { ...booking, status: 'approved' };
          }
          return booking;
        });
        return { ...item, bookings: updatedBookings };
      }
      return item;
    });
    setEquipment(updatedEquipment);
  };

  const handleRejectBooking = (equipId, bookingId) => {
    const updatedEquipment = equipment.map(item => {
      if (item.id === equipId) {
        const updatedBookings = item.bookings
          .filter(booking => booking.id !== bookingId);
        return {
          ...item,
          available: item.available + 1,
          bookings: updatedBookings
        };
      }
      return item;
    });
    setEquipment(updatedEquipment);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">Sports Equipment Management</h2>
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          onClick={() => setShowAddEquipmentForm(true)}
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
          Add Equipment
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {equipment.map((item) => (
          <div key={item.id} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                  <TrophyIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{item.category}</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{item.name}</div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        {item.available} / {item.quantity} available
                      </div>
                    </dd>
                    <dd className="mt-1 text-sm text-gray-500">
                      Condition: <span className="font-medium">{item.condition}</span>
                    </dd>
                  </dl>
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => handleBookEquipment(item)}
                  disabled={item.available === 0}
                >
                  <PlusIcon className="-ml-0.5 mr-2 h-4 w-4" />
                  Book Equipment
                </button>
              </div>

              {item.bookings.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Upcoming Bookings:</h4>
                  <ul className="border-t border-gray-200 divide-y divide-gray-200">
                    {item.bookings.map((booking) => (
                      <li key={booking.id} className="py-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{booking.studentName}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(booking.startDate).toLocaleString()} - {new Date(booking.endDate).toLocaleTimeString()}
                            </p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              booking.status === 'approved' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {booking.status}
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            {booking.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApproveBooking(item.id, booking.id)}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  <CheckCircleIcon className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleRejectBooking(item.id, booking.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <XMarkIcon className="h-5 w-5" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && selectedEquipment && (
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
                    Book {selectedEquipment.name}
                  </h3>
                  <div className="mt-2">
                    <form onSubmit={handleSubmitBooking}>
                      <div className="mb-4">
                        <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">Student ID</label>
                        <input
                          type="text"
                          id="studentId"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          value={newBooking.studentId}
                          onChange={(e) => setNewBooking({...newBooking, studentId: e.target.value})}
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label htmlFor="studentName" className="block text-sm font-medium text-gray-700">Student Name</label>
                        <input
                          type="text"
                          id="studentName"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          value={newBooking.studentName}
                          onChange={(e) => setNewBooking({...newBooking, studentName: e.target.value})}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Time</label>
                          <input
                            type="datetime-local"
                            id="startDate"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={newBooking.startDate}
                            onChange={(e) => setNewBooking({...newBooking, startDate: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Time</label>
                          <input
                            type="datetime-local"
                            id="endDate"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={newBooking.endDate}
                            onChange={(e) => setNewBooking({...newBooking, endDate: e.target.value})}
                            required
                          />
                        </div>
                      </div>
                      <div className="mb-4">
                        <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">Purpose</label>
                        <textarea
                          id="purpose"
                          rows="3"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          value={newBooking.purpose}
                          onChange={(e) => setNewBooking({...newBooking, purpose: e.target.value})}
                          required
                        />
                      </div>
                      <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                        <button
                          type="submit"
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm"
                        >
                          Submit Booking
                        </button>
                        <button
                          type="button"
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                          onClick={() => setShowBookingForm(false)}
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

export default EquipmentBooking;
