import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AcademicCapIcon,
  BellIcon,
  BookOpenIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ClockIcon,
  Cog6ToothIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  HomeIcon,
  SparklesIcon,
  UserIcon,
  // Outline Icons
  UserCircleIcon as UserCircleOutlineIcon,
  // Solid Icons
  HomeIcon as HomeSolidIcon,
} from '@heroicons/react/24/outline';

const StudentSidebar = () => {
  const location = useLocation();

  const isActive = (path, fullPath = null) => {
    if (fullPath) {
      return location.pathname === fullPath;
    }
    // Special handling for the root path
    if (path === '' && location.pathname === '/student') {
      return true;
    }
    return location.pathname.startsWith(`/student/${path}`) && path !== '';
  };

  const navItems = [
    { 
      name: 'Overview', 
      path: 'dashboard',
      fullPath: '/student/dashboard',
      icon: HomeIcon,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      exact: true
    },
    { 
      name: 'Profile', 
      path: 'profile',
      fullPath: '/student/profile',
      icon: UserIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    { 
      name: 'Academic', 
      path: 'academic',
      icon: AcademicCapIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      hasChildren: true,
      children: [
        { 
          name: 'Attendance',
          path: 'attendance',
          fullPath: '/student/attendance',
          icon: CalendarDaysIcon
        },
        { 
          name: 'Results',
          path: 'results',
          fullPath: '/student/results',
          icon: DocumentTextIcon
        },
        { 
          name: 'Examinations',
          path: 'examinations',
          fullPath: '/student/examinations',
          icon: ChartBarIcon
        }
      ]
    },
    { 
      name: 'Fee Structure', 
      path: 'fee-structure',
      fullPath: '/student/fee-structure',
      icon: CurrencyDollarIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      hasChildren: true,
      children: [
        { 
          name: 'My Fees',
          path: 'my-fees',
          fullPath: '/student/my-fees',
          icon: CurrencyDollarIcon
        },
        { 
          name: 'Fee Structure',
          path: 'fee-details',
          fullPath: '/student/fee-details',
          icon: DocumentTextIcon
        }
      ]
    },
    { 
      name: 'Hostel', 
      path: 'hostel',
      icon: HomeIcon,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      hasChildren: true,
      children: [
        { 
          name: 'Announcements',
          path: 'announcements',
          fullPath: '/student/announcements',
          icon: BellIcon
        },
        { 
          name: 'Hostel Menu',
          path: 'hostel-menu',
          fullPath: '/student/hostel-menu',
          icon: DocumentTextIcon
        },
        { 
          name: 'Mess Status',
          path: 'mess-status',
          fullPath: '/student/mess-status',
          icon: DocumentTextIcon
        },
        { 
          name: 'Hostel Feedbacks',
          path: 'hostel-feedbacks',
          fullPath: '/student/hostel-feedbacks',
          icon: DocumentTextIcon
        },
        { 
          name: 'Rules',
          path: 'rules',
          fullPath: '/student/rules',
          icon: DocumentTextIcon
        },
        { 
          name: 'Leave Request',
          path: 'leave-request',
          fullPath: '/student/leave-request',
          icon: DocumentTextIcon
        },
        { 
          name: 'Room Allocation',
          path: 'room-allocation',
          fullPath: '/student/room-allocation',
          icon: HomeIcon
        },
        { 
          name: 'Items',
          path: 'items',
          fullPath: '/student/items',
          icon: DocumentTextIcon
        },
        { 
          name: 'Votes',
          path: 'votes',
          fullPath: '/student/votes',
          icon: DocumentTextIcon
        }
      ]
    },
    { 
      name: 'Transport', 
      path: 'transport',
      fullPath: '/student/transport',
      icon: ClockIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      external: true,
      externalUrl: 'file:///C:/COLLEGE/Bus/Fleet_Flow-main/frontend/public/index.html'
    },
    { 
      name: 'Career Development', 
      path: 'career',
      icon: SparklesIcon,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
      hasChildren: true,
      children: [
        { 
          name: 'Resume Analyzer',
          path: 'resume',
          fullPath: '/student/career/resume',
          icon: DocumentTextIcon
        },
        { 
          name: 'Internships',
          path: 'internships',
          fullPath: '/student/career/internships',
          icon: BriefcaseIcon
        },
        { 
          name: 'Career Prep Courses',
          path: 'courses',
          fullPath: '/student/career/courses',
          icon: AcademicCapIcon
        },
        { 
          name: 'Career Assistant',
          path: 'assistant',
          fullPath: '/student/career/assistant',
          icon: SparklesIcon
        }
      ]
    },
    { 
      name: 'Notifications', 
      path: 'notifications',
      icon: BellIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    { 
      name: 'Settings', 
      path: 'settings',
      icon: Cog6ToothIcon,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100'
    }
  ];

  const renderNavItem = (item, isChild = false) => {
    const isItemActive = isActive(item.path, item.fullPath);
    const iconColor = isItemActive ? 'text-white' : 'text-white';
    const bgColor = isItemActive ? 'bg-[#2b4a74]' : 'hover:bg-[#2b4a74]';
    const textColor = isItemActive ? 'text-white font-semibold' : 'text-white';
    
    // For parent items, we'll handle them separately
    if (item.hasChildren && !isChild) {
      return (
        <div key={item.name} className="space-y-1">
          <div className="px-4 py-3 text-sm font-medium text-gray-300">    
            {item.name}
          </div>
          <div className="space-y-1 pl-4">
            {item.children.map(child => renderNavItem({ ...child, parentPath: item.path }, true))}
          </div>
        </div>
      );
    }

    if (item.external) {
      return (
        <a
          key={item.name}
          href={item.externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`group flex items-center px-4 py-3 text-sm rounded-lg transition-colors ${bgColor} ${textColor}`}
        >
          <item.icon className={`mr-3 h-5 w-5 flex-shrink-0 ${iconColor}`} />
          <span>{item.name}</span>
        </a>
      );
    }

    // Calculate the path for the item
    const itemPath = item.fullPath || (item.parentPath 
      ? `/student/${item.parentPath}/${item.path}` 
      : `/student/${item.path}`);

    return (
      <Link
        key={item.name}
        to={itemPath}
        className={`group flex items-center px-4 py-3 text-sm rounded-lg transition-colors ${bgColor} ${textColor}`}
      >
        <item.icon className={`mr-3 h-5 w-5 flex-shrink-0 ${iconColor}`} />
        <span>{item.name}</span>
      </Link>
    );
  };

  return (
    <div className="flex h-screen w-64 flex-col border-r border-gray-800 bg-[#1d395e]">
      {/* Logo */}
      <div className="flex h-16 flex-shrink-0 items-center px-4 border-b border-gray-700">
        <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
          S
        </div>
        <h1 className="ml-3 text-lg font-semibold text-white">Student Portal</h1>
      </div>

      {/* Navigation - Scrollable Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <nav className="flex-1 overflow-y-auto py-2 px-4 space-y-1">
          {navItems.flatMap((item) => renderNavItem(item))}
        </nav>
      </div>

      {/* User Profile - Fixed at Bottom */}
      <div className="border-t border-gray-700 p-4 bg-[#1d395e] flex-shrink-0">
        <div className="group flex items-center rounded-lg p-2 hover:bg-[#2b4a74]">
          <div className="h-9 w-9 rounded-full bg-[#2b4a74] flex items-center justify-center">
            <UserCircleOutlineIcon className="h-5 w-5 text-white" />       
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white truncate">        
              {JSON.parse(localStorage.getItem('user') || '{}').full_name || 'Student'}
            </p>
            <p className="text-xs text-gray-300 group-hover:text-white">
              View profile
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentSidebar;