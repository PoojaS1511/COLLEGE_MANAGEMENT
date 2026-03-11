import React from 'react'

const StudentTimetable = () => {
  const timetable = {
    Monday: [
      { time: '9:00-10:00', subject: 'Database Systems', faculty: 'Dr. Smith', room: 'CS-101' },
      { time: '10:00-11:00', subject: 'Web Technologies', faculty: 'Prof. Johnson', room: 'CS-102' },
      { time: '11:15-12:15', subject: 'Software Engineering', faculty: 'Dr. Brown', room: 'CS-103' },
      { time: '1:15-2:15', subject: 'Computer Networks', faculty: 'Prof. Davis', room: 'CS-104' },
      { time: '2:15-3:15', subject: 'Operating Systems Lab', faculty: 'Dr. Wilson', room: 'CS-Lab1' }
    ],
    Tuesday: [
      { time: '9:00-10:00', subject: 'Operating Systems', faculty: 'Dr. Wilson', room: 'CS-101' },
      { time: '10:00-11:00', subject: 'Database Systems', faculty: 'Dr. Smith', room: 'CS-102' },
      { time: '11:15-12:15', subject: 'Computer Networks', faculty: 'Prof. Davis', room: 'CS-103' },
      { time: '1:15-2:15', subject: 'Web Technologies Lab', faculty: 'Prof. Johnson', room: 'CS-Lab2' },
      { time: '2:15-3:15', subject: 'Software Engineering', faculty: 'Dr. Brown', room: 'CS-104' }
    ],
    Wednesday: [
      { time: '9:00-10:00', subject: 'Software Engineering', faculty: 'Dr. Brown', room: 'CS-101' },
      { time: '10:00-11:00', subject: 'Operating Systems', faculty: 'Dr. Wilson', room: 'CS-102' },
      { time: '11:15-12:15', subject: 'Database Systems Lab', faculty: 'Dr. Smith', room: 'CS-Lab1' },
      { time: '1:15-2:15', subject: 'Computer Networks', faculty: 'Prof. Davis', room: 'CS-103' },
      { time: '2:15-3:15', subject: 'Web Technologies', faculty: 'Prof. Johnson', room: 'CS-104' }
    ],
    Thursday: [
      { time: '9:00-10:00', subject: 'Web Technologies', faculty: 'Prof. Johnson', room: 'CS-101' },
      { time: '10:00-11:00', subject: 'Computer Networks', faculty: 'Prof. Davis', room: 'CS-102' },
      { time: '11:15-12:15', subject: 'Operating Systems', faculty: 'Dr. Wilson', room: 'CS-103' },
      { time: '1:15-2:15', subject: 'Database Systems', faculty: 'Dr. Smith', room: 'CS-104' },
      { time: '2:15-3:15', subject: 'Software Engineering Lab', faculty: 'Dr. Brown', room: 'CS-Lab2' }
    ],
    Friday: [
      { time: '9:00-10:00', subject: 'Computer Networks Lab', faculty: 'Prof. Davis', room: 'CS-Lab1' },
      { time: '10:00-11:00', subject: 'Database Systems', faculty: 'Dr. Smith', room: 'CS-101' },
      { time: '11:15-12:15', subject: 'Web Technologies', faculty: 'Prof. Johnson', room: 'CS-102' },
      { time: '1:15-2:15', subject: 'Operating Systems', faculty: 'Dr. Wilson', room: 'CS-103' },
      { time: '2:15-3:15', subject: 'Software Engineering', faculty: 'Dr. Brown', room: 'CS-104' }
    ]
  }

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Weekly Timetable</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">
                Time
              </th>
              {days.map(day => (
                <th key={day} className="border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-700">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {['9:00-10:00', '10:00-11:00', '11:15-12:15', '1:15-2:15', '2:15-3:15'].map((timeSlot, timeIndex) => (
              <tr key={timeSlot}>
                <td className="border border-gray-300 px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">
                  {timeSlot}
                </td>
                {days.map(day => {
                  const classInfo = timetable[day][timeIndex]
                  return (
                    <td key={day} className="border border-gray-300 px-4 py-3 text-sm">
                      {classInfo ? (
                        <div className="space-y-1">
                          <div className="font-medium text-gray-900">{classInfo.subject}</div>
                          <div className="text-gray-600">{classInfo.faculty}</div>
                          <div className="text-gray-500 text-xs">{classInfo.room}</div>
                        </div>
                      ) : (
                        <div className="text-gray-400 text-center">-</div>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Important Notes:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Break time: 11:00 AM - 11:15 AM</li>
          <li>• Lunch break: 12:15 PM - 1:15 PM</li>
          <li>• Lab sessions are 2 hours duration</li>
          <li>• Saturday classes as per college calendar</li>
        </ul>
      </div>
    </div>
  )
}

export default StudentTimetable
