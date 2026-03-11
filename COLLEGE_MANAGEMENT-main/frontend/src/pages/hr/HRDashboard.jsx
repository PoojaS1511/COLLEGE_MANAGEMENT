import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

const HRDashboard = () => {
  console.log('HR Dashboard component rendering...');
  const navigate = useNavigate();
  const { moveToNextStep } = useOutletContext();
  const [stats, setStats] = useState({
    totalOnboarded: 0,
    pendingOnboardings: 0,
    completedOnboardings: 0,
    completionPercentage: 0
  });

  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    // Mock data - in real app, this would come from API
    setStats({
      totalOnboarded: 156,
      pendingOnboardings: 12,
      completedOnboardings: 144,
      completionPercentage: 92.3
    });

    setRecentActivity([
      {
        id: 1,
        employeeName: 'John Smith',
        action: 'Completed Registration',
        time: '2 hours ago',
        status: 'completed'
      },
      {
        id: 2,
        employeeName: 'Sarah Johnson',
        action: 'Started Document Upload',
        time: '4 hours ago',
        status: 'in-progress'
      },
      {
        id: 3,
        employeeName: 'Michael Chen',
        action: 'Activated System Access',
        time: '1 day ago',
        status: 'completed'
      },
      {
        id: 4,
        employeeName: 'Emily Davis',
        action: 'Salary Setup Completed',
        time: '2 days ago',
        status: 'completed'
      },
      {
        id: 5,
        employeeName: 'Robert Wilson',
        action: 'Registration Started',
        time: '3 days ago',
        status: 'pending'
      }
    ]);
  }, []);

  const handleStartNewOnboarding = () => {
    // Navigate to registration page
    moveToNextStep();
  };

  const getActivityIcon = (status) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'in-progress':
        return '🔄';
      case 'pending':
        return '⏳';
      default:
        return '📝';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">HR Onboarding Dashboard</h1>
        <p className="text-gray-600">Manage and track employee onboarding progress</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-500 text-sm font-medium">Total Employees Onboarded</div>
          <div className="text-3xl font-bold text-blue-600 my-2">{stats.totalOnboarded}</div>
          <div className="text-sm text-green-500">+12% from last month</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-500 text-sm font-medium">Pending Onboardings</div>
          <div className="text-3xl font-bold text-yellow-600 my-2">{stats.pendingOnboardings}</div>
          <div className="text-sm text-yellow-500">Need attention</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-500 text-sm font-medium">Completed Onboardings</div>
          <div className="text-3xl font-bold text-green-600 my-2">{stats.completedOnboardings}</div>
          <div className="text-sm text-gray-500">This month</div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="flex justify-between items-center mb-2">
          <div className="font-medium text-gray-700">Overall Onboarding Progress</div>
          <div className="font-bold text-blue-600">{stats.completionPercentage}%</div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ width: `${stats.completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Recent Onboarding Activity
        </h2>
        
        <div className="space-y-3">
          {recentActivity.map((activity) => (
            <div 
              key={activity.id} 
              className="flex items-center p-4 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="text-2xl mr-4">
                {getActivityIcon(activity.status)}
              </div>
              
              <div className="flex-1">
                <div className="font-semibold text-gray-800">
                  {activity.employeeName}
                </div>
                <div className="text-sm text-gray-600">
                  {activity.action}
                </div>
              </div>
              
              <div className="text-xs text-gray-400">
                {activity.time}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-8 text-center">
        <button 
          onClick={handleStartNewOnboarding}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center mx-auto"
        >
          🚀 Start New Onboarding
        </button>
      </div>
    </div>
  );
};

export default HRDashboard;
