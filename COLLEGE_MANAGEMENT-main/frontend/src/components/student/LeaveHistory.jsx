import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { format, parseISO } from 'date-fns';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

const LeaveHistory = ({ studentId }) => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedLeave, setExpandedLeave] = useState(null);

  useEffect(() => {
    const fetchLeaves = async () => {
      if (!studentId) return;

      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('leave_applications')
          .select('*')
          .or(`user_id.eq.${studentId},student_id.eq.${studentId}`)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setLeaves(data || []);
      } catch (err) {
        console.error('Error fetching leave applications:', err);
        setError('Failed to load leave history');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaves();
  }, [studentId]);

  const toggleExpand = (id) => {
    setExpandedLeave(expandedLeave === id ? null : id);
  };

  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'MMM d, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    } catch (e) {
      return timeString;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
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
    );
  }

  if (leaves.length === 0) {
    return (
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">You haven't submitted any leave applications yet.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {leaves.map((leave) => (
        <div key={leave.id} className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center">
                    <p className="text-sm font-medium text-blue-600 truncate">
                      Leave Application - {formatDate(leave.date_of_stay)}
                    </p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[leave.status?.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
                        {leave.status || 'Pending'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      Applied on {format(parseISO(leave.created_at), 'MMM d, yyyy h:mm a')}
                    </div>
                    {leave.time && (
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        {formatTime(leave.time)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5">
                  <button
                    type="button"
                    onClick={() => toggleExpand(leave.id)}
                    className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {expandedLeave === leave.id ? 'Show Less' : 'View Details'}
                  </button>
                </div>
              </div>

              {expandedLeave === leave.id && (
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Hostel & Room</h4>
                      <p className="mt-1 text-sm text-gray-600">
                        {leave.hostel_name || 'N/A'}{leave.room_number ? `, Room ${leave.room_number}` : ''}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Student Details</h4>
                      <p className="mt-1 text-sm text-gray-600">
                        {leave.roll_number} • {leave.branch} • {leave.year} Year
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <h4 className="text-sm font-medium text-gray-900">Reason for Leave</h4>
                      <p className="mt-1 text-sm text-gray-600 whitespace-pre-line">
                        {leave.reason || 'No reason provided'}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Contact Information</h4>
                      <p className="mt-1 text-sm text-gray-600">
                        Student: {leave.student_mobile || 'N/A'}<br />
                        Parent: {leave.parent_mobile || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Advisor Information</h4>
                      <p className="mt-1 text-sm text-gray-600">
                        {leave.advisor_name || 'N/A'}<br />
                        {leave.advisor_mobile ? `Contact: ${leave.advisor_mobile}` : ''}
                      </p>
                    </div>
                    {leave.updated_at && (
                      <div className="md:col-span-2">
                        <p className="text-xs text-gray-500 italic">
                          Last updated: {format(parseISO(leave.updated_at), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LeaveHistory;
