// Mock data for the college management system

// Mock students data for college
const students = [
  {
    id: 1,
    name: 'Rahul Sharma',
    enrollmentNumber: 'EN2023001',
    course: 'B.Tech CSE',
    semester: '4th',
    section: 'A',
    contact: '9876543210',
    email: 'rahul.sharma@college.edu',
    batch: '2022-2026',
  },
  {
    id: 2,
    name: 'Priya Patel',
    enrollmentNumber: 'EN2023002',
    course: 'BBA',
    semester: '2nd',
    section: 'B',
    contact: '8765432109',
    email: 'priya.patel@college.edu',
    batch: '2023-2027',
  },
  {
    id: 3,
    name: 'Amit Kumar',
    enrollmentNumber: 'EN2022001',
    course: 'B.Tech ECE',
    semester: '6th',
    section: 'C',
    contact: '7654321098',
    email: 'amit.kumar@college.edu',
    batch: '2021-2025',
  },
  {
    id: 4,
    name: 'Sneha Gupta',
    enrollmentNumber: 'EN2023003',
    course: 'B.Com',
    semester: '2nd',
    section: 'A',
    contact: '6543210987',
    email: 'sneha.gupta@college.edu',
    batch: '2023-2027',
  },
  {
    id: 5,
    name: 'Vikram Singh',
    enrollmentNumber: 'EN2021001',
    course: 'B.Tech CSE',
    semester: '8th',
    section: 'B',
    contact: '9432109876',
    email: 'vikram.singh@college.edu',
    batch: '2020-2024',
  },
];

// Mock communications data for college
const communications = [
  {
    id: 1,
    title: 'College Fest Announcement',
    message: 'Dear students, we are excited to announce our annual college fest "TECHNO-CULTURAL FEST 2023" from 15th to 17th December 2023. Participation certificates will be provided to all participants.',
    date: '2023-11-15',
    type: 'announcement',
    status: 'sent',
    recipients: ['all_students'],
    createdBy: 'Principal Office',
  },
  {
    id: 2,
    title: 'Fee Payment Reminder',
    message: 'This is to remind all students that the last date for 2nd installment fee payment is 25th November 2023. Please visit the accounts office between 10:00 AM to 3:00 PM on working days.',
    date: '2023-11-18',
    type: 'reminder',
    status: 'sent',
    recipients: ['all_students'],
    createdBy: 'Accounts Department',
  },
  {
    id: 3,
    title: 'Holiday Notice',
    message: 'The college will remain closed on 12th November 2023 on account of Diwali. Classes will resume on 13th November 2023 as per schedule.',
    date: '2023-11-10',
    type: 'notice',
    status: 'sent',
    recipients: ['all'],
    createdBy: 'Administration',
  },
  {
    id: 4,
    title: 'Mid-Term Exam Schedule',
    message: 'Mid-term examinations for all courses will be conducted from 1st December to 10th December 2023. The detailed timetable will be displayed on the notice board.',
    date: '2023-11-20',
    type: 'academic',
    status: 'draft',
    recipients: ['all_students', 'faculty'],
    createdBy: 'Examination Cell',
  },
];

// Mock reports data for college
const reports = {
  attendance: {
    monthly: [
      { month: 'Aug', present: 18, absent: 2, leave: 2 },
      { month: 'Sep', present: 20, absent: 1, leave: 1 },
      { month: 'Oct', present: 19, absent: 1, leave: 2 },
    ],
    overall: {
      present: 90.5,
      absent: 4.8,
      leave: 4.7,
    },
  },
  academics: {
    subjects: [
      { name: 'Data Structures', credits: 4, grade: 'A' },
      { name: 'Database Systems', credits: 4, grade: 'A+' },
      { name: 'Operating Systems', credits: 4, grade: 'B+' },
      { name: 'Computer Networks', credits: 4, grade: 'A' },
      { name: 'Software Engineering', credits: 3, grade: 'A' },
    ],
    cgpa: 9.2,
    creditsCompleted: 120,
    totalCredits: 160,
  },
  fees: {
    totalStudents: 1800,
    feesCollected: 45000000, // 4.5 Cr
    feesPending: 5000000,    // 50 Lakhs
    collectionRate: 90.0,
    monthlyCollection: [
      { month: 'Aug', amount: 15000000 },
      { month: 'Sep', amount: 18000000 },
      { month: 'Oct', amount: 12000000 },
    ],
  },
};

