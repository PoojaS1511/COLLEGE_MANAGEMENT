
import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

const Dashboard = () => {
  console.log('Dashboard component rendering...');
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
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>HR Onboarding Dashboard</h1>
        <p>Manage and track employee onboarding progress</p>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card info">
          <div className="card-title">Total Employees Onboarded</div>
          <div className="card-value">{stats.totalOnboarded}</div>
          <div className="card-change">+12% from last month</div>
        </div>
        
        <div className="summary-card warning">
          <div className="card-title">Pending Onboardings</div>
          <div className="card-value">{stats.pendingOnboardings}</div>
          <div className="card-change">Need attention</div>
        </div>
        
        <div className="summary-card success">
          <div className="card-title">Completed Onboardings</div>
          <div className="card-value">{stats.completedOnboardings}</div>
          <div className="card-change">This month</div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="progress-section">
        <div className="progress-header">
          <div className="progress-title">Overall Onboarding Progress</div>
          <div className="progress-percentage">{stats.completionPercentage}%</div>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${stats.completionPercentage}%` }}
          />
        </div>
      </div>



      {/* Recent Activity */}
      <div className="recent-activity-section">
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
          Recent Onboarding Activity
        </h2>
        
        <div className="activity-list">
          {recentActivity.map((activity) => (
            <div 
              key={activity.id} 
              className="activity-item"
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '1rem',
                backgroundColor: 'white',
                borderRadius: '8px',
                marginBottom: '0.75rem',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div style={{ fontSize: '1.5rem', marginRight: '1rem' }}>
                {getActivityIcon(activity.status)}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '0.25rem' }}>
                  {activity.employeeName}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  {activity.action}
                </div>
              </div>
              
              <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                {activity.time}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <button 
          className="btn btn-primary"
          onClick={handleStartNewOnboarding}
          style={{ fontSize: '1rem', padding: '1rem 2rem' }}
        >
          🚀 Start New Onboarding
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
