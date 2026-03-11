import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { BellIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'

const StudentHeader = () => {
  const { signOut } = useAuth()

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold text-black">Student Dashboard</h1>
          <p className="text-sm text-gray-600">Welcome back! Here's your academic overview.</p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 text-gray-400 hover:text-black transition-colors duration-200">
            <BellIcon className="h-6 w-6" />
            <span className="absolute top-0 right-0 h-2 w-2 bg-black rounded-full"></span>
          </button>

          {/* Settings */}
          <button className="p-2 text-gray-400 hover:text-black transition-colors duration-200">
            <Cog6ToothIcon className="h-6 w-6" />
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button className="flex items-center space-x-3 text-sm">
              <div className="h-8 w-8 bg-black rounded-full flex items-center justify-center">
                <span className="text-white font-medium">S</span>
              </div>
              <span className="text-black font-medium">Student</span>
            </button>
          </div>

          {/* Logout */}
          <button
            onClick={signOut}
            className="px-4 py-2 text-sm font-medium text-black hover:text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}

export default StudentHeader
