import React from 'react'

const HostelTransport = ({ register, errors }) => {
  return (
    <div className="space-y-6">
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            {...register('hostel_required')}
            className="h-4 w-4 text-royal-600 focus:ring-royal-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">Do you require Hostel accommodation?</span>
        </label>
      </div>

      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            {...register('transport_required')}
            className="h-4 w-4 text-royal-600 focus:ring-royal-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">Do you require College Transport?</span>
        </label>
      </div>
    </div>
  )
}

export default HostelTransport
