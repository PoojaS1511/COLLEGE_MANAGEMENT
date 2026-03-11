import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Mock data for infrastructure facilities
const mockFacilities = {
  campusMap: {
    title: 'Campus Map',
    description: 'Interactive map of the college campus',
    icon: '🗺️',
    link: '/admin/infrastructure/campus-map',
    stats: '3D View Available'
  },
  classroomAllocation: {
    title: 'Classroom Allocation',
    description: 'Manage and track classroom assignments',
    icon: '🏫',
    link: '/admin/infrastructure/classroom-allocation',
    stats: '42 Classrooms'
  },
  smartClassroom: {
    title: 'Smart Classroom Tracking',
    description: 'Monitor and manage smart classroom equipment',
    icon: '💻',
    link: '/admin/infrastructure/smart-classroom',
    stats: '15 Smart Rooms'
  },
  labEquipment: {
    title: 'Lab Equipment',
    description: 'View and book lab equipment',
    icon: '🔬',
    link: '/admin/infrastructure/lab-equipment',
    stats: '120+ Items'
  },
  auditorium: {
    title: 'Auditorium Booking',
    description: 'Book and manage auditorium events',
    icon: '🎭',
    link: '/admin/infrastructure/auditorium',
    stats: '3 Venues Available'
  }
};

const FacilityCard = ({ facility }) => (
  <Link 
    to={facility.link}
    className="flex flex-col p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
  >
    <div className="flex items-center mb-4">
      <span className="text-3xl mr-4">{facility.icon}</span>
      <div>
        <h3 className="text-lg font-semibold text-gray-800">{facility.title}</h3>
        <p className="text-sm text-gray-500">{facility.description}</p>
      </div>
    </div>
    <div className="mt-auto pt-4 border-t border-gray-100">
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        {facility.stats}
      </span>
    </div>
  </Link>
);

const InfrastructureFacilities = () => {
  const [activeTab, setActiveTab] = useState('all');
  
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Infrastructure Facilities</h1>
        <p className="text-gray-600">Manage and monitor college infrastructure resources</p>
      </div>
      
      <div className="flex space-x-2 mb-6 pb-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            activeTab === 'all' 
              ? 'bg-blue-100 text-blue-700' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          All Facilities
        </button>
        <button
          onClick={() => setActiveTab('classrooms')}
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            activeTab === 'classrooms' 
              ? 'bg-blue-100 text-blue-700' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Classrooms
        </button>
        <button
          onClick={() => setActiveTab('labs')}
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            activeTab === 'labs' 
              ? 'bg-blue-100 text-blue-700' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Labs
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            activeTab === 'events' 
              ? 'bg-blue-100 text-blue-700' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Events & Bookings
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.values(mockFacilities).map((facility, index) => (
          <FacilityCard key={index} facility={facility} />
        ))}
      </div>
      
      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-4">
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            Generate Usage Report
          </button>
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            View Maintenance Logs
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
            + New Booking
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfrastructureFacilities;
