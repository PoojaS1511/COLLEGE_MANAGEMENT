import React, { useState, useEffect } from 'react';
import { useStudent } from '../../contexts/StudentContext';
import { CalendarIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { supabase } from '../../services/supabaseClient';
import { TABLES } from '../../lib/supabase';

const StudentAttendance = () => {
  const { student } = useStudent();
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (!student?.id) {
        console.log('No student ID available');
        setError('No student ID available. Please log in again.');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        console.log('Fetching attendance data for student ID:', student.id);
        
        // First, get all attendance records for the student
        const { data: attendance, error: attendanceError } = await supabase
          .from('student_attendance')
          .select('*')
          .eq('student_id', student.id)
          .order('attendance_date', { ascending: false });

        if (attendanceError) {
          throw new Error(`Failed to load attendance: ${attendanceError.message}`);
        }

        if (!attendance || attendance.length === 0) {
          setAttendanceData([]);
          setLoading(false);
          return;
        }

        // Get unique subject and faculty IDs
        const subjectIds = [...new Set(attendance.map(a => a.subject_id))];
        const facultyIds = [...new Set(attendance.filter(a => a.faculty_id).map(a => a.faculty_id))];
        const scheduleIds = [...new Set(attendance.filter(a => a.class_schedule_id).map(a => a.class_schedule_id))];

        // Fetch related data in parallel
        const [
          { data: subjects },
          { data: faculties },
          { data: schedules }
        ] = await Promise.all([
          subjectIds.length > 0 
            ? supabase.from('subjects').select('*').in('id', subjectIds)
            : { data: [] },
          facultyIds.length > 0 
            ? supabase.from('faculty').select('*').in('id', facultyIds)
            : { data: [] },
          scheduleIds.length > 0
            ? supabase.from('class_schedule').select('*').in('id', scheduleIds)
            : { data: [] }
        ]);

        // Create lookup maps
        const subjectsMap = new Map(subjects?.map(s => [s.id, s]) || []);
        const facultiesMap = new Map(faculties?.map(f => [f.id, f]) || []);
        const schedulesMap = new Map(schedules?.map(s => [s.id, s]) || []);

        // Transform the data
        const formattedData = attendance.map(record => {
          const subject = subjectsMap.get(record.subject_id);
          const faculty = record.faculty_id ? facultiesMap.get(record.faculty_id) : null;
          const schedule = record.class_schedule_id ? schedulesMap.get(record.class_schedule_id) : null;

          return {
            id: record.id,
            date: new Date(record.attendance_date).toISOString().split('T')[0],
            status: record.status.toLowerCase(),
            subject: subject?.name || `Subject ${record.subject_id}`,
            subjectCode: subject?.code || '',
            period: schedule 
              ? `Period ${schedule.period_number} (${schedule.start_time} - ${schedule.end_time})` 
              : 'N/A',
            notes: record.notes || '',
            faculty: faculty?.full_name || 'N/A',
            facultyEmail: faculty?.email || ''
          };
        });

        setAttendanceData(formattedData);
      } catch (err) {
        console.error('Error fetching attendance data:', err);
        setError(`Failed to load attendance data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [student?.id]);

  if (!student) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading student data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500 max-w-md p-4 bg-red-50 rounded-lg">
          <h3 className="font-bold">Error Loading Attendance</h3>
          <p className="mt-2">{error}</p>
          <p className="mt-2 text-sm">Please contact support if this issue persists.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading attendance data...</div>
      </div>
    );
  }

  // Error state is now handled above

  // Calculate attendance summary
  const totalClasses = attendanceData.length;
  const presentClasses = attendanceData.filter(record => record.status === 'present').length;
  const attendancePercentage = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Attendance</h1>
        
        {/* Attendance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <CalendarIcon className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-lg font-medium">Total Classes</h2>
            </div>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {totalClasses}
            </p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <CheckCircleIcon className="h-6 w-6 text-green-600 mr-2" />
              <h2 className="text-lg font-medium">Present</h2>
            </div>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {presentClasses} <span className="text-sm text-gray-500">({attendancePercentage}%)</span>
            </p>
          </div>
          
          <div className={`p-4 rounded-lg ${
            attendancePercentage >= 75 ? 'bg-green-50' : 
            attendancePercentage >= 50 ? 'bg-yellow-50' : 'bg-red-50'
          }`}>
            <div className="flex items-center">
              <ClockIcon className={`h-6 w-6 ${
                attendancePercentage >= 75 ? 'text-green-600' : 
                attendancePercentage >= 50 ? 'text-yellow-600' : 'text-red-600'
              } mr-2`} />
              <h2 className="text-lg font-medium">Attendance %</h2>
            </div>
            <p className={`text-3xl font-bold ${
              attendancePercentage >= 75 ? 'text-green-600' : 
              attendancePercentage >= 50 ? 'text-yellow-600' : 'text-red-600'
            } mt-2`}>
              {attendancePercentage}%
            </p>
          </div>
        </div>
        
        {/* Attendance Records */}
        <div className="overflow-x-auto">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Attendance</h2>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendanceData.length > 0 ? (
                attendanceData.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        record.status === 'present' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.period}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                    No attendance records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentAttendance;