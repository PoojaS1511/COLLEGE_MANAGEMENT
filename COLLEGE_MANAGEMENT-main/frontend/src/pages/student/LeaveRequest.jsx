import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "../../lib/supabase";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import { useStudent } from '../../contexts/StudentContext';

const LeaveRequest = () => {
  const [formData, setFormData] = useState({
    date_of_stay: '',
    time: '',
    reason: '',
    student_mobile: '',
    parent_mobile: '',
    informed_advisor: 'no',
    advisor_name: '',
    advisor_mobile: '',
    roll_number: '' // Match the database column name
  });
  
  const [loading, setLoading] = useState(false);
  const { student: userData, loading: studentLoading, user } = useStudent();
  const navigate = useNavigate();

  useEffect(() => {
    if (userData) {
      // Pre-fill form with user data when student data is available
      setFormData(prev => ({
        ...prev,
        student_mobile: userData.phone || '',
        parent_mobile: userData.parent_phone || '',
        hostel_name: userData.hostel_name || '',
        room_number: userData.room_number || '',
        name: userData.name || '',
        roll_number: userData.roll_number || '', // Update roll number field name to match the database schema
        branch: userData.branch || '',
        year: userData.year || '',
        semester: userData.semester || ''
      }));
    }
  }, [userData]);

  if (studentLoading) {
    return <div>Loading student data...</div>;
  }

  if (!userData) {
    return (
      <div className="p-4">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Please complete your student profile before submitting a leave request.
              </p>
              <div className="mt-2">
                <button
                  onClick={() => navigate('/profile')}
                  className="text-sm font-medium text-yellow-700 hover:text-yellow-600 underline"
                >
                  Go to Profile <span aria-hidden="true">&rarr;</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('leave_applications')
        .insert([
          {
            ...formData,
            user_id: userData?.user_id,
            email: userData?.email,
            name: userData?.name,
            roll_number: userData?.roll_no || userData?.roll_number,
            branch: userData?.branch,
            year: userData?.year,
            semester: userData?.semester,
            status: 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;

      toast.success('Leave application submitted successfully!');
      navigate('/student/hostel');
    } catch (error) {
      console.error('Error submitting leave application:', error);
      toast.error(error.message || 'Failed to submit leave application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <DocumentTextIcon className="h-8 w-8 text-indigo-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-800">Leave Application</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-medium text-gray-700 mb-4">Student Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={userData?.name || ''}
                  disabled
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Roll Number</label>
                <input
                  type="text"
                  value={userData?.roll_no || userData?.roll_number || ''}
                  disabled
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Branch</label>
                <input
                  type="text"
                  value={userData?.branch || ''}
                  disabled
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Year & Semester</label>
                <input
                  type="text"
                  value={`${userData?.year || ''} - ${userData?.semester || ''}`}
                  disabled
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-100"
                />
              </div>
            </div>
          </div>

          {/* Leave Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-medium text-gray-700 mb-4">Leave Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Date of Leave <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  name="date_of_stay"
                  value={formData.date_of_stay}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Time <span className="text-red-500">*</span></label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Hostel Name</label>
                <input
                  type="text"
                  name="hostel_name"
                  value={formData.hostel_name || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Room Number</label>
                <input
                  type="text"
                  name="room_number"
                  value={formData.room_number || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Reason for Leave <span className="text-red-500">*</span></label>
                <textarea
                  name="reason"
                  rows={3}
                  value={formData.reason}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Please provide a detailed reason for your leave"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-medium text-gray-700 mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Student Mobile <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  name="student_mobile"
                  value={formData.student_mobile}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Your mobile number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Parent/Guardian Mobile <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  name="parent_mobile"
                  value={formData.parent_mobile}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Parent/Guardian mobile number"
                />
              </div>
            </div>
          </div>

          {/* Advisor Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-4">
              <input
                id="informed_advisor"
                name="informed_advisor"
                type="checkbox"
                checked={formData.informed_advisor === 'yes'}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  informed_advisor: e.target.checked ? 'yes' : 'no'
                }))}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="informed_advisor" className="ml-2 block text-sm text-gray-700">
                I have informed my faculty advisor about this leave
              </label>
            </div>

            {formData.informed_advisor === 'yes' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Advisor Name</label>
                  <input
                    type="text"
                    name="advisor_name"
                    value={formData.advisor_name}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Faculty advisor name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Advisor Mobile</label>
                  <input
                    type="tel"
                    name="advisor_mobile"
                    value={formData.advisor_mobile}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Advisor's mobile number"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Signature */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-medium text-gray-700 mb-4">Declaration</h2>
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="declaration"
                  name="declaration"
                  type="checkbox"
                  required
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="declaration" className="font-medium text-gray-700">
                  I declare that the information provided is true and correct to the best of my knowledge.
                </label>
                <p className="text-gray-500">
                  I understand that providing false information may result in disciplinary action.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Leave Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeaveRequest;
