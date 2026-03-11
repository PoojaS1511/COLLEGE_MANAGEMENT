import React from 'react'

const AcademicBackground = ({ register, errors }) => {
  const boards = [
    'CBSE', 'ICSE', 'State Board (Tamil Nadu)', 'State Board (Karnataka)', 
    'State Board (Kerala)', 'State Board (Andhra Pradesh)', 'Others'
  ]

  const groups = [
    'Physics, Chemistry, Mathematics (PCM)',
    'Physics, Chemistry, Biology (PCB)', 
    'Physics, Chemistry, Mathematics, Biology (PCMB)',
    'Commerce with Mathematics',
    'Commerce without Mathematics',
    'Arts/Humanities',
    'Others'
  ]

  return (
    <div className="space-y-6">
      {/* 10th Standard Details */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">10th Standard Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Board <span className="text-red-500">*</span>
            </label>
            <select
              {...register('tenth_board', { required: '10th board is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-500 focus:border-transparent"
            >
              <option value="">Select Board</option>
              {boards.map(board => (
                <option key={board} value={board}>{board}</option>
              ))}
            </select>
            {errors.tenth_board && (
              <p className="mt-1 text-sm text-red-600">{errors.tenth_board.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year of Passing <span className="text-red-500">*</span>
            </label>
            <select
              {...register('tenth_year', { required: '10th year is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-500 focus:border-transparent"
            >
              <option value="">Select Year</option>
              {Array.from({length: 10}, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            {errors.tenth_year && (
              <p className="mt-1 text-sm text-red-600">{errors.tenth_year.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Marks (% or CGPA) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              {...register('tenth_marks', { 
                required: '10th marks are required',
                min: { value: 0, message: 'Marks cannot be negative' },
                max: { value: 100, message: 'Marks cannot exceed 100%' }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-500 focus:border-transparent"
              placeholder="Enter marks"
            />
            {errors.tenth_marks && (
              <p className="mt-1 text-sm text-red-600">{errors.tenth_marks.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* 12th Standard Details */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">12th Standard Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Board <span className="text-red-500">*</span>
            </label>
            <select
              {...register('twelfth_board', { required: '12th board is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-500 focus:border-transparent"
            >
              <option value="">Select Board</option>
              {boards.map(board => (
                <option key={board} value={board}>{board}</option>
              ))}
            </select>
            {errors.twelfth_board && (
              <p className="mt-1 text-sm text-red-600">{errors.twelfth_board.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year of Passing <span className="text-red-500">*</span>
            </label>
            <select
              {...register('twelfth_year', { required: '12th year is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-500 focus:border-transparent"
            >
              <option value="">Select Year</option>
              {Array.from({length: 5}, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            {errors.twelfth_year && (
              <p className="mt-1 text-sm text-red-600">{errors.twelfth_year.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Marks (% or CGPA) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              {...register('twelfth_marks', { 
                required: '12th marks are required',
                min: { value: 0, message: 'Marks cannot be negative' },
                max: { value: 100, message: 'Marks cannot exceed 100%' }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-500 focus:border-transparent"
              placeholder="Enter marks"
            />
            {errors.twelfth_marks && (
              <p className="mt-1 text-sm text-red-600">{errors.twelfth_marks.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Studied <span className="text-red-500">*</span>
            </label>
            <select
              {...register('group_studied', { required: 'Group studied is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-500 focus:border-transparent"
            >
              <option value="">Select Group</option>
              {groups.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
            {errors.group_studied && (
              <p className="mt-1 text-sm text-red-600">{errors.group_studied.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Medium of Instruction <span className="text-red-500">*</span>
            </label>
            <select
              {...register('medium_of_instruction', { required: 'Medium of instruction is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-500 focus:border-transparent"
            >
              <option value="">Select Medium</option>
              <option value="English">English</option>
              <option value="Tamil">Tamil</option>
              <option value="Hindi">Hindi</option>
              <option value="Others">Others</option>
            </select>
            {errors.medium_of_instruction && (
              <p className="mt-1 text-sm text-red-600">{errors.medium_of_instruction.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Eligibility Note */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">
              Eligibility Criteria
            </h3>
            <div className="mt-2 text-sm text-green-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Minimum 50% marks in 12th standard for general category</li>
                <li>Minimum 45% marks in 12th standard for reserved categories</li>
                <li>Must have studied Mathematics and Physics in 12th standard for engineering courses</li>
                <li>Chemistry or Biology or Computer Science as third subject</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AcademicBackground
