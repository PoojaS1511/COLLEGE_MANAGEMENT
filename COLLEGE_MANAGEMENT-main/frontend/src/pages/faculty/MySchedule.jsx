import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const MySchedule = () => {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFacultySchedule = async () => {
      try {
        setLoading(true);
        
        // Get the faculty's schedule directly from faculty_schedule table
        const { data: scheduleData, error: scheduleError } = await supabase
          .from('faculty_schedule')
          .select(`
            *,
            faculty_subject_assignments!inner(
              subject:subjects(name, code),
              course:courses(name, code)
            )
          `)
          .eq('faculty_subject_assignments.faculty_id', user.id)
          .order('day_of_week', { ascending: true })
          .order('start_time', { ascending: true });

        if (scheduleError) throw scheduleError;

        setSchedule(scheduleData || []);
      } catch (err) {
        console.error('Error fetching schedule:', err);
        setError('Failed to load schedule. Please try again later.');
        toast.error('Failed to load schedule');
      } finally {
        setLoading(false);
      }
    };

    fetchFacultySchedule();
  }, [user.id]);

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getDayName = (dayNumber) => {
    const dayIndex = parseInt(dayNumber, 10);
    return daysOfWeek[dayIndex] || `Day ${dayNumber}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
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

  // Group schedule by day
  const scheduleByDay = schedule.reduce((acc, item) => {
    const day = item.day_of_week || '0';
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(item);
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Schedule</h1>
        <p className="mt-1 text-sm text-gray-500">View your weekly teaching schedule</p>
      </div>

      {Object.keys(scheduleByDay).length === 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No schedule found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Your schedule has not been set up yet. Please contact the administration.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(scheduleByDay)
            .sort(([dayA], [dayB]) => dayA - dayB)
            .map(([day, daySchedule]) => (
              <div key={day} className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 bg-gray-50">
                  <h3 className="text-lg font-medium text-gray-900">{getDayName(day)}</h3>
                </div>
                <div className="border-t border-gray-200">
                  <ul className="divide-y divide-gray-200">
                    {daySchedule.map((item, idx) => (
                      <li key={idx} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-indigo-600 truncate">
                              {item.faculty_subject_assignments?.subject?.name || 'N/A'} (
                              {item.faculty_subject_assignments?.subject?.code || 'N/A'})
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                              {formatTime(item.start_time)} - {formatTime(item.end_time)}
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                              Course: {item.faculty_subject_assignments?.course?.name || 'N/A'} - 
                              {item.faculty_subject_assignments?.course?.code || 'N/A'}
                            </p>
                          </div>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {item.room || 'Room TBD'}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default MySchedule;
