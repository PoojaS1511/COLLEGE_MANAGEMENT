import React, { useState, useEffect, useCallback } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import toast from 'react-hot-toast';
import { 
  WifiIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  DocumentTextIcon,
  ClockIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const ITDigitalServices = () => {
  const location = useLocation();
  // Extract the current tab from the URL (e.g., 'wifi' from '/admin/it/wifi')
  const currentPath = location.pathname.split('/').pop();
  const [activeTab, setActiveTab] = useState(currentPath || 'wifi');
  const [stats, setStats] = useState([
    { id: 'wifi', name: 'Active Wi-Fi Users', value: '0', icon: WifiIcon, change: '0', changeType: 'neutral' },
    { id: 'devices', name: 'Devices Managed', value: '0', icon: DevicePhoneMobileIcon, change: '0', changeType: 'neutral' },
    { id: 'labs', name: 'Lab Reservations Today', value: '0', icon: ComputerDesktopIcon, change: '0', changeType: 'neutral' },
    { id: 'licenses', name: 'Software Licenses', value: '0', icon: DocumentTextIcon, change: '0', changeType: 'neutral' },
  ]);
  const [subscriptions, setSubscriptions] = useState([]);
  
  // Update active tab when the URL changes
  useEffect(() => {
    const path = location.pathname.split('/').pop();
    if (path && ['wifi', 'devices', 'labs', 'software'].includes(path)) {
      setActiveTab(path);
    } else {
      setActiveTab('wifi');
    }
  }, [location.pathname]);

  // Function to update stats with new data
  const updateStat = useCallback((id, newValue, changeType = 'neutral') => {
    setStats(prevStats => 
      prevStats.map(stat => {
        if (stat.id === id) {
          const oldValue = parseInt(stat.value.replace(/,/g, '')) || 0;
          const newNumericValue = typeof newValue === 'number' ? newValue : parseInt(newValue) || 0;
          const change = newNumericValue - oldValue;
          
          return {
            ...stat,
            value: newNumericValue.toLocaleString(),
            change: change > 0 ? `+${change}` : change.toString(),
            changeType: change > 0 ? 'increase' : change < 0 ? 'decrease' : 'neutral'
          };
        }
        return stat;
      })
    );
  }, []);

  // Set up real-time subscriptions
  useEffect(() => {
    // Function to fetch initial data and set up subscriptions
    const setupRealtimeData = async () => {
      try {
        // Subscribe to active WiFi users
        const wifiChannel = supabase
          .channel('active_wifi_users')
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'wifi_sessions' }, 
            (payload) => {
              // This is a simplified example - you'd need to query the actual count
              // based on your database schema
              supabase
                .from('wifi_sessions')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'active')
                .then(({ count }) => {
                  updateStat('wifi', count || 0);
                });
            }
          )
          .subscribe();

        // Subscribe to device management
        const devicesChannel = supabase
          .channel('managed_devices')
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'it_assets' }, 
            () => {
              supabase
                .from('it_assets')
                .select('*', { count: 'exact', head: true })
                .then(({ count }) => {
                  updateStat('devices', count || 0);
                });
            }
          )
          .subscribe();

        // Subscribe to lab reservations
        const labsChannel = supabase
          .channel('lab_reservations')
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'lab_reservations' }, 
            () => {
              const today = new Date().toISOString().split('T')[0];
              supabase
                .from('lab_reservations')
                .select('*', { count: 'exact', head: true })
                .eq('reservation_date', today)
                .then(({ count }) => {
                  updateStat('labs', count || 0);
                });
            }
          )
          .subscribe();

        // Subscribe to software licenses
        const licensesChannel = supabase
          .channel('software_licenses')
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'software_licenses' }, 
            () => {
              supabase
                .from('software_licenses')
                .select('*', { count: 'exact', head: true })
                .then(({ count }) => {
                  updateStat('licenses', count || 0);
                });
            }
          )
          .subscribe();

        // Store subscription references for cleanup
        setSubscriptions([wifiChannel, devicesChannel, labsChannel, licensesChannel]);

        // Initial data fetch
        fetchInitialData();
      } catch (error) {
        console.error('Error setting up real-time data:', error);
        toast.error('Error setting up real-time updates');
      }
    };

    // Function to fetch initial data
    const fetchInitialData = async () => {
      try {
        // Fetch initial WiFi users count
        const { count: wifiCount } = await supabase
          .from('wifi_sessions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');
        updateStat('wifi', wifiCount || 0);

        // Fetch initial devices count
        const { count: devicesCount } = await supabase
          .from('it_assets')
          .select('*', { count: 'exact', head: true });
        updateStat('devices', devicesCount || 0);

        // Fetch today's lab reservations
        const today = new Date().toISOString().split('T')[0];
        const { count: labsCount } = await supabase
          .from('lab_reservations')
          .select('*', { count: 'exact', head: true })
          .eq('reservation_date', today);
        updateStat('labs', labsCount || 0);

        // Fetch software licenses count
        const { count: licensesCount } = await supabase
          .from('software_licenses')
          .select('*', { count: 'exact', head: true });
        updateStat('licenses', licensesCount || 0);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        toast.error('Error loading dashboard data');
      }
    };

    setupRealtimeData();

    // Cleanup function to unsubscribe from all channels
    return () => {
      subscriptions.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, [updateStat]);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">IT & Digital Services</h1>
        <p className="text-gray-600">Manage digital infrastructure, devices, and software resources</p>
      </div>

      {/* Stats with real-time updates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${
                stat.changeType === 'increase' ? 'bg-green-100 text-green-600' : 
                stat.changeType === 'decrease' ? 'bg-red-100 text-red-600' : 
                'bg-blue-100 text-blue-600'
              }`}>
                <stat.icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <div className="flex items-center">
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  {stat.change !== '0' && (
                    <span className={`ml-2 text-sm font-medium ${
                      stat.changeType === 'increase' ? 'text-green-600' : 
                      stat.changeType === 'decrease' ? 'text-red-600' : 
                      'text-gray-500'
                    }`}>
                      {stat.change}
                    </span>
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
            to="wifi"
            onClick={() => setActiveTab('wifi')}
            className={`${activeTab === 'wifi' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            <WifiIcon className="inline-block h-5 w-5 mr-1 -mt-1" />
            Wi-Fi Access
          </Link>
          <Link
            to="devices"
            onClick={() => setActiveTab('devices')}
            className={`${activeTab === 'devices' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            <DevicePhoneMobileIcon className="inline-block h-5 w-5 mr-1 -mt-1" />
            Device Management
          </Link>
          <Link
            to="labs"
            onClick={() => setActiveTab('labs')}
            className={`${activeTab === 'labs' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            <ComputerDesktopIcon className="inline-block h-5 w-5 mr-1 -mt-1" />
            Computer Labs
          </Link>
          <Link
            to="software"
            onClick={() => setActiveTab('software')}
            className={`${activeTab === 'software' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            <DocumentTextIcon className="inline-block h-5 w-5 mr-1 -mt-1" />
            Software Licenses
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

export default ITDigitalServices;
