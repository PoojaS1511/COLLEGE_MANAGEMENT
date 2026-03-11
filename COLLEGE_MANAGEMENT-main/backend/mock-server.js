require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

// Mock data
const mockStats = {
  totalStudents: 1250,
  activeStudents: 1180,
  totalFaculty: 85,
  activeFaculty: 78,
  totalCourses: 45,
  totalDepartments: 7,
  averageAttendance: 87.5,
  monthlyRevenue: 2500000,
  pendingFees: 180000,
  admissionInquiries: 234,
  enrolledThisMonth: 45
};

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Mock students stats endpoint
app.get('/api/students/stats', (req, res) => {
  console.log('GET /api/students/stats - returning mock data');
  res.json({
    success: true,
    data: mockStats
  });
});

// Mock students list endpoint
app.get('/api/students', (req, res) => {
  console.log('GET /api/students - returning mock list');
  res.json({
    success: true,
    data: [
      { id: 1, name: 'John Doe', email: 'john@example.com', department: 'CSE', year: 3 },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', department: 'ECE', year: 2 }
    ]
  });
});

// Mock finance dashboard metrics endpoint
app.get('/api/finance/dashboard/metrics', (req, res) => {
  console.log('GET /api/finance/dashboard/metrics - returning mock finance data');
  res.json({
    success: true,
    data: {
      totalRevenue: 2500000,
      totalExpenses: 1800000,
      netBalance: 700000,
      pendingDues: 180000,
      monthlyRevenue: 250000,
      monthlyExpenses: 150000,
      revenueExpenses: {
        revenue: [
          { month: 'Jan', amount: 230000 },
          { month: 'Feb', amount: 250000 },
          { month: 'Mar', amount: 280000 },
          { month: 'Apr', amount: 260000 },
          { month: 'May', amount: 250000 },
          { month: 'Jun', amount: 270000 }
        ],
        expenses: [
          { month: 'Jan', amount: 180000 },
          { month: 'Feb', amount: 190000 },
          { month: 'Mar', amount: 200000 },
          { month: 'Apr', amount: 195000 },
          { month: 'May', amount: 150000 },
          { month: 'Jun', amount: 160000 }
        ]
      },
      feeCollection: {
        collected: 2000000,
        pending: 180000,
        total: 2180000,
        byDepartment: [
          { department: 'CSE', collected: 500000, pending: 45000 },
          { department: 'ECE', collected: 450000, pending: 38000 },
          { department: 'MECH', collected: 400000, pending: 32000 },
          { department: 'CIVIL', collected: 350000, pending: 28000 },
          { department: 'EEE', collected: 300000, pending: 25000 },
          { department: 'DA Scholar', collected: 150000, pending: 12000 }
        ]
      },
      budgetAnalysis: {
        allocated: 3000000,
        spent: 1800000,
        remaining: 1200000,
        categories: [
          { category: 'Salaries', allocated: 1500000, spent: 1200000, remaining: 300000 },
          { category: 'Infrastructure', allocated: 800000, spent: 400000, remaining: 400000 },
          { category: 'Equipment', allocated: 400000, spent: 150000, remaining: 250000 },
          { category: 'Operations', allocated: 300000, spent: 50000, remaining: 250000 }
        ]
      },
      trends: {
        studentGrowth: [
          { year: '2020', count: 800 },
          { year: '2021', count: 950 },
          { year: '2022', count: 1100 },
          { year: '2023', count: 1180 },
          { year: '2024', count: 1250 }
        ],
        revenueGrowth: [
          { year: '2020', amount: 1800000 },
          { year: '2021', amount: 2000000 },
          { year: '2022', amount: 2200000 },
          { year: '2023', amount: 2400000 },
          { year: '2024', amount: 2500000 }
        ]
      },
      salaryDistribution: {
        totalSalaryBudget: 1500000,
        byDepartment: [
          { department: 'CSE', totalSalary: 400000, averageSalary: 80000 },
          { department: 'ECE', totalSalary: 350000, averageSalary: 75000 },
          { department: 'MECH', totalSalary: 300000, averageSalary: 70000 },
          { department: 'CIVIL', totalSalary: 250000, averageSalary: 65000 },
          { department: 'EEE', totalSalary: 200000, averageSalary: 60000 }
        ]
      }
    }
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Mock server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  - GET  /api/students/stats');
  console.log('  - GET  /api/students');
  console.log('  - GET  /api/finance/dashboard/metrics');
});

module.exports = app;
