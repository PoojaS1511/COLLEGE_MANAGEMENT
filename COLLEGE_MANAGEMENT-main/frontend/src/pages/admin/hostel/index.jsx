import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Card } from 'antd';
import { 
  HomeIcon, 
  UserGroupIcon, 
  ClipboardDocumentListIcon,
  CakeIcon,
  ArrowRightIcon,
  DocumentTextIcon,
  BellAlertIcon
} from '@heroicons/react/24/outline';

const Hostel = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // If we're at the root path, render the dashboard
  if (location.pathname === '/admin/hostel' || location.pathname === '/admin/hostel/') {
    return (
      <div className="p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Hostel Management</h1>
          <p className="text-gray-600">Manage room allocations, wardens, and hostel operations</p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Announcements Card */}
          <div 
            onClick={() => navigate('announcements')}
            className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg mr-4">
                <BellAlertIcon className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Announcements</h3>
                <p className="text-sm text-gray-500">Manage hostel announcements</p>
              </div>
            </div>
            <ArrowRightIcon className="h-5 w-5 text-gray-400" />
          </div>

          {/* Food Menu Card */}
          <div 
            onClick={() => navigate('food-menu')}
            className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center">
              <div className="p-3 bg-amber-100 rounded-lg mr-4">
                <CakeIcon className="h-8 w-8 text-amber-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Food Menu</h3>
                <p className="text-sm text-gray-500">Manage weekly meal plans</p>
              </div>
            </div>
            <ArrowRightIcon className="h-5 w-5 text-gray-400" />
          </div>

          {/* Hostel Rules Card */}
          <div 
            onClick={() => navigate('rules')}
            className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg mr-4">
                <DocumentTextIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Hostel Rules</h3>
                <p className="text-sm text-gray-500">Manage hostel rules and regulations</p>
              </div>
            </div>
            <ArrowRightIcon className="h-5 w-5 text-gray-400" />
          </div>

          {/* Allocations Card */}
          <div 
            onClick={() => navigate('allocations')}
            className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg mr-4">
                <UserGroupIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Room Allocations</h3>
                <p className="text-sm text-gray-500">Manage student room and bed allocations</p>
              </div>
            </div>
            <ArrowRightIcon className="h-5 w-5 text-gray-400" />
          </div>

          {/* Menu Items Management Card */}
          <div 
            onClick={() => navigate('menu-items')}
            className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center">
              <div className="p-3 bg-pink-100 rounded-lg mr-4">
                <ClipboardDocumentListIcon className="h-8 w-8 text-pink-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Menu Items Management</h3>
                <p className="text-sm text-gray-500">Manage hostel menu items and specials</p>
              </div>
            </div>
            <ArrowRightIcon className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>
    );
  }

  // Otherwise, render the nested route content
  return (
    <div className="p-4">
      <Card className="shadow">
        <Outlet />
      </Card>
    </div>
  );
};

export default Hostel;
