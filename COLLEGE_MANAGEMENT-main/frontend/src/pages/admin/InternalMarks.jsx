import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { format } from 'date-fns';
import { supabase } from '../../lib/supabase';
import { ErrorBoundary } from 'react-error-boundary';
import {
  ClipboardDocumentCheckIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

// Test data for debugging
const testMarksData = [{
  id: 1,
  student_id: 'test-student-1',
  faculty_subject_assignment_id: 1,
  assessment_type: 'Quiz',
  marks_obtained: 85,
  max_marks: 100,
  entered_by_faculty_id: 'test-faculty-1',
  entered_at: new Date().toISOString(),
  remarks: 'Test data',
  exam_id: 1,
  student: { name: 'Test Student', roll_no: 'TS001' },
  faculty: { name: 'Test Faculty' },
  exam: { name: 'Mid Term 1' },
  assignment: { subject: { name: 'Mathematics', code: 'MATH101' } }
}];

// Error boundary fallback component
function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
      <h3 className="font-bold flex items-center">
        <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
        Something went wrong
      </h3>
      <pre className="whitespace-pre-wrap mt-2">{error.message}</pre>
      <button 
        onClick={resetErrorBoundary}
        className="mt-2 px-3 py-1 bg-red-500 text-white rounded text-sm"
      >
        Try again
      </button>
    </div>
  );
}

