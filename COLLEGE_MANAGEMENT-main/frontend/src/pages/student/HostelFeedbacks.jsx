import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';
import { AuthContext } from '../../contexts/AuthContext';
import PreviousFeedbacks from '../../components/student/PreviousFeedbacks';

const HostelFeedbacks = () => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    roll_no: '',
    department: '',
    room_no: '',
    feedback_type: 'maintenance',
    urgency: 'low',
    message: '',
    status: 'pending'
  });
  const [loading, setLoading] = useState(false);
  const [userDataLoaded, setUserDataLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!user?.id) return;

      try {
        setUserDataLoaded(false);
        
        // First, try to get the student record using the user's ID
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('*')
          .or(`user_id.eq.${user.id},email.eq.${user.email}`)
          .maybeSingle();

        if (studentError) throw studentError;

        if (studentData) {
          // If we found the student record, use that data
          setFormData(prev => ({
            ...prev,
            name: studentData.name || user.user_metadata?.full_name || '',
            roll_no: studentData.roll_no || studentData.roll_number || '',
            department: studentData.department || studentData.branch || studentData.department_name || '',
            room_no: studentData.room_no || studentData.room_number || ''
          }));
          setUserDataLoaded(true);
          return;
        }

        // If not found in students table, try the users table as fallback
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (userError) throw userError;

        if (userData) {
          setFormData(prev => ({
            ...prev,
            name: userData.full_name || userData.name || user.user_metadata?.full_name || '',
            roll_no: userData.roll_number || userData.roll_no || '',
            department: userData.department || userData.branch || '',
            room_no: userData.room_number || userData.room_no || ''
          }));
        }
      } catch (error) {
        console.error('Error fetching student data:', error);
        // If all else fails, use whatever user data we have from auth
        setFormData(prev => ({
          ...prev,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Student',
          roll_no: user.user_metadata?.roll_no || '',
          department: user.user_metadata?.department || ''
        }));
      } finally {
        setUserDataLoaded(true);
      }
    };

    fetchStudentData();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) {
      toast.error('You must be logged in to submit feedback');
      return;
    }

    // Basic validation
    if (!formData.name || !formData.roll_no || !formData.department || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('feedbacks')
        .insert([{
          name: formData.name,
          roll_no: formData.roll_no,
          department: formData.department,
          room_no: formData.room_no,
          feedback_type: formData.feedback_type,
          urgency: formData.urgency,
          message: formData.message,
          status: 'pending',
          student_id: user.id,
          created_at: new Date().toISOString()
        }])
        .select();

      if (error) throw error;
      
      toast.success('Feedback submitted successfully!');
      navigate('/student/dashboard'); // Redirect to dashboard after successful submission
      
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error(error.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking user data
  if (!userDataLoaded) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Hostel Feedback Form</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm font-medium text-gray-500">Name</p>
              <p className="text-gray-900 font-medium">{formData.name || 'Not available'}</p>
            </div>

            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm font-medium text-gray-500">Roll Number</p>
              <p className="text-gray-900 font-medium">{formData.roll_no || 'Not available'}</p>
            </div>

            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm font-medium text-gray-500">Department</p>
              <p className="text-gray-900 font-medium">{formData.department || 'Not available'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
              <input
                type="text"
                name="room_no"
                value={formData.room_no}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Feedback Type *</label>
            <select
              name="feedback_type"
              value={formData.feedback_type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            >
              <option value="maintenance">Maintenance Request</option>
              <option value="cleanliness">Cleanliness</option>
              <option value="facilities">Facilities</option>
              <option value="staff">Staff</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Urgency *</label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="urgency"
                  value="low"
                  checked={formData.urgency === 'low'}
                  onChange={handleChange}
                  className="text-blue-600 focus:ring-blue-500"
                  disabled={loading}
                />
                <span className="ml-2 text-gray-700">Low</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="urgency"
                  value="medium"
                  checked={formData.urgency === 'medium'}
                  onChange={handleChange}
                  className="text-yellow-600 focus:ring-yellow-500"
                  disabled={loading}
                />
                <span className="ml-2 text-gray-700">Medium</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="urgency"
                  value="high"
                  checked={formData.urgency === 'high'}
                  onChange={handleChange}
                  className="text-red-600 focus:ring-red-500"
                  disabled={loading}
                />
                <span className="ml-2 text-gray-700">High</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Please provide details about your feedback or issue..."
              required
              disabled={loading}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Previous Feedbacks Section */}
      <div className="max-w-2xl mx-auto mt-8">
        <PreviousFeedbacks studentId={user?.id} />
      </div>
    </div>
  );
};

export default HostelFeedbacks;