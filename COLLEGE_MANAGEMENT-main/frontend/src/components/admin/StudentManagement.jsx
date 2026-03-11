import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchStudents,
  searchStudents,
  getStudentStatistics,
  deleteStudent,
  addStudent,
  updateStudent,
  softDeleteStudent
} from '../../services/studentService';
import AddStudentForm from './AddStudentForm';
import LoadingSpinner from '../common/LoadingSpinner';
import ConfirmDialog from '../common/ConfirmDialog';
import Pagination from '../common/Pagination';
import {
  UserIcon,
  ChartBarIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ArrowPathIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  DocumentArrowDownIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// Constants
const ITEMS_PER_PAGE = 10;
const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'graduated', label: 'Graduated' },
  { value: 'suspended', label: 'Suspended' }
];

const COURSE_OPTIONS = [
  'B.Tech CSE',
  'B.Tech ECE',
  'B.Tech MECH',
  'B.Tech CIVIL',
  'MCA',
  'MBA'
];

const StudentManagement = () => {
  // State management
  const [state, setState] = useState({
    students: [],
    filteredStudents: [],
    loading: true,
    searchTerm: '',
    filters: {
      course: '',
      status: '',
      admission_year: ''
    },
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: ITEMS_PER_PAGE
    },
    showAddForm: false,
    showDeleteDialog: false,
    editStudent: null,
    studentToDelete: null,
    isSearching: false,
    statistics: null
  });

  const navigate = useNavigate();
  
  // Destructure state for easier access
  const { 
    students, 
    filteredStudents, 
    loading, 
    searchTerm, 
    filters, 
    pagination, 
    showAddForm, 
    showDeleteDialog, 
    editStudent, 
    studentToDelete, 
    isSearching,
    statistics
  } = state;

  // Update state with type safety
  const updateState = (updates) => {
    setState(prev => ({
      ...prev,
      ...(typeof updates === 'function' ? updates(prev) : updates)
    }));
  };

  // Load students with pagination and filters
  const loadStudents = useCallback(async () => {
    console.log('Loading students...');
    try {
      updateState({ loading: true });
      
      console.log('Fetching students with params:', {
        page: state.pagination.currentPage,
        pageSize: state.pagination.itemsPerPage,
        filters: {
          ...state.filters,
          status: state.filters.status || undefined,
          course: state.filters.course || undefined,
          admission_year: state.filters.admission_year || undefined
        }
      });
      
      const response = await fetchStudents({
        page: state.pagination.currentPage,
        pageSize: state.pagination.itemsPerPage,
        filters: {
          ...state.filters,
          status: state.filters.status || undefined,
          course: state.filters.course || undefined,
          admission_year: state.filters.admission_year || undefined
        },
        sortField: 'created_at',
        sortOrder: 'desc'
      });

      console.log('Students API response:', response);
      
      if (!response || !response.data) {
        throw new Error('Invalid response format from server');
      }

      updateState({
        students: response.data,
        filteredStudents: response.data,
        pagination: {
          ...state.pagination,
          totalPages: response.pagination?.totalPages || 1,
          totalItems: response.pagination?.totalItems || 0
        },
        loading: false
      });
    } catch (error) {
      console.error('Error loading students:', error);
      toast.error(error.message || 'Failed to load students. Please try again.');
      updateState({ loading: false });
    }
  }, [state.pagination.currentPage, state.filters, state.pagination.itemsPerPage]);

  // Load student statistics
  const loadStatistics = useCallback(async () => {
    console.log('Loading student statistics...');
    try {
      const stats = await getStudentStatistics();
      console.log('Student statistics:', stats);
      updateState({ statistics: stats });
    } catch (error) {
      console.error('Error loading statistics:', error);
      toast.error(`Failed to load statistics: ${error.message}`);
      // Initialize with default values to prevent UI errors
      updateState({
        statistics: {
          total: 0,
          recent: 0,
          byStatus: {},
          byCourse: [],
          byYear: []
        }
      });
    }
  }, []);

  // Handle page change
  const handlePageChange = (page) => {
    updateState(prev => ({
      pagination: {
        ...prev.pagination,
        currentPage: page
      }
    }));
  };

  // Initial load and when filters or pagination changes
  useEffect(() => {
    console.log('Component mounted or dependencies changed');
    
    // Load students and statistics in parallel
    const loadData = async () => {
      try {
        await Promise.all([
          loadStudents(),
          loadStatistics()
        ]);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error(`Failed to load data: ${error.message}`);
      }
    };
    
    loadData();
    
    // Add cleanup function if needed
    return () => {
      console.log('Cleaning up...');
    };
  }, [loadStudents, loadStatistics]);

  // Handle search
  useEffect(() => {
    const search = async () => {
      if (!searchTerm.trim()) {
        updateState({
          filteredStudents: students,
          isSearching: false
        });
        return;
      }

      try {
        updateState({ isSearching: true });
        const results = await searchStudents(searchTerm);
        updateState({
          filteredStudents: results,
          isSearching: false
        });
      } catch (error) {
        console.error('Error searching students:', error);
        toast.error('Error performing search');
        updateState({
          filteredStudents: students,
          isSearching: false
        });
      }
    };

    const timer = setTimeout(() => {
      search();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, students]);

  const handleAddStudent = () => {
    navigate('/admin/students/add');
  };

  const handleFormSubmit = async (studentData) => {
    try {
      updateState({ loading: true });
      
      if (editStudent) {
        // Update existing student
        const updatedStudent = await updateStudent(editStudent.id, {
          ...studentData,
          updated_at: new Date().toISOString()
        });
        
        updateState(prev => ({
          students: prev.students.map(s => s.id === updatedStudent.id ? updatedStudent : s),
          filteredStudents: prev.filteredStudents.map(s => s.id === updatedStudent.id ? updatedStudent : s),
          showAddForm: false,
          editStudent: null,
          loading: false
        }));
        
        toast.success('Student updated successfully');
      } else {
        // Add new student
        const newStudent = await addStudent(studentData);
        
        updateState(prev => ({
          students: [newStudent, ...prev.students],
          filteredStudents: [newStudent, ...prev.filteredStudents],
          showAddForm: false,
          editStudent: null,
          loading: false
        }));
        
        toast.success('Student added successfully');
      }
    } catch (error) {
      console.error('Error saving student:', error);
      toast.error(error.message || `Failed to ${editStudent ? 'update' : 'add'} student. Please try again.`);
      throw error; // Re-throw the error to be handled by the form
    } finally {
      updateState(prev => ({ ...prev, loading: false }));
    }
  };

  const confirmDelete = (student) => {
    updateState({
      studentToDelete: student,
      showDeleteDialog: true
    });
  };

  const cancelDelete = () => {
    updateState({
      studentToDelete: null,
      showDeleteDialog: false
    });
  };

  const handleDelete = async () => {
    if (!studentToDelete) return;
    
    try {
      updateState({ loading: true });
      await softDeleteStudent(studentToDelete.id);
      await loadStudents();
      await loadStatistics();
      toast.success('Student deleted successfully');
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error(error.message || 'Failed to delete student. Please try again.');
    } finally {
      updateState({ 
        loading: false,
        showDeleteDialog: false,
        studentToDelete: null
      });
    }
  };

  const handleRefresh = () => {
    loadStudents();
    loadStatistics();
    toast.success('Student list refreshed');
  };

  const handleView = (studentId) => {
    navigate(`/admin/students/${studentId}`);
  };

  const generateRegisterNumber = () => {
    const year = new Date().getFullYear();
    const nextNumber = students.length + 1;
    return `REG${year}${nextNumber.toString().padStart(3, '0')}`;
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Register Number', 'Full Name', 'Email', 'Course', 'Department', 'Semester', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredStudents.map(student => [
        student.id,
        `"${student.register_number || student.student_id || 'N/A'}"`,
        `"${student.full_name || 'N/A'}"`,
        `"${student.email || 'N/A'}"`,
        `"${student.courses?.name || student.course_name || 'N/A'}"`,
        `"${student.courses?.departments?.name || 'N/A'}"`,
        student.current_semester || 'N/A',
        student.status || 'N/A'
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `students_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Render loading state
  if (loading && !showDeleteDialog) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 relative">
      {/* Loading overlay for async operations */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10">
          <LoadingSpinner size="md" />
        </div>
      )}
      {/* Header with stats and actions */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
            <p className="text-gray-600">Manage student records and information</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              <ArrowPathIcon className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={exportToCSV}
              className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              disabled={loading || filteredStudents.length === 0}
            >
              <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
              Export CSV
            </button>
            <button
              onClick={handleAddStudent}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              disabled={loading}
            >
              <UserPlusIcon className="h-4 w-4 mr-1" />
              Add Student
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <UserIcon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Students</p>
                  <p className="text-2xl font-semibold">{statistics.total}</p>
                </div>
              </div>
            </div>
            
            {/* Gender Statistics */}
            {statistics.byGender?.map(({ gender, count }) => (
              <div key={`gender-${gender}`} className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center">
                  <div className={`p-3 rounded-full ${
                    gender === 'Male' ? 'bg-blue-100 text-blue-600' :
                    gender === 'Female' ? 'bg-pink-100 text-pink-600' :
                    gender === 'Other' ? 'bg-purple-100 text-purple-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    <UserGroupIcon className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">{gender}</p>
                    <p className="text-2xl font-semibold">{count}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Department Statistics */}
            {statistics.byDepartment?.slice(0, 1).map(({ department_id, count }) => (
              <div key={`dept-${department_id}`} className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                    <BuildingOfficeIcon className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Departments</p>
                    <p className="text-2xl font-semibold">{statistics.byDepartment.length}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <FunnelIcon className="h-5 w-5 mr-2 text-gray-500" />
            Filters
          </h3>
          <button
            onClick={() => updateState({
              filters: { course: '', status: '', admission_year: '' },
              searchTerm: ''
            })}
            className="text-sm text-blue-600 hover:text-blue-800"
            disabled={loading}
          >
            Clear All
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search by name, email, or ID..."
              value={searchTerm}
              onChange={(e) => updateState({ searchTerm: e.target.value })}
              disabled={loading}
            />
            {isSearching && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>

          <select
            value={filters.course}
            onChange={(e) => updateState(prev => ({
              filters: { ...prev.filters, course: e.target.value },
              pagination: { ...prev.pagination, currentPage: 1 }
            }))}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            disabled={loading}
          >
            <option value="">All Courses</option>
            {COURSE_OPTIONS.map(course => (
              <option key={course} value={course}>{course}</option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(e) => updateState(prev => ({
              filters: { ...prev.filters, status: e.target.value },
              pagination: { ...prev.pagination, currentPage: 1 }
            }))}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            disabled={loading}
          >
            <option value="">All Status</option>
            {STATUS_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          <select
            value={filters.admission_year}
            onChange={(e) => updateState(prev => ({
              filters: { ...prev.filters, admission_year: e.target.value },
              pagination: { ...prev.pagination, currentPage: 1 }
            }))}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            disabled={loading}
          >
            <option value="">All Years</option>
            {Array.from({ length: 5 }, (_, i) => {
              const year = new Date().getFullYear() - i;
              return <option key={year} value={year}>{year}</option>;
            })}
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semester</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <UserIcon className="h-12 w-12 text-gray-300 mb-2" />
                      <p className="text-lg font-medium">
                        {isSearching ? 'Searching...' : 'No students found'}
                      </p>
                      {!isSearching && (searchTerm || Object.values(filters).some(Boolean)) && (
                        <button 
                          onClick={() => updateState({
                            searchTerm: '',
                            filters: { course: '', status: '', admission_year: '' },
                            pagination: { ...state.pagination, currentPage: 1 }
                          })}
                          className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, index) => (
                  <tr key={student.id || student.user_id || `student-${index}`} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {(student.full_name || '').split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{student.full_name}</div>
                          <div className="text-sm text-gray-500">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {student.courses?.name || student.course_name || 'No Course'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {student.register_number || student.student_id || 'No ID'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        Semester {student.current_semester || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        !student.status ? 'bg-gray-100 text-gray-800' :
                        student.status === 'active' ? 'bg-green-100 text-green-800' :
                        student.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                        student.status === 'graduated' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {student.status ? `${student.status.charAt(0).toUpperCase()}${student.status.slice(1)}` : 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleView(student.id)}
                          className="p-1 text-blue-600 hover:text-blue-900 rounded-full hover:bg-blue-50"
                          title="View Details"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => updateState({
                            editStudent: student,
                            showAddForm: true
                          })}
                          className="p-1 text-yellow-600 hover:text-yellow-900 rounded-full hover:bg-yellow-50"
                          title="Edit Student"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => confirmDelete(student)}
                          className="p-1 text-red-600 hover:text-red-900 rounded-full hover:bg-red-50"
                          title="Delete Student"
                          disabled={loading}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(pagination.currentPage - 1) * pagination.itemsPerPage + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}
                  </span>{' '}
                  of <span className="font-medium">{pagination.totalItems}</span> results
                </p>
              </div>
              <div>
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                  showPageNumbers={true}
                  showPrevNext={true}
                  showFirstLast={true}
                  className="border-gray-200"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Student Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editStudent ? 'Edit Student' : 'Add New Student'}
              </h2>
              <button
                onClick={() => updateState({ showAddForm: false, editStudent: null })}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <AddStudentForm
              initialData={editStudent}
              onSubmit={handleFormSubmit}
              onSuccess={() => {
                loadStudents();
                loadStatistics();
                updateState({ showAddForm: false, editStudent: null });
              }}
              onCancel={() => updateState({ showAddForm: false, editStudent: null })}
              loading={loading}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Student"
        message={`Are you sure you want to delete ${studentToDelete?.full_name || 'this student'}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={cancelDelete}
        isDanger={true}
      />
    </div>
  );
};

export default StudentManagement;
