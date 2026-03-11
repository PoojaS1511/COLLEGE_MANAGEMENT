import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import api from '../../services/api';

const TakeAttendance = () => {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch faculty's students
  useEffect(() => {
    const fetchStudents = async () => {
      if (!user?.id) {
        setError('User authentication failed. Please log in again.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        
        // Get faculty assignments first
        const assignmentsResponse = await api.getFacultyAssignments(user.id);
        
        if (!assignmentsResponse.success || !assignmentsResponse.data?.length) {
          throw new Error('No class assignments found for this faculty member.');
        }
        
        // Get students for the first assignment
        const firstAssignment = assignmentsResponse.data[0];
        const response = await api.getFacultyStudents({
          facultyId: user.id,
          semester: firstAssignment.semester,
          section: firstAssignment.section,
          subjectId: firstAssignment.subject_id
        });
        
        if (response.success) {
          const studentList = response.data || [];
          setStudents(studentList);
          
          // Initialize attendance status as present by default
          const initialAttendance = {};
          studentList.forEach(student => {
            initialAttendance[student.id] = 'present';
          });
          setAttendance(initialAttendance);
          
          if (studentList.length === 0) {
            setError('No students found for your class.');
          }
        } else {
          throw new Error(response.message || 'Failed to load students');
        }
      } catch (err) {
        console.error('Error:', err);
        setError(err.message || 'Failed to load data. Please try again later.');
        toast.error(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [user]);

  const handleAttendanceChange = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (students.length === 0) {
      toast.error('No students to mark attendance for');
      return;
    }

    setSubmitting(true);
    try {
      // Get the first assignment to get subject_id and class_schedule_id
      const assignmentsResponse = await api.getFacultyAssignments(user.id);
      if (!assignmentsResponse.success || !assignmentsResponse.data?.length) {
        throw new Error('No class assignments found for this faculty member.');
      }
      const firstAssignment = assignmentsResponse.data[0];

      const attendanceRecords = Object.entries(attendance).map(([studentId, status]) => ({
        student_id: studentId,
        faculty_id: user.id,
        subject_id: firstAssignment.subject_id,
        class_schedule_id: firstAssignment.class_schedule_id,
        attendance_date: new Date().toISOString().split('T')[0],
        status: status,
        notes: `Marked by ${user.user_metadata?.full_name || 'faculty'}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('student_attendance')
        .insert(attendanceRecords);

      if (error) throw error;

      toast.success('Attendance marked successfully!');
      navigate('/faculty/attendance');
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast.error(error.message || 'Failed to save attendance');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3">Loading students...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Take Attendance</h1>
        <span className="text-sm text-gray-500">
          {students.length} student(s) found
        </span>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        {error ? (
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
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Register Number</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                    <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-900">
                        {student.register_number || 'N/A'}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {student.full_name}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                        {student.section || 'N/A'}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-center">
                        <select
                          className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                          value={attendance[student.id] || 'present'}
                          onChange={(e) => handleAttendanceChange(student.id, e.target.value)}
                        >
                          <option value="present">Present</option>
                          <option value="absent">Absent</option>
                          <option value="late">Late</option>
                          <option value="on_leave">On Leave</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className={`px-6 py-2 rounded-md text-white ${submitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {submitting ? 'Saving...' : 'Save Attendance'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TakeAttendance;
