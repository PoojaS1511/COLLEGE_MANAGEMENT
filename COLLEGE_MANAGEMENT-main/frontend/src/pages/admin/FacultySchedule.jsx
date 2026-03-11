import React, { useState, useEffect } from 'react';
import { supabase } from "../../lib/supabase";
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const FacultySchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tablesExist, setTablesExist] = useState(true);
  
  // Days of the week for display
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Time slots for display (8 AM to 5 PM)
  const timeSlots = Array.from({ length: 10 }, (_, i) => {
    const hour = i + 8;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  useEffect(() => {
    checkTablesExist().then(exists => {
      if (exists) {
        fetchFacultySchedules();
      } else {
        setTablesExist(false);
        setLoading(false);
      }
    });
  }, []);

  const checkTablesExist = async () => {
    try {
      // Try to query the faculty_schedule table directly
      console.log('Checking if faculty_schedule table exists...');
      const { data, error } = await supabase
        .from('faculty_schedule')
        .select('*')
        .limit(1);
      
      console.log('Table check result:', { data, error });
      return !error;
    } catch (err) {
      console.error('Error checking table existence:', err);
      return false;
    }
  };

  const fetchFacultySchedules = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching faculty subject assignments...');
      
      // First, fetch faculty data with their subject assignments
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('faculty_subject_assignments')
        .select('*')
        .limit(100);

      if (assignmentError) {
        console.error('Error fetching faculty assignments:', assignmentError);
        throw assignmentError;
      }

      console.log('Fetched', assignmentData?.length || 0, 'faculty assignments');
      
      // Get unique faculty and subject IDs for batch fetching
      const facultyIds = [...new Set(assignmentData?.map(a => a.faculty_id).filter(Boolean))];
      const subjectIds = [...new Set(assignmentData?.map(a => a.subject_id).filter(Boolean))];

      // Fetch faculty details in batch
      console.log('Fetching faculty details...');
      const { data: facultyData = [], error: facultyError } = await supabase
        .from('faculties')
        .select('*')
        .in('id', facultyIds);

      if (facultyError) {
        console.error('Error fetching faculty details:', facultyError);
        throw facultyError;
      }

      // Create a map of faculty ID to faculty details
      const facultyMap = new Map(facultyData?.map(f => [f.id, f]) || []);

      // Fetch subject details in batch with proper schema fields
      console.log('Fetching subject details...');
      const { data: subjectData = [], error: subjectError } = await supabase
        .from('subjects')
        .select('id, name, code, semester, credits, subject_type, is_elective')
        .in('id', subjectIds);

      if (subjectError) {
        console.error('Error fetching subject details:', subjectError);
        throw subjectError;
      }

      // Create a map of subject ID to subject details
      const subjectMap = new Map(subjectData?.map(s => {
        const subjectIdStr = String(s.id || '');
        return [s.id, {
          ...s,
          subject_name: s.name, // Map name to subject_name for backward compatibility
          subject_code: s.code  // Map code to subject_code for backward compatibility
        }];
      }) || []);

      // Create a map of assignment_id to faculty and subject data
      const assignmentMap = new Map(
        assignmentData?.map(item => {
          const faculty = facultyMap.get(item.faculty_id) || {};
          const subject = subjectMap.get(item.subject_id) || {};
          const subjectIdStr = String(item.subject_id || '');
          
          return [
            item.id,
            {
              facultyName: faculty.full_name || 'Unassigned',
              facultyEmail: faculty.email || '',
              employeeId: faculty.employee_id || '',
              designation: faculty.designation || '',
              subjectName: subject.name || `Subject ${subjectIdStr.substring(0, 4)}`,
              subjectCode: subject.code || `SUBJ-${subjectIdStr.substring(0, 4) || '000'}`,
              semester: subject.semester || '',
              credits: subject.credits || 0,
              subjectType: subject.subject_type || 'Core'
            }
          ];
        }) || []
      );

      console.log('Fetching schedule data...');
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('faculty_schedule')
        .select('*')
        .order('day_of_week')
        .order('start_time')
        .limit(500);

      if (scheduleError) {
        console.error('Error fetching schedule data:', scheduleError);
        throw scheduleError;
      }
      
      console.log('Processing', scheduleData?.length || 0, 'schedule entries');
      
      // Format the schedule data with faculty and subject information
      const formattedData = scheduleData?.map(schedule => {
        const assignmentInfo = assignmentMap.get(schedule.assignment_id) || {};
        let dayOfWeek = schedule.day_of_week;
        
        // Convert day_of_week to number if it's a string
        if (typeof dayOfWeek === 'string') {
          const dayMap = {
            'monday': 1, 'tuesday': 2, 'wednesday': 3, 'thursday': 4,
            'friday': 5, 'saturday': 6, 'sunday': 7
          };
          dayOfWeek = dayMap[dayOfWeek.toLowerCase()] || 0;
        }

        return {
          ...schedule,
          day_of_week: dayOfWeek,
          facultyName: assignmentInfo.facultyName || 'Unassigned',
          facultyEmail: assignmentInfo.facultyEmail || '',
          employeeId: assignmentInfo.employeeId || '',
          designation: assignmentInfo.designation || '',
          subjectName: assignmentInfo.subjectName || `Subject ${schedule.assignment_id?.substring(0, 4) || ''}`,
          subjectCode: assignmentInfo.subjectCode || `SUBJ-${schedule.assignment_id?.substring(0, 4) || '000'}`,
          roomNumber: schedule.room_number || 'TBD'
        };
      }) || [];

      console.log('Schedule data processed successfully');
      setSchedules(formattedData);
    } catch (err) {
      console.error('Error in fetchFacultySchedules:', err);
      setError('Failed to load faculty schedules. Please check your connection and try again.');
      toast.error('Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  const schedulesByDay = schedules.reduce((acc, schedule) => {
    const dayIndex = schedule.day_of_week;
    if (dayIndex >= 1 && dayIndex <= 7) {
      if (!acc[dayIndex]) {
        acc[dayIndex] = [];
      }
      acc[dayIndex].push(schedule);
    }
    return acc;
  }, {});

  const isTimeInSchedule = (time, schedule) => {
    if (!schedule || !schedule.start_time || !schedule.end_time) return false;
    
    const [hour, minute] = time.split(':').map(Number);
    const [startHour, startMinute] = schedule.start_time.split(':').map(Number);
    const [endHour, endMinute] = schedule.end_time.split(':').map(Number);
    
    const timeInMinutes = hour * 60 + minute;
    const startTimeInMinutes = startHour * 60 + (startMinute || 0);
    const endTimeInMinutes = endHour * 60 + (endMinute || 0);
    
    return timeInMinutes >= startTimeInMinutes && timeInMinutes < endTimeInMinutes;
  };

  const getScheduleAtTime = (dayIndex, time) => {
    const daySchedules = schedulesByDay[dayIndex] || [];
    return daySchedules.find(schedule => isTimeInSchedule(time, schedule));
  };

  const formatTimeDisplay = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes || '00'} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !tablesExist) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                {tablesExist ? 'Error loading schedules' : 'Database Setup Required'}
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  {tablesExist 
                    ? error || 'An unknown error occurred while loading the faculty schedules.'
                    : 'The faculty schedule feature requires database tables that have not been set up yet.'
                  }
                </p>
                {!tablesExist && (
                  <div className="mt-4">
                    <p className="font-medium">To fix this:</p>
                    <ol className="list-decimal pl-5 mt-2 space-y-1">
                      <li>Run the database migration to create the required tables</li>
                      <li>Ensure you have the latest database schema</li>
                      <li>Contact your system administrator if you need assistance</li>
                    </ol>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (schedules.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">No schedules found</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>No faculty schedules have been created yet.</p>
                <div className="mt-4">
                  <p className="font-medium">To get started:</p>
                  <ol className="list-decimal pl-5 mt-2 space-y-1">
                    <li>Assign faculty to subjects using the Faculty Management section</li>
                    <li>Create schedule entries for each faculty member</li>
                    <li>Refresh this page to see the updated schedule</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Faculty Schedule</h1>
          <p className="mt-1 text-sm text-gray-500">View and manage faculty teaching schedules</p>
        </div>
        <button
          onClick={() => toast.info('Add schedule functionality coming soon')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Schedule
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                {daysOfWeek.map((day, index) => (
                  <th 
                    key={day} 
                    scope="col" 
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                      new Date().getDay() === index + 1 ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <span>{day}</span>
                      {new Date().getDay() === index + 1 && (
                        <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Today
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {timeSlots.map((time) => (
                <tr key={time} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200">
                    {formatTimeDisplay(time)}
                  </td>
                  {daysOfWeek.map((_, dayIndex) => {
                    const schedule = getScheduleAtTime(dayIndex + 1, time);
                    const isCurrentTime = 
                      new Date().getDay() === dayIndex + 1 && 
                      isTimeInSchedule(time, { 
                        start_time: format(new Date(), 'HH:mm'), 
                        end_time: format(new Date(Date.now() + 60 * 60 * 1000), 'HH:mm') 
                      });
                    
                    return (
                      <td 
                        key={`${dayIndex}-${time}`} 
                        className={`px-6 py-4 whitespace-nowrap border-r border-gray-200 ${
                          isCurrentTime ? 'bg-blue-50' : ''
                        }`}
                      >
                        {schedule ? (
                          <div className={`p-3 rounded-lg border-l-4 ${
                            schedule.is_active 
                              ? 'border-blue-400 bg-blue-50 hover:bg-blue-100' 
                              : 'border-gray-300 bg-gray-50 opacity-75'
                          }`}>
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{schedule.subjectName}</div>
                                <div className="text-sm text-gray-600">{schedule.facultyName}</div>
                              </div>
                              {!schedule.is_active && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                  Inactive
                                </span>
                              )}
                            </div>
                            <div className="mt-1 text-xs text-gray-500">
                              {formatTimeDisplay(schedule.start_time)} - {formatTimeDisplay(schedule.end_time)}
                            </div>
                            {schedule.roomNumber && schedule.roomNumber !== 'TBD' && (
                              <div className="mt-1 text-xs text-gray-500">
                                <span className="inline-flex items-center">
                                  <svg className="mr-1 h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 20 20" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  {schedule.roomNumber}
                                </span>
                              </div>
                            )}
                          </div>
                        ) : isCurrentTime ? (
                          <div className="h-full w-full border-2 border-dashed border-gray-300 rounded-lg p-2">
                            <p className="text-xs text-center text-gray-500">No class</p>
                          </div>
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap items-center text-sm text-gray-500">
        <div className="flex items-center mr-6 mb-2">
          <span className="inline-block w-3 h-3 bg-blue-400 rounded-full mr-2"></span>
          <span>Current Time Slot</span>
        </div>
        <div className="flex items-center mr-6 mb-2">
          <span className="inline-block w-3 h-3 bg-blue-100 rounded-full mr-2"></span>
          <span>Today</span>
        </div>
        <div className="flex items-center mb-2">
          <span className="inline-block w-3 h-3 bg-gray-100 rounded-full mr-2"></span>
          <span>Inactive Schedule</span>
        </div>
      </div>
    </div>
  );
};

export default FacultySchedule;