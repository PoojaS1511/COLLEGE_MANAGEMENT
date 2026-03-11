import React, { useState } from 'react'
import { HomeIcon, UserGroupIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline'

const HostelManagement = () => {
  const [activeTab, setActiveTab] = useState('rooms')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Hostel Management</h1>
        <p className="text-gray-600">Manage room allocations, wardens, and hostel operations</p>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('rooms')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'rooms' ? 'border-royal-500 text-royal-600' : 'border-transparent text-gray-500'
              }`}
            >
              Room Management
            </button>
            <button
              onClick={() => setActiveTab('wardens')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'wardens' ? 'border-royal-500 text-royal-600' : 'border-transparent text-gray-500'
              }`}
            >
              Warden Management
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reports' ? 'border-royal-500 text-royal-600' : 'border-transparent text-gray-500'
              }`}
            >
              Occupancy Reports
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'rooms' && (
            <div className="text-center py-12">
              <HomeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Room allocation and management interface</p>
            </div>
          )}

          {activeTab === 'wardens' && (
            <div className="text-center py-12">
              <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Warden assignment and contact management</p>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="text-center py-12">
              <ClipboardDocumentListIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Hostel occupancy and utilization reports</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default HostelManagement
