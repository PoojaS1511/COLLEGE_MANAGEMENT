// Mock data for exam management
const grades = ['F', 'D', 'C', 'B', 'A', 'A+'];

const mockClasses = [
  { id: '10A', name: '10th A', section: 'A', academicYear: '2024-2025' },
  { id: '10B', name: '10th B', section: 'B', academicYear: '2024-2025' },
  { id: '9A', name: '9th A', section: 'A', academicYear: '2024-2025' },
  { id: '9B', name: '9th B', section: 'B', academicYear: '2024-2025' },
];

const mockCourses = [
  { id: 1, name: 'B.Tech CSE', code: 'CSE', duration: '4 years' },
  { id: 2, name: 'B.Tech ECE', code: 'ECE', duration: '4 years' },
  { id: 3, name: 'B.Tech ME', code: 'ME', duration: '4 years' },
  { id: 4, name: 'B.Tech CE', code: 'CE', duration: '4 years' },
  { id: 5, name: 'BBA', code: 'BBA', duration: '3 years' },
];

const mockSubjects = [
  { id: 'math', name: 'Mathematics', code: 'MATH101', course_id: 1 },
  { id: 'sci', name: 'Science', code: 'SCI101', course_id: 1 },
  { id: 'eng', name: 'English', code: 'ENG101', course_id: 1 },
  { id: 'sst', name: 'Social Studies', code: 'SST101', course_id: 2 },
  { id: 'comp', name: 'Computer Science', code: 'CS101', course_id: 2 },
];

const mockStudents = [
  { id: 's1', name: 'John Doe', rollNumber: '20241001', classId: '10A', course_id: 1 },
  { id: 's2', name: 'Jane Smith', rollNumber: '20241002', classId: '10A', course_id: 1 },
  { id: 's3', name: 'Robert Johnson', rollNumber: '20241003', classId: '10B', course_id: 2 },
  { id: 's4', name: 'Emily Davis', rollNumber: '20241004', classId: '10B', course_id: 2 },
  { id: 's5', name: 'Michael Brown', rollNumber: '20249001', classId: '9A', course_id: 3 },
  { id: 's6', name: 'Sarah Wilson', rollNumber: '20249002', classId: '9B', course_id: 4 },
];

const mockExams = [
  {
    id: 'e1',
    exam_name: 'Mid Term - 1',
    exam_type: 'mid_term',
    start_date: '2024-09-15',
    end_date: '2024-09-20',
    academic_year: '2024-2025',
    status: 'upcoming',
    classes: ['10A', '10B', '9A', '9B'],
  },
  {
    id: 'e2',
    exam_name: 'Mid Term - 2',
    exam_type: 'mid_term',
    start_date: '2024-11-10',
    end_date: '2024-11-15',
    academic_year: '2024-2025',
    status: 'upcoming',
    classes: ['10A', '10B', '9A', '9B'],
  },
  {
    id: 'e3',
    exam_name: 'Final Term',
    exam_type: 'final',
    start_date: '2025-03-01',
    end_date: '2025-03-15',
    academic_year: '2024-2025',
    status: 'upcoming',
    classes: ['10A', '10B', '9A', '9B'],
  },
];

// Mock faculty data
const mockFaculty = [
  { id: 'f1', name: 'Dr. Smith', email: 'smith@school.edu', department: 'Science' },
  { id: 'f2', name: 'Prof. Johnson', email: 'johnson@school.edu', department: 'Mathematics' },
  { id: 'f3', name: 'Dr. Williams', email: 'williams@school.edu', department: 'English' },
  { id: 'f4', name: 'Prof. Brown', email: 'brown@school.edu', department: 'Social Studies' },
  { id: 'f5', name: 'Dr. Davis', email: 'davis@school.edu', department: 'Computer Science' },
];

// Mock attendance records
const mockAttendanceRecords = [
  {
    id: 1,
    date: '2025-01-15',
    subject_id: 'math',
    subject_name: 'Mathematics',
    course_id: 1,
    course_name: 'B.Tech CSE',
    class_id: '10A',
    attendance: [
      { student_id: 's1', status: 'present' },
      { student_id: 's2', status: 'present' },
    ],
    present_count: 2,
    total_students: 2,
    percentage: 100.0
  },
  {
    id: 2,
    date: '2025-01-15',
    subject_id: 'sci',
    subject_name: 'Science',
    course_id: 1,
    course_name: 'B.Tech CSE',
    class_id: '10A',
    attendance: [
      { student_id: 's1', status: 'present' },
      { student_id: 's2', status: 'absent' },
    ],
    present_count: 1,
    total_students: 2,
    percentage: 50.0
  },
  {
    id: 3,
    date: '2025-01-15',
    subject_id: 'sst',
    subject_name: 'Social Studies',
    course_id: 2,
    course_name: 'BBA',
    class_id: '10B',
    attendance: [
      { student_id: 's3', status: 'present' },
      { student_id: 's4', status: 'present' },
    ],
    present_count: 2,
    total_students: 2,
    percentage: 100.0
  },
];

// Generate a smaller set of mock exam results
const generateMockResults = () => {
  const results = [];
  let resultId = 1;
  
  // Only generate results for the first exam to reduce initial load
  const exam = mockExams[0];
  
  // Only generate results for the first 5 students
  const studentsToProcess = mockStudents.slice(0, 5);
  
  studentsToProcess.forEach(student => {
    // Only include core subjects for each student
    const studentSubjects = mockSubjects.filter(subject => 
      subject.course_id === student.course_id
    );
    
    studentSubjects.forEach(subject => {
      const totalMarks = 100;
      const obtainedMarks = Math.floor(Math.random() * totalMarks);
      const percentage = (obtainedMarks / totalMarks) * 100;
      const gradeIndex = Math.min(
        Math.floor(percentage / 20),
        grades.length - 1
      );
      
      results.push({
        id: `r${resultId++}`,
        exam_id: exam.id,
        student_id: student.id,
        subject_id: subject.id,
        total_marks: totalMarks,
        obtained_marks: obtainedMarks,
        percentage: percentage.toFixed(2),
        grade: grades[gradeIndex],
        status: 'published',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    });
  });
  
  return results;
};

const mockExamResults = generateMockResults();

// Helper function for pagination
const paginate = (array, page = 1, pageSize = 10) => {
  const startIndex = (page - 1) * pageSize;
  return {
    data: array.slice(startIndex, startIndex + pageSize),
    pagination: {
      total: array.length,
      page,
      pageSize,
      totalPages: Math.ceil(array.length / pageSize)
    }
  };
};

// Mock API functions
export const mockExamAPI = {
  getExamSchedules: async () => ({
    data: mockExams,
    status: 'success'
  }),
  
  getExamSchedule: async (id) => {
    const exam = mockExams.find(e => e.id === id);
    return { data: exam, status: exam ? 'success' : 'error' };
  },
  
  createExamSchedule: async (examData) => {
    try {
      // Generate a new exam ID
      const newId = `e${mockExams.length + 1}`;
      
      // Create the new exam object with all required fields
      const newExam = {
        id: newId,
        exam_name: examData.name || 'New Exam',
        exam_type: examData.exam_type || 'mid_term',
        start_date: examData.date || new Date().toISOString().split('T')[0],
        end_date: examData.end_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        academic_year: examData.academic_year || '2024-2025',
        status: 'upcoming',
        classes: examData.classes || [],
        subject_id: examData.subject_id || '',
        start_time: examData.start_time || '09:00',
        duration: examData.duration || 180,
        total_marks: examData.total_marks || 100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Add to the beginning of the array (most recent first)
      mockExams.unshift(newExam);
      
      return { 
        data: newExam, 
        status: 'success',
        message: 'Exam created successfully'
      };
    } catch (error) {
      console.error('Error creating exam:', error);
      return {
        status: 'error',
        message: 'Failed to create exam'
      };
    }
  },

  updateExamSchedule: async (id, examData) => {
    const index = mockExams.findIndex(e => e.id === id);
    if (index === -1) return { 
      data: null, 
      status: 'error', 
      message: 'Exam not found' 
    };
    
    mockExams[index] = { 
      ...mockExams[index], 
      ...examData, 
      updated_at: new Date().toISOString() 
    };
    
    return { 
      data: mockExams[index], 
      status: 'success' 
    };
  },

  deleteExamSchedule: async (id) => {
    const index = mockExams.findIndex(e => e.id === id);
    if (index === -1) return { 
      status: 'error', 
      message: 'Exam not found' 
    };
    
    mockExams.splice(index, 1);
    return { 
      status: 'success',
      message: 'Exam deleted successfully'
    };
  },

  getExamResults: async (examId, filters = {}, page = 1, pageSize = 10) => {
    // Small delay to simulate network request
    await new Promise(resolve => setTimeout(resolve, 100));
    
    let results = mockExamResults;
    
    // Apply filters
    if (examId) {
      results = results.filter(r => r.exam_id === examId);
    }
    
    if (filters.student_id) {
      results = results.filter(r => r.student_id === filters.student_id);
    }
    
    if (filters.subject_id) {
      results = results.filter(r => r.subject_id === filters.subject_id);
    }
    
    // Apply pagination
    const { data, pagination } = paginate(results, page, pageSize);
    
    return { 
      data, 
      pagination,
      status: 'success' 
    };
  },
  
  getExamAnalytics: async (examId, filters = {}) => {
    // This is a simplified version of analytics
    let examResults = mockExamResults.filter(r => r.exam_id === examId);
    
    if (filters.class_id) {
      const studentsInClass = mockStudents.filter(s => s.classId === filters.class_id)
        .map(s => s.id);
      examResults = examResults.filter(r => studentsInClass.includes(r.student_id));
    }
    
    if (examResults.length === 0) {
      return {
        data: {
          total_students: 0,
          average_percentage: 0,
          grade_distribution: {},
          subject_wise: {},
          topper: null,
          pass_percentage: 0
        },
        status: 'success'
      };
    }
    
    if (examResults.length === 0) {
      return {
        data: {
          total_students: 0,
          average_percentage: 0,
          grade_distribution: {},
          subject_wise: {},
          topper: null,
          pass_percentage: 0
        },
        status: 'success'
      };
    }
    
    // Calculate basic statistics
    const totalMarks = examResults.reduce((sum, r) => sum + parseFloat(r.obtained_marks), 0);
    const averagePercentage = totalMarks / examResults.length;
    
    // Grade distribution
    const gradeDistribution = {};
    examResults.forEach(r => {
      gradeDistribution[r.grade] = (gradeDistribution[r.grade] || 0) + 1;
    });
    
    // Subject-wise performance
    const subjectWise = {};
    mockSubjects.forEach(subject => {
      const subjectResults = examResults.filter(r => r.subject_id === subject.id);
      if (subjectResults.length > 0) {
        const subjectMarks = subjectResults.reduce((sum, r) => sum + parseFloat(r.obtained_marks), 0);
        subjectWise[subject.id] = {
          name: subject.name,
          average: subjectMarks / subjectResults.length,
          total_students: subjectResults.length
        };
      }
    });
    
    // Find topper
    const studentMarks = {};
    examResults.forEach(r => {
      if (!studentMarks[r.student_id]) {
        studentMarks[r.student_id] = {
          total: 0,
          count: 0,
          student: mockStudents.find(s => s.id === r.student_id)
        };
      }
      studentMarks[r.student_id].total += parseFloat(r.obtained_marks);
      studentMarks[r.student_id].count++;
    });
    
    let topper = null;
    let maxAverage = -1;
    
    Object.values(studentMarks).forEach(sm => {
      const avg = sm.total / sm.count;
      if (avg > maxAverage) {
        maxAverage = avg;
        topper = {
          student_id: sm.student.id,
          student_name: sm.student.name,
          average: avg.toFixed(2)
        };
      }
    });
    
    // Pass percentage (assuming 35% is passing)
    const passedStudents = new Set(
      examResults
        .filter(r => (r.obtained_marks / r.total_marks) >= 0.35)
        .map(r => r.student_id)
    ).size;
    
    const totalStudents = new Set(examResults.map(r => r.student_id)).size;
    const passPercentage = totalStudents > 0 ? (passedStudents / totalStudents) * 100 : 0;
    
    return {
      data: {
        total_students: totalStudents,
        average_percentage: averagePercentage.toFixed(2),
        grade_distribution: gradeDistribution,
        subject_wise: subjectWise,
        topper: topper,
        pass_percentage: passPercentage.toFixed(2)
      },
      status: 'success'
    };
  }
};

export const mockStudentAPI = {
  getStudents: async (classFilter = '') => {
    const filteredStudents = classFilter 
      ? mockStudents.filter(s => s.classId === classFilter)
      : mockStudents;
    return { data: filteredStudents, status: 'success' };
  },
  
  getStudent: async (id) => {
    const student = mockStudents.find(s => s.id === id);
    return { data: student, status: student ? 'success' : 'error' };
  }
};

export const mockSubjectAPI = {
  getSubjects: async () => ({
    success: true,
    data: mockSubjects,
    message: 'Subjects retrieved successfully'
  })
};

export const mockClassAPI = {
  getClasses: async () => ({
    data: mockClasses,
    status: 'success'
  })
};

export const mockCourseAPI = {
  getCourses: async () => ({
    success: true,
    data: mockCourses,
    message: 'Courses retrieved successfully'
  }),
  
  getCourse: async (id) => {
    const course = mockCourses.find(c => c.id === parseInt(id));
    return {
      success: !!course,
      data: course,
      message: course ? 'Course retrieved successfully' : 'Course not found'
    };
  }
};

export const mockAttendanceAPI = {
  getAttendanceRecords: async (filters = {}) => {
    let records = [...mockAttendanceRecords];
    
    // Process each record to ensure all required fields are present
    records = records.map(record => {
      // Calculate present count if not already set
      const presentCount = record.present_count !== undefined 
        ? record.present_count 
        : record.attendance.filter(a => a.status === 'present').length;
      
      // Calculate total students if not already set
      const totalStudents = record.total_students !== undefined 
        ? record.total_students 
        : record.attendance.length;
      
      // Calculate percentage if not already set
      const percentage = record.percentage !== undefined 
        ? record.percentage 
        : totalStudents > 0 ? (presentCount / totalStudents) * 100 : 0;
      
      // Get subject name if not already set
      const subject = mockSubjects.find(s => s.id === record.subject_id);
      const subjectName = record.subject_name || (subject ? subject.name : 'N/A');
      
      // Get course name if not already set
      const course = mockCourses.find(c => c.id === record.course_id);
      const courseName = record.course_name || (course ? course.name : 'N/A');
      
      return {
        ...record,
        subject_name: subjectName,
        course_name: courseName,
        present_count: presentCount,
        total_students: totalStudents,
        percentage: percentage,
        absent_count: totalStudents - presentCount
      };
    });
    
    // Apply filters
    if (filters.course_id) {
      records = records.filter(r => r.course_id === parseInt(filters.course_id));
    }
    if (filters.subject_id) {
      records = records.filter(r => r.subject_id === filters.subject_id);
    }
    if (filters.date) {
      records = records.filter(r => r.date === filters.date);
    }
    
    return {
      success: true,
      data: records,
      message: 'Attendance records retrieved successfully'
    };
  },
  
  createAttendanceRecord: async (recordData) => {
    const newRecord = {
      id: mockAttendanceRecords.length + 1,
      ...recordData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    mockAttendanceRecords.push(newRecord);
    
    return {
      success: true,
      data: newRecord,
      message: 'Attendance record created successfully'
    };
  },
  
  updateAttendanceRecord: async (id, updates) => {
    const index = mockAttendanceRecords.findIndex(r => r.id === parseInt(id));
    if (index === -1) {
      return {
        success: false,
        message: 'Attendance record not found'
      };
    }
    
    mockAttendanceRecords[index] = {
      ...mockAttendanceRecords[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    return {
      success: true,
      data: mockAttendanceRecords[index],
      message: 'Attendance record updated successfully'
    };
  },
  
  deleteAttendanceRecord: async (id) => {
    const index = mockAttendanceRecords.findIndex(r => r.id === parseInt(id));
    if (index === -1) {
      return {
        success: false,
        message: 'Attendance record not found'
      };
    }
    
    mockAttendanceRecords.splice(index, 1);
    
    return {
      success: true,
      message: 'Attendance record deleted successfully'
    };
  }
};

export {
  mockClasses,
  mockCourses,
  mockSubjects,
  mockStudents,
  mockExams,
  mockFaculty,
  mockExamResults,
  mockAttendanceRecords,
  grades
};
