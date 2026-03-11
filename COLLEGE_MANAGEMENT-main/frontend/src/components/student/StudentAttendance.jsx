import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import apiService from '../../services/api'
import { CalendarIcon, ChartBarIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

const StudentAttendance = () => {
  const { user } = useAuth()
  const [attendanceData, setAttendanceData] = useState([])
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [viewMode, setViewMode] = useState('overview') // overview, calendar, detailed

  useEffect(() => {
    fetchAttendanceData()
  }, [user])

  const fetchAttendanceData = async () => {
    try {
      if (!user) return;
      setLoading(true);

      // Mock data - replacing API call
      const mockAttendanceData = [
        {
          subject_id: 1,
          subject_name: 'Computer Networks',
          subject_code: 'CS501',
          faculty_name: 'Dr. Rajesh Kumar',
          total_classes: 45,
          attended_classes: 38,
          percentage: 84.4,
          status: 'good'
        },
        {
          subject_id: 2,
          subject_name: 'Operating Systems',
          subject_code: 'CS502',
          faculty_name: 'Dr. Priya Sharma',
          total_classes: 42,
          attended_classes: 30,
          percentage: 71.4,
          status: 'warning'
        },
        {
          subject_id: 3,
          subject_name: 'Database Systems',
          subject_code: 'CS503',
          faculty_name: 'Dr. Arun Kumar',
          total_classes: 40,
          attended_classes: 35,
          percentage: 87.5,
          status: 'good'
        }
      ];

      const mockAttendanceRecords = [
        {
          id: 1,
          date: '2025-01-15',
          subject_name: 'Computer Networks',
          subject_code: 'CS501',
          status: 'present',
          period: '1st Period (9:00 AM - 10:00 AM)'
        },
        {
          id: 2,
          date: '2025-01-15',
          subject_name: 'Operating Systems',
          subject_code: 'CS502',
          status: 'absent',
          period: '2nd Period (10:00 AM - 11:00 AM)'
        },
        {
          id: 3,
          date: '2025-01-14',
          subject_name: 'Database Systems',
          subject_code: 'CS503',
          status: 'present',
          period: '3rd Period (11:30 AM - 12:30 PM)'
        }
      ];

      setAttendanceData(mockAttendanceData);
      setAttendanceRecords(mockAttendanceRecords);
      
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      // Set empty arrays on error
      setAttendanceData([]);
      setAttendanceRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const getOverallAttendance = () => {
    const totalClasses = attendanceData.reduce((sum, subject) => sum + subject.total_classes, 0)
    const totalPresent = attendanceData.reduce((sum, subject) => sum + subject.attended_classes, 0)
    return totalClasses > 0 ? ((totalPresent / totalClasses) * 100).toFixed(1) : 0
  }

  const getBestAttendedSubject = () => {
    return attendanceData.reduce((best, current) =>
      parseFloat(current.percentage) > parseFloat(best.percentage || 0) ? current : best, {}
    )
  }

  const getLeastAttendedSubject = () => {
    return attendanceData.reduce((least, current) =>
      parseFloat(current.percentage) < parseFloat(least.percentage || 100) ? current : least, {}
    )
  }

  const getFilteredRecords = () => {
    if (selectedSubject === 'all') return attendanceRecords
    return attendanceRecords.filter(record =>
      record.subject_code === selectedSubject
    )
  }

  const getAttendanceByMonth = () => {
    const monthlyData = {}
    attendanceRecords.forEach(record => {
      const month = new Date(record.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      if (!monthlyData[month]) {
        monthlyData[month] = { total: 0, present: 0 }
      }
      monthlyData[month].total++
      if (record.status === 'present') {
        monthlyData[month].present++
      }
    })
    return monthlyData
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-royal-600"></div>
      </div>
    )
  }

  const overallAttendance = getOverallAttendance()
  const bestSubject = getBestAttendedSubject()
  const leastSubject = getLeastAttendedSubject()
  const monthlyData = getAttendanceByMonth()

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Overall Attendance</p>
              <p className={`text-2xl font-bold ${
                overallAttendance >= 75 ? 'text-green-600' : 'text-red-600'
              }`}>
                {overallAttendance}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <CalendarIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Classes</p>
              <p className="text-2xl font-bold text-gray-900">
                {attendanceData.reduce((sum, subject) => sum + subject.total_classes, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold">↑</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Best Subject</p>
              <p className="text-sm font-bold text-gray-900">{bestSubject.subject_name || 'N/A'}</p>
              <p className="text-xs text-green-600">{bestSubject.percentage || 0}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 font-bold">↓</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Needs Attention</p>
              <p className="text-sm font-bold text-gray-900">{leastSubject.subject_name || 'N/A'}</p>
              <p className="text-xs text-red-600">{leastSubject.percentage || 0}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* View Mode Selector */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Attendance Details</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('overview')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                viewMode === 'overview'
                  ? 'bg-royal-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setViewMode('detailed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                viewMode === 'detailed'
                  ? 'bg-royal-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Detailed
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                viewMode === 'calendar'
                  ? 'bg-royal-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Calendar
            </button>
          </div>
        </div>

        {/* Overview Mode */}
        {viewMode === 'overview' && (
          <div className="space-y-6">
            {/* Subject-wise Attendance Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Classes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Present
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Absent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Percentage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendanceData.map((subject) => (
                    <tr key={subject.subject_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {subject.subject_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {subject.subject_code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {subject.total_classes}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                        {subject.attended_classes}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                        {subject.total_classes - subject.attended_classes}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          subject.percentage >= 75 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {subject.percentage}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {subject.percentage >= 75 ? (
                          <span className="text-green-600 font-medium">Good</span>
                        ) : subject.percentage >= 65 ? (
                          <span className="text-yellow-600 font-medium">Warning</span>
                        ) : (
                          <span className="text-red-600 font-medium">Critical</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Attendance Progress Bars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {attendanceData.map((subject) => (
                <div key={subject.subject_id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-gray-900">{subject.subject_name}</h4>
                    <span className="text-sm text-gray-600">{subject.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        subject.percentage >= 75 ? 'bg-green-500' :
                        subject.percentage >= 65 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(subject.percentage, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Present: {subject.attended_classes}</span>
                    <span>Absent: {subject.total_classes - subject.attended_classes}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Mode */}
        {viewMode === 'detailed' && (
          <div className="space-y-6">
            {/* Subject Filter */}
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Filter by Subject:</label>
              <select 
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="all">All Subjects</option>
                {attendanceData.map(subject => (
                  <option 
                    key={`subject-${subject.subject_id}`} 
                    value={subject.subject_code}
                  >
                    {subject.subject_name} ({subject.subject_code})
                  </option>
                ))}
              </select>
            </div>

            {/* Detailed Records */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Period
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Faculty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getFilteredRecords().map(record => (
                    <tr key={`${record.id}-${record.date}`} className="border-b border-gray-200">
                      <td className="px-4 py-2">{new Date(record.date).toLocaleDateString()}</td>
                      <td className="px-4 py-2">{record.subject_name} ({record.subject_code})</td>
                      <td className="px-4 py-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          record.status === 'present' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-2">{record.period}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Calendar Mode */}
        {viewMode === 'calendar' && (
          <div className="space-y-6">
            {/* Monthly Attendance Chart */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(monthlyData).map(([month, data]) => {
                const percentage = ((data.present / data.total) * 100).toFixed(1)
                return (
                  <div key={month} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">{month}</h4>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Total: {data.total}</span>
                      <span>Present: {data.present}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          percentage >= 75 ? 'bg-green-500' :
                          percentage >= 65 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-center text-sm font-medium text-gray-900 mt-2">
                      {percentage}%
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Attendance Alerts */}
      {attendanceData.some(subject => subject.percentage < 75) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Attendance Warning</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>You have subjects with attendance below 75%. Please attend classes regularly to meet the minimum requirement.</p>
                <ul className="list-disc list-inside mt-2">
                  {attendanceData
                    .filter(subject => subject.percentage < 75)
                    .map(subject => (
                      <li key={subject.subject_id}>
                        {subject.subject_name}: {subject.percentage}% (Need {Math.ceil((0.75 * subject.total_classes - subject.attended_classes) / 0.25)} more classes)
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentAttendance
