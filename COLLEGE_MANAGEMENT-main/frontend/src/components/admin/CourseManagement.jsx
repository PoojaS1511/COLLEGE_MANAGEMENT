import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import apiService from '../../services/api'
import LoadingSpinner from '../common/LoadingSpinner'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  AcademicCapIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

const CourseManagement = () => {
  const [courses, setCourses] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editCourse, setEditCourse] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    department_id: '',
    credits: 3,
    description: '',
    duration_years: 4,
    total_semesters: 8,
    fee_per_semester: 0
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm()

  useEffect(() => {
    fetchCourses();
    // Remove the dependency on fetchCourses to avoid infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true)
      // Fetch both courses and departments
      const [coursesResponse, departmentsResponse] = await Promise.all([
        apiService.getAllCourses(),
        apiService.getAllDepartments()
      ])

      if (departmentsResponse && departmentsResponse.success) {
        // Set the departments in state
        setDepartments(departmentsResponse.data);
        
        // Create a map of department_id to department for quick lookup
        const departmentsMap = departmentsResponse.data.reduce((acc, dept) => {
          acc[dept.id] = dept;
          return acc;
        }, {});

        // Only process courses if the response was successful
        if (coursesResponse && coursesResponse.success) {
          // Map courses to include department information
          const coursesWithDepartment = coursesResponse.data.map(course => ({
            ...course,
            department: departmentsMap[course.department_id] || {
              name: 'N/A',
              code: 'N/A',
              head_of_department: 'N/A'
            }
          }));
          setCourses(coursesWithDepartment);
        } else {
          setCourses([]);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      // Fallback to empty array if there's an error
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  // Removed the separate fetchDepartments function since we're now fetching departments with courses

  const handleAddCourse = () => {
    setEditCourse(null)
    reset()
    setIsAddModalOpen(true)
  }

  const handleEditCourse = (course) => {
    setEditCourse(course)
    Object.keys(course).forEach(key => {
      setValue(key, course[key])
    })
    setIsAddModalOpen(true)
  }

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        const response = await apiService.deleteCourse(courseId)
        if (response.success) {
          alert('Course deleted successfully!')
          fetchCourses()
        }
      } catch (error) {
        console.error('Error deleting course:', error)
        alert('Failed to delete course')
      }
    }
  }

  const onSubmit = async (data) => {
    setFormLoading(true);
    try {
      // Prepare the course data with proper types
      const courseData = {
        name: data.name,
        code: data.code,
        department_id: parseInt(data.department_id, 10),
        credits: parseInt(data.credits || 3, 10),
        description: data.description || '',
        duration_years: parseInt(data.duration_years || 4, 10),
        total_semesters: parseInt(data.total_semesters || 8, 10),
        fee_per_semester: parseFloat(data.fee_per_semester || 0)
      };

      // Validate required fields
      if (!courseData.code || !courseData.department_id) {
        throw new Error('Please fill in all required fields');
      }

      let response;
      if (editCourse) {
        response = await apiService.updateCourse(editCourse.id, courseData);
      } else {
        response = await apiService.createCourse(courseData);
      }

      if (response.success) {
        alert(`Course ${editCourse ? 'updated' : 'added'} successfully!`);
        setIsAddModalOpen(false);
        setFormData({
          name: '',
          code: '',
          department_id: '',
          credits: 3,
          description: '',
          duration_years: 4,
          total_semesters: 8,
          fee_per_semester: 0
        });
        fetchCourses();
      } else {
        alert(response.error || 'Failed to save course');
      }
    } catch (error) {
      console.error('Error saving course:', error);
      alert('Failed to save course');
    } finally {
      setFormLoading(false);
    }
  };

  const handleCloseForm = () => {
    setIsAddModalOpen(false)
    setEditCourse(null)
    reset()
  }

  if (loading) {
    return <LoadingSpinner size="large" text="Loading courses..." />
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
              <p className="text-gray-600 mt-1">Manage courses and programs</p>
            </div>
            <button
              onClick={handleAddCourse}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md shadow-sm flex items-center transition-colors duration-200"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Course
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-royal-100 flex items-center justify-center">
                          <AcademicCapIcon className="h-6 w-6 text-royal-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {course.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {course.code}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {course.department?.name || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {course.department?.code || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      HOD: {course.department?.head_of_department || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {course.duration_years} Years
                    </div>
                    <div className="text-sm text-gray-500">
                      {course.total_semesters} Semesters
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditCourse(course)}
                        className="text-royal-600 hover:text-royal-900"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
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

        {courses.length === 0 && (
          <div className="text-center py-12">
            <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No courses found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding a new course.
            </p>
          </div>
        )}
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="relative p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center pb-3">
              <h3 className="text-xl font-semibold">{editCourse ? 'Edit Course' : 'Add New Course'}</h3>
              <button 
                onClick={handleCloseForm}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name*</label>
                  <input
                    type="text"
                    {...register('name', { required: 'Course name is required' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Code*</label>
                  <input
                    type="text"
                    {...register('code', { required: 'Course code is required' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                  {errors.code && (
                    <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Department*</label>
                  <select
                    {...register('department_id', { required: 'Department is required' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code})
                      </option>
                    ))}
                  </select>
                  {errors.department_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.department_id.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Credits</label>
                  <input
                    type="number"
                    {...register('credits')}
                    min="1"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Duration (Years)</label>
                  <input
                    type="number"
                    {...register('duration_years')}
                    min="1"
                    max="6"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Semesters</label>
                  <input
                    type="number"
                    {...register('total_semesters')}
                    min="1"
                    max="12"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Fee per Semester</label>
                  <input
                    type="number"
                    {...register('fee_per_semester')}
                    min="0"
                    step="0.01"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {formLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {editCourse ? 'Updating...' : 'Adding...'}
                    </div>
                  ) : editCourse ? 'Update Course' : 'Add Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default CourseManagement
