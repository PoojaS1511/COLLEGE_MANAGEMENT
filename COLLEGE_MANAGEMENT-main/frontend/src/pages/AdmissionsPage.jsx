import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { supabase } from '../lib/supabase'
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  CheckCircleIcon,
  DocumentArrowUpIcon
} from '@heroicons/react/24/outline'

// Import form sections
import PersonalDetails from '../components/admissions/PersonalDetails'
import ParentGuardianInfo from '../components/admissions/ParentGuardianInfo'
import ContactInformation from '../components/admissions/ContactInformation'
import AcademicBackground from '../components/admissions/AcademicBackground'
import AdmissionCategory from '../components/admissions/AdmissionCategory'
import CourseSelection from '../components/admissions/CourseSelection'
import HostelTransport from '../components/admissions/HostelTransport'
import DocumentUpload from '../components/admissions/DocumentUpload'
import Declaration from '../components/admissions/Declaration'

const AdmissionsPage = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [applicationNumber, setApplicationNumber] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const { register, handleSubmit, watch, setValue, formState: { errors }, trigger } = useForm({
    mode: 'onChange'
  })

  const steps = [
    { id: 1, title: 'Personal Details', component: PersonalDetails },
    { id: 2, title: 'Parent/Guardian Info', component: ParentGuardianInfo },
    { id: 3, title: 'Contact Information', component: ContactInformation },
    { id: 4, title: 'Academic Background', component: AcademicBackground },
    { id: 5, title: 'Admission Category', component: AdmissionCategory },
    { id: 6, title: 'Course Selection', component: CourseSelection },
    { id: 7, title: 'Hostel & Transport', component: HostelTransport },
    { id: 8, title: 'Upload Documents', component: DocumentUpload },
    { id: 9, title: 'Declaration', component: Declaration }
  ]

  const nextStep = async () => {
    const isValid = await trigger()
    if (isValid && currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const generateApplicationNumber = () => {
    const year = new Date().getFullYear()
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `ADM${year}${random}`
  }

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      const appNumber = generateApplicationNumber()
      
      const submissionData = {
        application_number: appNumber,
        ...data,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('admission_applications')
        .insert([submissionData])

      if (error) throw error

      setApplicationNumber(appNumber)
      setIsSubmitted(true)
    } catch (error) {
      console.error('Error submitting application:', error)
      alert('Error submitting application. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center"
        >
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            🎉 Application Submitted Successfully!
          </h2>
          <p className="text-gray-600 mb-6">
            Your application has been submitted with reference number:
          </p>
          <div className="bg-royal-50 border border-royal-200 rounded-lg p-4 mb-6">
            <p className="text-royal-800 font-bold text-lg">{applicationNumber}</p>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Please save this reference number for future correspondence.
          </p>
          <div className="space-y-3">
            <button className="w-full bg-royal-600 hover:bg-royal-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
              Login to Student Dashboard
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Back to Home
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  const CurrentStepComponent = steps[currentStep - 1].component

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Admission Application Form
          </h1>
          <p className="text-lg text-gray-600">
            Cube Arts and Engineering College - Academic Year 2025-26
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">
              Step {currentStep} of {steps.length}
            </span>
            <span className="text-sm font-medium text-gray-500">
              {Math.round((currentStep / steps.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-royal-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / steps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`text-xs ${
                  step.id <= currentStep ? 'text-royal-600' : 'text-gray-400'
                }`}
              >
                {step.title}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {steps[currentStep - 1].title}
                </h2>
                <CurrentStepComponent
                  register={register}
                  errors={errors}
                  watch={watch}
                  setValue={setValue}
                />
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <ChevronLeftIcon className="h-4 w-4 mr-2" />
                Previous
              </button>

              {currentStep === steps.length ? (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <DocumentArrowUpIcon className="h-4 w-4 mr-2" />
                      Submit Application
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-royal-600 rounded-lg hover:bg-royal-700 transition-colors duration-200"
                >
                  Next
                  <ChevronRightIcon className="h-4 w-4 ml-2" />
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdmissionsPage
