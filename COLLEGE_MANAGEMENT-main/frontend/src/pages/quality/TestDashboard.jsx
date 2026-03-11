import React from 'react';

const TestDashboard = () => {
  return (
    <div className="p-6 bg-red-100 min-h-screen">
      <h1 className="text-3xl font-bold text-red-900">TEST DASHBOARD - QUALITY</h1>
      <p className="text-red-700 mt-4">This is a test to see if the component loads</p>
      <div className="mt-6 p-4 bg-white rounded">
        <h2 className="text-xl font-semibold">Test Data:</h2>
        <ul className="mt-2 space-y-1">
          <li>Total Faculty: 50</li>
          <li>Pending Audits: 3</li>
          <li>Open Grievances: 5</li>
          <li>Policy Compliance: 87%</li>
          <li>Accreditation Score: 82</li>
        </ul>
      </div>
    </div>
  );
};

export default TestDashboard;
