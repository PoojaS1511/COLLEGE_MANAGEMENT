import React, { useState, useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { 
  UserGroupIcon,
  ClockIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { medicalService } from '../../../services/healthSafetyService';
import { format } from 'date-fns';

const HealthSafety = () => {
  const [activeTab, setActiveTab] = useState('health-center');
  const [stats, setStats] = useState([
    { name: 'Today\'s Appointments', value: '0', icon: ClockIcon, change: '0', changeType: 'neutral' },
    { name: 'Active Cases', value: '0', icon: UserGroupIcon, change: '0', changeType: 'neutral' },
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setIsLoading(true);
        
        // Fetch today's appointments
        const today = format(new Date(), 'yyyy-MM-dd');
        const appointments = await medicalService.getAppointments({
          date: today,
          status: 'scheduled'
        });
        
        // Fetch active medical cases
        const activeCases = await medicalService.getActiveMedicalCases();

        // Update stats with real data
        setStats([
          { 
            ...stats[0], 
            value: appointments?.length.toString() || '0',
            change: '+0',
            changeType: 'neutral'
          },
          { 
            ...stats[1], 
            value: activeCases?.length.toString() || '0',
            change: '+0',
            changeType: 'neutral'
          }
        ]);
        
      } catch (err) {
        console.error('Error fetching health dashboard stats:', err);
        setError('Failed to load health dashboard statistics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Health Center</h1>
        <p className="text-gray-600">Manage health center appointments and medical cases</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${stat.changeType === 'increase' ? 'bg-green-100 text-green-600' : stat.changeType === 'decrease' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                <stat.icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  {stat.change !== '0' && (
                    <p className={`ml-2 text-sm font-medium ${stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change} {stat.changeType === 'increase' ? '↑' : stat.changeType === 'decrease' ? '↓' : ''}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Page Content */}
      <div className="bg-white p-6 rounded-lg shadow">
        <Outlet />
      </div>
    </div>
  );
};

export default HealthSafety;
