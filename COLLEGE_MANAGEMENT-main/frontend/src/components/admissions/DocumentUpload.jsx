import React from 'react'

const DocumentUpload = ({ register, errors }) => {
  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-yellow-800 mb-2">Document Upload Requirements</h3>
        <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
          <li>All documents should be in PDF, JPG, or PNG format</li>
          <li>Maximum file size: 2MB per document</li>
          <li>Documents should be clear and readable</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Passport Size Photo <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            accept=".jpg,.jpeg,.png"
            {...register('photo', { required: 'Photo is required' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-500 focus:border-transparent"
          />
          {errors.photo && (
            <p className="mt-1 text-sm text-red-600">{errors.photo.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            10th Marksheet <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            {...register('tenth_marksheet', { required: '10th marksheet is required' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-500 focus:border-transparent"
          />
          {errors.tenth_marksheet && (
            <p className="mt-1 text-sm text-red-600">{errors.tenth_marksheet.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            12th Marksheet <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            {...register('twelfth_marksheet', { required: '12th marksheet is required' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-500 focus:border-transparent"
          />
          {errors.twelfth_marksheet && (
            <p className="mt-1 text-sm text-red-600">{errors.twelfth_marksheet.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Transfer Certificate
          </label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            {...register('transfer_certificate')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  )
}

export default DocumentUpload
