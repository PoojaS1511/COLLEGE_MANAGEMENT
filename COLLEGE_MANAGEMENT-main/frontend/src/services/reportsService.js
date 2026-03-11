// Mock data for reports
const mockExamResults = [
  { id: 'R001', studentId: 'S1001', studentName: 'John Doe', course: 'B.Tech CSE', semester: 5, subject: 'Data Structures', marksObtained: 85, totalMarks: 100, grade: 'A', examDate: '2024-07-15' },
  { id: 'R002', studentId: 'S1001', studentName: 'John Doe', course: 'B.Tech CSE', semester: 5, subject: 'Algorithms', marksObtained: 78, totalMarks: 100, grade: 'B+', examDate: '2024-07-17' },
  { id: 'R003', studentId: 'S1002', studentName: 'Jane Smith', course: 'MBA', semester: 3, subject: 'Marketing Management', marksObtained: 92, totalMarks: 100, grade: 'A+', examDate: '2024-07-16' },
  { id: 'R004', studentId: 'S1002', studentName: 'Jane Smith', course: 'MBA', semester: 3, subject: 'Financial Accounting', marksObtained: 88, totalMarks: 100, grade: 'A', examDate: '2024-07-18' },
  { id: 'R005', studentId: 'S1003', studentName: 'Robert Johnson', course: 'BBA', semester: 1, subject: 'Business Economics', marksObtained: 65, totalMarks: 100, grade: 'C+', examDate: '2024-07-15' },
  { id: 'R006', studentId: 'S1003', studentName: 'Robert Johnson', course: 'BBA', semester: 1, subject: 'Business Mathematics', marksObtained: 72, totalMarks: 100, grade: 'B', examDate: '2024-07-17' }
];

const mockAttendanceData = [
  { id: 'AT001', studentId: 'S1001', studentName: 'John Doe', course: 'B.Tech CSE', semester: 5, month: 'July 2024', totalClasses: 20, classesAttended: 18, percentage: 90 },
  { id: 'AT002', studentId: 'S1002', studentName: 'Jane Smith', course: 'MBA', semester: 3, month: 'July 2024', totalClasses: 20, classesAttended: 15, percentage: 75 },
  { id: 'AT003', studentId: 'S1003', studentName: 'Robert Johnson', course: 'BBA', semester: 1, month: 'July 2024', totalClasses: 20, classesAttended: 12, percentage: 60 },
  { id: 'AT004', studentId: 'S1004', studentName: 'Emily Davis', course: 'B.Tech CSE', semester: 5, month: 'July 2024', totalClasses: 20, classesAttended: 20, percentage: 100 },
  { id: 'AT005', studentId: 'S1005', studentName: 'Michael Wilson', course: 'MBA', semester: 3, month: 'July 2024', totalClasses: 20, classesAttended: 19, percentage: 95 }
];

const mockFeeCollectionData = [
  { month: 'Jan 2024', amount: 1250000, transactions: 150 },
  { month: 'Feb 2024', amount: 1180000, transactions: 142 },
  { month: 'Mar 2024', amount: 1420000, transactions: 168 },
  { month: 'Apr 2024', amount: 980000, transactions: 120 },
  { month: 'May 2024', amount: 750000, transactions: 95 },
  { month: 'Jun 2024', amount: 0, transactions: 0 },
  { month: 'Jul 2024', amount: 1560000, transactions: 180 },
  { month: 'Aug 2024', amount: 0, transactions: 0 }
];

