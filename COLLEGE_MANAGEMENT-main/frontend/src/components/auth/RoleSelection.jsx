import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, UserCog, UserCheck, Truck } from 'lucide-react';

const RoleSelection = () => {
  const roles = [
    {
      id: 'student',
      title: 'Student',
      description: 'Access your student portal to view your academic records, attendance, and more.',
      icon: <GraduationCap className="w-10 h-10 text-white" />,
      bgColor: 'bg-blue-600',
      hoverBgColor: 'hover:bg-blue-700'
    },
    {
      id: 'faculty',
      title: 'Faculty',
      description: 'Access faculty dashboard to manage courses, attendance, and student records.',
      icon: <UserCog className="w-10 h-10 text-white" />,
      bgColor: 'bg-green-600',
      hoverBgColor: 'hover:bg-green-700'
    },
    {
      id: 'admin',
      title: 'Administrator',
      description: 'Access administrative tools and manage the institution\'s data and settings.',
      icon: <UserCheck className="w-10 h-10 text-white" />,
      bgColor: 'bg-purple-600',
      hoverBgColor: 'hover:bg-purple-700'
    },
    {
      id: 'driver',
      title: 'Driver',
      description: 'Access transportation management system for route planning and student pickups.',
      icon: <Truck className="w-10 h-10 text-white" />,
      bgColor: 'bg-orange-600',
      hoverBgColor: 'hover:bg-orange-700'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Welcome to College Portal
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please select your role to continue
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {roles.map((role) => (
            <Link
              key={role.id}
              to={`/login/${role.id}`}
              className={`${role.bgColor} ${role.hoverBgColor} rounded-lg shadow-md overflow-hidden transition-all duration-300 transform hover:scale-105`}
            >
              <div className="p-6">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-black bg-opacity-20">
                  {role.icon}
                </div>
                <h3 className="text-xl font-bold text-white text-center mb-2">{role.title}</h3>
                <p className="text-white text-sm text-center opacity-90">{role.description}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Need help?{' '}
            <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
