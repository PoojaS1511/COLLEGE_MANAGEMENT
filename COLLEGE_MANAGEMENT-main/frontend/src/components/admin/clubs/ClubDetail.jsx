import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { 
  PencilIcon, 
  UserGroupIcon, 
  CalendarIcon, 
  PhotoIcon, 
  TrophyIcon, 
  DocumentTextIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import ApiService from '../../../services/api';

const navigation = [
  { name: 'Overview', href: '', icon: DocumentTextIcon },
  { name: 'Members', href: 'members', icon: UserGroupIcon },
  { name: 'Events', href: 'events', icon: CalendarIcon },
  { name: 'Gallery', href: 'gallery', icon: PhotoIcon },
  { name: 'Awards', href: 'awards', icon: TrophyIcon },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const ClubDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    members: 0,
    upcomingEvents: 0,
    pastEvents: 0,
    awards: 0,
  });
  const [activeTab, setActiveTab] = useState('');

  useEffect(() => {
    // Set active tab based on URL
    const pathParts = location.pathname.split('/');
    const currentTab = pathParts[pathParts.length - 1];
    setActiveTab(currentTab === id ? '' : currentTab);
  }, [location.pathname, id]);

  useEffect(() => {
    fetchClub();
    fetchStats();
  }, [id]);

  const fetchClub = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getClub(id);
      if (response.success) {
        setClub(response.data);
      } else {
        setError(response.message || 'Failed to load club details');
      }
    } catch (error) {
      console.error('Error fetching club:', error);
      setError('Failed to load club details');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [membersRes, eventsRes, awardsRes] = await Promise.all([
        ApiService.getClubMembers(id),
        ApiService.getClubEvents(id),
        ApiService.getClubAwards(id)
      ]);

      const upcomingEvents = eventsRes.success 
        ? eventsRes.data.filter(event => new Date(event.start_date) > new Date()).length 
        : 0;
      
      const pastEvents = eventsRes.success 
        ? eventsRes.data.filter(event => new Date(event.start_date) <= new Date()).length 
        : 0;

      setStats({
        members: membersRes.success ? membersRes.data.length : 0,
        upcomingEvents,
        pastEvents,
        awards: awardsRes.success ? awardsRes.data.length : 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleStatusToggle = async () => {
    if (!club) return;
    
    try {
      const response = await ApiService.updateClub(club.id, { 
        is_active: !club.is_active 
      });
      
      if (response.success) {
        setClub(prev => ({
          ...prev,
          is_active: !prev.is_active
        }));
      } else {
        setError(response.message || 'Failed to update club status');
      }
    } catch (error) {
      console.error('Error updating club status:', error);
      setError('Failed to update club status');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !club) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Error loading club</h3>
          <p className="mt-2 text-sm text-gray-500">{error || 'Club not found'}</p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/admin/academics/clubs')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Clubs
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="lg:flex lg:items-center lg:justify-between">
          <div className="flex-1 min-w-0">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-4">
                <li>
                  <div className="flex">
                    <Link to="/admin/academics/clubs" className="text-sm font-medium text-gray-500 hover:text-gray-700">
                      Clubs
                    </Link>
                  </div>
                </li>
                <li>
                  <div className="flex items-center">
                    <svg
                      className="flex-shrink-0 h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="ml-4 text-sm font-medium text-gray-500">
                      {club.name}
                    </span>
                  </div>
                </li>
              </ol>
            </nav>
            <h2 className="mt-2 text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              {club.name}
            </h2>
            <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <UserGroupIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                {stats.members} members
              </div>
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <CalendarIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                {stats.upcomingEvents} upcoming events
              </div>
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <TrophyIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                {stats.awards} awards
              </div>
            </div>
          </div>
          <div className="mt-5 flex lg:mt-0 lg:ml-4 space-x-3">
          <div className="mt-5 flex lg:mt-0 lg:ml-4 space-x-3">
            <Link
              to={`/admin/academics/clubs/${club.id}/edit`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PencilIcon className="-ml-1 mr-2 h-5 w-5" />
              Edit
            </Link>
            <button
              onClick={handleStatusToggle}
              className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                club.is_active
                  ? 'border-red-300 text-red-700 bg-white hover:bg-red-50'
                  : 'border-green-300 text-green-700 bg-white hover:bg-green-50'
              }`}
            >
              {club.is_active ? (
                <>
                  <XCircleIcon className="-ml-1 mr-2 h-5 w-5" />
                  Deactivate
                </>
              ) : (
                <>
                  <CheckCircleIcon className="-ml-1 mr-2 h-5 w-5" />
                  Activate
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {navigation.map((item) => {
              const isActive = activeTab === item.href;
              return (
                <Link
                  key={item.name}
                  to={`/admin/academics/clubs/${id}/${item.href}`}
                  className={classNames(
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                    'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center'
                  )}
                >
                  <item.icon className="mr-2 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white shadow rounded-lg">
        <Outlet />
      </div>
    </div>
  );
};

export default ClubDetail;