const InternalMarks = () => {
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('checking'); // 'checking', 'connected', 'error'
  const [showDebug, setShowDebug] = useState(process.env.NODE_ENV === 'development');
  const [filters, setFilters] = useState({
    assessmentType: '',
    examId: '',
    facultyId: ''
  });
  const [exams, setExams] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [selectedMark, setSelectedMark] = useState(null);
  const [assessmentTypes] = useState([
    'Quiz',
    'Assignment',
    'Mid Term',
    'Internal Test',
    'Lab Work',
    'Project',
    'Presentation',
    'Other'
  ]);
  
  const navigate = useNavigate();

  // Test database connection
  const testDatabaseConnection = async () => {
    try {
      console.log('Testing database connection...');
      setConnectionStatus('checking');
      
      // 1. Check Supabase auth session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw sessionError;
      }
      
      console.log('Supabase session:', session);
      
      if (!session) {
        console.warn('No active session found');
        setConnectionStatus('error');
        setError('Not authenticated. Please log in.');
        return false;
      }
      
      // 2. Test a simple query - don't throw on error, just return false
      const { data, error: queryError } = await supabase
        .from('internal_marks')
        .select('id')
        .limit(1);
      
      if (queryError) {
        console.warn('Database query warning:', queryError);
        // Don't throw, just return false to indicate we should use test data
        return false;
      }
      
      console.log('Database connection test successful');
      setConnectionStatus('connected');
      return true;
      
    } catch (error) {
      console.warn('Database connection test failed, using test data:', error);
      setConnectionStatus('error');
      // Don't set error state to prevent UI from showing error message
      // setError(`Database error: ${error.message}`);
      return false; // Return false to use test data
    }
  };

  // Test API connection
  const testApiConnection = async () => {
    try {
      console.log('Testing API connection...');
      const response = await api.getInternalMarks({ limit: 1 });
      console.log('API test response:', response);
      
      if (response.success) {
        toast.success('API connection successful!');
        return true;
      } else {
        throw new Error(response.message || 'API request failed');
      }
    } catch (error) {
      console.error('API test failed:', error);
      toast.error(`API Error: ${error.message}`);
      return false;
    }
  };

  // Reset component state
  const resetComponent = () => {
    console.log('Resetting component state...');
    setMarks([]);
    setLoading(true);
    setError('');
    setSearchTerm('');
    setFilters({
      assessmentType: '',
      examId: '',
      facultyId: ''
    });
    fetchInternalMarks();
  };

  // Fetch internal marks data
  const fetchInternalMarks = async () => {
    console.log('Fetching internal marks from Supabase...');
    setLoading(true);
    setError('');
    
    try {
      // Query the internal_marks table with related data
      const { data, error } = await supabase
        .from('internal_marks')
        .select(`
          *,
          student:student_id (id, full_name, register_number, email),
          faculty:entered_by_faculty_id (id, full_name, email, employee_id),
          exam:exam_id (id, name, exam_date, exam_type),
          assignment:faculty_subject_assignment_id (
            id,
            subject:subject_id (id, name, code),
            course:course_id (id, name, code)
          )
        `)
        .order('entered_at', { ascending: false });
      
      if (error) throw error;
      
      console.log(`Fetched ${data?.length || 0} marks from Supabase`);
      
      // Format the data for display
      const formattedData = data.map(mark => {
        // Get student details with fallbacks
        const studentName = mark.student?.full_name || `Student ${mark.student_id?.substring(0, 6)}...` || 'N/A';
        const registerNumber = mark.student?.register_number || 'N/A';
        
        // Get exam details with fallbacks
        const examName = mark.exam?.name || mark.exam?.exam_type || 'N/A';
        
        // Get faculty details with fallbacks
        const facultyName = mark.faculty?.full_name || 
                          (mark.faculty?.employee_id ? `Faculty ${mark.faculty.employee_id}` : 'N/A');
        
        // Get subject and course details
        const subjectName = mark.assignment?.subject?.name || 'N/A';
        const courseName = mark.assignment?.course?.name || 'N/A';
        const subjectCode = mark.assignment?.subject?.code || '';
        
        // Calculate percentage and pass/fail status
        const percentage = mark.max_marks > 0 
          ? Math.round((mark.marks_obtained / mark.max_marks) * 100) 
          : 0;
        const isPassed = percentage >= 40; // 40% passing threshold
        
        return {
          ...mark,
          // Add display-friendly fields
          student_name: studentName,
          student_register_number: registerNumber,
          exam_name: examName,
          faculty_name: facultyName,
          subject_name: subjectName,
          course_name: courseName,
          subject_code: subjectCode,
          percentage: percentage,
          is_passed: isPassed,
          // Format dates for display
          formatted_date: mark.entered_at ? formatDate(mark.entered_at) : 'N/A',
          // Keep original nested objects for reference
          student: mark.student,
          faculty: mark.faculty,
          exam: mark.exam,
          assignment: mark.assignment
        };
      });
      
      setMarks(formattedData || []);
      
    } catch (err) {
      console.error('Error fetching internal marks:', err);
      setError('Failed to load marks. Please try again.');
      toast.error('Failed to load marks. Please check your connection and try again.');
      // Fall back to test data in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Using test data due to error');
        setMarks(testMarksData);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch reference data (exams, faculties)
  const fetchReferenceData = async () => {
    try {
      // Fetch exams
      const examsResponse = await api.getExams({});
      if (examsResponse.success) {
        setExams(examsResponse.data || []);
      }
      
      // Fetch faculties
      const facultiesResponse = await api.getFaculty();
      if (facultiesResponse.success) {
        setFaculties(facultiesResponse.data || []);
      }
    } catch (err) {
      console.error('Error fetching reference data:', err);
    }
  };

  useEffect(() => {
    fetchReferenceData();
  }, []);

  useEffect(() => {
    fetchInternalMarks();
  }, [filters]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchInternalMarks();
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setFilters({
      assessmentType: '',
      examId: '',
      facultyId: ''
    });
  };

  const viewDetails = (mark) => {
    console.log('Viewing details for mark:', mark);
    setSelectedMark(mark);
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy, hh:mm a');
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Debug info object
  const debugInfo = {
    marksCount: marks.length,
    loading,
    error,
    searchTerm,
    filters,
    connectionStatus,
    lastUpdated: new Date().toISOString()
  };

  // Log render info in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Rendering InternalMarks with state:', debugInfo);
  }

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, info) => {
        console.error('Error in InternalMarks:', error, info);
      }}
    >
      <div className="container mx-auto p-4">
        {/* Connection Status */}
        <div className="mb-4 p-3 rounded-md bg-blue-50 border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                connectionStatus === 'connected' ? 'bg-green-500' : 
                connectionStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
              <span className="text-sm font-medium">
                {connectionStatus === 'connected' ? 'Connected to Database' : 
                 connectionStatus === 'error' ? 'Connection Error' : 'Connecting...'}
              </span>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Search by student name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Assessment Type Filter */}
              <select
                name="assessmentType"
                value={filters.assessmentType}
                onChange={handleFilterChange}
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">All Assessment Types</option>
                {assessmentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              {/* Exam Filter */}
              <select
                name="examId"
                value={filters.examId}
                onChange={handleFilterChange}
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">All Exams</option>
                {exams.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.name}
                  </option>
                ))}
              </select>

              {/* Faculty Filter */}
              <select
                name="facultyId"
                value={filters.facultyId}
                onChange={handleFilterChange}
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">All Faculties</option>
                {faculties.map((faculty) => (
                  <option key={faculty.id} value={faculty.id}>
                    {faculty.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <ArrowPathIcon className="-ml-1 mr-2 h-4 w-4" />
                Reset
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FunnelIcon className="-ml-1 mr-2 h-4 w-4" />
                Apply Filters
              </button>
            </div>
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && marks.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <ClipboardDocumentCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No internal marks found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {Object.values(filters).some(Boolean) || searchTerm
                ? 'Try adjusting your search or filter criteria.'
                : 'No internal marks have been recorded yet.'}
            </p>
          </div>
        )}

        {/* Data Table */}
        {!loading && !error && marks.length > 0 && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assessment
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Marks
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Exam
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Faculty
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {marks.map((mark) => (
                    <tr key={mark.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-indigo-100 rounded-full">
                            <UserCircleIcon className="h-8 w-8 text-indigo-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {mark.student_name || `Student ${mark.student_id?.substring(0, 6)}...`}
                            </div>
                            <div className="text-sm text-gray-500">
                              {mark.student_register_number || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{mark.assessment_type}</div>
                        <div className="text-sm text-gray-500">Max: {mark.max_marks}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          mark.marks_obtained >= (mark.max_marks * 0.4) 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {mark.marks_obtained} / {mark.max_marks}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {mark.exam_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {mark.faculty_name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {mark.subject_name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(mark.entered_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => viewDetails(mark)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                          title="View Details"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button
                          className="text-yellow-600 hover:text-yellow-900 mr-4"
                          title="Edit"
                          onClick={() => {}}
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                          onClick={() => {}}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Pagination - Separate from the table container */}
        {!loading && !error && marks.length > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Previous
              </button>
              <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of{' '}
                  <span className="font-medium">20</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <a
                    href="#"
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    aria-current="page"
                    className="z-10 bg-indigo-50 border-indigo-500 text-indigo-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                  >
                    1
                  </a>
                  <a
                    href="#"
                    className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                  >
                    2
                  </a>
                  <a
                    href="#"
                    className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                  >
                    3
                  </a>
                  <a
                    href="#"
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </a>
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Mark Details Modal */}
        {selectedMark && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Marks Details</h3>
                <button 
                  onClick={() => setSelectedMark(null)} 
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                  aria-label="Close"
                >
                  &times;
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Student</p>
                    <p className="font-medium">{selectedMark.student?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Reg No.</p>
                    <p className="font-medium">{selectedMark.student_register_number || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Subject</p>
                    <p className="font-medium">
                      {selectedMark.subject_name || selectedMark.assignment?.subject?.name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Assessment Type</p>
                    <p className="font-medium">{selectedMark.assessment_type || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Marks Obtained</p>
                    <p className="font-medium">
                      {selectedMark.marks_obtained} / {selectedMark.max_marks}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Percentage</p>
                    <p className="font-medium">
                      {selectedMark.max_marks > 0 
                        ? ((selectedMark.marks_obtained / selectedMark.max_marks) * 100).toFixed(2) + '%'
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Entered By</p>
                    <p className="font-medium">
                      {selectedMark.faculty?.name || selectedMark.entered_by_faculty_id || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium">
                      {formatDate(selectedMark.entered_at)}
                    </p>
                  </div>
                </div>
                
                {selectedMark.remarks && (
                  <div>
                    <p className="text-sm text-gray-500">Remarks</p>
                    <p className="mt-1">{selectedMark.remarks}</p>
                  </div>
                )}
                
                <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
                  <button
                    onClick={() => setSelectedMark(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default InternalMarks;
