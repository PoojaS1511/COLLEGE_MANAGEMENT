import React, { useState, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Menu, Transition } from '@headlessui/react';
import { 
  BellIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  UserIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
const AdminHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <header className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Search Bar */}
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search students, faculty, or records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-black focus:border-black"
            />
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* Quick Stats */}
          <div className="hidden md:flex items-center space-x-6 text-sm text-gray-600">
            <div className="text-center">
              <div className="font-semibold text-gray-900">1,250</div>
              <div>Students</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900">85</div>
              <div>Faculty</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-red-600">23</div>
              <div>Defaulters</div>
            </div>
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-gray-400 hover:text-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 rounded-full">
            <BellIcon className="h-6 w-6" />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-black ring-2 ring-white"></span>
          </button>

          {/* User Menu */}
          <Menu as="div" className="relative ml-3">
            <div>
              <Menu.Button className="flex items-center max-w-xs rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2">
                <span className="sr-only">Open user menu</span>
                <div className="flex items-center">
                  <div className="text-right mr-3 hidden md:block">
                    <p className="text-sm font-medium text-gray-700">{user?.user_metadata?.full_name || user?.email}</p>
                    <p className="text-xs text-gray-500">{user?.role || 'Admin'}</p>
                  </div>
                  {user?.user_metadata?.avatar_url ? (
                    <img
                      className="h-8 w-8 rounded-full"
                      src={user.user_metadata.avatar_url}
                      alt={user.email}
                    />
                  ) : (
                    <UserCircleIcon className="h-8 w-8 text-gray-400" />
                  )}
                </div>
              </Menu.Button>
            </div>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => navigate('/admin/profile')}
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } flex w-full px-4 py-2 text-sm text-gray-700`}
                    >
                      <UserIcon className="mr-2 h-5 w-5" />
                      Your Profile
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => navigate('/admin/settings')}
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } flex w-full px-4 py-2 text-sm text-gray-700`}
                    >
                      <Cog6ToothIcon className="mr-2 h-5 w-5" />
                      Settings
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => navigate('/admin/roles')}
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } flex w-full px-4 py-2 text-sm text-gray-700`}
                    >
                      <ShieldCheckIcon className="mr-2 h-5 w-5" />
                      Roles & Permissions
                    </button>
                  )}
                </Menu.Item>
                <div className="border-t border-gray-100 my-1"></div>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleLogout}
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } flex w-full px-4 py-2 text-sm text-red-600`}
                    >
                      <ArrowRightOnRectangleIcon className="mr-2 h-5 w-5" />
                      Sign out
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </header>
  );
}

export default AdminHeader
