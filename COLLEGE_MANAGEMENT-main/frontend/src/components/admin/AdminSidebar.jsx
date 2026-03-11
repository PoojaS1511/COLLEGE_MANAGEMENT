import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './AdminSidebar.css';
// Import all icons from heroicons
import { 
  // Outline Icons
  AcademicCapIcon,
  BanknotesIcon,
  BellAlertIcon,
  BookOpenIcon,
  BookmarkSquareIcon,
  BriefcaseIcon,
  Cog6ToothIcon,
  ComputerDesktopIcon,
  DocumentDuplicateIcon,
  KeyIcon,
  BuildingOffice2Icon,
  CalendarDaysIcon,
  CalendarIcon,
  ChartBarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClipboardDocumentCheckIcon,
  CpuChipIcon,
  CurrencyDollarIcon,
  DevicePhoneMobileIcon,
  DocumentTextIcon,
  FireIcon,
  HomeIcon,
  LightBulbIcon,
  PencilSquareIcon,
  PhotoIcon,
  ServerIcon,
  ShieldCheckIcon,
  TrophyIcon,
  TruckIcon,
  UserCircleIcon,
  UserGroupIcon,
  UserGroupIcon as UserGroupOutlineIcon,
  UserPlusIcon,
  UserIcon,
  WifiIcon,
  WrenchScrewdriverIcon,
  ChatBubbleLeftIcon,
  // Aliases for outline icons
  ChartBarIcon as ChartBarOutlineIcon,
  ClipboardDocumentCheckIcon as ClipboardDocumentCheckOutlineIcon,
  CurrencyDollarIcon as CurrencyDollarOutlineIcon,
  HomeIcon as HomeOutlineIcon,
  ShieldCheckIcon as ShieldCheckOutlineIcon
} from '@heroicons/react/24/outline';

// Solid Icons
import { 
  BookOpenIcon as BookOpenSolidIcon,
  BriefcaseIcon as BriefcaseSolidIcon,
  ClipboardDocumentCheckIcon as ClipboardDocumentCheckSolidIcon,
  CurrencyDollarIcon as CurrencyDollarSolidIcon,
  HomeIcon as HomeSolidIcon,
  UserGroupIcon as UserGroupSolidIcon,
  LinkIcon
} from '@heroicons/react/24/solid';

