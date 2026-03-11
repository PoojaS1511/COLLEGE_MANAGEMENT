import React from 'react'

const ParentGuardianInfo = ({ register, errors }) => {
  return (
    <div className="space-y-6">
      {/* Father's Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Father's Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Father's Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('father_name', { 
                required: 'Father\'s name is required',
                minLength: { value: 2, message: 'Name must be at least 2 characters' }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-500 focus:border-transparent"
              placeholder="Enter father's full name"
            />
            {errors.father_name && (
              <p className="mt-1 text-sm text-red-600">{errors.father_name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Father's Mobile Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              {...register('father_phone', { 
                required: 'Father\'s mobile number is required',
                pattern: {
                  value: /^[6-9]\d{9}$/,
                  message: 'Enter a valid 10-digit mobile number'
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-500 focus:border-transparent"
              placeholder="Enter 10-digit mobile number"
              maxLength="10"
            />
            {errors.father_phone && (
              <p className="mt-1 text-sm text-red-600">{errors.father_phone.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Mother's Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Mother's Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mother's Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('mother_name', { 
                required: 'Mother\'s name is required',
                minLength: { value: 2, message: 'Name must be at least 2 characters' }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-500 focus:border-transparent"
              placeholder="Enter mother's full name"
            />
            {errors.mother_name && (
              <p className="mt-1 text-sm text-red-600">{errors.mother_name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mother's Mobile Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              {...register('mother_phone', { 
                required: 'Mother\'s mobile number is required',
                pattern: {
                  value: /^[6-9]\d{9}$/,
                  message: 'Enter a valid 10-digit mobile number'
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-500 focus:border-transparent"
              placeholder="Enter 10-digit mobile number"
              maxLength="10"
            />
            {errors.mother_phone && (
              <p className="mt-1 text-sm text-red-600">{errors.mother_phone.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Guardian Information (if applicable) */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Guardian Information (if applicable)</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Guardian Name
          </label>
          <input
            type="text"
            {...register('guardian_name')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-500 focus:border-transparent"
            placeholder="Enter guardian's full name (if different from parents)"
          />
        </div>
      </div>

      {/* Annual Family Income */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Annual Family Income <span className="text-red-500">*</span>
        </label>
        <select
          {...register('annual_income', { required: 'Annual family income is required' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-500 focus:border-transparent"
        >
          <option value="">Select Annual Income Range</option>
          <option value="below_1_lakh">Below ₹1 Lakh</option>
          <option value="1_to_2_lakh">₹1 - 2 Lakh</option>
          <option value="2_to_3_lakh">₹2 - 3 Lakh</option>
          <option value="3_to_5_lakh">₹3 - 5 Lakh</option>
          <option value="5_to_8_lakh">₹5 - 8 Lakh</option>
          <option value="8_to_12_lakh">₹8 - 12 Lakh</option>
          <option value="above_12_lakh">Above ₹12 Lakh</option>
        </select>
        {errors.annual_income && (
          <p className="mt-1 text-sm text-red-600">{errors.annual_income.message}</p>
        )}
      </div>

      {/* Additional Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Important Note
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Please ensure all parent/guardian information is accurate as this will be used for official communication 
                and emergency contacts. Income certificate may be required for scholarship eligibility.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ParentGuardianInfo
