import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import apiService from '../../services/api'
import { BookOpenIcon, UserIcon, ClockIcon } from '@heroicons/react/24/outline'

const StudentAcademicOverview = () => {
  const { user } = useAuth()
  const [subjects, setSubjects] = useState([])
  const [timetable, setTimetable] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAcademicData()
  }, [user])

  const fetchAcademicData = async () => {
    try {
      if (!user) return;
      setLoading(true);

      // Get academic data from API
      const studentId = 1; // Mock student ID
      
      try {
        // Mock academic data
        const mockSubjects = [
          {
            id: 1,
            name: 'Computer Networks',
            code: 'CS501',
            credits: 3,
            subject_type: 'theory',
            faculty_name: 'Dr. Rajesh Kumar',
            faculty_designation: 'Professor'
          },
          {
            id: 2,
            name: 'Operating Systems',
            code: 'CS502',
            credits: 4,
            subject_type: 'theory',
            faculty_name: 'Dr. Priya Sharma',
            faculty_designation: 'Associate Professor'
          },
          {
            id: 3,
            name: 'Database Management Systems',
            code: 'CS503',
            credits: 4,
            subject_type: 'theory',
            faculty_name: 'Dr. Arun Kumar',
            faculty_designation: 'Assistant Professor'
          },
          {
            id: 4,
            name: 'Software Engineering Lab',
            code: 'CS504',
            credits: 2,
            subject_type: 'practical',
            faculty_name: 'Dr. Sunita Reddy',
            faculty_designation: 'Assistant Professor'
          }
        ];

        const mockTimetable = {
          'Monday': [
            { time: '9:00-10:00', subject: 'Computer Networks', room: 'CS-101', faculty: 'Dr. Rajesh Kumar' },
            { time: '10:00-11:00', subject: 'Operating Systems', room: 'CS-102', faculty: 'Dr. Priya Sharma' },
            { time: '11:30-12:30', subject: 'Database Systems', room: 'CS-103', faculty: 'Dr. Arun Kumar' }
          ],
          'Tuesday': [
            { time: '9:00-10:00', subject: 'Operating Systems', room: 'CS-102', faculty: 'Dr. Priya Sharma' },
            { time: '10:00-11:00', subject: 'Database Systems', room: 'CS-103', faculty: 'Dr. Arun Kumar' },
            { time: '2:00-5:00', subject: 'Software Engineering Lab', room: 'Lab-1', faculty: 'Dr. Sunita Reddy' }
          ],
          'Wednesday': [
            { time: '9:00-10:00', subject: 'Computer Networks', room: 'CS-101', faculty: 'Dr. Rajesh Kumar' },
            { time: '10:00-11:00', subject: 'Database Systems', room: 'CS-103', faculty: 'Dr. Arun Kumar' },
            { time: '11:30-12:30', subject: 'Operating Systems', room: 'CS-102', faculty: 'Dr. Priya Sharma' }
          ],
          'Thursday': [
            { time: '9:00-10:00', subject: 'Database Systems', room: 'CS-103', faculty: 'Dr. Arun Kumar' },
            { time: '10:00-11:00', subject: 'Computer Networks', room: 'CS-101', faculty: 'Dr. Rajesh Kumar' },
            { time: '2:00-5:00', subject: 'Software Engineering Lab', room: 'Lab-1', faculty: 'Dr. Sunita Reddy' }
          ],
          'Friday': [
            { time: '9:00-10:00', subject: 'Operating Systems', room: 'CS-102', faculty: 'Dr. Priya Sharma' },
            { time: '10:00-11:00', subject: 'Computer Networks', room: 'CS-101', faculty: 'Dr. Rajesh Kumar' },
            { time: '11:30-12:30', subject: 'Database Systems', room: 'CS-103', faculty: 'Dr. Arun Kumar' }
          ]
        };

        setSubjects(mockSubjects);
        setTimetable(mockTimetable);
      } catch (error) {
        console.error('Error in fetchAcademicData:', error);
        // Set default/empty data on error
        setSubjects([]);
        setTimetable({});
      }
    } catch (error) {
      console.error('Error in fetchAcademicData:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-royal-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Academic Overview</h2>
        <p className="text-gray-600">Current semester subjects, faculty assignments, and weekly schedule</p>
      </div>

      {/* Semester Subjects */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Current Semester Subjects</h3>
        
        {subjects.length === 0 ? (
          <p className="text-gray-600">No subjects found for current semester.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => (
              <div key={subject.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <BookOpenIcon className="h-5 w-5 text-royal-600 mr-2" />
                    <h4 className="font-semibold text-gray-900">{subject.name}</h4>
                  </div>
                  <span className="text-xs bg-royal-100 text-royal-800 px-2 py-1 rounded-full">
                    {subject.credits} Credits
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">Code: {subject.code}</p>
                
                <div className="mt-3 flex justify-between text-xs text-gray-500">
                  <span>Type: {subject.subject_type || 'Theory'}</span>
                  <span>Semester: {subject.semester}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weekly Timetable */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Weekly Timetable</h3>
        
        {Object.keys(timetable).length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Time
                  </th>
                  {Object.keys(timetable).map(day => (
                    <th key={day} className="border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-700">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {['9:00', '10:00', '11:30', '14:00'].map((time) => (
                  <tr key={time}>
                    <td className="border border-gray-300 px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">
                      {time}
                    </td>
                    {Object.entries(timetable).map(([day, classes]) => {
                      const classAtTime = Array.isArray(classes) ? classes.find(cls => {
                        if (!cls || !cls.time) return false;
                        const [startTime] = cls.time.split('-');
                        return startTime.trim() === time;
                      }) : null;
                      
                      return (
                        <td key={day} className="border border-gray-300 px-4 py-3 text-sm">
                          {classAtTime ? (
                            <div className="space-y-1">
                              <div className="font-medium text-gray-900">
                                {classAtTime.subject}
                              </div>
                              <div className="text-gray-500 text-xs">
                                Room: {classAtTime.room}
                              </div>
                              <div className="text-gray-500 text-xs">
                                {classAtTime.faculty}
                              </div>
                            </div>
                          ) : (
                            <div className="text-gray-400 text-center">-</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No timetable data available</p>
        )}
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Schedule Notes:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Break time: 11:00 AM - 11:15 AM</li>
            <li>• Lunch break: 12:30 PM - 1:30 PM</li>
            <li>• Lab sessions are typically 2-3 hours duration</li>
            <li>• Saturday classes as per college calendar</li>
          </ul>
        </div>
      </div>

      {/* Faculty Contact Information */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Faculty Contact Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject) => (
            <div key={subject.id} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">{subject.name}</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  <span className="font-medium">Faculty:</span>{' '}
                  {subject.faculty_name || 'TBA'}
                </p>
                <p>
                  <span className="font-medium">Designation:</span>{' '}
                  {subject.faculty_designation || 'N/A'}
                </p>
                <p>
                  <span className="font-medium">Subject Code:</span> {subject.code}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default StudentAcademicOverview
