import React from 'react';
import { useStudent } from '../../contexts/StudentContext';
import LeaveHistory from '../../components/student/LeaveHistory';

const LeaveHistoryPage = () => {
  const { user } = useStudent();

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="pb-5 border-b border-gray-200">
          <h1 className="text-2xl font-bold leading-tight text-gray-900">Leave History</h1>
          <p className="mt-2 max-w-4xl text-sm text-gray-500">
            View your previous leave applications and their current status.
          </p>
        </div>
        
        <div className="mt-8">
          <LeaveHistory studentId={user?.id} />
        </div>
      </div>
    </div>
  );
};

export default LeaveHistoryPage;
