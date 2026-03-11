import React, { useState, useEffect } from 'react'
import apiService from '../../services/api'
import LoadingSpinner from '../common/LoadingSpinner'
import {
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  DocumentTextIcon,
  UserIcon,
  AcademicCapIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline'

const AdmissionReview = () => {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      // Mock admission applications data
      const mockApplications = [
        {
          id: 1,
          application_id: 'APP2025001',
          register_number: 'REG2025001',
          full_name: 'Alice Johnson',
          email: 'alice.johnson@email.com',
          phone: '+91 9876543213',
          date_of_birth: '2004-03-20',
          gender: 'female',
          course_id: 1,
          course_name: 'B.Tech CSE',
          quota_type: 'merit',
          category: 'general',
          father_name: 'Robert Johnson',
          mother_name: 'Sarah Johnson',
          permanent_address: '123 Park Street, Mumbai, Maharashtra',
          tenth_percentage: 94.5,
          twelfth_percentage: 89.2,
          entrance_exam_score: 142,
          entrance_exam_rank: 1580,
          status: 'pending',
          submitted_at: '2025-01-15T10:30:00',
          documents_submitted: true,
          fee_paid: false
        },
        {
          id: 2,
          application_id: 'APP2025002',
          register_number: 'REG2025002',
          full_name: 'David Wilson',
          email: 'david.wilson@email.com',
          phone: '+91 9876543214',
          date_of_birth: '2003-11-15',
          gender: 'male',
          course_id: 2,
          course_name: 'B.Tech ECE',
          quota_type: 'sports',
          category: 'obc',
          father_name: 'Michael Wilson',
          mother_name: 'Emma Wilson',
          permanent_address: '456 Lake View, Pune, Maharashtra',
          tenth_percentage: 87.3,
          twelfth_percentage: 84.7,
          entrance_exam_score: 128,
          entrance_exam_rank: 2340,
          status: 'approved',
          submitted_at: '2025-01-14T14:20:00',
          documents_submitted: true,
          fee_paid: true
        },
        {
          id: 3,
          application_id: 'APP2025003',
          register_number: 'REG2025003',
          full_name: 'Priya Sharma',
          email: 'priya.sharma@email.com',
          phone: '+91 9876543215',
          date_of_birth: '2004-07-08',
          gender: 'female',
          course_id: 1,
          course_name: 'B.Tech CSE',
          quota_type: 'management',
          category: 'general',
          father_name: 'Raj Sharma',
          mother_name: 'Sunita Sharma',
          permanent_address: '789 Garden Road, Delhi',
          tenth_percentage: 91.8,
          twelfth_percentage: 88.5,
          entrance_exam_score: 135,
          entrance_exam_rank: 1890,
          status: 'rejected',
          submitted_at: '2025-01-13T09:15:00',
          documents_submitted: false,
          fee_paid: false
        }
      ]
      
      setApplications(mockApplications)
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      // Mock status update
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: newStatus }
            : app
        )
      )
      
      alert(`Application ${newStatus} successfully!`)
      setShowModal(false)
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update application status')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true
    return app.status === filter
  })

  if (loading) {
    return <LoadingSpinner size="large" text="Loading admission applications..." />
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admission Applications</h1>
              <p className="text-gray-600 mt-1">Review and manage admission applications</p>
            </div>
            
            {/* Filter Buttons */}
            <div className="flex space-x-2">
              {['all', 'pending', 'approved', 'rejected'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-md text-sm font-medium capitalize ${
                    filter === status
                      ? 'bg-royal-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status} ({applications.filter(app => status === 'all' || app.status === status).length})
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Application Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Academic Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredApplications.map((application) => (
                <tr key={application.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-royal-100 flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-royal-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {application.full_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {application.application_id}
                        </div>
                        <div className="text-sm text-gray-500">
                          {application.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{application.course_name}</div>
                    <div className="text-sm text-gray-500">{application.quota_type} quota</div>
                    <div className="text-sm text-gray-500">{application.category} category</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      10th: {application.tenth_percentage}%
                    </div>
                    <div className="text-sm text-gray-900">
                      12th: {application.twelfth_percentage}%
                    </div>
                    <div className="text-sm text-gray-500">
                      Rank: {application.entrance_exam_rank}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.status)}`}>
                      {application.status}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(application.submitted_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedApplication(application)
                          setShowModal(true)
                        }}
                        className="text-royal-600 hover:text-royal-900"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      {application.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(application.id, 'approved')}
                            className="text-green-600 hover:text-green-900"
                          >
                            <CheckIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(application.id, 'rejected')}
                            className="text-red-600 hover:text-red-900"
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredApplications.length === 0 && (
          <div className="text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No applications found</h3>
            <p className="mt-1 text-sm text-gray-500">
              No admission applications match the current filter.
            </p>
          </div>
        )}
      </div>

      {/* Application Detail Modal */}
      {showModal && selectedApplication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Application Details - {selectedApplication.application_id}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Personal Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Full Name</label>
                      <p className="text-sm text-gray-900">{selectedApplication.full_name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                      <p className="text-sm text-gray-900">{selectedApplication.date_of_birth}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="text-sm text-gray-900">{selectedApplication.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <p className="text-sm text-gray-900">{selectedApplication.phone}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Father's Name</label>
                      <p className="text-sm text-gray-900">{selectedApplication.father_name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Mother's Name</label>
                      <p className="text-sm text-gray-900">{selectedApplication.mother_name}</p>
                    </div>
                  </div>
                </div>

                {/* Academic Information */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Academic Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Course Applied</label>
                      <p className="text-sm text-gray-900">{selectedApplication.course_name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Quota Type</label>
                      <p className="text-sm text-gray-900">{selectedApplication.quota_type}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">10th Percentage</label>
                      <p className="text-sm text-gray-900">{selectedApplication.tenth_percentage}%</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">12th Percentage</label>
                      <p className="text-sm text-gray-900">{selectedApplication.twelfth_percentage}%</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Entrance Exam Score</label>
                      <p className="text-sm text-gray-900">{selectedApplication.entrance_exam_score}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Entrance Exam Rank</label>
                      <p className="text-sm text-gray-900">{selectedApplication.entrance_exam_rank}</p>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Address</h4>
                  <p className="text-sm text-gray-900">{selectedApplication.permanent_address}</p>
                </div>

                {/* Status and Actions */}
                {selectedApplication.status === 'pending' && (
                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                      onClick={() => handleStatusUpdate(selectedApplication.id, 'rejected')}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedApplication.id, 'approved')}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Approve
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdmissionReview
