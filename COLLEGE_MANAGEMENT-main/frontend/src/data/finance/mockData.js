// Mock data for Finance Module

export const DEPARTMENTS = [
  { id: 'all', name: 'All Departments' },
  { id: 'cse', name: 'CSE' },
  { id: 'ece', name: 'ECE' },
  { id: 'mechanical', name: 'Mechanical' },
  { id: 'civil', name: 'Civil' },
  { id: 'eee', name: 'EEE' },
];

export const ACADEMIC_YEARS = [
  '2024-2025',
  '2023-2024',
  '2022-2023',
  '2021-2022',
];

export const EXPENSE_CATEGORIES = [
  'Infrastructure',
  'Equipment',
  'Utilities',
  'Maintenance',
  'Software & Licenses',
  'Events & Activities',
  'Administrative',
  'Other',
];

export const PAYMENT_STATUS = {
  PAID: 'Paid',
  PENDING: 'Pending',
  OVERDUE: 'Overdue',
  PARTIAL: 'Partial',
};

export const BUDGET_STATUS = {
  ACTIVE: 'Active',
  EXCEEDED: 'Exceeded',
  WARNING: 'Warning',
};

export const MAINTENANCE_STATUS = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CANCELLED: 'Cancelled',
};

// Dashboard Metrics Mock Data
export const dashboardMetrics = {
  totalRevenue: 12500000,
  totalExpenses: 8750000,
  netBalance: 3750000,
  pendingDues: 450000,
  revenueGrowth: 12.5,
  expenseGrowth: 8.3,
  dueGrowth: -5.2,
};

// Revenue & Expenses Data
export const revenueExpensesData = [
  { month: 'Jan', revenue: 980000, expenses: 720000 },
  { month: 'Feb', revenue: 1050000, expenses: 780000 },
  { month: 'Mar', revenue: 1150000, expenses: 850000 },
  { month: 'Apr', revenue: 1080000, expenses: 800000 },
  { month: 'May', revenue: 1200000, expenses: 880000 },
  { month: 'Jun', revenue: 1250000, expenses: 920000 },
  { month: 'Jul', revenue: 980000, expenses: 730000 },
  { month: 'Aug', revenue: 1100000, expenses: 820000 },
  { month: 'Sep', revenue: 1180000, expenses: 860000 },
  { month: 'Oct', revenue: 1050000, expenses: 790000 },
  { month: 'Nov', revenue: 1150000, expenses: 840000 },
  { month: 'Dec', revenue: 1330000, expenses: 760000 },
];

// Fee Collection Data
export const feeCollectionData = {
  byDepartment: [
    { department: 'CSE', collected: 4500000, pending: 120000 },
    { department: 'ECE', collected: 3200000, pending: 85000 },
    { department: 'Mechanical', collected: 2800000, pending: 95000 },
    { department: 'Civil', collected: 2100000, pending: 75000 },
    { department: 'EEE', collected: 2500000, pending: 75000 },
  ],
  byYear: [
    { year: 'First Year', collected: 3800000, pending: 150000 },
    { year: 'Second Year', collected: 3500000, pending: 110000 },
    { year: 'Third Year', collected: 4200000, pending: 95000 },
    { year: 'Fourth Year', collected: 3600000, pending: 95000 },
  ],
};

// Budget Analysis Data
export const budgetAnalysisData = [
  { department: 'CSE', allocated: 2500000, used: 2100000, remaining: 400000 },
  { department: 'ECE', allocated: 2000000, used: 1750000, remaining: 250000 },
  { department: 'Mechanical', allocated: 1800000, used: 1650000, remaining: 150000 },
  { department: 'Civil', allocated: 1500000, used: 1200000, remaining: 300000 },
  { department: 'EEE', allocated: 1700000, used: 1500000, remaining: 200000 },
];

// Salary Distribution Data
export const salaryDistributionData = [
  { role: 'Professors', count: 45, totalSalary: 4500000 },
  { role: 'Associate Professors', count: 38, totalSalary: 3400000 },
  { role: 'Assistant Professors', count: 52, totalSalary: 3900000 },
  { role: 'Lab Assistants', count: 28, totalSalary: 1400000 },
  { role: 'Administrative Staff', count: 42, totalSalary: 2100000 },
  { role: 'Support Staff', count: 35, totalSalary: 1050000 },
];

