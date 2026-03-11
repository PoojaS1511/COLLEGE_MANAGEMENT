import React from 'react';

// Sample data - replace this with actual API calls later
const facilities = [
  {
    id: 1,
    name: 'Sports Complex',
    type: 'Sports',
    capacity: 100,
    status: 'available'
  },
  {
    id: 2,
    name: 'Auditorium',
    type: 'Event',
    capacity: 500,
    status: 'available'
  },
  {
    id: 3,
    name: 'Library',
    type: 'Study',
    capacity: 200,
    status: 'maintenance'
  },
  {
    id: 4,
    name: 'Computer Lab',
    type: 'Lab',
    capacity: 40,
    status: 'available'
  }
];

export default function FacilitiesManagement() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl font-bold text-gray-800">Facilities Management</h1>
          <p className="text-gray-600">Manage college facilities and bookings</p>
        </div>
        <button 
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          onClick={() => console.log('Add new facility')}
        >
          <span className="mr-2">+</span>
          Add Facility
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Available Facilities</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {facilities.map((facility) => (
            <div key={facility.id} className="p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{facility.name}</h3>
                  <p className="text-sm text-gray-500">
                    Type: {facility.type} • Capacity: {facility.capacity} people
                  </p>
                </div>
                <span 
                  className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                    facility.status === 'available' 
                      ? 'bg-green-100 text-green-800' 
                      : facility.status === 'maintenance'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {facility.status.charAt(0).toUpperCase() + facility.status.slice(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}