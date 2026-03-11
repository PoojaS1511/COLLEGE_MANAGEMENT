import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Mock data for academic support facilities
const academicFacilities = {
  library: {
    title: 'Library Management',
    description: 'Access and manage library resources, track loans, and handle reservations',
    icon: '📚',
    link: '/admin/academic/library/catalog',
    stats: '10,000+ Books',
    color: 'bg-blue-50',
    textColor: 'text-blue-800'
  },
  laboratory: {
    title: 'Laboratory Scheduling',
    description: 'Book lab slots and track equipment and consumables',
    icon: '🔬',
    link: '/admin/academic/laboratories',
    stats: '15 Labs',
    color: 'bg-green-50',
    textColor: 'text-green-800'
  },
  research: {
    title: 'ITC Research',
    description: 'Manage research papers, funding, and mentor connections',
    icon: '💡',
    link: '/admin/academic/itc-research',
    stats: '50+ Projects',
    color: 'bg-purple-50',
    textColor: 'text-purple-800'
  }
};

const FacilityCard = ({ facility }) => {
  const handleClick = (e) => {
    e.preventDefault();
    window.location.href = facility.link;
  };

  return (
    <a 
      href={facility.link}
      onClick={handleClick}
      className={`flex flex-col p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 ${facility.color} hover:shadow-lg cursor-pointer`}
    >
      <div className="flex items-center mb-4">
        <span className="text-3xl mr-3">{facility.icon}</span>
        <h3 className="text-lg font-semibold">{facility.title}</h3>
      </div>
      <p className="text-gray-600 mb-4 flex-grow">{facility.description}</p>
      <div className="flex justify-between items-center">
        <span className={`text-sm font-medium ${facility.textColor}`}>
          {facility.stats}
        </span>
        <span className="text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </span>
      </div>
    </a>
  );
};

const AcademicSupport = () => {
  const [activeTab, setActiveTab] = useState('all');
  
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Academic Support Facilities</h1>
        <p className="text-gray-600">Manage and access all academic resources and support services</p>
      </div>
      
      <div className="flex flex-wrap gap-3 mb-6 pb-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 text-sm font-medium rounded-full ${
            activeTab === 'all' 
              ? 'bg-blue-100 text-blue-700' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          All Resources
        </button>
        <button
          onClick={() => setActiveTab('library')}
          className={`px-4 py-2 text-sm font-medium rounded-full ${
            activeTab === 'library' 
              ? 'bg-blue-100 text-blue-700' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Library
        </button>
        <button
          onClick={() => setActiveTab('lab')}
          className={`px-4 py-2 text-sm font-medium rounded-full ${
            activeTab === 'lab' 
              ? 'bg-blue-100 text-blue-700' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Laboratories
        </button>
        <button
          onClick={() => setActiveTab('research')}
          className={`px-4 py-2 text-sm font-medium rounded-full ${
            activeTab === 'research' 
              ? 'bg-blue-100 text-blue-700' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Research
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(academicFacilities).map(([key, facility]) => (
          <FacilityCard key={key} facility={facility} />
        ))}
      </div>
      
      <div className="mt-8 p-6 bg-white rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Quick Stats</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-700">1,250+</div>
            <div className="text-sm text-blue-600">Active Book Loans</div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-700">85%</div>
            <div className="text-sm text-green-600">Lab Utilization</div>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-700">24</div>
            <div className="text-sm text-purple-600">Active Research Projects</div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Recent Activities</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-start p-3 hover:bg-white rounded-lg transition-colors">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                {item === 1 ? '📚' : item === 2 ? '🔬' : '💡'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {item === 1 
                    ? 'New book added: "Advanced React Patterns"' 
                    : item === 2 
                      ? 'Chemistry Lab 3 maintenance scheduled' 
                      : 'Research paper submission deadline extended'}
                </p>
                <p className="text-sm text-gray-500">
                  {item === 1 
                    ? '2 hours ago' 
                    : item === 2 
                      ? 'Yesterday' 
                      : '3 days ago'}
                </p>
              </div>
              <button className="ml-4 text-sm font-medium text-blue-600 hover:text-blue-800">
                View
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AcademicSupport;