// Mock fees data with detailed breakdown for college
const feesManagement = {
  feeStructure: [
    {
      id: 1,
      name: 'Tuition Fee',
      amount: 75000,
      frequency: 'semester',
      applicableTo: 'all',
      description: 'Semester tuition fee for regular courses',
    },
    {
      id: 2,
      name: 'Examination Fee',
      amount: 5000,
      frequency: 'semester',
      applicableTo: 'all',
      description: 'Semester examination fee',
    },
    {
      id: 3,
      name: 'Library Fee',
      amount: 3000,
      frequency: 'annual',
      applicableTo: 'all',
      description: 'Annual library maintenance and subscription fee',
    },
    {
      id: 4,
      name: 'Laboratory Fee',
      amount: 10000,
      frequency: 'semester',
      applicableTo: 'science_tech_students',
      description: 'Semester laboratory charges for practical sessions',
    },
    {
      id: 5,
      name: 'Caution Money',
      amount: 10000,
      frequency: 'one_time',
      applicableTo: 'first_year',
      description: 'Refundable caution money deposit',
    },
  ],
  studentFees: students.map(student => {
    const isFirstYear = student.semester.includes('1st') || student.semester.includes('2nd');
    const isScienceTech = ['B.Tech', 'BCA', 'B.Sc'].some(course => student.course.includes(course));
    
    const tuitionFee = 75000;
    const examFee = 5000;
    const libraryFee = 3000 / 2; // Annual fee divided by 2 semesters
    const labFee = isScienceTech ? 10000 : 0;
    const cautionMoney = isFirstYear ? 10000 : 0;
    
    const totalFees = tuitionFee + examFee + (libraryFee) + labFee + cautionMoney;
    const paidAmount = Math.min(totalFees, Math.floor(Math.random() * (totalFees * 1.2)));
    const pendingAmount = Math.max(0, totalFees - paidAmount);
    
    // Generate payment history for offline payments
    const paymentHistory = [];
    let remaining = paidAmount;
    const paymentModes = ['Cash', 'DD', 'Cheque'];
    
    // Generate 1-3 offline payments
    const numPayments = Math.min(3, Math.max(1, Math.ceil(Math.random() * 3)));
    
    for (let i = 0; i < numPayments && remaining > 0; i++) {
      const amount = i === numPayments - 1 
        ? remaining 
        : Math.floor(Math.random() * remaining * 0.8) + 1;
      
      paymentHistory.push({
        id: i + 1,
        amount: amount,
        date: new Date(2023, 7 + i, Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
        mode: paymentModes[Math.floor(Math.random() * paymentModes.length)],
        receiptNumber: `RCPT${student.enrollmentNumber.slice(2)}${100 + i}`,
        receivedBy: ['Accountant', 'Clerk', 'Cashier'][Math.floor(Math.random() * 3)],
        status: 'completed',
        remarks: 'Paid at college counter',
      });
      
      remaining -= amount;
    }
    
    return {
      studentId: student.id,
      studentName: student.name,
      enrollmentNumber: student.enrollmentNumber,
      course: student.course,
      semester: student.semester,
      totalFees: totalFees,
      paidAmount: paidAmount,
      pendingAmount: pendingAmount,
      lastPaymentDate: paymentHistory.length > 0 ? paymentHistory[paymentHistory.length - 1].date : null,
      paymentStatus: pendingAmount === 0 ? 'Paid' : pendingAmount === totalFees ? 'Not Paid' : 'Partial',
      feeBreakup: [
        { name: 'Tuition Fee', amount: tuitionFee },
        { name: 'Examination Fee', amount: examFee },
        { name: 'Library Fee (Semester)', amount: libraryFee },
        ...(labFee > 0 ? [{ name: 'Laboratory Fee', amount: labFee }] : []),
        ...(cautionMoney > 0 ? [{ name: 'Caution Money', amount: cautionMoney, refundable: true }] : []),
      ],
      paymentHistory: paymentHistory,
      paymentInstructions: 'Please visit the college accounts office between 10:00 AM to 3:00 PM on working days to make fee payment. Bring the fee challan and payment receipt.',
    };
  }),
  feeTransactions: [
    {
      id: 1,
      receiptNumber: 'RCPT100001',
      studentId: 1,
      studentName: 'Rahul Sharma',
      enrollmentNumber: 'EN2023001',
      amount: 50000,
      date: '2023-11-15',
      mode: 'DD',
      receivedBy: 'Accountant',
      status: 'completed',
      remarks: '1st installment',
    },
    {
      id: 2,
      receiptNumber: 'RCPT100002',
      studentId: 2,
      studentName: 'Priya Patel',
      enrollmentNumber: 'EN2023002',
      amount: 75000,
      date: '2023-11-16',
      mode: 'Cash',
      receivedBy: 'Cashier',
      status: 'completed',
      remarks: 'Full payment',
    },
    {
      id: 3,
      receiptNumber: 'RCPT100003',
      studentId: 3,
      studentName: 'Amit Kumar',
      enrollmentNumber: 'EN2022001',
      amount: 40000,
      date: '2023-11-17',
      mode: 'Cheque',
      receivedBy: 'Clerk',
      status: 'completed',
      remarks: '2nd installment',
    },
  ],
  feeDueDates: [
    {
      installment: '1st Installment',
      dueDate: '2023-08-15',
      lateFeeAfter: '2023-08-20',
      lateFeeAmount: 1000,
    },
    {
      installment: '2nd Installment',
      dueDate: '2023-11-15',
      lateFeeAfter: '2023-11-20',
      lateFeeAmount: 1000,
    },
  ],
  paymentModes: [
    { id: 1, name: 'Cash', description: 'Cash payment at college counter' },
    { id: 2, name: 'DD', description: 'Demand Draft in favor of "College Name" payable at City' },
    { id: 3, name: 'Cheque', description: 'Account payee cheque in favor of "College Name"' },
  ],
};

export {
  students,
  communications,
  reports,
  feesManagement,
};
