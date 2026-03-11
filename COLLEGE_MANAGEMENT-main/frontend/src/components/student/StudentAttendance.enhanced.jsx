import React, { useState, useEffect } from 'react'
import { useStudent } from '../../contexts/StudentContext'
import { supabase } from '../../lib/supabase'
import { 
  CalendarIcon, 
  ChartBarIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  AcademicCapIcon,
  TrendingUpIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

const StudentAttendance = () => {
  const { student } = useStudent()
  const [attendanceData, setAttendanceData] = useState([])
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [viewMode, setViewMode] = useState('overview')
  const [stats, setStats] = useState({
    overall: 0,
    present: 0,
    absent: 0,
    late: 0,
    totalClasses: 0
  })

  useEffect(() => {
    if (student?.id) {
      fetchAttendanceData()
    }
  }, [student])

  const fetchAttendanceData = async () => {
    try {
      if (!student?.id) return;
      setLoading(true);

      // Fetch attendance records from Supabase
      const { data: attendanceRecordsData, error: attendanceError } = await supabase
        .from('attendance')
        .select(`
          *,
          subjects (
            id,
            name,
            code
          )
        `)
        .eq('student_id', student.id)
        .order('date', { ascending: false });

      if (attendanceError) throw attendanceError;

      // Transform attendance records
      const transformedRecords = (attendanceRecordsData || []).map(record => ({
        id: record.id,
        date: record.date,
        subject_name: record.subjects?.name || 'N/A',
        subject_code: record.subjects?.code || 'N/A',
        status: record.status || 'absent',
        period: record.period || 'N/A',
        remarks: record.remarks || ''
      }));

      setAttendanceRecords(transformedRecords);

      // Calculate subject-wise attendance
      const subjectMap = {};

      transformedRecords.forEach(record => {
        const subjectKey = record.subject_code;
        if (!subjectMap[subjectKey]) {
          subjectMap[subjectKey] = {
            subject_id: record.id,
            subject_name: record.subject_name,
            subject_code: record.subject_code,
            total_classes: 0,
            attended_classes: 0,
            percentage: 0,
            status: 'good'
          };
        }

        subjectMap[subjectKey].total_classes++;
        if (record.status === 'present') {
          subjectMap[subjectKey].attended_classes++;
        }
      });

      // Calculate percentages and status
      const subjectAttendance = Object.values(subjectMap).map(subject => {
        const percentage = subject.total_classes > 0
          ? (subject.attended_classes / subject.total_classes) * 100
          : 0;

        let status = 'good';
        if (percentage < 75) status = 'critical';
        else if (percentage < 85) status = 'warning';

        return {
          ...subject,
          percentage: parseFloat(percentage.toFixed(2)),
          status
        };
      });

      setAttendanceData(subjectAttendance);

      // Calculate overall stats
      const totalClasses = transformedRecords.length;
      const presentCount = transformedRecords.filter(r => r.status === 'present').length;
      const absentCount = transformedRecords.filter(r => r.status === 'absent').length;
      const lateCount = transformedRecords.filter(r => r.status === 'late').length;
      const overallPercentage = totalClasses > 0 ? (presentCount / totalClasses) * 100 : 0;

      setStats({
        overall: parseFloat(overallPercentage.toFixed(2)),
        present: presentCount,
        absent: absentCount,
        late: lateCount,
        totalClasses
      });

    } catch (error) {
      console.error('Error fetching attendance data:', error);
      toast.error('Failed to load attendance data');
      setAttendanceData([]);
      setAttendanceRecords([]);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="relative">
          <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-blue-600"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <AcademicCapIcon className="h-12 w-12 text-blue-600 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  const bestSubject = getBestAttendedSubject()
  const leastSubject = getLeastAttendedSubject()
  const filteredRecords = getFilteredRecords()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-6">
      {/* Header */}
      <div className="mb-8" data-aos="fade-down">
        <h1 className="text-4xl font-bold gradient-text-blue mb-2">Attendance Overview</h1>
        <p className="text-gray-600">Track your class attendance and performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Overall Attendance */}
        <div className="stat-card" data-aos="fade-up" data-aos-delay="100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <ChartBarIcon className="h-8 w-8 text-white" />
            </div>
            {stats.overall >= 75 ? (
              <ArrowTrendingUpIcon className="h-6 w-6 text-green-500" />
            ) : (
              <ArrowTrendingDownIcon className="h-6 w-6 text-red-500" />
            )}
          </div>
          <p className="text-sm font-medium text-gray-600 mb-1">Overall Attendance</p>
          <p className={`text-3xl font-bold ${
            stats.overall >= 75 ? 'text-green-600' : 'text-red-600'
          }`}>
            {stats.overall}%
          </p>
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                stats.overall >= 75 ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gradient-to-r from-red-400 to-red-600'
              }`}
              style={{ width: `${stats.overall}%` }}
            ></div>
          </div>
        </div>

        {/* Total Classes */}
        <div className="stat-card" data-aos="fade-up" data-aos-delay="200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
              <CalendarIcon className="h-8 w-8 text-white" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-600 mb-1">Total Classes</p>
          <p className="text-3xl font-bold text-gray-900">{stats.totalClasses}</p>
          <div className="mt-3 flex gap-2 text-xs">
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
              {stats.present} Present
            </span>
            <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full font-medium">
              {stats.absent} Absent
            </span>
          </div>
        </div>

        {/* Best Subject */}
        <div className="stat-card" data-aos="fade-up" data-aos-delay="300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
              <TrendingUpIcon className="h-8 w-8 text-white" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-600 mb-1">Best Subject</p>
          <p className="text-lg font-bold text-gray-900 truncate">{bestSubject.subject_name || 'N/A'}</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{bestSubject.percentage || 0}%</p>
        </div>

        {/* Needs Attention */}
        <div className="stat-card" data-aos="fade-up" data-aos-delay="400">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
              <ExclamationTriangleIcon className="h-8 w-8 text-white" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-600 mb-1">Needs Attention</p>
          <p className="text-lg font-bold text-gray-900 truncate">{leastSubject.subject_name || 'N/A'}</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">{leastSubject.percentage || 0}%</p>
        </div>
      </div>

      {/* View Mode Selector */}
      <div className="mb-6" data-aos="fade-up">
        <div className="glass-card p-2 inline-flex rounded-xl">
          <button
            onClick={() => setViewMode('overview')}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
              viewMode === 'overview'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setViewMode('detailed')}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
              viewMode === 'detailed'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            Detailed Records
          </button>
        </div>
      </div>

      {/* Subject-wise Attendance */}
      {viewMode === 'overview' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4" data-aos="fade-right">
            Subject-wise Attendance
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {attendanceData.map((subject, index) => (
              <div
                key={subject.subject_code}
                className="card-gradient p-6"
                data-aos="zoom-in"
                data-aos-delay={index * 100}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {subject.subject_name}
                    </h3>
                    <p className="text-sm text-gray-600">{subject.subject_code}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    subject.status === 'good' ? 'bg-green-100 text-green-700' :
                    subject.status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {subject.status === 'good' ? 'Good' :
                     subject.status === 'warning' ? 'Warning' : 'Critical'}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Attendance</span>
                    <span className={`text-2xl font-bold ${
                      subject.percentage >= 75 ? 'text-green-600' :
                      subject.percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {subject.percentage}%
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-3 rounded-full transition-all duration-700 ${
                        subject.percentage >= 75 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                        subject.percentage >= 60 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                        'bg-gradient-to-r from-red-400 to-red-600'
                      }`}
                      style={{ width: `${subject.percentage}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      <CheckCircleIcon className="h-4 w-4 inline mr-1 text-green-600" />
                      {subject.attended_classes} attended
                    </span>
                    <span className="text-gray-600">
                      <XCircleIcon className="h-4 w-4 inline mr-1 text-red-600" />
                      {subject.total_classes - subject.attended_classes} missed
                    </span>
                    <span className="text-gray-600 font-medium">
                      Total: {subject.total_classes}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {attendanceData.length === 0 && (
            <div className="text-center py-12" data-aos="fade-up">
              <AcademicCapIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No attendance data available</p>
            </div>
          )}
        </div>
      )}

      {/* Detailed Records */}
      {viewMode === 'detailed' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6" data-aos="fade-right">
            <h2 className="text-2xl font-bold text-gray-900">Attendance Records</h2>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="input-field max-w-xs"
            >
              <option value="all">All Subjects</option>
              {attendanceData.map(subject => (
                <option key={subject.subject_code} value={subject.subject_code}>
                  {subject.subject_name}
                </option>
              ))}
            </select>
          </div>

          <div className="card-gradient overflow-hidden" data-aos="fade-up">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-blue-200">
                <thead className="bg-gradient-to-r from-blue-600 to-blue-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Period
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-blue-100">
                  {filteredRecords.map((record, index) => (
                    <tr
                      key={record.id}
                      className="hover:bg-blue-50 transition-colors duration-200"
                      data-aos="fade-up"
                      data-aos-delay={index * 50}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(record.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{record.subject_name}</div>
                        <div className="text-xs text-gray-500">{record.subject_code}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.period}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          record.status === 'present' ? 'bg-green-100 text-green-800' :
                          record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {record.status === 'present' && <CheckCircleIcon className="h-4 w-4 mr-1" />}
                          {record.status === 'absent' && <XCircleIcon className="h-4 w-4 mr-1" />}
                          {record.status === 'late' && <ClockIcon className="h-4 w-4 mr-1" />}
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredRecords.length === 0 && (
              <div className="text-center py-12">
                <CalendarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No records found</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentAttendance
