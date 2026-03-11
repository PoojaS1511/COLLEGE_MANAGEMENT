import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  AlertTriangle, 
  Shield, 
  Award, 
  BarChart3,
  Menu,
  X
} from 'lucide-react';

const QualityNavigation = ({ isOpen, onClose }) => {
  const location = useLocation();

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/quality/dashboard',
      icon: LayoutDashboard,
      description: 'Real-time KPIs and institutional metrics'
    },
    {
      name: 'Faculty Performance',
      path: '/quality/faculty',
      icon: Users,
      description: 'Faculty evaluation and performance tracking'
    },
    {
      name: 'Audit Records',
      path: '/quality/audits',
      icon: FileText,
      description: 'Internal and external quality audits'
    },
    {
      name: 'Grievance Reports',
      path: '/quality/grievances',
      icon: AlertTriangle,
      description: 'Grievance submission and resolution tracking'
    },
    {
      name: 'Policy Compliance',
      path: '/quality/policies',
      icon: Shield,
      description: 'Regulatory policy compliance monitoring'
    },
    {
      name: 'Accreditation',
      path: '/quality/accreditation',
      icon: Award,
      description: 'NAAC/NBA accreditation readiness'
    },
    {
      name: 'Analytics',
      path: '/quality/analytics',
      icon: BarChart3,
      description: 'AI-driven insights and analytics'
    }
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">Q&A</span>
            </div>
            <span className="ml-3 text-xl font-semibold text-gray-900">Quality & Accreditation</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-5 px-2">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => onClose()}
                  className={`
                    group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-200
                    ${isActive(item.path)
                      ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className={`
                    mr-3 h-5 w-5 flex-shrink-0
                    ${isActive(item.path) ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}
                  `} />
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                  </div>
                  {isActive(item.path) && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Quick Stats */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs font-medium text-gray-500 mb-2">System Status</div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">API Status</span>
                <span className="flex items-center text-green-600">
                  <div className="w-2 h-2 bg-green-600 rounded-full mr-1"></div>
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Last Sync</span>
                <span className="text-gray-900">Just now</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default QualityNavigation;
