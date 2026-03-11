import React from 'react'

const ContactInformation = ({ register, errors, watch, setValue }) => {
  const sameAsPermament = watch('same_as_permanent')

  const handleSameAsPermament = (checked) => {
    if (checked) {
      const permanentAddress = watch('permanent_address')
      const city = watch('city')
      const state = watch('state')
      const pincode = watch('pincode')
      
      setValue('communication_address', permanentAddress)
      setValue('comm_city', city)
      setValue('comm_state', state)
      setValue('comm_pincode', pincode)
    }
  }

  return (
    <div className="space-y-6">
      {/* Student Contact Details */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Contact Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Student Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Enter a valid email address'
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-500 focus:border-transparent"
              placeholder="Enter your email address"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Student Mobile Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              {...register('phone', { 
                required: 'Mobile number is required',
                pattern: {
                  value: /^[6-9]\d{9}$/,
                  message: 'Enter a valid 10-digit mobile number'
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-500 focus:border-transparent"
              placeholder="Enter 10-digit mobile number"
              maxLength="10"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Permanent Address */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Permanent Address</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Permanent Address <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('permanent_address', { 
                required: 'Permanent address is required',
                minLength: { value: 10, message: 'Address must be at least 10 characters' }
              })}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-500 focus:border-transparent"
              placeholder="Enter your permanent address"
            />
            {errors.permanent_address && (
              <p className="mt-1 text-sm text-red-600">{errors.permanent_address.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('city', { required: 'City is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-500 focus:border-transparent"
                placeholder="Enter city"
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State <span className="text-red-500">*</span>
              </label>
              <select
                {...register('state', { required: 'State is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-500 focus:border-transparent"
              >
                <option value="">Select State</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Kerala">Kerala</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Telangana">Telangana</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="Madhya Pradesh">Madhya Pradesh</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="Bihar">Bihar</option>
                <option value="West Bengal">West Bengal</option>
                <option value="Odisha">Odisha</option>
                <option value="Jharkhand">Jharkhand</option>
                <option value="Assam">Assam</option>
                <option value="Punjab">Punjab</option>
                <option value="Haryana">Haryana</option>
                <option value="Himachal Pradesh">Himachal Pradesh</option>
                <option value="Uttarakhand">Uttarakhand</option>
                <option value="Goa">Goa</option>
                <option value="Delhi">Delhi</option>
                <option value="Others">Others</option>
              </select>
              {errors.state && (
                <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pincode <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('pincode', { 
                  required: 'Pincode is required',
                  pattern: {
                    value: /^\d{6}$/,
                    message: 'Enter a valid 6-digit pincode'
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-500 focus:border-transparent"
                placeholder="Enter pincode"
                maxLength="6"
              />
              {errors.pincode && (
                <p className="mt-1 text-sm text-red-600">{errors.pincode.message}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Communication Address */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Communication Address</h3>
        
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              {...register('same_as_permanent')}
              onChange={(e) => handleSameAsPermament(e.target.checked)}
              className="h-4 w-4 text-royal-600 focus:ring-royal-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Same as permanent address</span>
          </label>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Communication Address <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('communication_address', { 
                required: 'Communication address is required',
                minLength: { value: 10, message: 'Address must be at least 10 characters' }
              })}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-500 focus:border-transparent"
              placeholder="Enter your communication address"
              disabled={sameAsPermament}
            />
            {errors.communication_address && (
              <p className="mt-1 text-sm text-red-600">{errors.communication_address.message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactInformation
