import React, { useState, useEffect, useCallback } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  CalendarIcon,
  ClockIcon,
  TrophyIcon,
  UserGroupIcon,
  PlusIcon,
  ListBulletIcon,
  ChartBarIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { supabase } from '../../../lib/supabase';

const SportsManagement = () => {
  const location = useLocation();
  const currentPath = location.pathname.split('/').pop();
  const [activeTab, setActiveTab] = useState(currentPath || 'equipment');
  const [stats, setStats] = useState([
    { id: 'equipment', name: 'Active Equipment Bookings', value: '0', icon: ListBulletIcon, change: '0', changeType: 'neutral' },
    { id: 'grounds', name: 'Ground Reservations', value: '0', icon: CalendarIcon, change: '0', changeType: 'neutral' },
    { id: 'fitness', name: 'Fitness Logs Today', value: '0', icon: ChartBarIcon, change: '0', changeType: 'neutral' },
    { id: 'events', name: 'Upcoming Events', value: '0', icon: TrophyIcon, change: '0', changeType: 'neutral' },
  ]);
  const [loading, setLoading] = useState(true);
  
  // Update active tab when the URL changes
  useEffect(() => {
    const path = location.pathname.split('/').pop();
    if (path && ['equipment', 'grounds', 'fitness', 'events'].includes(path)) {
      setActiveTab(path);
    } else {
      setActiveTab('equipment');
    }
  }, [location.pathname]);

  // Function to update stats with new data
  const updateStat = useCallback((id, newValue, changeType = 'neutral') => {
    setStats(prevStats => 
      prevStats.map(stat => {
        if (stat.id === id) {
          const oldValue = parseInt(stat.value) || 0;
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

  // Set up real-time data fetching
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Fetch equipment bookings
        const { count: equipmentBookings } = await supabase
          .from('equipment_bookings')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');
        updateStat('equipment', equipmentBookings || 0);

        // Fetch ground reservations
        const { count: groundReservations } = await supabase
          .from('ground_reservations')
          .select('*', { count: 'exact', head: true })
          .gte('end_time', new Date().toISOString());
        updateStat('grounds', groundReservations || 0);

        // Fetch today's fitness logs
        const today = new Date().toISOString().split('T')[0];
        const { count: fitnessLogs } = await supabase
          .from('fitness_logs')
          .select('*', { count: 'exact', head: true })
          .gte('date', today);
        updateStat('fitness', fitnessLogs || 0);

        // Fetch upcoming events
        const { count: upcomingEvents } = await supabase
          .from('sports_events')
          .select('*', { count: 'exact', head: true })
          .gte('start_time', new Date().toISOString());
        updateStat('events', upcomingEvents || 0);

      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchStats();

    // Set up real-time subscriptions
    const equipmentChannel = supabase
      .channel('equipment_bookings_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'equipment_bookings' },
        () => fetchStats()
      )
      .subscribe();

    const groundsChannel = supabase
      .channel('ground_reservations_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'ground_reservations' },
        () => fetchStats()
      )
      .subscribe();

    const fitnessChannel = supabase
      .channel('fitness_logs_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'fitness_logs' },
        () => fetchStats()
      )
      .subscribe();

    const eventsChannel = supabase
      .channel('sports_events_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'sports_events' },
        () => fetchStats()
      )
      .subscribe();

    // Cleanup function
    return () => {
      supabase.removeChannel(equipmentChannel);
      supabase.removeChannel(groundsChannel);
      supabase.removeChannel(fitnessChannel);
      supabase.removeChannel(eventsChannel);
    };
  }, [updateStat]);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Sports & Recreation</h1>
        <p className="text-gray-600">Manage sports facilities, equipment bookings, and fitness activities</p>
      </div>

      {/* Stats */}
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
                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-7 w-16 bg-gray-200 rounded"></div>
                  </div>
                ) : (
                  <div className="flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                    {stat.change !== '0' && (
                      <p 
                        className={`ml-2 text-sm font-medium ${
                          stat.changeType === 'increase' ? 'text-green-600' : 
                          stat.changeType === 'decrease' ? 'text-red-600' : 
                          'text-gray-500'
                        }`}
                      >
                        {stat.change}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          <Link
            to="equipment"
            className={`${
              activeTab === 'equipment' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <ListBulletIcon className="h-5 w-5 mr-1" />
            Equipment Booking
          </Link>
          <Link
            to="grounds"
            className={`${
              activeTab === 'grounds' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <CalendarIcon className="h-5 w-5 mr-1" />
            Ground Reservation
          </Link>
          <Link
            to="fitness"
            className={`${
              activeTab === 'fitness' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <ChartBarIcon className="h-5 w-5 mr-1" />
            Fitness Log
          </Link>
          <Link
            to="events"
            className={`${
              activeTab === 'events' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <TrophyIcon className="h-5 w-5 mr-1" />
            Event Tracker
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

export default SportsManagement;