export const reportsService = {
  // Exam Reports
  getExamResults: async (filters = {}) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let results = [...mockExamResults];
        
        if (filters.studentId) {
          results = results.filter(r => r.studentId === filters.studentId);
        }
        if (filters.course) {
          results = results.filter(r => r.course === filters.course);
        }
        if (filters.semester) {
          results = results.filter(r => r.semester === parseInt(filters.semester));
        }
        
        resolve(results);
      }, 500);
    });
  },
  
  getStudentPerformance: async (studentId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const studentResults = mockExamResults.filter(r => r.studentId === studentId);
        
        if (studentResults.length === 0) {
          resolve(null);
        }
        
        const totalMarks = studentResults.reduce((sum, r) => sum + r.marksObtained, 0);
        const average = totalMarks / studentResults.length;
        
        const performance = {
          studentId: studentResults[0].studentId,
          studentName: studentResults[0].studentName,
          course: studentResults[0].course,
          semester: studentResults[0].semester,
          totalSubjects: studentResults.length,
          totalMarks: studentResults.reduce((sum, r) => sum + r.totalMarks, 0),
          marksObtained: totalMarks,
          averageMarks: parseFloat(average.toFixed(2)),
          percentage: parseFloat(((totalMarks / (studentResults.length * 100)) * 100).toFixed(2)),
          results: studentResults,
          attendance: mockAttendanceData.find(a => a.studentId === studentId) || {}
        };
        
        resolve(performance);
      }, 500);
    });
  },
  
  // Attendance Reports
  getAttendanceReport: async (filters = {}) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let results = [...mockAttendanceData];
        
        if (filters.course) {
          results = results.filter(a => a.course === filters.course);
        }
        if (filters.semester) {
          results = results.filter(a => a.semester === parseInt(filters.semester));
        }
        if (filters.minPercentage) {
          results = results.filter(a => a.percentage >= parseInt(filters.minPercentage));
        }
        if (filters.maxPercentage) {
          results = results.filter(a => a.percentage <= parseInt(filters.maxPercentage));
        }
        
        resolve(results);
      }, 500);
    });
  },
  
  // Financial Reports
  getFeeCollectionReport: async (year = 2024) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // In a real app, this would filter by year
        const report = {
          year,
          totalCollection: mockFeeCollectionData.reduce((sum, m) => sum + m.amount, 0),
          totalTransactions: mockFeeCollectionData.reduce((sum, m) => sum + m.transactions, 0),
          monthlyData: mockFeeCollectionData,
          topCourses: [
            { course: 'MBA', amount: 1250000, percentage: 35 },
            { course: 'B.Tech CSE', amount: 980000, percentage: 27 },
            { course: 'BBA', amount: 750000, percentage: 21 },
            { course: 'B.Com', amount: 400000, percentage: 11 },
            { course: 'B.Sc IT', amount: 250000, percentage: 7 }
          ],
          paymentMethods: [
            { method: 'Online Payment', percentage: 65 },
            { method: 'Bank Transfer', percentage: 25 },
            { method: 'Cash', percentage: 8 },
            { method: 'Cheque', percentage: 2 }
          ]
        };
        
        resolve(report);
      }, 500);
    });
  },
  
  // Analytics Dashboard
  getAnalyticsDashboard: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const totalStudents = 1250;
        const totalFaculty = 85;
        const totalCourses = 12;
        const totalRevenue = 12500000;
        
        const dashboard = {
          overview: {
            totalStudents,
            totalFaculty,
            totalCourses,
            totalRevenue,
            avgStudentPerCourse: Math.round(totalStudents / totalCourses)
          },
          studentDemographics: {
            byCourse: [
              { name: 'B.Tech CSE', value: 450 },
              { name: 'MBA', value: 300 },
              { name: 'BBA', value: 250 },
              { name: 'B.Com', value: 150 },
              { name: 'B.Sc IT', value: 100 }
            ],
            byGender: [
              { name: 'Male', value: 55 },
              { name: 'Female', value: 45 }
            ]
          },
          academicPerformance: {
            passPercentage: 87.5,
            distinctionPercentage: 32.4,
            avgAttendance: 84.2,
            topPerformingCourses: [
              { name: 'MBA', passPercentage: 94.2 },
              { name: 'B.Tech CSE', passPercentage: 89.5 },
              { name: 'BBA', passPercentage: 85.7 }
            ]
          },
          financialOverview: {
            totalRevenue: 12500000,
            feeCollectionRate: 92.5,
            outstandingAmount: 937500,
            revenueBySource: [
              { name: 'Tuition Fees', value: 75 },
              { name: 'Hostel Fees', value: 15 },
              { name: 'Examination Fees', value: 5 },
              { name: 'Other', value: 5 }
            ]
          },
          recentActivities: [
            { id: 1, type: 'admission', description: '25 new admissions for Fall 2024', timestamp: '2024-08-14T10:30:00Z' },
            { id: 2, type: 'exam', description: 'Mid-term exams scheduled for next week', timestamp: '2024-08-13T14:15:00Z' },
            { id: 3, type: 'fee', description: 'Fee collection for August completed', timestamp: '2024-08-12T16:45:00Z' },
            { id: 4, type: 'event', description: 'Annual cultural fest scheduled for September', timestamp: '2024-08-10T09:20:00Z' }
          ]
        };
        
        resolve(dashboard);
      }, 500);
    });
  },
  
  // Export report data
  exportReport: async (reportType, format = 'pdf', filters = {}) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // In a real app, this would generate and return a file
        resolve({
          success: true,
          message: `${reportType} report generated successfully`,
          format,
          url: `/exports/${reportType}_${new Date().getTime()}.${format}`,
          generatedAt: new Date().toISOString()
        });
      }, 1000);
    });
  }
};
