import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import '../../styles/RelievingRequest.css';

const RelievingRequest = ({ faculty, existingRequest, onRefresh }) => {
  const [isEditing, setIsEditing] = useState(!existingRequest);
  const [loading, setLoading] = useState(false);
  const [fileError, setFileError] = useState('');
  const [status, setStatus] = useState({
    loading: false,
    message: '',
    type: '' // 'success', 'error', 'info'
  });

  // Form State
  const [formData, setFormData] = useState({
    proposed_last_working_day: '',
    reason: '',
    file: null
  });

  // Load existing data if available
  useEffect(() => {
    if (existingRequest) {
      setFormData({
        proposed_last_working_day: existingRequest.proposed_last_working_day || '',
        reason: existingRequest.reason || '',
        file: null
      });
      setIsEditing(false);
    }
  }, [existingRequest]);

  // File Validation: PDF, JPG, PNG only (max 5MB)
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setFileError('Invalid file format. Please upload PDF, JPG, or PNG files only.');
        e.target.value = "";
        setFormData({ ...formData, file: null });
        return;
      }
      
      // Check file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (selectedFile.size > maxSize) {
        setFileError('File size too large. Maximum size is 5MB.');
        e.target.value = "";
        setFormData({ ...formData, file: null });
        return;
      }
      
      setFileError('');
      setFormData({ ...formData, file: selectedFile });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous status
    setStatus({ loading: true, message: 'Submitting your request...', type: 'info' });
    
    // Validate form
    if (!formData.proposed_last_working_day) {
      setStatus({
        loading: false,
        message: 'Please select a proposed last working day',
        type: 'error'
      });
      return;
    }
    
    if (!formData.reason || formData.reason.trim().length < 10) {
      setStatus({
        loading: false,
        message: 'Please provide a detailed reason for leaving (minimum 10 characters)',
        type: 'error'
      });
      return;
    }
    
    // File is required for new requests
    if (!existingRequest && !formData.file) {
      setFileError("Please upload your resignation letter (Mandatory)");
      setStatus({
        loading: false,
        message: 'Please upload your resignation letter',
        type: 'error'
      });
      return;
    }

    setLoading(true);

    try {
      let fileUrl = existingRequest?.resignation_letter_url || null;
      setStatus({ loading: true, message: 'Uploading document...', type: 'info' });

      // 1. Upload File to Storage if a new file is provided
      if (formData.file) {
        const fileExt = formData.file.name.split('.').pop();
        const fileName = `${faculty.id}/${Date.now()}.${fileExt}`;
        
        // Upload to S3 bucket
        const { error: uploadError } = await supabase.storage
          .from('resignation-letters')
          .upload(fileName, formData.file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data } = supabase.storage
          .from('resignation-letters')
          .getPublicUrl(fileName);
          
        fileUrl = data.publicUrl;
      }

      // 2. Prepare Payload based on the schema
      const payload = {
        faculty_id: faculty.id,
        proposed_last_working_day: formData.proposed_last_working_day,
        reason: formData.reason,
        resignation_letter_url: fileUrl,
        status: 'SUBMITTED',
        applied_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Initialize all boolean flags as false
        relieving_letter_ready: false,
        experience_cert_ready: false,
        service_cert_ready: false,
        settlement_ready: false
      };

      // 3. Database Operation
      if (existingRequest) {
        const { error: updateError } = await supabase
          .from('relieving_requests')
          .update(payload)
          .eq('id', existingRequest.id);
          
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('relieving_requests')
          .insert([payload]);
          
        if (insertError) throw insertError;
      }

      setStatus({
        loading: false,
        message: 'Relieving request submitted successfully!',
        type: 'success'
      });
      
      // Show success message for 2 seconds before refreshing
      setTimeout(() => {
        onRefresh(); // Refresh dashboard to show the status view
        setIsEditing(false);
      }, 1500);

    } catch (error) {
      console.error("Submission Error:", error);
      setStatus({
        loading: false,
        message: `Submission failed: ${error.message || 'An error occurred. Please try again.'}`,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const ApplicantDetails = () => (
    <div className="applicant-details">
      <span className="applicant-title">Faculty Information</span>
      <div className="applicant-grid">
        <div className="detail-item">
          <span className="detail-label">Full Name</span>
          <span className="detail-value">{faculty?.full_name || 'Not Available'}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Employee ID</span>
          <span className="detail-value">{faculty?.employee_id || 'Not Available'}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Designation</span>
          <span className="detail-value">{faculty?.designation || 'N/A'}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Department</span>
          <span className="detail-value">{faculty?.department_id || 'N/A'}</span>
        </div>
      </div>
    </div>
  );

  // --- VIEW 1: STATUS VIEW (Read Only) ---
  if (!isEditing && existingRequest) {
    // Enhanced status configuration
    const statusConfig = {
      SUBMITTED: {
        text: 'Under Review',
        description: 'Your request has been submitted and is under review by the admin.',
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
        color: 'blue',
        showDocuments: false,
        showSettlement: false
      },
      APPROVED: {
        text: 'Approved',
        description: 'Your request has been approved. Please check the document status below.',
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        ),
        color: 'green',
        showDocuments: true,
        showSettlement: true
      },
      REJECTED: {
        text: 'Rejected',
        description: 'Your request has been rejected. Please see remarks below.',
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ),
        color: 'red',
        showDocuments: false,
        showSettlement: false
      }
    };

    const status = statusConfig[existingRequest.status] || {
      text: 'Unknown',
      description: 'The current status of your request could not be determined.',
      icon: null,
      color: 'gray'
    };

    const statusColor = {
      blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
      green: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
      red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
      gray: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' }
    }[status.color];

    // Format dates and times
    const formatDate = (dateString) => {
      if (!dateString) return 'Not specified';
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      try {
        return new Date(dateString).toLocaleDateString(undefined, options);
      } catch (e) {
        return 'Invalid date';
      }
    };

    const formatDateTime = (dateTimeString) => {
      if (!dateTimeString) return 'Not specified';
      const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      try {
        return new Date(dateTimeString).toLocaleString(undefined, options);
      } catch (e) {
        return 'Invalid date/time';
      }
    };

    return (
      <div className="request-card space-y-6">
        {/* Status Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Relieving Request Status</h2>
            <p className="text-gray-500">Track the progress of your request</p>
          </div>
          <div className={`inline-flex items-center px-4 py-2 rounded-full ${statusColor.bg} ${statusColor.border}`}>
            <span className={`inline-flex items-center ${statusColor.text} text-sm font-medium`}>
              {status.icon && <span className="mr-2">{status.icon}</span>}
              {status.text}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {/* Status Timeline */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Request Timeline</h3>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              
              {/* Submitted Step */}
              <div className="relative pl-12 pb-6">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${existingRequest.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                    {existingRequest.status === 'SUBMITTED' ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-4">
                    <h4 className="text-base font-medium text-gray-900">Request Submitted</h4>
                    <p className="text-sm text-gray-500">{formatDate(existingRequest.applied_date)}</p>
                  </div>
                </div>
              </div>
              
              {/* Status Step */}
              <div className="relative pl-12 pb-6">
                <div className="flex items-start">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    existingRequest.status === 'SUBMITTED' 
                      ? 'bg-blue-100 text-blue-600' 
                      : existingRequest.status === 'APPROVED' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                  }`}>
                    {status.icon}
                  </div>
                  <div className="ml-4">
                    <h4 className="text-base font-medium text-gray-900">
                      {status.text}
                      {existingRequest.status === 'APPROVED' && existingRequest.approved_date && (
                        <span className="ml-2 text-sm font-normal text-gray-500">
                          (Approved on {formatDate(existingRequest.approved_date)})
                        </span>
                      )}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">{status.description}</p>
                    {existingRequest.status === 'REJECTED' && existingRequest.admin_remarks && (
                      <div className="mt-2 p-3 bg-red-50 border border-red-100 rounded-md">
                        <h5 className="text-sm font-medium text-red-800">Admin Remarks:</h5>
                        <p className="text-sm text-red-700 mt-1">{existingRequest.admin_remarks}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Next Steps */}
              {existingRequest.status === 'APPROVED' && (
                <div className="relative pl-12">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-base font-medium text-gray-900">Next Steps</h4>
                      <p className="text-sm text-gray-600">
                        Your last working day is scheduled for <span className="font-medium">{formatDate(existingRequest.proposed_last_working_day)}</span>.
                        Please complete the handover process before this date.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Request Details */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Request Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Request ID</h4>
                <p className="mt-1 text-base text-gray-900 font-mono">{existingRequest.id}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Submitted On</h4>
                <p className="mt-1 text-base text-gray-900">{formatDateTime(existingRequest.applied_date)}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Proposed Last Working Day</h4>
                <p className="mt-1 text-base text-gray-900">{formatDate(existingRequest.proposed_last_working_day)}</p>
              </div>
              {existingRequest.status === 'APPROVED' && existingRequest.approved_last_working_day && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Approved Last Working Day</h4>
                  <p className="mt-1 text-base font-medium text-green-600">
                    {formatDate(existingRequest.approved_last_working_day)}
                  </p>
                </div>
              )}
              {existingRequest.updated_at && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Last Updated</h4>
                  <p className="mt-1 text-sm text-gray-900">{formatDateTime(existingRequest.updated_at)}</p>
                </div>
              )}
              {existingRequest.resignation_letter_url && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Resignation Letter</h4>
                  <a 
                    href={existingRequest.resignation_letter_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    View Document
                  </a>
                </div>
              )}
            </div>
            
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-500">Reason for Leaving</h4>
              <p className="mt-1 text-base text-gray-900 whitespace-pre-line bg-gray-50 p-3 rounded">
                {existingRequest.reason || 'No reason provided.'}
              </p>
            </div>

            {/* Document Status - Only show if request is approved */}
            {status.showDocuments && (
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Document Status</h3>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-100 text-blue-600">
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">Relieving Letter</div>
                              <div className="text-sm text-gray-500">Official relieving letter from the institution</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {existingRequest.relieving_letter_ready ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Ready
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Pending
                            </span>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-100 text-blue-600">
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">Experience Certificate</div>
                              <div className="text-sm text-gray-500">Proof of employment and experience</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {existingRequest.experience_cert_ready ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Ready
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Pending
                            </span>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">Service Certificate</div>
                              <div className="text-sm text-gray-500">Confirmation of service details</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {existingRequest.service_cert_ready ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Ready
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Pending
                            </span>
                          )}
                        </td>
                      </tr>
                      {status.showSettlement && (
                        <tr className="bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-purple-100 text-purple-600">
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">Settlement Status</div>
                                <div className="text-sm text-gray-500">Financial and asset settlement</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {existingRequest.settlement_ready ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Completed
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Pending
                              </span>
                            )}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  {existingRequest.settlement_ready 
                    ? "All your documents are ready. Please collect them from the HR department."
                    : "Documents will be marked as 'Ready' once they are prepared by the HR department."}
                </p>
              </div>
            )}

            {/* Admin Remarks - Show only if exists */}
            {existingRequest.admin_remarks && (
              <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Admin Remarks</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p className="whitespace-pre-line">{existingRequest.admin_remarks}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
          {existingRequest.status === 'REJECTED' ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex-1 text-center"
            >
              Edit & Resubmit Request
            </button>
          ) : (
            <div className="text-center w-full py-2 text-sm text-gray-500">
              {existingRequest.status === 'SUBMITTED' 
                ? 'Your request is currently under review. You will be notified once a decision is made.'
                : 'If you have any questions, please contact the HR department.'}
            </div>
          )}
          
          {existingRequest.status === 'SUBMITTED' && (
            <button 
              onClick={() => {
                if (window.confirm('Are you sure you want to withdraw this request?')) {
                  // Handle withdraw action
                  alert('Withdraw functionality will be implemented here');
                }
              }}
              className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex-1 text-center"
            >
              Withdraw Request
            </button>
          )}
        </div>
      </div>
    </div>
    );
  }

  // --- VIEW 2: FORM VIEW ---
  return (
    <div className="request-card">
      <h2 className="text-xl font-bold mb-6">Submit Relieving Request</h2>
      
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-700 mb-3">Faculty Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Full Name</p>
            <p className="font-medium">{faculty?.full_name || 'N/A'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Employee ID</p>
            <p className="font-medium">{faculty?.employee_id || 'N/A'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Designation</p>
            <p className="font-medium">{faculty?.designation || 'N/A'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Department</p>
            <p className="font-medium">{faculty?.department_id || 'N/A'}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="form-group">
          <label className="form-label font-medium block mb-2">
            Proposed Last Working Day <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]} // Prevent past dates
              className="form-input w-full border border-gray-300 p-2.5 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.proposed_last_working_day}
              onChange={(e) => setFormData({ ...formData, proposed_last_working_day: e.target.value })}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Select the date you plan to be your last working day
          </p>
        </div>

        <div className="form-group">
          <label className="form-label font-medium block mb-2">
            Reason for Resignation <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows={5}
            className="form-input w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Please provide a detailed reason for your resignation..."
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          />
          <p className="mt-1 text-sm text-gray-500">
            Minimum 10 characters. Your feedback helps us improve.
          </p>
        </div>

        <div className="form-group">
          <label className="form-label font-medium block mb-2">
            Upload Resignation Letter <span className="text-red-500">*</span>
          </label>
          <div className={`file-upload-box border-2 border-dashed rounded-lg transition-colors ${
            formData.file ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50 hover:border-blue-400'
          } p-6 text-center`}>
            <input
              type="file"
              id="resignation-letter"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={handleFileChange}
              required={!existingRequest}
            />
            <label 
              htmlFor="resignation-letter" 
              className="cursor-pointer flex flex-col items-center justify-center space-y-2"
            >
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <div className="text-sm text-gray-600">
                {formData.file ? (
                  <span className="font-medium text-green-600">{formData.file.name}</span>
                ) : (
                  <>
                    <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                    <p className="text-xs text-gray-500 mt-1">PDF, JPG, or PNG (max 5MB)</p>
                  </>
                )}
              </div>
            </label>
          </div>
          {fileError && <p className="mt-1 text-sm text-red-600">{fileError}</p>}
        </div>

        <div className="flex gap-3 pt-4">
          {existingRequest && (
            <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary flex-1 py-3 border rounded">
              Cancel
            </button>
          )}
          <button 
            type="submit" 
            disabled={loading} 
            className={`btn btn-primary flex-1 py-3 ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded font-bold transition-colors flex items-center justify-center`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : 'Submit Request'}
          </button>
        </div>

        {/* Status Message */}
        {status.message && (
          <div 
            className={`mt-4 p-4 rounded-md ${
              status.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 
              status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 
              'bg-blue-50 text-blue-700 border border-blue-200'
            }`}
          >
            <div className="flex items-center">
              {status.loading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : status.type === 'error' ? (
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : status.type === 'success' ? (
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <p className="text-sm font-medium">{status.message}</p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default RelievingRequest;
