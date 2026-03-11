import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import apiService from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  ArrowPathIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(null);

  // Watch department_id changes to update duration
  const departmentId = watch('department_id');
  
  useEffect(() => {
    if (departmentId) {
      const selectedDept = departments.find(d => d.id === departmentId);
      if (selectedDept) {
        setValue('duration_years', selectedDept.duration_years || 1, { shouldValidate: true });
        setSelectedDepartmentId(departmentId);
      }
    } else {
      setSelectedDepartmentId(null);
      setValue('duration_years', '');
    }
  }, [departmentId, departments, setValue]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm();

  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchCourses(),
          fetchDepartments()
        ]);
      } catch (error) {
        console.error('Error initializing data:', error);
        toast.error('Failed to load data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await apiService.getCourses();
      if (response && response.success) {
        setCourses(Array.isArray(response.data) ? response.data : []);
      } else {
        throw new Error(response?.message || 'Failed to fetch courses');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error(error.message || 'Failed to load courses. Please try again.');
      setCourses([]);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await apiService.getDepartments();
      if (response && response.success) {
        setDepartments(Array.isArray(response.data) ? response.data : []);
      } else {
        throw new Error(response?.message || 'Failed to fetch departments');
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to load departments. Some features may be limited.');
      setDepartments([]);
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await fetchCourses();
      toast.success('Courses refreshed successfully');
    } catch (error) {
      console.error('Error refreshing courses:', error);
      toast.error('Failed to refresh courses');
    } finally {
      setIsRefreshing(false);
    }
  };

  const onSubmit = async (data) => {
    if (isSubmitting) return;
    
    try {
      if (!data.department_id) {
        toast.error('Please select a department');
        return;
      }

      // Only include fields that exist in the database schema
      const courseData = {
        name: data.name,
        code: data.code,
        department_id: data.department_id,
        duration_years: data.duration_years,
        credits: parseInt(data.credits, 10) || 0,
        description: data.description || null
      };

      if (isEditing && data.id) {
        const { id, ...updates } = courseData;
        const response = await apiService.updateCourse(id, updates);
        if (response && response.success) {
          toast.success('Course updated successfully');
          await fetchCourses();
          handleCloseForm();
        } else {
          throw new Error(response?.message || 'Failed to update course');
        }
      } else {
        const response = await apiService.createCourse(courseData);
        if (response && response.success) {
          toast.success('Course created successfully');
          await fetchCourses();
          handleCloseForm();
        } else {
          throw new Error(response?.message || 'Failed to create course');
        }
      }
    } catch (error) {
      console.error('Error saving course:', error);
      toast.error(error.message || `Failed to ${isEditing ? 'update' : 'create'} course. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (course) => {
    setIsEditing(true);
    // Only set values for fields that exist in the schema
    const validFields = ['id', 'name', 'code', 'department_id', 'duration_years', 'credits', 'description'];
    Object.entries(course).forEach(([key, value]) => {
      if (validFields.includes(key)) {
        setValue(key, value);
      }
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await apiService.deleteCourse(id);
      if (response && response.success) {
        toast.success('Course deleted successfully');
        await fetchCourses();
      } else {
        throw new Error(response?.message || 'Failed to delete course');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error(error.message || 'Failed to delete course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setIsEditing(false);
    reset();
  };

  const filteredCourses = (Array.isArray(courses) ? courses : []).filter(course => {
    try {
      if (!searchTerm) return true;
      
      const search = searchTerm.toLowerCase();
      const name = course?.name?.toString().toLowerCase() || '';
      const code = course?.code?.toString().toLowerCase() || '';
      const departmentName = departments.find(d => d.id === course.department_id)?.name?.toLowerCase() || '';
      
      return (
        name.includes(search) ||
        code.includes(search) ||
        departmentName.includes(search)
      );
    } catch (error) {
      console.error('Error filtering courses:', error);
      return false;
    }
  });
  
  const getDepartmentName = (departmentId) => {
    if (!departmentId) return 'N/A';
    const department = departments.find(d => d.id === departmentId);
    return department ? department.name : 'Unknown Department';
  };

  if (loading && !isRefreshing) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Course Management</h1>
        <div className="flex space-x-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 flex items-center"
          >
            <ArrowPathIcon className={`h-5 w-5 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-1" />
            Add Course
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search by name or code"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Credits
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {course.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{course.name}</div>
                      {course.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {course.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getDepartmentName(course.department_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {course.duration_years} {course.duration_years === 1 ? 'year' : 'years'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {course.credits || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(course)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(course.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                          disabled={loading}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    {searchTerm ? 'No matching courses found.' : 'No courses available.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Course Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  {isEditing ? 'Edit Course' : 'Add New Course'}
                </h2>
                <button
                  onClick={handleCloseForm}
                  className="text-gray-400 hover:text-gray-500"
                  disabled={loading}
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <input type="hidden" {...register('id')} />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="department_id" className="block text-sm font-medium text-gray-700">
                      Department
                    </label>
                    <select
                      id="department_id"
                      {...register('department_id', { required: 'Department is required' })}
                      className={`mt-1 block w-full border ${
                        errors.department_id ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                      disabled={isSubmitting}
                      onChange={(e) => {
                        setSelectedDepartmentId(e.target.value);
                      }}
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                    {errors.department_id && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                        {errors.department_id.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Course Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      {...register('name', { required: 'Course name is required' })}
                      className={`mt-1 block w-full border ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                      Course Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="code"
                      {...register('code', { required: 'Course code is required' })}
                      className={`mt-1 block w-full border ${
                        errors.code ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                    />
                    {errors.code && (
                      <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="duration_years" className="block text-sm font-medium text-gray-700">
                      Duration (Years) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="duration_years"
                      min="1"
                      max="6"
                      readOnly
                      {...register('duration_years', { 
                        required: 'Duration is required',
                        min: { value: 1, message: 'Minimum 1 year' },
                        max: { value: 6, message: 'Maximum 6 years' },
                        valueAsNumber: true
                      })}
                      className="mt-1 block w-full border border-gray-300 bg-gray-100 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {!selectedDepartmentId && (
                      <p className="mt-1 text-sm text-yellow-600">Select a department to set duration</p>
                    )}
                    {errors.duration_years && (
                      <p className="mt-1 text-sm text-red-600">{errors.duration_years.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="credits" className="block text-sm font-medium text-gray-700">
                      Credits <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="credits"
                      min="1"
                      max="30"
                      step="0.5"
                      {...register('credits', { 
                        required: 'Credits are required',
                        min: { value: 1, message: 'Minimum 1 credit' },
                        max: { value: 30, message: 'Maximum 30 credits' }
                      })}
                      className={`mt-1 block w-full border ${
                        errors.credits ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                      disabled={isSubmitting}
                    />
                    {errors.credits && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                        {errors.credits.message}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      id="description"
                      rows={3}
                      {...register('description')}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    disabled={loading}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {isEditing ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      isEditing ? 'Update Course' : 'Create Course'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;
