import React, { useState, useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { 
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { incidentService, firstAidService } from '../../../services/healthSafetyService';
import { format } from 'date-fns';

const SecurityDashboard = () => {
  const [activeTab, setActiveTab] = useState('security');
  const [stats, setStats] = useState([
    { name: 'Security Incidents', value: '0', icon: ExclamationTriangleIcon, change: '0', changeType: 'neutral' },
    { name: 'Lost & Found Items', value: '0', icon: ClipboardDocumentCheckIcon, change: '0', changeType: 'neutral' },
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setIsLoading(true);
        
        // Fetch open security incidents
        const incidents = await incidentService.getAll({
          status: 'open'
        });
        
        // Fetch lost and found items
        const lostItems = await firstAidService.getLostAndFoundItems();

        // Update stats with real data
        setStats([
          { 
            ...stats[0], 
            value: incidents?.length.toString() || '0',
            change: '+0',
            changeType: 'neutral'
          },
          { 
            ...stats[1], 
            value: lostItems?.length.toString() || '0',
            change: '+0',
            changeType: 'neutral'
          },
        ]);
        
      } catch (err) {
        console.error('Error fetching security dashboard stats:', err);
        setError('Failed to load security dashboard statistics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Security & Safety</h1>
        <p className="text-gray-600">Manage security incidents and lost & found items</p>
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

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <Link
            to="security"
            onClick={() => setActiveTab('security')}
            className={`${activeTab === 'security' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Security Incidents
          </Link>
          <Link
            to="lost-found"
            onClick={() => setActiveTab('lost-found')}
            className={`${activeTab === 'lost-found' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Lost & Found
          </Link>
        </nav>
      </div>

      {/* Page Content */}
      <div className="bg-white p-6 rounded-lg shadow">
        <Outlet />
      </div>
    </div>
  );
};

export default SecurityDashboard;
