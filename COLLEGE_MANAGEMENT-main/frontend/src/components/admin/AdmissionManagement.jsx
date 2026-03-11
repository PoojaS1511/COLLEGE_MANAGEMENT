import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserPlusIcon,
  MagnifyingGlassIcon,
  DocumentArrowUpIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { admissionsService } from '../../services/admissionsService';
import toast from 'react-hot-toast';

const AdmissionManagement = () => {
  const navigate = useNavigate();
  const [admissions, setAdmissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    courseStats: []
  });

  // Fetch admissions data
  const fetchAdmissions = async () => {
    try {
      setIsLoading(true);
      const filters = {
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: searchTerm || undefined,
        offset: (pagination.page - 1) * pagination.limit,
        limit: pagination.limit
      };

      const { data, count } = await admissionsService.getAdmissions(filters);
      
      setAdmissions(data);
      setPagination(prev => ({ ...prev, total: count || 0 }));
      
      // Fetch stats if not already loaded
      if (stats.total === 0) {
        fetchAdmissionStats();
      }
    } catch (error) {
      console.error('Error fetching admissions:', error);
      toast.error('Failed to load admission applications');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch admission statistics
  const fetchAdmissionStats = async () => {
    try {
      // Get general admission stats
      const statsData = await admissionsService.getAdmissionStats();
      
      // Get course-wise stats
      const courseStats = await admissionsService.getAdmissionStatsByCourse();
      
      setStats(prev => ({
        ...prev,
        total: statsData.statusCounts.total || 0,
        pending: statsData.statusCounts.pending || 0,
        approved: statsData.statusCounts.approved || 0,
        rejected: statsData.statusCounts.rejected || 0,
        courseStats: courseStats || []
      }));
    } catch (error) {
      console.error('Error fetching admission stats:', error);
      toast.error('Failed to load admission statistics');
    }
  };

  // Initial data load
  useEffect(() => {
    fetchAdmissions();
  }, [pagination.page, pagination.limit, statusFilter, searchTerm]);

  // Handle status filter change
  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on new search
  };

  // Handle new admission button click
  const handleNewAdmission = () => {
    navigate('/admissions'); // This should match your admission form route
  };

  // Handle status update
  const handleStatusUpdate = (id, newStatus) => {
    // In a real app, you would make an API call here
    // For now, we'll just update the local state
    setAdmissions(prev => 
      prev.map(admission => 
        admission.id === id 
          ? { ...admission, status: newStatus } 
          : admission
      )
    );
  };

  // Filter admissions based on search term and status filter
  const filteredAdmissions = React.useMemo(() => {
    return admissions.filter(admission => {
      // Filter by search term
      const matchesSearch = searchTerm === '' || 
        `${admission.first_name || ''} ${admission.last_name || ''} ${admission.email || ''} ${admission.phone || ''}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      
      // Filter by status
      const matchesStatus = statusFilter === 'all' || admission.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [admissions, searchTerm, statusFilter]);

  // Status options for the dropdown
  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'approved', label: 'Approved', color: 'bg-green-100 text-green-800' },
    { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' },
  ];

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status) => {
    const iconClass = 'h-5 w-5 mr-1';
    switch (status) {
      case 'approved':
        return <CheckCircleIcon className={`${iconClass} text-green-500`} />;
      case 'rejected':
        return <XCircleIcon className={`${iconClass} text-red-500`} />;
      case 'pending':
      default:
        return <ClockIcon className={`${iconClass} text-yellow-500`} />;
    }
  };

  // Get status display info
  const getStatusInfo = (status) => {
    return statusOptions.find(option => option.value === status) || 
           { value: status, label: status, color: 'bg-gray-100 text-gray-800' };
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <ArrowPathIcon className="animate-spin h-8 w-8 text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Admission Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            View and manage student admission applications
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => navigate('/admin/admissions/new')}
          >
            <UserPlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            New Application
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <DocumentArrowUpIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Applications</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{stats.total}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <ClockIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending Review</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{stats.pending}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <CheckCircleIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Approved</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{stats.approved}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                <XCircleIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Rejected</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{stats.rejected}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <form className="w-full sm:w-96" onSubmit={handleSearch}>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2 border"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </form>
          
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                statusFilter === 'all' 
                  ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' 
                  : 'text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
              onClick={() => handleStatusFilter('all')}
            >
              All
            </button>
            <button
              type="button"
              className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center ${
                statusFilter === 'pending' 
                  ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                  : 'text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
              onClick={() => handleStatusFilter('pending')}
            >
              <ClockIcon className="h-4 w-4 mr-1" />
              Pending ({stats.pending})
            </button>
            <button
              type="button"
              className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center ${
                statusFilter === 'approved' 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
              onClick={() => handleStatusFilter('approved')}
            >
              <CheckCircleIcon className="h-4 w-4 mr-1" />
              Approved ({stats.approved})
            </button>
            <button
              type="button"
              className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center ${
                statusFilter === 'rejected' 
                  ? 'bg-red-100 text-red-800 border border-red-200' 
                  : 'text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
              onClick={() => handleStatusFilter('rejected')}
            >
              <XCircleIcon className="h-4 w-4 mr-1" />
              Rejected ({stats.rejected})
            </button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <ArrowPathIcon className="animate-spin h-8 w-8 text-indigo-600" />
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredAdmissions.length === 0 ? (
                <li className="px-6 py-12 text-center">
                  <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No applications found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {statusFilter !== 'all' 
                      ? `No ${statusFilter} applications found.` 
                      : 'Get started by creating a new application.'}
                  </p>
                  <div className="mt-6">
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      onClick={() => navigate('/admin/admissions/new')}
                    >
                      <UserPlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                      New Application
                    </button>
                  </div>
                </li>
              ) : (
                <>{filteredAdmissions.map((admission) => (
                  <li key={admission.id} className="hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          {admission.first_name} {admission.last_name}
                          {admission.courses && (
                            <span className="ml-2 text-xs font-normal text-gray-500">
                              ({admission.courses.name || 'No course'})
                            </span>
                          )}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex items-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(admission.status)}`}>
                            {getStatusIcon(admission.status)}
                            {admission.status.charAt(0).toUpperCase() + admission.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex space-y-1 sm:space-y-0 sm:space-x-4">
                          <div className="flex items-center text-sm text-gray-500">
                            <span className="truncate">{admission.email}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <span className="truncate">{admission.phone}</span>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <span>
                            Applied on{' '}
                            <time dateTime={admission.created_at}>
                              {new Date(admission.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </time>
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}</>
              )}
              
              {/* Pagination */}
              {pagination.total > pagination.limit && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                        pagination.page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page * pagination.limit >= pagination.total}
                      className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                        pagination.page * pagination.limit >= pagination.total ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                        <span className="font-medium">
                          {Math.min(pagination.page * pagination.limit, pagination.total)}
                        </span>{' '}
                        of <span className="font-medium">{pagination.total}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => handlePageChange(pagination.page - 1)}
                          disabled={pagination.page === 1}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                            pagination.page === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          <span className="sr-only">Previous</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        
                        {/* Page numbers */}
                        {Array.from({ length: Math.ceil(pagination.total / pagination.limit) }, (_, i) => i + 1).map((pageNum) => (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              pagination.page === pageNum
                                ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        ))}
                        
                        <button
                          onClick={() => handlePageChange(pagination.page + 1)}
                          disabled={pagination.page * pagination.limit >= pagination.total}
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                            pagination.page * pagination.limit >= pagination.total ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          <span className="sr-only">Next</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdmissionManagement;
