import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { HomeIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { useStudent } from '../../contexts/StudentContext';
import AllocationStatus from '../../components/student/AllocationStatus';

const RoomAllocation = () => {
  const [formData, setFormData] = useState({
    hostel: '',
    floor: '',
    room_number: '',
    bed_number: '',
    fees_status: 'unpaid',
    receipt_url: '',
    status: 'pending',
    roll_no: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [existingAllocation, setExistingAllocation] = useState(null);
  const { student: userData, loading: studentLoading } = useStudent();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllocation = async () => {
      if (!userData) return;
      
      try {
        // Fetch existing allocation if any
        const { data: allocationData, error: allocationError } = await supabase
          .from('allocations')
          .select('*')
          .eq('student_pk', userData.user_id || userData.id)
          .maybeSingle();

        if (allocationError) {
          console.error('Error fetching allocation data:', allocationError);
          throw allocationError;
        }

        if (allocationData) {
          setExistingAllocation(allocationData);
          setFormData(prev => ({
            ...prev,
            hostel: allocationData.hostel || '',
            floor: allocationData.floor || '',
            room_number: allocationData.room_number || '',
            bed_number: allocationData.bed_number || '',
            fees_status: allocationData.fees_status || 'unpaid',
            receipt_url: allocationData.receipt_url || '',
            status: allocationData.status || 'pending',
            roll_no: userData?.roll_no || allocationData.roll_no || ''
          }));
        } else {
          // If no allocation exists, set the roll_no from userData
          setFormData(prev => ({
            ...prev,
            roll_no: userData?.roll_no || ''
          }));
        }
      } catch (error) {
        console.error('Error in fetchAllocation:', error);
        toast.error(error.message || 'Failed to load allocation data');
      }
    };

    fetchAllocation();
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
                Please complete your student profile before requesting room allocation.
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
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      // Handle file upload
      const file = files[0];
      if (file) {
        // In a real app, you would upload this file to storage first
        // For now, we'll just store the file name
        setFormData(prev => ({
          ...prev,
          [name]: file.name
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First, fetch the student record using the auth user ID
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('id, roll_no, name, email, branch')
        .eq('user_id', userData?.user_id || userData?.id)
        .single();

      if (studentError) {
        console.error('Error fetching student data:', studentError);
        throw studentError;
      }

      const allocationData = {
        ...formData,
        bed_number: parseInt(formData.bed_number, 10) || null,
        student_pk: student.id,  // Use the student's ID from the students table
        email: student.email,
        name: student.name,
        roll_no: student.roll_no,
        department: student.branch,
        status: formData.status || 'pending',
        created_at: existingAllocation ? formData.created_at : new Date().toISOString()
      };
      
      // Remove any undefined or null values that might cause issues with the database
      Object.keys(allocationData).forEach(key => {
        if (allocationData[key] === undefined || allocationData[key] === '') {
          delete allocationData[key];
        }
      });

      let error;
      if (existingAllocation) {
        // Update existing allocation - only include fields that can be updated
        const { error: updateError } = await supabase
          .from('allocations')
          .update({
            hostel: allocationData.hostel,
            floor: allocationData.floor,
            room_number: allocationData.room_number,
            bed_number: allocationData.bed_number,
            fees_status: allocationData.fees_status,
            status: allocationData.status,
            receipt_url: allocationData.receipt_url,
            department: allocationData.department
          })
          .eq('id', existingAllocation.id);
        error = updateError;
      } else {
        // Create new allocation - include all required fields
        const { error: insertError } = await supabase
          .from('allocations')
          .insert([allocationData]);
        error = insertError;
      }

      if (error) throw error;

      toast.success('Room allocation request submitted successfully!');
      navigate('/student/hostel');
    } catch (error) {
      console.error('Error in room allocation:', error);
      toast.error(error.message || 'Failed to process room allocation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Allocation Status Section */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Your Current Allocation</h2>
            <p className="mt-1 text-sm text-gray-500">View your current room allocation status and details</p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <AllocationStatus 
              studentId={userData?.user_id || userData?.id}
              rollNo={userData?.roll_no}
              email={userData?.email}
            />
          </div>
        </div>

        {/* Room Allocation Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900">Room Allocation Request</h2>
              <p className="mt-1 text-sm text-gray-500">Please fill in the details below to request room allocation</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Hostel <span className="text-red-500">*</span></label>
                <select
                  name="hostel"
                  value={formData.hostel}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Select Hostel</option>
                  <option value="Boys Hostel A">Boys Hostel A</option>
                  <option value="Boys Hostel B">Boys Hostel B</option>
                  <option value="Girls Hostel A">Girls Hostel A</option>
                  <option value="Girls Hostel B">Girls Hostel B</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Floor <span className="text-red-500">*</span></label>
                <select
                  name="floor"
                  value={formData.floor}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Select Floor</option>
                  <option value="Ground Floor">Ground Floor</option>
                  <option value="1st Floor">1st Floor</option>
                  <option value="2nd Floor">2nd Floor</option>
                  <option value="3rd Floor">3rd Floor</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Room Number <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="room_number"
                  value={formData.room_number}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="e.g., 101, 201"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Bed Number <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  name="bed_number"
                  value={formData.bed_number}
                  onChange={handleChange}
                  required
                  min="1"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="e.g., 1, 2, 3"
                />
              </div>
            </div>
          </div>

          {/* Fees and Receipt */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-medium text-gray-700 mb-4">Fees and Receipt</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Fees Status <span className="text-red-500">*</span></label>
                <select
                  name="fees_status"
                  value={formData.fees_status}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                  <option value="partial">Partially Paid</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Upload Receipt {formData.fees_status !== 'unpaid' && <span className="text-red-500">*</span>}
                </label>
                <div className="mt-1 flex items-center">
                  <input
                    type="file"
                    name="receipt_url"
                    onChange={handleChange}
                    accept="image/*,.pdf"
                    disabled={formData.fees_status === 'unpaid'}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-indigo-50 file:text-indigo-700
                      hover:file:bg-indigo-100
                      disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                {formData.receipt_url && (
                  <p className="mt-1 text-sm text-gray-500">Selected: {formData.receipt_url}</p>
                )}
              </div>
            </div>
          </div>

          {/* Declaration */}
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
                  I understand that providing false information may result in cancellation of my room allocation.
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
              {loading ? 'Submitting...' : 'Submit Allocation Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomAllocation;
