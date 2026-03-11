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
  
  // Fetch courses on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await apiService.getCourses();
        if (response?.success) {
          setCourses(response.data || []);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Fetch subjects when course changes
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!watchedCourseId) {
        setSubjects([]);
        setSelectedSubject('');
        return;
      }

      try {
        setLoading(true);
        const response = await apiService.getSubjectsByCourse(watchedCourseId);
        if (response?.success) {
          setSubjects(response.data || []);
        }
      } catch (error) {
        console.error('Error fetching subjects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [watchedCourseId]);

  // Fetch students and attendance when both course and subject are selected
  const fetchAllData = useCallback(async () => {
    if (!selectedCourse || !selectedSubject) return;

    try {
      setIsRefreshing(true);
      
      // Fetch students
      const studentsResponse = await apiService.getStudentsByCourse(selectedCourse);
      if (studentsResponse?.success) {
        setStudents(studentsResponse.data || []);
      }
      
      // Fetch attendance
      const attendanceResponse = await apiService.getAttendanceByCourseAndSubject(
        selectedCourse,
        selectedSubject
      );
      
      if (attendanceResponse?.success) {
        setAttendanceRecords(attendanceResponse.data || []);
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [selectedCourse, selectedSubject]);

  // Call fetchAllData when dependencies change
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      // Your form submission logic here
      console.log('Form submitted:', data);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  // Handle closing the attendance form
  const handleCloseForm = () => {
    setShowMarkAttendance(false);
    reset();
    setSelectedStudents({});
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

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Attendance Management</h2>
            <button
              onClick={handleMarkAttendance}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Mark Attendance
            </button>
          </div>
        </div>
        
        {/* Your form and table components here */}
        
      </div>
    </div>
  );
};

export default AttendanceManagement;
