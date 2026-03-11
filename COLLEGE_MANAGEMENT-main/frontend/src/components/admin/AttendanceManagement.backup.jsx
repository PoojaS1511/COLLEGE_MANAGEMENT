import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import apiService from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import { 
  CalendarIcon, 
  UserGroupIcon,
  CheckIcon, 
  XMarkIcon, 
  PlusIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const AttendanceManagement = () => {
  // State for data storage
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  
  // UI State
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showMarkAttendance, setShowMarkAttendance] = useState(false);
  
  // Merged data state
  const [mergedAttendance, setMergedAttendance] = useState([]);
  
  // Form state
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedStudents, setSelectedStudents] = useState({});

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: {
      course_id: '',
      subject_id: ''
    }
  });
  
  const watchedCourseId = watch('course_id');
  
  // Callback functions
  const fetchSubjects = useCallback(async (courseId) => {
    if (!courseId) {
      console.warn('No courseId provided to fetchSubjects');
      setSubjects([]);
      return [];
    }

    try {
      const response = await apiService.getSubjects({ course_id: courseId });
      console.log('Subjects response for course', courseId, ':', response);
      
      if (response?.success && Array.isArray(response.data)) {
        if (response.data.length > 0) {
          setSubjects(response.data);
          return response.data;
        } else {
          console.warn('No subjects found for course:', courseId);
          setSubjects([]);
          return [];
        }
      } else {
        console.warn('Failed to fetch subjects:', response?.message || 'Unknown error');
        setSubjects([]);
        return [];
      }
    } catch (error) {
      console.error('Error in fetchSubjects:', error);
      setSubjects([]);
      return [];
    }
  }, []);

  const fetchStudents = useCallback(async (courseId) => {
    if (!courseId) {
      console.warn('No courseId provided to fetchStudents');
      setStudents([]);
      return [];
    }

    try {
      setLoading(true);
      const response = await apiService.getStudents({ course_id: courseId });
      if (response?.success) {
        setStudents(response.data || []);
        return response.data || [];
      }
      throw new Error(response?.message || 'Failed to fetch students');
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);


  // Define fetchAllData function first
  const fetchAllData = useCallback(async () => {
    if (!selectedCourse || !selectedSubject) {
      console.warn('Please select both course and subject');
      return;
    }

    try {
      console.log('Fetching data for course:', selectedCourse, 'subject:', selectedSubject);
      setIsRefreshing(true);

  // Initialize component
  useEffect(() => {
    let isMounted = true;
    
    const initialize = async () => {
      try {
        console.log('Initializing component...');
        console.log('Fetching courses...');
        const coursesResponse = await apiService.getCourses();
        console.log('Courses response:', coursesResponse);
        
        if (isMounted && coursesResponse?.success && Array.isArray(coursesResponse.data)) {
          console.log('Setting courses:', coursesResponse.data);
          setCourses(coursesResponse.data || []);
        } else if (isMounted) {
          console.warn('Failed to fetch courses:', coursesResponse?.message);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error initializing data:', error);
        }
      } finally {
        if (isMounted) {
          console.log('Finished initialization');
          setLoading(false);
        }
      }
    };
    
    initialize();
    
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array means this runs once on mount

  // Fetch subjects when a course is selected
  useEffect(() => {
    const fetchSubjectsForCourse = async () => {
      if (!selectedCourse) {
{{ ... }}
        console.log('No course selected, clearing subjects');
        setSubjects([]);
        setSelectedSubject('');
        return;
      }

      try {
        console.log('===== FETCHING SUBJECTS =====');
        console.log('Selected course ID:', selectedCourse);
        
        // Make the API call
        console.log('Calling apiService.getSubjectsByCourse with course ID:', selectedCourse);
        const response = await apiService.getSubjectsByCourse(selectedCourse);
        console.log('Subjects API response:', response);
        
        if (response?.success && Array.isArray(response.data)) {
          console.log(`Setting ${response.data.length} subjects for course ${selectedCourse}`, response.data);
          setSubjects(response.data);
          
          // Auto-select the first subject if none is selected
          if (response.data.length > 0) {
            // Only update selectedSubject if it's not already set or if the current value is not in the new list
            if (!selectedSubject || !response.data.some(subj => subj.id === selectedSubject)) {
              console.log('Setting selected subject to first subject:', response.data[0].id);
              setSelectedSubject(response.data[0].id);
            }
          } else {
            console.warn('No subjects found for the selected course');
            setSelectedSubject('');
          }
        } else {
          console.warn('Failed to fetch subjects or invalid data format:', response);
          setSubjects([]);
          setSelectedSubject('');
        }
      } catch (error) {
        console.error('Error in fetchSubjectsForCourse:', error);
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          response: error.response
        });
        setSubjects([]);
        setSelectedSubject('');
      }
    };

    fetchSubjectsForCourse();
  }, [selectedCourse]); // Removed selectedSubject from dependencies to prevent infinite loop

  // Fetch attendance data when both course and subject are selected
  useEffect(() => {
    if (selectedCourse && selectedSubject) {
      fetchAllData();
    } else {
      // Clear attendance records if either course or subject is not selected
      setAttendanceRecords([]);
    }
  }, [selectedCourse, selectedSubject, fetchAllData]);

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      // Your form submission logic here
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle closing the attendance form
  const handleCloseForm = () => {
    setShowMarkAttendance(false);
    setSelectedStudents({});
    reset();
  };

  // Handle student attendance toggle
  const handleStudentAttendance = (studentId, status) => {
    setSelectedStudents(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  // Handle mark attendance button click
  const handleMarkAttendance = () => {
    setShowMarkAttendance(true);
  };


  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Attendance Management</h2>
            <div className="flex space-x-3">
              <button
                onClick={handleMarkAttendance}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-royal-600 hover:bg-royal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-royal-500"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                Mark Attendance
              </button>
              <button
                onClick={fetchAllData}
                disabled={isRefreshing}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-royal-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowPathIcon className={`-ml-1 mr-2 h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="px-6 py-4">
          {/* Course and Subject Selection */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Filter Attendance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="filter_course" className="block text-sm font-medium text-gray-700 mb-1">
                  Course
                </label>
                <select
                  id="filter_course"
                  value={selectedCourse || ''}
                  onChange={(e) => {
                    console.log('Course selected:', e.target.value);
                    setSelectedCourse(e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-500"
                >
                  <option value="">Select Course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="filter_subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <select
                  id="filter_subject"
                  value={selectedSubject || ''}
                  onChange={(e) => {
                    console.log('Subject selected:', e.target.value);
                    setSelectedSubject(e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  disabled={!selectedCourse}
                >
                  <option value="">Select Subject</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={fetchAllData}
                  disabled={!selectedCourse || !selectedSubject || isRefreshing}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-royal-600 hover:bg-royal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-royal-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowPathIcon className={`-ml-1 mr-2 h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Loading...' : 'Load Attendance'}
                </button>
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Attendance summary and filters */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Attendance Summary</h3>
                {/* Add your attendance summary components here */}
              </div>
              
              {/* Attendance records table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Course
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subject
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mergedAttendance.map((record) => (
                      <tr key={`${record.student_id}-${record.subject_id}-${record.date}`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {record.student_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.course_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.subject_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(record.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            record.status === 'present' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mark Attendance Modal */}
      {showMarkAttendance && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Mark Attendance</h3>
              <button
                onClick={handleCloseForm}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="course_id" className="block text-sm font-medium text-gray-700 mb-1">
                    Course
                  </label>
                  <select
                    id="course_id"
                    {...register('course_id', { required: 'Course is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-500"
                  >
                    <option value="">Select Course</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                  {errors.course_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.course_id.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="subject_id" className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <select
                    id="subject_id"
                    {...register('subject_id', { required: 'Subject is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    disabled={!watchedCourseId || loading}
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                  {errors.subject_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.subject_id.message}</p>
                  )}
                </div>
              </div>

              {selectedCourse && (
                <div className="mt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <UserGroupIcon className="h-5 w-5 mr-2" />
                    {`Student List${students.length > 0 ? ` (${students.length} students)` : ''}`}
                  </h4>
                  
                  <div className="overflow-y-auto max-h-96 border rounded-md">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Student Name
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Roll Number
                          </th>
                          <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {students.map((student) => (
                          <tr key={student.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {student.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {student.roll_number}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center space-x-2">
                                <button
                                  type="button"
                                  onClick={() => handleStudentAttendance(student.id, 'present')}
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    selectedStudents[student.id] === 'present'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                  }`}
                                >
                                  Present
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleStudentAttendance(student.id, 'absent')}
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    selectedStudents[student.id] === 'absent'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                  }`}
                                >
                                  Absent
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-royal-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || Object.keys(selectedStudents).length === 0}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-royal-600 hover:bg-royal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-royal-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : 'Save Attendance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceManagement;
