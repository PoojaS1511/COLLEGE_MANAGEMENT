// Mock data for reports and analytics in the college admin dashboard

// Helper function to generate random data points
const generateDataPoints = (count, min, max) => {
  return Array.from({ length: count }, () => Math.floor(Math.random() * (max - min + 1)) + min);
};

// Current academic year and previous years for comparison
const currentYear = new Date().getFullYear();
const years = [currentYear - 2, currentYear - 1, currentYear];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// College departments and programs
const departments = [
  'Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 
  'Biotechnology', 'Chemical', 'Aeronautical', 'Aerospace', 'Information Technology'
];

const degreePrograms = ['B.Tech', 'M.Tech', 'B.Sc', 'M.Sc', 'BBA', 'MBA', 'Ph.D'];
const semesters = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];

// Admission Analytics Data
export const admissionAnalytics = {
  yearlyTrends: {
    labels: years,
    datasets: [
      {
        label: 'Applications',
        data: generateDataPoints(3, 5000, 15000),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      },
      {
        label: 'Admissions',
        data: generateDataPoints(3, 1000, 3000),
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
      },
    ],
  },
  monthlyTrends: {
    labels: months,
    datasets: [
      {
        label: `Admissions ${currentYear}`,
        data: generateDataPoints(12, 50, 500),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
      },
    ],
  },
  admissionSources: {
    labels: ['College Website', 'Campus Visit', 'Education Fair', 'Counseling', 'Others'],
    datasets: [
      {
        data: [40, 25, 15, 15, 5],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
      },
    ],
  },
  departmentWiseAdmission: {
    labels: departments,
    datasets: [
      {
        label: 'Students',
        data: generateDataPoints(departments.length, 50, 300),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
    ],
  },
};

// Academic Performance Data
export const performanceReports = {
  departmentPerformance: {
    labels: departments,
    datasets: [
      {
        label: 'Average CGPA',
        data: departments.map(() => (Math.random() * 2 + 6).toFixed(2)),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
      },
    ],
  },
  semesterPerformance: {
    labels: semesters,
    datasets: [
      {
        label: 'Average CGPA',
        data: semesters.map(() => (Math.random() * 2 + 6).toFixed(2)),
        borderColor: 'rgb(153, 102, 255)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
      },
    ],
  },
  topPerformers: [
    { id: 1, name: 'Rahul Sharma', program: 'B.Tech CSE', semester: '8th', cgpa: '9.8' },
    { id: 2, name: 'Priya Patel', program: 'M.Tech AI', semester: '4th', cgpa: '9.7' },
    { id: 3, name: 'Amit Kumar', program: 'B.Tech ECE', semester: '6th', cgpa: '9.6' },
    { id: 4, name: 'Neha Gupta', program: 'BBA', semester: '6th', cgpa: '9.5' },
    { id: 5, name: 'Sandeep Singh', program: 'M.Tech CS', semester: '2nd', cgpa: '9.4' },
  ],
  subjectWisePerformance: {
    labels: ['Programming', 'Mathematics', 'Electronics', 'Mechanics', 'Humanities', 'Lab Work'],
    datasets: [
      {
        label: 'Average Score %',
        data: generateDataPoints(6, 65, 95),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
      },
    ],
  },
};

// College Facility Utilization Data
export const utilizationReports = {
  labUtilization: {
    labels: departments.map(dept => `${dept} Lab`).slice(0, 5),
    datasets: [
      {
        label: 'Utilization %',
        data: generateDataPoints(5, 40, 95),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
    ],
  },
  libraryUtilization: {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Average Daily Visitors',
        data: generateDataPoints(4, 100, 500),
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
      },
    ],
  },
  hostelOccupancy: {
    labels: ['Boys Hostel A', 'Boys Hostel B', 'Girls Hostel A', 'Girls Hostel B'],
    datasets: [
      {
        label: 'Occupancy %',
        data: generateDataPoints(4, 70, 100),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
        ],
      },
    ],
  },
};

// Placement and Internship Data
export const placementReports = {
  placementStats: {
    labels: ['2021', '2022', '2023'],
    datasets: [
      {
        label: 'Placement %',
        data: [75, 82, 88],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      },
      {
        label: 'Average Package (LPA)',
        data: [6.5, 7.2, 8.1],
        borderColor: 'rgb(153, 102, 255)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
      },
    ],
  },
  topRecruiters: [
    { name: 'Tech Solutions Inc.', offers: 45, highestPackage: '15 LPA' },
    { name: 'Global Systems', offers: 32, highestPackage: '18 LPA' },
    { name: 'InnovateX', offers: 28, highestPackage: '20 LPA' },
    { name: 'DataSphere', offers: 22, highestPackage: '16 LPA' },
    { name: 'CloudNova', offers: 18, highestPackage: '22 LPA' },
  ],
  departmentWisePlacement: {
    labels: departments.slice(0, 6),
    datasets: [
      {
        label: 'Placement %',
        data: generateDataPoints(6, 70, 98),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  },
};

// Exam and Results Data
export const examReports = {
  semesterResults: {
    labels: semesters,
    datasets: [
      {
        label: 'Pass %',
        data: generateDataPoints(8, 85, 98),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      },
    ],
  },
  subjectWiseResults: {
    labels: ['Programming', 'Mathematics', 'Electronics', 'Mechanics', 'Humanities'],
    datasets: [
      {
        label: 'Pass %',
        data: generateDataPoints(5, 80, 98),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
    ],
  },
};

// Fee and Financial Reports
export const feeReports = {
  feeCollection: {
    labels: months,
    datasets: [
      {
        label: 'Fee Collected (in Lakhs)',
        data: generateDataPoints(12, 50, 200),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      },
    ],
  },
  feeCategory: {
    labels: ['Tuition', 'Hostel', 'Library', 'Examination', 'Miscellaneous'],
    datasets: [
      {
        data: [60, 20, 5, 10, 5],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
      },
    ],
  },
  outstandingFees: {
    totalOutstanding: '1,25,00,000',
    byDepartment: departments.slice(0, 5).map((dept, index) => ({
      department: dept,
      amount: (Math.random() * 500000 + 50000).toLocaleString('en-IN', { maximumFractionDigits: 0 })
    }))
  },
};

export default {
  admissionAnalytics,
  performanceReports,
  utilizationReports,
  placementReports,
  examReports,
  feeReports,
};