const AdminSidebar = () => {
  // Removed inline scrollbar styles as they're now in CSS
  const location = useLocation();

  const [expandedSections, setExpandedSections] = useState({
    academic: location.pathname.startsWith('/admin/academic'),
    academics: location.pathname.startsWith('/admin/academics'),
    clubs: location.pathname.startsWith('/admin/academics/clubs'),
    infrastructure: location.pathname.startsWith('/admin/infrastructure'), 
    it: location.pathname.startsWith('/admin/it'),
    sports: location.pathname.startsWith('/admin/sports')
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const isActive = (path, fullPath = null, exact = false) => {
    // If fullPath is provided, use it for exact matching
    if (fullPath) {
      return location.pathname === fullPath;
    }
    
    // For exact matching
    if (exact) {
      return location.pathname === `/admin/${path}`.replace(/\/+$/, '');   
    }
    
    // Special case for analytics
    if (path === 'analytics') {
      return location.pathname.startsWith('/admin/analytics');
    }
    
    // For nested paths like 'results/staging', check if pathname contains the path
    if (path.includes('/')) {
      return location.pathname.includes(path);
    }
    
    // Special case for dashboard
    if (path === 'dashboard' || path === '') {
      return location.pathname === '/admin' || 
             location.pathname === '/admin/' || 
             location.pathname === '/admin/dashboard';
    }
    
    // For non-exact matching, check if the current path starts with the given path
    // but ensure we're not matching partial path segments
    const pathToCheck = `/admin/${path}`;
    return location.pathname === pathToCheck || 
           (location.pathname.startsWith(`${pathToCheck}/`) && path !== '');
  };

  const isExactActive = (path) => {
    // Remove any trailing slashes for consistent comparison
    const normalizedPathname = location.pathname.replace(/\/$/, '');
    const normalizedComparePath = `/admin/${path}`.replace(/\/$/, '');
    return normalizedPathname === normalizedComparePath;
  };

  const navItems = [
    { 
      name: 'Overview', 
      path: '',
      icon: ChartBarOutlineIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      exact: true
    },
    { 
      name: 'Dashboard', 
      path: 'dashboard',
      icon: HomeOutlineIcon,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      exact: true
    },
    { 
      name: 'Student Management', 
      path: 'students',
      icon: UserGroupIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      exact: false,
      hasChildren: true,
      children: [
        { 
          name: 'All Students',
          path: 'students',
          fullPath: '/admin/students',
          exact: true
        },
        {
          name: 'Add Users',
          path: 'students/add',
          fullPath: '/admin/students/addusers',
          icon: UserPlusIcon
        },
        {
          name: 'Manage Credentials',
          path: 'students/credentials',
          fullPath: '/admin/students/credentials',
          icon: KeyIcon
        },
        {
          name: 'Signup Credentials',
          path: 'students/signup-credentials',
          fullPath: '/admin/students/signup-credentials',
          icon: ClipboardDocumentCheckIcon
        }
      ]
    },
    { 
      name: 'Faculty Management', 
      path: 'faculty',
      icon: UserGroupIcon,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      hasChildren: true,
      children: [
        { 
          name: 'All Faculty',
          path: 'faculty',
          fullPath: '/admin/faculty',
          exact: true
        },
        {
          name: 'Manage Credentials',
          path: 'faculty/credentials',
          fullPath: '/admin/faculty/credentials',
          icon: KeyIcon
        }, 
        {
          name: 'Attendance',
          path: 'faculty/attendance',
          fullPath: '/admin/faculty/attendance',
          icon: ClipboardDocumentCheckIcon
        },
        {
          name: 'Faculty Mapping',
          path: 'faculty/mapping',
          fullPath: '/admin/faculty/mapping',
          icon: LinkIcon
        },
        { 
          name: 'Marks Management', 
          path: 'faculty/marks',
          icon: ClipboardDocumentCheckIcon,
          color: 'text-amber-600',
          bgColor: 'bg-amber-50',
          fullPath: '/admin/internal-marks'
        },
        { 
          name: 'Faculty Schedule', 
          path: 'faculty/schedule',
          icon: CalendarIcon,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          fullPath: '/admin/faculty-schedule'
        },
        { 
          name: 'Research Papers',
          path: 'faculty/research-papers',
          icon: DocumentTextIcon,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          fullPath: '/admin/faculty/research-papers'
        }
      ]
    },
    { 
      name: 'Academic Management', 
      path: 'academics',
      icon: AcademicCapIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      hasChildren: true,
      children: [
        { 
          name: 'Courses Management',
          path: 'courses',
          icon: BookOpenIcon,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          fullPath: '/admin/academics/courses'
        },
        { 
          name: 'Subjects',
          path: 'subjects',
          icon: BookmarkSquareIcon,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50'
        },
        { 
          name: 'Exams', 
          path: 'exams',
          icon: ClipboardDocumentCheckOutlineIcon,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50'
        },
        { 
          name: 'Departments',
          path: 'departments',
          icon: BuildingOffice2Icon,
          color: 'text-amber-600',
          bgColor: 'bg-amber-50',
          fullPath: '/admin/academics/departments'
        },
      ]
    },
    { 
      name: 'Attendance', 
      path: 'attendance',
      icon: CalendarDaysIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
   
    { 
      name: 'Fees', 
      path: 'fees',
      icon: CurrencyDollarOutlineIcon,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100'
    },
    { 
      name: 'Hostel Management',
      path: 'hostel',
      icon: HomeIcon,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
      hasChildren: true,
      children: [
        { 
          name: 'Announcements Management',
          path: 'announcements',
          fullPath: '/admin/hostel/announcements',
          icon: BellAlertIcon
        },
        {
          name: 'Food Menu Management',
          path: 'food-menu',
          fullPath: '/admin/hostel/food-menu',
          icon: FireIcon
        },
        {
          name: 'Hostel Rules Management',
          path: 'rules',
          fullPath: '/admin/hostel/rules',
          icon: ClipboardDocumentCheckIcon
        },
        {
          name: 'Allocations',
          path: 'allocations',
          fullPath: '/admin/hostel/allocations',
          icon: UserGroupIcon
        },
        {
          name: 'Feedbacks',
          path: 'feedbacks',
          fullPath: '/admin/hostel/feedbacks',
          icon: ChatBubbleLeftIcon
        },
        {
          name: 'Leave Management',
          path: 'leave-management',
          fullPath: '/admin/hostel/leave-management',
          icon: CalendarDaysIcon
        },
        {
          name: 'Status Management',
          path: 'status',
          fullPath: '/admin/hostel/status',
          icon: ChartBarIcon
        },
        {
          name: 'Menu Items Management',
          path: 'menu-items',
          fullPath: '/admin/hostel/menu-items',
          icon: FireIcon
        },
        {
          name: 'Votes Management',
          path: 'votes',
          fullPath: '/admin/hostel/votes',
          icon: ChartBarIcon
        },
        {
          name: 'Polls Management',
          path: 'polls',
          fullPath: '/admin/hostel/polls',
          icon: ChartBarIcon
        }
      ]
    },
    { 
      name: 'Admissions', 
      path: 'admissions',
      icon: UserGroupOutlineIcon,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100'
    },
    { 
      name: 'Clubs',
      path: 'clubs',
      icon: UserGroupOutlineIcon,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      fullPath: '/admin/academics/clubs'
    },
    { 
      name: 'Infrastructure',
      path: 'infrastructure',
      icon: BuildingOffice2Icon,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      hasChildren: true,
      children: [
        { 
          name: 'Overview', 
          path: 'infrastructure',
          fullPath: '/admin/infrastructure',
          exact: true
        },
        { 
          name: 'Campus Map', 
          path: 'campus-map',
          fullPath: '/admin/infrastructure/campus-map'
        },
        { 
          name: 'Classroom Allocation', 
          path: 'classroom-allocation',
          fullPath: '/admin/infrastructure/classroom-allocation'
        },
        { 
          name: 'Smart Classroom', 
          path: 'smart-classroom',
          fullPath: '/admin/infrastructure/smart-classroom'
        },
       
      ]
    },
    { 
      name: 'HR Management', 
      path: 'hr',
      icon: BriefcaseIcon,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
      hasChildren: true,
      children: [
        {
          name: 'Dashboard',
          path: 'hr',
          fullPath: '/admin/hr',
          exact: true
        },
        {
          name: 'Relieving Requests',
          path: 'hr/relieving-requests',
          fullPath: '/admin/hr/relieving-requests',
          icon: ClipboardDocumentCheckIcon
        },
        {
          name: 'Document Manager',
          path: 'document-manager',
          fullPath: '/admin/hr/document-manager',
          icon: DocumentTextIcon
        },
        {
          name: 'Clearance Management',
          path: 'clearance',
          fullPath: '/admin/hr/clearance',
          icon: ClipboardDocumentCheckIcon
        }
      ]
    },
    { 
      name: 'Notifications', 
      path: 'notifications',
      icon: BellAlertIcon,
      color: 'text-violet-600',
      bgColor: 'bg-violet-100'
    },
    { 
      name: 'Notification Recipients', 
      path: 'notifications/recipients',
      icon: UserGroupOutlineIcon,
      color: 'text-teal-600',
      bgColor: 'bg-teal-100'
    },
    { 
      name: 'AI Assistant', 
      path: 'ai-assistant',
      icon: CpuChipIcon,
      color: 'text-fuchsia-600',
      bgColor: 'bg-fuchsia-100'
    },

    { 
      name: 'Analytics Dashboard', 
      path: 'analytics',
      icon: ChartBarIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      exact: false,
      hasChildren: true,
      children: [
        {
          name: 'Performance Analytics',
          path: 'analytics/performance',
          fullPath: '/admin/analytics/performance'
        },
        {
          name: 'Enrollment Analytics',
          path: 'analytics/enrollment',
          fullPath: '/admin/analytics/enrollment'
        }
      ]
    },
    {
      name: 'Finance',
      path: 'finance',
      icon: CurrencyDollarOutlineIcon,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      hasChildren: true,
      children: [
        {
          name: 'Dashboard',
          path: 'finance/dashboard',
          fullPath: '/admin/finance/dashboard'
        },
        {
          name: 'Student Fees',
          path: 'finance/student-fees',
          fullPath: '/admin/finance/student-fees'
        },
        {
          name: 'Staff Payroll',
          path: 'finance/staff-payroll',
          fullPath: '/admin/finance/staff-payroll'
        },
        {
          name: 'Expenses',
          path: 'finance/expenses',
          fullPath: '/admin/finance/expenses'
        },
        {
          name: 'Vendors',
          path: 'finance/vendors',
          fullPath: '/admin/finance/vendors'
        },
        {
          name: 'Budget Allocation',
          path: 'finance/budget',
          fullPath: '/admin/finance/budget'
        },
        {
          name: 'Maintenance',
          path: 'finance/maintenance',
          fullPath: '/admin/finance/maintenance'
        },
        {
          name: 'AI Assistant',
          path: 'finance/ai-assistant',
          fullPath: '/admin/finance/ai-assistant'
        }
      ]
    },
    {
      name: 'Payroll Management',
      path: 'payroll',
      icon: CurrencyDollarIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      hasChildren: true,
      children: [
        {
          name: 'Dashboard',
          path: 'dashboard',
          fullPath: '/admin/payroll/dashboard',
          icon: ChartBarIcon
        },
        {
          name: 'Payroll List',
          path: 'list',
          fullPath: '/admin/payroll/list',
          icon: ClipboardDocumentCheckIcon
        },
        {
          name: 'Calculation',
          path: 'calculation',
          fullPath: '/admin/payroll/calculation',
          icon: Cog6ToothIcon
        },
        {
          name: 'Approval',
          path: 'approval',
          fullPath: '/admin/payroll/approval',
          icon: ClipboardDocumentCheckIcon
        },
        {
          name: 'Payslip',
          path: 'payslip',
          fullPath: '/admin/payroll/payslip',
          icon: DocumentTextIcon
        },
        {
          name: 'Notifications',
          path: 'notifications',
          fullPath: '/admin/payroll/notifications',
          icon: BellAlertIcon
        }
      ]
    },
    {
      name: 'Quality Management',
      path: 'quality',
      icon: ShieldCheckIcon,
      color: 'text-teal-600',
      bgColor: 'bg-teal-100',
      hasChildren: true,
      children: [
        {
          name: 'Dashboard',
          path: 'quality/dashboard',
          fullPath: '/admin/quality/dashboard',
          icon: ChartBarIcon
        },
        {
          name: 'Faculty',
          path: 'quality/faculty',
          fullPath: '/admin/quality/faculty',
          icon: UserGroupIcon
        },
        {
          name: 'Analytics',
          path: 'quality/analytics',
          fullPath: '/admin/quality/analytics',
          icon: ChartBarIcon
        },
        {
          name: 'Audits',
          path: 'quality/audits',
          fullPath: '/admin/quality/audits',
          icon: ClipboardDocumentCheckIcon
        },
        {
          name: 'Grievances',
          path: 'quality/grievances',
          fullPath: '/admin/quality/grievances',
          icon: BellAlertIcon
        },
        {
          name: 'Policies',
          path: 'quality/policies',
          fullPath: '/admin/quality/policies',
          icon: DocumentTextIcon
        },
        {
          name: 'Accreditation',
          path: 'quality/accreditation',
          fullPath: '/admin/quality/accreditation',
          icon: TrophyIcon
        }
      ]
    },
    { 
      name: 'Settings', 
      path: 'settings',
      icon: Cog6ToothIcon,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100'
    }
  ];

  // Filter out the Overview item from navigation
  const filteredNavItems = navItems.filter(item => item.name !== 'Overview');


  return (
    <div className="sidebar-container">
      {/* Header */}
      <div className="sidebar-header">
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-300 border-opacity-20">
          <div className="flex flex-col items-center">
            <p className="text-sm font-semibold text-white">Admin Panel</p>  
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="sidebar-scrollable">
        <nav className="py-4 px-2">
        <div className="space-y-1">
          {filteredNavItems.map((item) => (
            <div key={item.name}>
              {item.hasChildren ? (
                <>
                  <button
                    onClick={() => toggleSection(item.path.split('/')[0] || item.path)}
                    className={`group w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-white rounded-lg transition-colors duration-200 ${
                      isActive(item.path) 
                        ? 'bg-white bg-opacity-20 font-semibold'
                        : 'hover:bg-[#2b4a74]'
                    }`}
                  >
                    <div className="flex items-center">
                      <item.icon 
                        className="mr-3 h-6 w-6 flex-shrink-0 text-white" 
                        aria-hidden="true" 
                      />
                      {item.name}
                    </div>
                    {expandedSections[item.path.split('/')[0] || item.path] ? (
                      <ChevronUpIcon className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                    )}
                  </button>

                  {expandedSections[item.path.split('/')[0] || item.path] && item.children && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          to={child.fullPath || `/admin/${item.path}/${child.path}`}
                          className={`group flex items-center px-3 py-2 text-sm font-medium text-white rounded-lg transition-colors duration-200 ${    
                            isActive(child.path, child.fullPath)
                              ? 'bg-white bg-opacity-20 font-semibold'     
                              : 'hover:bg-[#2b4a74]'
                          }`}
                        >
                          {child.icon && (
                            <child.icon
                              className="mr-3 h-5 w-5 flex-shrink-0 text-white"
                              aria-hidden="true"
                            />
                          )}
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : item.external ? (
                <a
                  href={item.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group flex items-center px-4 py-3 text-sm font-medium text-white rounded-md ${
                    isActive(item.path, null, item.exact) 
                      ? 'bg-white bg-opacity-20 font-semibold'
                      : 'hover:bg-[#2b4a74]'
                  }`}
                >
                  <item.icon 
                    className="mr-3 h-6 w-6 flex-shrink-0 text-white"      
                    aria-hidden="true" 
                  />
                  {item.name}
                  <span className="ml-auto">
                    <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                      <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                    </svg>
                  </span>
                </a>
              ) : (
                <Link
                  to={item.path.startsWith('http') ? '#' : `/admin/${item.path}`}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive(item.path, null, item.exact)
                      ? 'text-white bg-opacity-20 font-semibold'
                      : 'text-gray-200 hover:bg-white hover:bg-opacity-10'
                  }`}
                  onClick={item.onClick}
                  target={item.external ? '_blank' : '_self'}
                  rel={item.external ? 'noopener noreferrer' : ''}
                >
                  <item.icon
                    className={`mr-3 h-6 w-6 flex-shrink-0 ${
                      isActive(item.path, null, item.exact) ? 'text-white' : 'text-gray-300 group-hover:text-white'
                    }`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              )}
            </div>
          ))}
        </div>
        </nav>
      </div>

      {/* User Profile - Fixed at bottom */}
      <div className="user-profile-section">
        <div className="flex items-center">
          <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <span className="text-blue-600 text-xs font-medium">AU</span>  
          </div>
          <div className="ml-2 overflow-hidden">
            <p className="text-xs font-medium text-gray-200 truncate">Admin User</p>
            <p className="text-[10px] text-gray-400 truncate">Administrator</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;