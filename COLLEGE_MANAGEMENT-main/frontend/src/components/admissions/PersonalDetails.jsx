import React from 'react'

const PersonalDetails = ({ register, errors }) => {
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  const religions = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Others']
  const castes = ['General', 'OBC', 'SC', 'ST', 'Others']

  return (
    <div className="space-y-6">
      {/* Full Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register('full_name', { 
            required: 'Full name is required',
            minLength: { value: 2, message: 'Name must be at least 2 characters' }
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-500 focus:border-transparent"
          placeholder="Enter your full name"
        />
        {errors.full_name && (
          <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>
        )}
      </div>

      {/* Date of Birth and Gender */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            {...register('date_of_birth', { 
              required: 'Date of birth is required',
              validate: {
                notFuture: value => {
                  const today = new Date()
                  const birthDate = new Date(value)
                  return birthDate <= today || 'Date of birth cannot be in the future'
                },
                minimumAge: value => {
                  const today = new Date()
                  const birthDate = new Date(value)
                  const age = today.getFullYear() - birthDate.getFullYear()
                  return age >= 16 || 'Must be at least 16 years old'
                }
              }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-500 focus:border-transparent"
          />
          {errors.date_of_birth && (
            <p className="mt-1 text-sm text-red-600">{errors.date_of_birth.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gender <span className="text-red-500">*</span>
          </label>
          <select
            {...register('gender', { required: 'Gender is required' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-500 focus:border-transparent"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Others">Others</option>
          </select>
          {errors.gender && (
            <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
          )}
        </div>
      </div>

      {/* Blood Group and Aadhar Number */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Blood Group <span className="text-red-500">*</span>
          </label>
          <select
            {...register('blood_group', { required: 'Blood group is required' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-500 focus:border-transparent"
          >
            <option value="">Select Blood Group</option>
            {bloodGroups.map(group => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
          {errors.blood_group && (
            <p className="mt-1 text-sm text-red-600">{errors.blood_group.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Aadhar Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('aadhar_number', { 
              required: 'Aadhar number is required',
              pattern: {
                value: /^\d{12}$/,
                message: 'Aadhar number must be 12 digits'
              }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-500 focus:border-transparent"
            placeholder="Enter 12-digit Aadhar number"
            maxLength="12"
          />
          {errors.aadhar_number && (
            <p className="mt-1 text-sm text-red-600">{errors.aadhar_number.message}</p>
          )}
        </div>
      </div>

      {/* Religion and Caste */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Religion <span className="text-red-500">*</span>
          </label>
          <select
            {...register('religion', { required: 'Religion is required' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-500 focus:border-transparent"
          >
            <option value="">Select Religion</option>
            {religions.map(religion => (
              <option key={religion} value={religion}>{religion}</option>
            ))}
          </select>
          {errors.religion && (
            <p className="mt-1 text-sm text-red-600">{errors.religion.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Caste & Community <span className="text-red-500">*</span>
          </label>
          <select
            {...register('caste', { required: 'Caste is required' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-500 focus:border-transparent"
          >
            <option value="">Select Caste</option>
            {castes.map(caste => (
              <option key={caste} value={caste}>{caste}</option>
            ))}
          </select>
          {errors.caste && (
            <p className="mt-1 text-sm text-red-600">{errors.caste.message}</p>
          )}
        </div>
      </div>

      {/* Community (if applicable) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Community (if applicable)
        </label>
        <input
          type="text"
          {...register('community')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-500 focus:border-transparent"
          placeholder="Enter community if applicable"
        />
      </div>
    </div>
  )
}

export default PersonalDetails
