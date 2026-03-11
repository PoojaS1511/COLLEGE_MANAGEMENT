import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { 
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  ShieldCheckIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { ROLES } from '../../constants/roles';

const UserMenu = () => {
  const { user, logout } = useAuth();

  const userNavigation = [
    { 
      name: 'Your Profile', 
      href: '/profile', 
      icon: UserIcon,
      roles: [ROLES.ADMIN, ROLES.FACULTY, ROLES.STAFF]
    },
    { 
      name: 'Settings', 
      href: '/settings', 
      icon: Cog6ToothIcon,
      roles: [ROLES.ADMIN, ROLES.FACULTY, ROLES.STAFF]
    },
    { 
      name: 'Admin Panel', 
      href: '/admin', 
      icon: ShieldCheckIcon,
      roles: [ROLES.ADMIN]
    },
    { 
      name: 'Help & Support', 
      href: '/help', 
      icon: QuestionMarkCircleIcon,
      roles: [ROLES.ADMIN, ROLES.FACULTY, ROLES.STAFF, ROLES.STUDENT, ROLES.PARENT]
    },
    { 
      name: 'Sign out', 
      href: '#', 
      icon: ArrowRightOnRectangleIcon,
      onClick: logout,
      roles: [ROLES.ADMIN, ROLES.FACULTY, ROLES.STAFF, ROLES.STUDENT, ROLES.PARENT]
    },
  ];

  // Filter menu items based on user role
  const filteredNavigation = userNavigation.filter(item => 
    !item.roles || item.roles.includes(user?.role)
  );

  if (!user) return null;

  return (
    <Menu as="div" className="relative ml-3">
      <div>
        <Menu.Button className="flex max-w-xs items-center rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
          <span className="sr-only">Open user menu</span>
          {user.user_metadata?.avatar_url ? (
            <img 
              className="h-8 w-8 rounded-full" 
              src={user.user_metadata.avatar_url} 
              alt={user.email}
            />
          ) : (
            <UserCircleIcon className="h-8 w-8 text-gray-400" aria-hidden="true" />
          )}
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
          <div className="px-4 py-3">
            <p className="text-sm font-medium text-gray-700">
              {user.user_metadata?.full_name || user.email}
            </p>
            <p className="truncate text-xs text-gray-500">
              {user.role ? `${user.role.charAt(0).toUpperCase() + user.role.slice(1)}` : 'User'}
            </p>
          </div>
          <div className="border-t border-gray-100" />
          {filteredNavigation.map((item) => (
            <Menu.Item key={item.name}>
              {({ active }) => (
                <a
                  href={item.href}
                  onClick={(e) => {
                    if (item.onClick) {
                      e.preventDefault();
                      item.onClick();
                    }
                  }}
                  className={classNames(
                    active ? 'bg-gray-50' : '',
                    'group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50',
                    item.name === 'Sign out' ? 'text-red-600 hover:text-red-800' : ''
                  )}
                >
                  <item.icon 
                    className={classNames(
                      'mr-3 h-5 w-5',
                      item.name === 'Sign out' ? 'text-red-500' : 'text-gray-400 group-hover:text-gray-500'
                    )} 
                    aria-hidden="true" 
                  />
                  {item.name}
                </a>
              )}
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

// Helper function to conditionally join class names
function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default UserMenu;
