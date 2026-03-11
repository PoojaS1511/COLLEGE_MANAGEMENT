import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { 
  DocumentArrowDownIcon, 
  CalendarIcon, 
  ClockIcon,
  AcademicCapIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const StudentExaminations = () => {
  const { user } = useAuth();
  const [examSchedule, setExamSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('schedule'); // schedule, hallticket

  useEffect(() => {
    fetchExamData();
  }, [user]);

  const fetchExamData = async () => {
    try {
      setLoading(true);
      
      if (!user) {
        console.warn('No user found in fetchExamData');
        toast.error('You must be logged in to view exam data');
        return;
      }

      console.log('User object in fetchExamData:', JSON.stringify(user, null, 2));

      // First, check if user has student role
      if (user.role !== 'student') {
        console.warn('User does not have student role. User role:', user.role);
        toast('Exam schedules are only available for students');
        setExamSchedule([]);
        return;
      }

      // Try to fetch student data using the correct auth user ID
      let studentData = null;
      let course_id, current_semester;

      // Get the correct auth user ID from the user object
      const authUserId = user.user_id || user.id;
      console.log('Using auth user ID:', authUserId);

      try {
        const { data, error } = await supabase
          .from('students')
          .select('id, course_id, current_semester, department_id')
          .eq('user_id', authUserId);

        if (error) throw error;

        if (data && data.length > 0) {
          studentData = data[0]; // Take first record if multiple exist
          course_id = studentData.course_id;
          current_semester = studentData.current_semester;
          console.log('Found student data:', studentData);
        } else {
          // Check if user is faculty
          const { data: facultyData } = await supabase
            .from('faculty')
            .select('id')
            .eq('user_id', authUserId);

          if (facultyData && facultyData.length > 0) {
            toast('You are registered as faculty. Student exam schedules are not available.');
          } else {
            console.warn('No student record found for auth user ID:', authUserId);
            toast('No student record found. Please contact administration to complete your registration.');
          }
          setExamSchedule([]);
          return;
        }
      } catch (error) {
        console.error('Error fetching user academic data:', error);
        toast.error('Error loading your academic information. Please try again later.');
        setExamSchedule([]);
        return;
      }

      if (!course_id || !current_semester) {
        console.warn('Incomplete student data - missing course or semester');
        toast('Your academic information is incomplete. Please contact the administration.');
        setExamSchedule([]);
        return;
      }

      // Fetch exams for the student's course and semester
        console.log('Fetching exams with:', {
          course_id,
          current_semester,
          current_date: new Date().toISOString()
        });

        const { data: exams, error } = await supabase
          .from('exams')
          .select(`
            id,
            name,
            exam_type,
            start_date,
            end_date,
            total_marks,
            semester,
            subject_id,
            subjects:subject_id (name, code, credits)
          `)
          .eq('course_id', course_id)
          .eq('semester', current_semester)
          .or(`start_date.is.null,start_date.gte.${new Date().toISOString()}`)
          .order('start_date', { ascending: true, nullsFirst: true })
          .order('name', { ascending: true });
          
        console.log('Raw exams query result:', { exams, error });

      if (error) {
        console.error('Error fetching exams:', error);
        throw error;
      }

      console.log('Fetched exams:', exams);

      // Transform the data to match the expected format
      const formattedExams = (exams || []).map(exam => ({
        id: exam.id,
        exam_name: exam.name || 'Unnamed Exam',
        exam_type: exam.exam_type || 'Regular',
        exam_date: exam.start_date,
        start_time: exam.start_date ? new Date(exam.start_date).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }) : 'TBA',
        end_time: exam.end_date ? new Date(exam.end_date).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }) : 'TBA',
        duration: exam.start_date && exam.end_date ? calculateDuration(exam.start_date, exam.end_date) : 'TBA',
        room_number: 'To be announced',
        subjects: {
          name: exam.subjects?.name || 'N/A',
          code: exam.subjects?.code || 'N/A',
          credits: exam.subjects?.credits || 0
        }
      }));

      console.log('Formatted exams:', formattedExams);
      setExamSchedule(formattedExams);

      if (formattedExams.length === 0) {
        toast('No upcoming exams scheduled');
      }
    } catch (error) {
      console.error('Error fetching exam data:', error);
      toast.error(error.message || 'Failed to load exam data');
      // Fallback to empty array to prevent UI breakage
      setExamSchedule([]);
    } finally {
      setLoading(false);
    }
  };

  const downloadHallTicket = async (examId) => {
    if (loading) return;

    try {
      if (!user) {
        toast.error('You must be logged in to download hall tickets');
        return;
      }

      const studentId = user.id;
      setLoading(true);
      toast.loading('Generating hall ticket...', { id: 'hallticket' });

      const apiUrl = `${import.meta.env.VITE_API_URL || ''}/student_dashboard/hall-ticket?exam_id=${examId}&student_id=${studentId}`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/pdf' }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to generate hall ticket: HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.href = blobUrl;
      link.download = `hall_ticket_${examId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.open(blobUrl, '_blank');

      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
      toast.success('Hall ticket downloaded successfully!', { id: 'hallticket' });

    } catch (error) {
      console.error('Error in downloadHallTicket:', error);
      if (error.message.includes('401') || error.message.toLowerCase().includes('unauthorized')) {
        window.location.href = '/login?session_expired=1&redirect=' + encodeURIComponent(window.location.pathname);
      } else {
        toast.error(error.message || 'Failed to download hall ticket. Please try again.', { id: 'hallticket' });
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper function to calculate duration between two dates
  const calculateDuration = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate - startDate;
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins} minutes`;
    } else {
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return `${hours} hour${hours > 1 ? 's' : ''}${mins > 0 ? ` ${mins} minutes` : ''}`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-royal-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Examinations</h2>
        <p className="text-gray-600">Exam schedules and hall ticket downloads</p>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'schedule'
                  ? 'border-royal-500 text-royal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Exam Schedule
            </button>
            <button
              onClick={() => setActiveTab('hallticket')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'hallticket'
                  ? 'border-royal-500 text-royal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Hall Ticket
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'schedule' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Final Exam Schedule</h3>
                <span className="text-sm text-gray-600">Semester 5 • Academic Year 2024-25</span>
              </div>

              {examSchedule.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No exam schedule available yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hall</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {examSchedule.map((exam) => (
                        <tr key={exam.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {new Date(exam.exam_date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {exam.start_time} - {exam.end_time}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {exam.subjects?.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {exam.subjects?.code}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {exam.duration}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {exam.room_number}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Exam Instructions:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Report to the exam hall 15 minutes before the scheduled time</li>
                  <li>• Bring your hall ticket and ID card</li>
                  <li>• Mobile phones and electronic devices are not allowed</li>
                  <li>• Use only blue/black pen for writing</li>
                  <li>• Follow all COVID-19 safety protocols</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'hallticket' && (
            <div className="space-y-6">
              <div className="text-center">
                <AcademicCapIcon className="h-16 w-16 text-royal-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Hall Ticket Download</h3>
                <p className="text-gray-600 mb-6">Download your hall ticket for the upcoming examinations</p>
                
                {examSchedule && examSchedule.length > 0 ? (
                  <div className="space-y-4">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Available Hall Tickets</h4>
                      <ul className="space-y-4">
                        {examSchedule.map((exam) => (
                          <li key={exam.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-base font-medium text-gray-900">{exam.exam_name}</p>
                                <div className="mt-1 flex items-center text-sm text-gray-500">
                                  <CalendarIcon className="h-4 w-4 mr-1" />
                                  <span>{new Date(exam.exam_date).toLocaleDateString()}</span>
                                  <span className="mx-2">•</span>
                                  <ClockIcon className="h-4 w-4 mr-1" />
                                  <span>{exam.start_time}</span>
                                  <span className="mx-2">•</span>
                                  <span>Room: {exam.room_number}</span>
                                </div>
                              </div>
                              <button
                                onClick={() => downloadHallTicket(exam.id)}
                                className="inline-flex items-center px-4 py-2 border border-black text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors duration-200"
                                disabled={loading}
                              >
                                <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                                {loading ? 'Downloading...' : 'Download Hall Ticket'}
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          No upcoming exams found. Hall tickets will be available once the exam schedule is published.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-yellow-800">Important Notes:</h4>
                    <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                      <li>• Hall ticket will be available 1 week before exams</li>
                      <li>• Ensure all fee payments are completed</li>
                      <li>• Contact admin if you face any issues downloading</li>
                      <li>• Carry a printed copy to the examination hall</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentExaminations;
