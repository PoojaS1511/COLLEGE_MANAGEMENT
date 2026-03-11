import React from 'react';
import { UserGroupIcon, AcademicCapIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

const StudentSupport = () => {
  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <UserGroupIcon className="h-8 w-8 text-indigo-600 mr-2" />
        <h1 className="text-2xl font-bold text-gray-800">Student Support</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Academic Advising */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <AcademicCapIcon className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold">Academic Advising</h2>
          </div>
          <p className="text-gray-600 mb-4">Access academic advising resources and schedule appointments with advisors.</p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            View Advisors
          </button>
        </div>
        
        {/* Counseling Services */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <ChatBubbleLeftRightIcon className="h-6 w-6 text-green-600 mr-2" />
            <h2 className="text-lg font-semibold">Counseling Services</h2>
          </div>
          <p className="text-gray-600 mb-4">Access counseling and mental health support services for students.</p>
          <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
            Schedule Appointment
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Support Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'Tutoring Services', icon: '📚' },
            { name: 'Career Counseling', icon: '💼' },
            { name: 'Financial Aid', icon: '💰' },
            { name: 'Disability Services', icon: '♿' },
            { name: 'International Students', icon: '🌍' },
            { name: 'Health Services', icon: '🏥' }
          ].map((resource, index) => (
            <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="text-2xl mb-2">{resource.icon}</div>
              <h3 className="font-medium">{resource.name}</h3>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              For immediate assistance, please contact the Student Support Hotline at (555) 123-4567
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentSupport;
