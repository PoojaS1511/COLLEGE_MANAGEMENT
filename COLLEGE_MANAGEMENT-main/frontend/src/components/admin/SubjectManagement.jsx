import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import apiService from '../../services/api';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../common/LoadingSpinner';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  BookOpenIcon,
  XMarkIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const SubjectManagement = () => {
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editSubject, setEditSubject] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchSubjects(), fetchCourses(), fetchFaculty()]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await apiService.getSubjects();
      console.log('Subjects API response:', response);

      // Handle the API response format
      let subjectsData = [];
      if (response && response.success && Array.isArray(response.data)) {
        subjectsData = response.data;
      } else if (response && Array.isArray(response)) {
        // Fallback for direct array response
        subjectsData = response;
      } else {
        console.warn('Invalid subjects response format:', response);
        subjectsData = [];
      }

      console.log('Processed subjects data:', subjectsData);
      setSubjects(subjectsData);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast.error('Failed to load subjects. Please try again.');
      setSubjects([]);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await apiService.getCourses();
      console.log('Courses API response:', response);

      // Handle the API response format
      let coursesData = [];
      if (Array.isArray(response)) {
        coursesData = response;
      } else if (response && Array.isArray(response.data)) {
        coursesData = response.data;
      } else if (response && response.success && Array.isArray(response.data)) {
        coursesData = response.data;
      } else {
        console.warn('Invalid courses response format:', response);
        coursesData = [];
      }

      console.log('Processed courses data:', coursesData);
      setCourses(coursesData);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses. Please try again.');
      setCourses([]);
    }
  };

  const fetchFaculty = async () => {
    try {
      const { data, error } = await supabase
        .from('faculty')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      setFaculty(data || []);
    } catch (error) {
      console.error('Error fetching faculty:', error);
      toast.error('Failed to load faculty. Please try again.');
      throw error;
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await loadData();
      toast.success('Data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setFormLoading(true);
      
      if (editSubject) {
        await apiService.updateSubject(editSubject.id, data);
        toast.success('Subject updated successfully');
      } else {
        await apiService.createSubject(data);
        toast.success('Subject created successfully');
      }
      
      await fetchSubjects();
      handleCloseForm();
    } catch (error) {
      console.error('Error saving subject:', error);
      toast.error(`Failed to ${editSubject ? 'update' : 'create'} subject. Please try again.`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (subject) => {
    setEditSubject(subject);
    Object.entries(subject).forEach(([key, value]) => {
      setValue(key, value);
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        await apiService.deleteSubject(id);
        await fetchSubjects();
        toast.success('Subject deleted successfully');
      } catch (error) {
        console.error('Error deleting subject:', error);
        toast.error('Failed to delete subject. Please try again.');
      }
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditSubject(null);
    reset();
  };

  const filteredSubjects = React.useMemo(() => {
    // Ensure subjects is always an array before filtering
    if (!Array.isArray(subjects)) {
      console.warn('Subjects is not an array:', subjects);
      return [];
    }

    return subjects.filter(subject => {
      const matchesSearch = subject.name && subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           subject.code && subject.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCourse = !selectedCourse || subject.course_id === parseInt(selectedCourse);
      return matchesSearch && matchesCourse;
    });
  }, [subjects, searchTerm, selectedCourse]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Subject Management</h1>
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
            Add Subject
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <div>
            <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Course
            </label>
            <select
              id="course"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="">All Courses</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name} ({course.code})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Subjects Table */}
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
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Semester
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
              {filteredSubjects.length > 0 ? (
                filteredSubjects.map((subject) => (
                  <tr key={subject.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {subject.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{subject.name}</div>
                      <div className="text-sm text-gray-500">
                        {subject.subject_type === 'theory' ? 'Theory' : 'Lab'}
                        {subject.is_elective && ' • Elective'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {subject.courses?.name || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {subject.courses?.code || ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {subject.semester || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {subject.credits || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(subject)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(subject.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                    No subjects found. {searchTerm || selectedCourse ? 'Try adjusting your search or filters.' : ''}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Subject Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  {editSubject ? 'Edit Subject' : 'Add New Subject'}
                </h2>
                <button
                  onClick={handleCloseForm}
                  className="text-gray-400 hover:text-gray-500"
                  disabled={formLoading}
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Subject Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      {...register('name', { required: 'Subject name is required' })}
                      className={`mt-1 block w-full border ${errors.name ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                      Subject Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="code"
                      {...register('code', { required: 'Subject code is required' })}
                      className={`mt-1 block w-full border ${errors.code ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                    />
                    {errors.code && (
                      <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="course_id" className="block text-sm font-medium text-gray-700">
                      Course <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="course_id"
                      {...register('course_id', { required: 'Course is required' })}
                      className={`mt-1 block w-full border ${errors.course_id ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                    >
                      <option value="">Select Course</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.name} ({course.code})
                        </option>
                      ))}
                    </select>
                    {errors.course_id && (
                      <p className="mt-1 text-sm text-red-600">{errors.course_id.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="faculty_id" className="block text-sm font-medium text-gray-700">
                      Faculty
                    </label>
                    <select
                      id="faculty_id"
                      {...register('faculty_id')}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Select Faculty (Optional)</option>
                      {faculty.map((facultyMember) => (
                        <option key={facultyMember.id} value={facultyMember.id}>
                          {facultyMember.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="semester" className="block text-sm font-medium text-gray-700">
                      Semester <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="semester"
                      min="1"
                      max="8"
                      {...register('semester', { 
                        required: 'Semester is required',
                        min: { value: 1, message: 'Semester must be at least 1' },
                        max: { value: 8, message: 'Semester cannot be more than 8' }
                      })}
                      className={`mt-1 block w-full border ${errors.semester ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                    />
                    {errors.semester && (
                      <p className="mt-1 text-sm text-red-600">{errors.semester.message}</p>
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
                      max="10"
                      {...register('credits', { 
                        required: 'Credits are required',
                        min: { value: 1, message: 'Minimum 1 credit' },
                        max: { value: 10, message: 'Maximum 10 credits' }
                      })}
                      className={`mt-1 block w-full border ${errors.credits ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                    />
                    {errors.credits && (
                      <p className="mt-1 text-sm text-red-600">{errors.credits.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subject Type</label>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center">
                        <input
                          id="theory"
                          type="radio"
                          value="theory"
                          defaultChecked
                          {...register('subject_type')}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <label htmlFor="theory" className="ml-2 block text-sm text-gray-700">
                          Theory
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="lab"
                          type="radio"
                          value="lab"
                          {...register('subject_type')}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <label htmlFor="lab" className="ml-2 block text-sm text-gray-700">
                          Lab
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="is_elective"
                      type="checkbox"
                      {...register('is_elective')}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_elective" className="ml-2 block text-sm text-gray-700">
                      Is Elective Subject
                    </label>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    disabled={formLoading}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {formLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {editSubject ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>{editSubject ? 'Update Subject' : 'Create Subject'}</>
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

export default SubjectManagement;
