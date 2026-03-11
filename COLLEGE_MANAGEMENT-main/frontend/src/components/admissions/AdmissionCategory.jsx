import React from 'react'

const AdmissionCategory = ({ register, errors }) => {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Admission Type <span className="text-red-500">*</span>
        </label>
        <select
          {...register('quota_type', { required: 'Admission type is required' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-500 focus:border-transparent"
        >
          <option value="">Select Admission Type</option>
          <option value="government">Government Quota</option>
          <option value="management">Management Quota</option>
          <option value="sports">Sports Quota</option>
          <option value="ncc">NCC Quota</option>
        </select>
        {errors.quota_type && (
          <p className="mt-1 text-sm text-red-600">{errors.quota_type.message}</p>
        )}
      </div>

      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            {...register('first_graduate')}
            className="h-4 w-4 text-royal-600 focus:ring-royal-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">First Graduate in Family</span>
        </label>
      </div>
    </div>
  )
}

export default AdmissionCategory
