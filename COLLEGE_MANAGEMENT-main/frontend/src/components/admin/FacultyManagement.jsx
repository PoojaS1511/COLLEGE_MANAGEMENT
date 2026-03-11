import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import apiService from '../../services/api'
import LoadingSpinner from '../common/LoadingSpinner'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

const FacultyManagement = () => {
  const [faculty, setFaculty] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editFaculty, setEditFaculty] = useState(null)
  const [formLoading, setFormLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm()

  useEffect(() => {
    fetchFaculty()
    fetchDepartments()
  }, [])

  const fetchFaculty = async () => {
    try {
      const response = await apiService.getAllFaculty()
      if (response.success) {
        setFaculty(response.data)
      }
    } catch (error) {
      console.error('Error fetching faculty:', error)
      // Fallback mock data
      setFaculty([
        {
          id: 1,
          employee_id: 'FAC001',
          full_name: 'Dr. Rajesh Kumar',
          email: 'dr.rajesh@faculty.edu',
          phone: '+91 9876543220',
          department_id: 1,
          designation: 'Professor',
          qualification: 'Ph.D in Computer Science',
          experience_years: 15,
          date_of_joining: '2010-07-01',
          salary: 120000,
          status: 'active',
          departments: { name: 'Computer Science Engineering', code: 'CSE' }
        },
        {
          id: 2,
          employee_id: 'FAC002',
          full_name: 'Dr. Priya Sharma',
          email: 'dr.priya@faculty.edu',
          phone: '+91 9876543221',
          department_id: 2,
          designation: 'Associate Professor',
          qualification: 'Ph.D in Electronics',
          experience_years: 12,
          date_of_joining: '2012-08-15',
          salary: 100000,
          status: 'active',
          departments: { name: 'Electronics and Communication Engineering', code: 'ECE' }
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const fetchDepartments = async () => {
    try {
      const response = await apiService.getAllDepartments()
      if (response.success) {
        setDepartments(response.data)
      }
    } catch (error) {
      console.error('Error fetching departments:', error)
      setDepartments([
        { id: 1, name: 'Computer Science Engineering', code: 'CSE' },
        { id: 2, name: 'Electronics and Communication Engineering', code: 'ECE' },
        { id: 3, name: 'Mechanical Engineering', code: 'MECH' }
      ])
    }
  }

  const handleAddFaculty = () => {
    setEditFaculty(null)
    reset()
    setShowForm(true)
  }

  const handleEditFaculty = (facultyMember) => {
    setEditFaculty(facultyMember)
    Object.keys(facultyMember).forEach(key => {
      setValue(key, facultyMember[key])
    })
    setShowForm(true)
  }

  const handleDeleteFaculty = async (facultyId) => {
    if (window.confirm('Are you sure you want to delete this faculty member?')) {
      try {
        const response = await apiService.deleteFaculty(facultyId)
        if (response.success) {
          alert('Faculty member deleted successfully!')
          fetchFaculty()
        }
      } catch (error) {
        console.error('Error deleting faculty:', error)
        alert('Failed to delete faculty member')
      }
    }
  }

  const onSubmit = async (data) => {
    setFormLoading(true)
    try {
      // Generate employee ID if not editing
      if (!editFaculty) {
        data.employee_id = `FAC${String(Date.now()).slice(-3)}`
      }

      let response
      if (editFaculty) {
        response = await apiService.updateFaculty(editFaculty.id, data)
      } else {
        response = await apiService.addFaculty(data)
      }

      if (response.success) {
        alert(`Faculty member ${editFaculty ? 'updated' : 'added'} successfully!`)
        setShowForm(false)
        reset()
        fetchFaculty()
      }
    } catch (error) {
      console.error('Error saving faculty:', error)
      alert(`Failed to ${editFaculty ? 'update' : 'add'} faculty member`)
    } finally {
      setFormLoading(false)
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditFaculty(null)
    reset()
  }

  if (loading) {
    return <LoadingSpinner size="large" text="Loading faculty..." />
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Faculty Management</h1>
              <p className="text-gray-600 mt-1">Manage faculty members and staff</p>
            </div>
            <button
              onClick={handleAddFaculty}
              className="bg-royal-600 text-white px-4 py-2 rounded-md hover:bg-royal-700 flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Faculty
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Faculty Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Designation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Experience
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
              {faculty.map((facultyMember) => (
                <tr key={facultyMember.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-green-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {facultyMember.full_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {facultyMember.employee_id}
                        </div>
                        <div className="text-sm text-gray-500">
                          {facultyMember.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {facultyMember.departments?.name || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {facultyMember.departments?.code || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {facultyMember.designation}
                    </div>
                    <div className="text-sm text-gray-500">
                      {facultyMember.qualification}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {facultyMember.experience_years} years
                    </div>
                    <div className="text-sm text-gray-500">
                      Since {new Date(facultyMember.date_of_joining).getFullYear()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      facultyMember.status === 'active' 
                        ? 'bg-green-100 text-green-800'
                        : facultyMember.status === 'inactive'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {facultyMember.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditFaculty(facultyMember)}
                        className="text-royal-600 hover:text-royal-900"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteFaculty(facultyMember.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {faculty.length === 0 && (
          <div className="text-center py-12">
            <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No faculty found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding a new faculty member.
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Faculty Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {editFaculty ? 'Edit Faculty' : 'Add New Faculty'}
              </h3>
              <button
                onClick={handleCloseForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('full_name', { required: 'Full name is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-500"
                    placeholder="Dr. John Doe"
                  />
                  {errors.full_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-500"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    {...register('phone', { required: 'Phone is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-500"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('department_id', { required: 'Department is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-500"
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                  {errors.department_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.department_id.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Designation
                  </label>
                  <select
                    {...register('designation')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-500"
                  >
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Professor">Professor</option>
                    <option value="Head of Department">Head of Department</option>
                    <option value="Principal">Principal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Qualification
                  </label>
                  <input
                    type="text"
                    {...register('qualification')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-500"
                    placeholder="Ph.D in Computer Science"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    {...register('experience_years')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Joining
                  </label>
                  <input
                    type="date"
                    {...register('date_of_joining')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Salary (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    {...register('salary')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    {...register('status')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="retired">Retired</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 bg-royal-600 text-white rounded-md hover:bg-royal-700 disabled:opacity-50"
                >
                  {formLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {editFaculty ? 'Updating...' : 'Adding...'}
                    </div>
                  ) : (
                    editFaculty ? 'Update Faculty' : 'Add Faculty'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default FacultyManagement
