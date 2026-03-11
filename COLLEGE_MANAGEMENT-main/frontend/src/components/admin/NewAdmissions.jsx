import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  MagnifyingGlassIcon,
  EyeIcon,
  DocumentArrowDownIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  AcademicCapIcon,
  HomeIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  under_review: 'bg-blue-100 text-blue-800',
  waitlisted: 'bg-gray-100 text-gray-800'
};

const statusIcons = {
  pending: <ClockIcon className="h-4 w-4" />,
  approved: <CheckCircleIcon className="h-4 w-4" />,
  rejected: <XCircleIcon className="h-4 w-4" />,
  under_review: <ClockIcon className="h-4 w-4" />,
  waitlisted: <ClockIcon className="h-4 w-4" />
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatAge = (dateString) => {
  if (!dateString) return 'N/A';
  const today = new Date();
  const birthDate = new Date(dateString);
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    return age - 1;
  }
  return age;
};

const NewAdmissions = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch applications from Supabase
  useEffect(() => {
    const loadApplications = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let query = supabase
          .from('admissions')
          .select('*', { count: 'exact' });

        // Apply status filter
        if (statusFilter !== 'all') {
          query = query.eq('status', statusFilter);
        }

        // Apply course filter
        if (courseFilter !== 'all') {
          query = query.eq('course_applied', courseFilter);
        }

        // Apply search filter
        if (searchTerm.trim() !== '') {
          const search = `%${searchTerm}%`;
          query = query.or(
            `first_name.ilike.${search},last_name.ilike.${search},email.ilike.${search},phone.ilike.${search}`
          );
        }

        // Add pagination
        const from = page * rowsPerPage;
        const to = from + rowsPerPage - 1;

        const { data, error, count } = await query
          .order('created_at', { ascending: false })
          .range(from, to);

        if (error) throw error;

        setApplications(data || []);
        setTotalCount(count || 0);
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, [statusFilter, courseFilter, searchTerm, page, rowsPerPage]);

  // Define allowed status values based on database enum (must be lowercase)
  const allowedStatusValues = ['pending', 'approved', 'rejected'];

  // Function to normalize status to lowercase enum values
  const normalizeStatus = (status) => {
    if (!status) return 'pending';
    return status.toLowerCase();
  };

  // Function to display status with proper formatting
  const displayStatus = (status) => {
    if (!status) return 'Pending';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Debug function to test status updates
  const testStatusUpdate = async (applicationId) => {
    try {
      console.log('Testing status update for application:', applicationId);
      
      // First, get current status
      const { data: currentApp, error: fetchError } = await supabase
        .from('admissions')
        .select('status')
        .eq('id', applicationId)
        .single();

      if (fetchError) {
        console.error('Error fetching current status:', fetchError);
        return;
      }

      console.log('Current status:', currentApp.status);

      // Try updating to the same status first
      const { error: updateError } = await supabase
        .from('admissions')
        .update({ 
          status: currentApp.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (updateError) {
        console.error('Error updating to same status:', updateError);
      } else {
        console.log('Successfully updated to same status');
      }

    } catch (err) {
      console.error('Test error:', err);
    }
  };

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      // Normalize status to lowercase enum value
      const normalizedStatus = normalizeStatus(newStatus);
      
      console.log('Attempting to update status to:', normalizedStatus);

      const { error } = await supabase
        .from('admissions')
        .update({ 
          status: normalizedStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (error) {
        console.error('Database error:', error);
        
        // Handle check constraint error specifically
        if (error.code === '23514' && error.message.includes('admissions_status_check')) {
          // Try to get current status to understand what's allowed
          const { data: currentApp } = await supabase
            .from('admissions')
            .select('status')
            .eq('id', applicationId)
            .single();
          
          const currentStatus = currentApp?.status || 'unknown';
          throw new Error(`Cannot change status from "${currentStatus}" to "${normalizedStatus}". Database constraint violation. Status must be one of: ${allowedStatusValues.join(', ')}`);
        }
        throw error;
      }

      console.log('Status updated successfully to:', normalizedStatus);

      // Refresh the data
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: normalizedStatus, updated_at: new Date().toISOString() }
            : app
        )
      );
    } catch (err) {
      console.error('Error updating status:', err);
      alert(err.message || 'Failed to update status');
    }
  };

  const StatusDropdown = ({ application, onUpdate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    const handleStatusChange = async (newStatus) => {
      setIsUpdating(true);
      setIsOpen(false);
      await onUpdate(application.id, newStatus);
      setIsUpdating(false);
    };

    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isUpdating}
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
            statusColors[normalizeStatus(application.status)] || statusColors.pending
          } ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'}`}
        >
          {isUpdating ? (
            <div className="animate-spin rounded-full h-3 w-3 border-b border-white mr-1"></div>
          ) : (
            statusIcons[normalizeStatus(application.status)]
          )}
          {displayStatus(application.status)}
          <svg className="ml-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-1 w-40 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
            <div className="py-1 max-h-64 overflow-y-auto">
              <button
                onClick={() => handleStatusChange('pending')}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center whitespace-nowrap"
              >
                <span className="w-4 h-4 mr-2">⏳</span>
                Pending
              </button>
              <button
                onClick={() => handleStatusChange('approved')}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center whitespace-nowrap"
              >
                <span className="w-4 h-4 mr-2">✅</span>
                Approved
              </button>
              <button
                onClick={() => handleStatusChange('rejected')}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center whitespace-nowrap"
              >
                <span className="w-4 h-4 mr-2">❌</span>
                Rejected
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const viewDocument = (url, filename) => {
    if (url) {
      window.open(url, '_blank');
    } else {
      alert(`${filename} not uploaded`);
    }
  };

  const getUniqueCourses = () => {
    const courses = [...new Set(applications.map(app => app.course_applied).filter(Boolean))];
    return courses;
  };

  const ApplicationModal = ({ application, onClose }) => {
    if (!application) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Application Details</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <UserIcon className="h-5 w-5 mr-2" />
                  Personal Information
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p><span className="font-medium">Name:</span> {application.first_name} {application.last_name}</p>
                  <p><span className="font-medium">Date of Birth:</span> {formatDate(application.date_of_birth)} ({formatAge(application.date_of_birth)} years)</p>
                  <p><span className="font-medium">Gender:</span> {application.gender}</p>
                  <p><span className="font-medium">Nationality:</span> {application.nationality}</p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <EnvelopeIcon className="h-5 w-5 mr-2" />
                  Contact Information
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p><span className="font-medium">Email:</span> {application.email}</p>
                  <p><span className="font-medium">Phone:</span> {application.phone}</p>
                  <p><span className="font-medium">Address:</span> {application.address}</p>
                  <p><span className="font-medium">City:</span> {application.city}, {application.state}</p>
                  <p><span className="font-medium">Pincode:</span> {application.pincode}</p>
                </div>
              </div>

              {/* Guardian Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <UserIcon className="h-5 w-5 mr-2" />
                  Guardian Information
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p><span className="font-medium">Name:</span> {application.guardian_name}</p>
                  <p><span className="font-medium">Relationship:</span> {application.guardian_relationship}</p>
                  <p><span className="font-medium">Occupation:</span> {application.guardian_occupation}</p>
                  <p><span className="font-medium">Phone:</span> {application.guardian_phone}</p>
                </div>
              </div>

              {/* Academic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <AcademicCapIcon className="h-5 w-5 mr-2" />
                  Academic Information
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p><span className="font-medium">Previous School:</span> {application.previous_school}</p>
                  <p><span className="font-medium">10th Marks:</span> {application.tenth_marks}%</p>
                  <p><span className="font-medium">12th Marks:</span> {application.twelfth_marks}%</p>
                  <p><span className="font-medium">Graduation Marks:</span> {application.graduation_marks}%</p>
                  <p><span className="font-medium">Category:</span> {application.category}</p>
                </div>
              </div>

              {/* Course Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <AcademicCapIcon className="h-5 w-5 mr-2" />
                  Course Applied
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p><span className="font-medium">Course:</span> {application.course_applied}</p>
                  <p><span className="font-medium">Branch:</span> {application.branch}</p>
                  <p><span className="font-medium">Require Hostel:</span> {application.require_hostel ? 'Yes' : 'No'}</p>
                  <p><span className="font-medium">Require Transport:</span> {application.require_transport ? 'Yes' : 'No'}</p>
                </div>
              </div>

              {/* Documents */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                  Documents
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <button
                    onClick={() => viewDocument(application.photo_path, 'Photo')}
                    className="block w-full text-left hover:bg-gray-100 p-2 rounded"
                  >
                    📸 Photograph {application.photo_path ? '✓' : '✗'}
                  </button>
                  <button
                    onClick={() => viewDocument(application.signature_path, 'Signature')}
                    className="block w-full text-left hover:bg-gray-100 p-2 rounded"
                  >
                    ✍️ Signature {application.signature_path ? '✓' : '✗'}
                  </button>
                  <button
                    onClick={() => viewDocument(application.marksheet_path, 'Marksheet')}
                    className="block w-full text-left hover:bg-gray-100 p-2 rounded"
                  >
                    📄 Marksheet {application.marksheet_path ? '✓' : '✗'}
                  </button>
                  <button
                    onClick={() => viewDocument(application.id_proof_path, 'ID Proof')}
                    className="block w-full text-left hover:bg-gray-100 p-2 rounded"
                  >
                    🆔 ID Proof {application.id_proof_path ? '✓' : '✗'}
                  </button>
                  <button
                    onClick={() => viewDocument(application.other_docs_path, 'Other Documents')}
                    className="block w-full text-left hover:bg-gray-100 p-2 rounded"
                  >
                    📋 Other Documents {application.other_docs_path ? '✓' : '✗'}
                  </button>
                </div>
              </div>
            </div>

            {/* Status Update Actions */}
            <div className="mt-6 flex justify-between items-center border-t pt-4">
              <div className="flex items-center space-x-2">
                <span className="font-medium">Current Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[application.status] || statusColors.pending}`}>
                  {statusIcons[application.status]}
                  {application.status || 'pending'}
                </span>
              </div>
              <div className="flex space-x-2">
                {application.status !== 'approved' && (
                  <button
                    onClick={() => handleStatusUpdate(application.id, 'approved')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Approve
                  </button>
                )}
                {application.status !== 'rejected' && (
                  <button
                    onClick={() => handleStatusUpdate(application.id, 'rejected')}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Reject
                  </button>
                )}
                {application.status === 'pending' && (
                  <button
                    onClick={() => handleStatusUpdate(application.id, 'under_review')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Under Review
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admission Applications</h1>
        <p className="text-gray-600 mt-2">Manage and review student admission applications</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Courses</option>
            {getUniqueCourses().map(course => (
              <option key={course} value={course}>{course}</option>
            ))}
          </select>

          <div className="text-sm text-gray-600 flex items-center">
            Total: {totalCount} applications
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-600">
            <p>Error loading applications: {error}</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No applications found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applicant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Academic Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applied On
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-medium">
                              {app.first_name?.charAt(0)}{app.last_name?.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {app.first_name} {app.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {app.gender}, {formatAge(app.date_of_birth)} years
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{app.email}</div>
                      <div className="text-sm text-gray-500">{app.phone}</div>
                      <div className="text-sm text-gray-500">{app.city}, {app.state}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{app.course_applied}</div>
                      <div className="text-sm text-gray-500">{app.branch}</div>
                      <div className="text-xs text-gray-400">
                        {app.require_hostel && '🏠 Hostel '}
                        {app.require_transport && '🚌 Transport'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{app.previous_school}</div>
                      <div className="text-sm text-gray-500">
                        10th: {app.tenth_marks}% | 12th: {app.twelfth_marks}%
                      </div>
                      <div className="text-xs text-gray-400">Category: {app.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusDropdown 
                        application={{...app, status: normalizeStatus(app.status)}} 
                        onUpdate={handleStatusUpdate}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(app.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedApplication(app);
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => testStatusUpdate(app.id)}
                        className="text-gray-600 hover:text-gray-900 mr-3"
                        title="Debug Status Update"
                      >
                        🐛
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && applications.length > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={(page + 1) * rowsPerPage >= totalCount}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">
                    {page * rowsPerPage + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-medium">
                    {Math.min((page + 1) * rowsPerPage, totalCount)}
                  </span>{' '}
                  of{' '}
                  <span className="font-medium">{totalCount}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={(page + 1) * rowsPerPage >= totalCount}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <ApplicationModal
          application={selectedApplication}
          onClose={() => {
            setShowModal(false);
            setSelectedApplication(null);
          }}
        />
      )}
    </div>
  );
};

export default NewAdmissions;
