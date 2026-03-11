import React from 'react'

const Declaration = ({ register, errors }) => {
  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Declaration</h3>
        
        <div className="prose prose-sm text-gray-700 mb-6">
          <p className="mb-4">
            I hereby declare that the information provided in this application form is true and correct to the best of my knowledge. 
            I understand that any false information or suppression of facts may lead to the cancellation of my admission.
          </p>
          
          <p className="mb-4">
            I agree to abide by the rules and regulations of Cube Arts and Engineering College. I understand that the college 
            reserves the right to verify the authenticity of all documents and information provided.
          </p>
          
          <p className="mb-4">
            I acknowledge that admission is subject to verification of documents and fulfillment of eligibility criteria. 
            The college's decision regarding admission will be final and binding.
          </p>
        </div>

        <div className="space-y-4">
          <label className="flex items-start">
            <input
              type="checkbox"
              {...register('declaration_accepted', { 
                required: 'You must accept the declaration to proceed' 
              })}
              className="h-4 w-4 text-royal-600 focus:ring-royal-500 border-gray-300 rounded mt-1"
            />
            <span className="ml-3 text-sm text-gray-700">
              I hereby declare that the above information is true to the best of my knowledge and I accept all terms and conditions.
            </span>
          </label>
          {errors.declaration_accepted && (
            <p className="text-sm text-red-600">{errors.declaration_accepted.message}</p>
          )}

          <label className="flex items-start">
            <input
              type="checkbox"
              {...register('terms_accepted', { 
                required: 'You must accept the terms and conditions' 
              })}
              className="h-4 w-4 text-royal-600 focus:ring-royal-500 border-gray-300 rounded mt-1"
            />
            <span className="ml-3 text-sm text-gray-700">
              I agree to the <a href="/terms" className="text-royal-600 hover:text-royal-700 underline" target="_blank">Terms and Conditions</a> and 
              <a href="/privacy" className="text-royal-600 hover:text-royal-700 underline ml-1" target="_blank">Privacy Policy</a> of the college.
            </span>
          </label>
          {errors.terms_accepted && (
            <p className="text-sm text-red-600">{errors.terms_accepted.message}</p>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Next Steps After Submission
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ol className="list-decimal list-inside space-y-1">
                <li>You will receive an application reference number</li>
                <li>Application will be reviewed by the admissions committee</li>
                <li>You will be notified about the admission status via email/SMS</li>
                <li>If selected, you will receive further instructions for fee payment and document verification</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Declaration
