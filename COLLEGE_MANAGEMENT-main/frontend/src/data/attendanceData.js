// Hardcoded attendance data for student dashboard
export const attendanceData = [
  {
    id: 1,
    subject_name: 'Database Management Systems',
    subject_code: 'CS501',
    faculty_name: 'Dr. Robert Johnson',
    total_classes: 45,
    attended_classes: 38,
    percentage: 84.44,
    status: 'warning'
  },
  {
    id: 2,
    subject_name: 'Web Technologies',
    subject_code: 'CS502',
    faculty_name: 'Prof. Sarah Williams',
    total_classes: 42,
    attended_classes: 39,
    percentage: 92.86,
    status: 'good'
  },
  {
    id: 3,
    subject_name: 'Operating Systems',
    subject_code: 'CS503',
    faculty_name: 'Dr. Michael Brown',
    total_classes: 40,
    attended_classes: 36,
    percentage: 90.00,
    status: 'good'
  },
  {
    id: 4,
    subject_name: 'Computer Networks',
    subject_code: 'CS504',
    faculty_name: 'Prof. Emily Davis',
    total_classes: 38,
    attended_classes: 27,
    percentage: 71.05,
    status: 'critical'
  },
  {
    id: 5,
    subject_name: 'Software Engineering',
    subject_code: 'CS505',
    faculty_name: 'Dr. James Wilson',
    total_classes: 43,
    attended_classes: 41,
    percentage: 95.35,
    status: 'good'
  }
];

export const attendanceRecords = [
  {
    id: 101,
    date: '2025-11-05',
    subject_name: 'Database Management Systems',
    subject_code: 'CS501',
    status: 'present',
    period: 'P1',
    remarks: 'Regular class'
  },
  {
    id: 102,
    date: '2025-11-05',
    subject_name: 'Web Technologies',
    subject_code: 'CS502',
    status: 'present',
    period: 'P2',
    remarks: 'Lab session'
  },
  {
    id: 103,
    date: '2025-11-04',
    subject_name: 'Operating Systems',
    subject_code: 'CS503',
    status: 'absent',
    period: 'P3',
    remarks: 'Missed class'
  },
  {
    id: 104,
    date: '2025-11-04',
    subject_name: 'Computer Networks',
    subject_code: 'CS504',
    status: 'present',
    period: 'P4',
    remarks: 'Guest lecture'
  },
  {
    id: 105,
    date: '2025-11-03',
    subject_name: 'Software Engineering',
    subject_code: 'CS505',
    status: 'present',
    period: 'P1',
    remarks: 'Project discussion'
  }
];

export const attendanceStats = {
  overallAttendance: 84.6,
  totalClasses: 208,
  bestSubject: {
    name: 'Software Engineering',
    percentage: 95.35
  },
  needsAttention: {
    name: 'Computer Networks',
    percentage: 71.05
  },
  monthlyTrend: [
    { month: 'Jul', percentage: 82 },
    { month: 'Aug', percentage: 85 },
    { month: 'Sep', percentage: 80 },
    { month: 'Oct', percentage: 83 },
    { month: 'Nov', percentage: 84.6 }
  ]
};

export default {
  attendanceData,
  attendanceRecords,
  attendanceStats
};
