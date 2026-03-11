import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircleIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';

const UserCreatedSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  const [copied, setCopied] = useState(false);


  // If no state or user data, redirect to students list
  if (!state?.user) {
    navigate('/admin/students');
    return null;
  }

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const { user, message } = state;
  const userId = user.id || user.user_id || 'N/A';

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
          <CheckCircleIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
        </div>
        <h2 className="mt-3 text-2xl font-bold text-gray-900">Success!</h2>
        <p className="mt-2 text-sm text-gray-600">{message || 'User created successfully'}</p>
        
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900">User Details</h3>
          <dl className="mt-2 space-y-2">
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-gray-500">Name</dt>
              <dd className="text-sm text-gray-900">{user.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="text-sm text-gray-900">{user.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-gray-500">Role</dt>
              <dd className="text-sm text-gray-900 capitalize">{user.role || 'student'}</dd>
            </div>
            <div className="flex justify-between items-center">
              <dt className="text-sm font-medium text-gray-500">User ID</dt>
              <div className="flex items-center">
                <dd className="text-sm text-gray-900 font-mono mr-2">
                  {userId}
                </dd>
                {userId !== 'N/A' && (
                  <button
                    onClick={() => copyToClipboard(userId)}
                    className="text-gray-500 hover:text-gray-700"
                    title="Copy to clipboard"
                  >
                    <DocumentDuplicateIcon className="h-4 w-4" />
                  </button>
                )}
                {copied && <span className="text-xs text-green-600 ml-1">Copied!</span>}
              </div>
            </div>
          </dl>
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={() => navigate('/admin/students')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go to Students List
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserCreatedSuccess;
