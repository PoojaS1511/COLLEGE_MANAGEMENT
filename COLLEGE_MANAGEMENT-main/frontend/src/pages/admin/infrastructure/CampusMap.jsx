import React from 'react';

const CampusMap = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Campus Map</h1>
        <p className="text-gray-600">Interactive map of the college campus</p>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-6">
          <div className="text-center">
            <div className="text-5xl mb-4">🗺️</div>
            <h3 className="text-lg font-medium text-gray-800">Interactive Campus Map</h3>
            <p className="text-gray-500 mt-2">This is a placeholder for the interactive campus map.</p>
            <p className="text-sm text-gray-400 mt-2">Future features will include:</p>
            <ul className="text-sm text-gray-500 list-disc list-inside mt-2 space-y-1">
              <li>3D building visualization</li>
              <li>Room finder</li>
              <li>Navigation between buildings</li>
              <li>Accessibility routes</li>
            </ul>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800">Main Building</h4>
            <p className="text-sm text-blue-600 mt-1">Administration, Classrooms</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-800">Science Block</h4>
            <p className="text-sm text-green-600 mt-1">Labs, Research Centers</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-medium text-purple-800">Auditorium</h4>
            <p className="text-sm text-purple-600 mt-1">Events, Conferences</p>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="font-medium text-gray-800 mb-4">Quick Links</h3>
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
              Download Campus Map (PDF)
            </button>
            <button className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
              Report an Issue
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
              View in 3D
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampusMap;
