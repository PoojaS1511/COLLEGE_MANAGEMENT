import React from 'react';
import { useLocation } from 'react-router-dom';

const RouteDebugger = () => {
  const location = useLocation();
  
  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg text-xs max-w-md z-50">
      <div className="font-bold mb-2">Route Debugger</div>
      <div className="space-y-1">
        <div><span className="text-gray-400">Pathname:</span> {location.pathname}</div>
        <div><span className="text-gray-400">Search:</span> {location.search || 'none'}</div>
        <div><span className="text-gray-400">Hash:</span> {location.hash || 'none'}</div>
      </div>
    </div>
  );
};

export default RouteDebugger;