// Student Fees Mock Data
export const studentFees = Array.from({ length: 50 }, (_, i) => ({
  id: `SF${String(i + 1).padStart(4, '0')}`,
  studentId: `ST${String(i + 1001).padStart(5, '0')}`,
  studentName: `Student ${i + 1}`,
  department: DEPARTMENTS[Math.floor(Math.random() * (DEPARTMENTS.length - 1)) + 1].id.toUpperCase(),
  academicYear: ACADEMIC_YEARS[Math.floor(Math.random() * ACADEMIC_YEARS.length)],
  totalFee: 120000,
  paidAmount: Math.floor(Math.random() * 120000),
  pendingAmount: 0,
  paymentDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
  paymentStatus: ['Paid', 'Pending', 'Partial'][Math.floor(Math.random() * 3)],
})).map(fee => ({
  ...fee,
  pendingAmount: fee.totalFee - fee.paidAmount,
}));


// Expenses Mock Data
export const expenses = Array.from({ length: 40 }, (_, i) => ({
  id: `EXP${String(i + 1).padStart(4, '0')}`,
  category: EXPENSE_CATEGORIES[Math.floor(Math.random() * EXPENSE_CATEGORIES.length)],
  department: DEPARTMENTS[Math.floor(Math.random() * (DEPARTMENTS.length - 1)) + 1].id.toUpperCase(),
  amount: Math.floor(Math.random() * 500000) + 10000,
  vendor: `Vendor ${Math.floor(Math.random() * 20) + 1}`,
  expenseDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
  paymentStatus: ['Paid', 'Pending'][Math.floor(Math.random() * 2)],
  description: 'Expense description',
}));

// Vendors Mock Data
export const vendors = Array.from({ length: 25 }, (_, i) => ({
  id: `VND${String(i + 1).padStart(4, '0')}`,
  vendorName: `Vendor ${i + 1}`,
  serviceType: ['Equipment Supplier', 'Maintenance', 'Software', 'Utilities', 'Services'][Math.floor(Math.random() * 5)],
  contactNumber: `+91-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
  email: `vendor${i + 1}@example.com`,
  amountDue: Math.floor(Math.random() * 200000),
  amountPaid: Math.floor(Math.random() * 800000),
  totalTransactions: Math.floor(Math.random() * 50) + 5,
}));

// Budget Allocation Mock Data
export const budgetAllocations = DEPARTMENTS.slice(1).map((dept, i) => ({
  id: `BDG${String(i + 1).padStart(4, '0')}`,
  department: dept.id.toUpperCase(),
  financialYear: ACADEMIC_YEARS[0],
  allocatedAmount: 1500000 + Math.floor(Math.random() * 1000000),
  usedAmount: 0,
  remainingAmount: 0,
  budgetStatus: 'Active',
})).map(budget => {
  const usedPercentage = Math.random();
  budget.usedAmount = Math.floor(budget.allocatedAmount * usedPercentage);
  budget.remainingAmount = budget.allocatedAmount - budget.usedAmount;
  budget.budgetStatus = 
    usedPercentage > 1 ? 'Exceeded' : 
    usedPercentage > 0.9 ? 'Warning' : 
    'Active';
  return budget;
});

// Maintenance Requests Mock Data
export const maintenanceRequests = Array.from({ length: 30 }, (_, i) => ({
  id: `MNT${String(i + 1).padStart(4, '0')}`,
  assetName: ['Lab Equipment', 'Computer', 'Projector', 'AC Unit', 'Furniture', 'Network Equipment'][Math.floor(Math.random() * 6)],
  department: DEPARTMENTS[Math.floor(Math.random() * (DEPARTMENTS.length - 1)) + 1].id.toUpperCase(),
  issueDescription: 'Equipment malfunction requiring immediate attention',
  reportedDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
  resolvedDate: Math.random() > 0.4 ? new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString() : null,
  maintenanceCost: Math.floor(Math.random() * 50000) + 1000,
  status: ['Pending', 'In Progress', 'Resolved'][Math.floor(Math.random() * 3)],
}));