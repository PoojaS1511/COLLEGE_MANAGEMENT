import {
  mockExamAPI,
  mockStudentAPI,
  mockSubjectAPI,
  mockClassAPI,
  mockCourseAPI,
  mockAttendanceAPI,
} from '@/data/mockExamData.js';

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const mockApiService = {
  // Exam Management
  getExams: async () => {
    await delay(300);
    const response = await mockExamAPI.getExamSchedules();
    return response; // This already has { success, data } format
  },
  
  getExamSchedules: async () => {
    await delay(300);
    const response = await mockExamAPI.getExamSchedules();
    return response; // This already has { success, data } format
  },
  
  getExam: async (id) => {
    await delay(200);
    const response = await mockExamAPI.getExamSchedule(id);
    return {
      success: true,
      data: response.data
    };
  },
  
  createExam: async (examData) => {
    await delay(400);
    const response = await mockExamAPI.createExamSchedule(examData);
    return response; // This already has { success, data } format
  },
  
  post: async (url, data) => {
    if (url === '/exams') {
      return await mockApiService.createExam(data);
    } else if (url === '/attendance') {
      return await mockApiService.createAttendanceRecord(data);
    }
    throw new Error(`No handler for POST ${url}`);
  },
  
  put: async (url, data) => {
    const match = url.match(/^\/exams\/(\d+)$/);
    if (match) {
      const id = match[1];
      return await mockApiService.updateExam(id, data);
    } else if (url.startsWith('/attendance/')) {
      const id = url.split('/').pop();
      return await mockApiService.updateAttendanceRecord(id, data);
    }
    throw new Error(`No handler for PUT ${url}`);
  },
  
  updateExam: async (id, examData) => {
    await delay(300);
    const response = await mockExamAPI.updateExamSchedule(id, examData);
    return response; // This already has { success, data } format
  },
  
  deleteExam: async (id) => {
    await delay(200);
    const response = await mockExamAPI.deleteExamSchedule(id);
    return response; // This already has { success, data } format
  },

  delete: async (url) => {
    if (url.startsWith('/exams/')) {
      const id = url.split('/').pop();
      return await mockApiService.deleteExam(id);
    } else if (url.startsWith('/attendance/')) {
      const id = url.split('/').pop();
      return await mockApiService.deleteAttendanceRecord(id);
    }
    throw new Error(`No handler for DELETE ${url}`);
  },

  // Exam Results
  getExamResults: async (examId, filters = {}) => {
    await delay(300);
    const response = await mockExamAPI.getExamResults(examId, filters);
    return response; // This already has { success, data } format
  },

  // Analytics
  getExamAnalytics: async (examId, filters = {}) => {
    await delay(400);
    const response = await mockExamAPI.getExamAnalytics(examId, filters);
    return response; // This already has { success, data } format
  },

  // Students
  getStudents: async (classFilter = '') => {
    await delay(200);
    const response = await mockStudentAPI.getStudents(classFilter);
    return response; // This already has { success, data } format
  },

  getStudent: async (id) => {
    await delay(200);
    const response = await mockStudentAPI.getStudent(id);
    return {
      success: response.status === 'success',
      data: response.data
    };
  },

  // Student Resume
  getStudentResume: async (studentId) => {
    await delay(300);
    
    // For testing purposes, let's make it return no resume for even student IDs
    if (parseInt(studentId) % 2 === 0) {
      // Return a response indicating no resume found
      return {
        success: true,
        data: null,
        message: 'No resume found for this student'
      };
    }
    
    // Return a mock response with a resume URL for odd student IDs
    return {
      success: true,
      data: {
        id: `resume_${studentId}`,
        student_id: studentId,
        resume_url: `https://example.com/resumes/${studentId}_resume.pdf`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
  },

  uploadStudentResume: async (studentId, formData) => {
    await delay(500);
    const file = formData.get('resume');
    return {
      success: true,
      data: {
        id: `resume_${studentId}`,
        student_id: studentId,
        resume_url: `https://example.com/resumes/${studentId}_${file.name}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      message: 'Resume uploaded successfully'
    };
  },

  // Subjects
  getSubjects: async () => {
    await delay(200);
    const response = await mockSubjectAPI.getSubjects();
    return response; // This already has { success, data } format
  },

  // Classes
  getClasses: async () => {
    await delay(200);
    const response = await mockClassAPI.getClasses();
    return response; // This already has { success, data } format
  },

  // Courses
  getAllCourses: async () => {
    await delay(200);
    return mockCourseAPI.getCourses();
  },

  getCourse: async (id) => {
    await delay(200);
    return mockCourseAPI.getCourse(id);
  },

  // Attendance
  getAttendanceRecords: async (filters = {}) => {
    await delay(300);
    return mockAttendanceAPI.getAttendanceRecords(filters);
  },

  createAttendanceRecord: async (recordData) => {
    await delay(400);
    return mockAttendanceAPI.createAttendanceRecord(recordData);
  },

  updateAttendanceRecord: async (id, recordData) => {
    await delay(300);
    return mockAttendanceAPI.updateAttendanceRecord(id, recordData);
  },

  deleteAttendanceRecord: async (id) => {
    await delay(200);
    return mockAttendanceAPI.deleteAttendanceRecord(id);
  },

  // Add this method to handle GET requests
  get: async (url) => {
    if (url === '/subjects') {
      return await mockApiService.getSubjects();
    } else if (url === '/exams') {
      return await mockApiService.getExamSchedules();
    } else if (url.startsWith('/exams/')) {
      const id = url.split('/').pop();
      return await mockApiService.getExam(id);
    } else if (url === '/courses') {
      return await mockApiService.getAllCourses();
    } else if (url.startsWith('/courses/')) {
      const id = url.split('/').pop();
      return await mockApiService.getCourse(id);
    } else if (url === '/attendance') {
      return await mockApiService.getAttendanceRecords();
    } else if (url.startsWith('/attendance/')) {
      const id = url.split('/').pop();
      return await mockApiService.getAttendanceRecord(id);
    } else if (url.startsWith('/students/resume/')) {
      const studentId = url.split('/').pop();
      return await mockApiService.getStudentResume(studentId);
    }
    throw new Error(`No handler for GET ${url}`);
  },

  // Mock authentication
  login: async (email, password) => {
    await delay(500);
    // Mock authentication logic
    if (email === 'admin@school.edu' && password === 'admin123') {
      return {
        success: true,
        data: {
          token: 'mock-jwt-token',
          user: {
            id: 'admin1',
            name: 'Admin User',
            email: 'admin@school.edu',
            role: 'admin'
          }
        }
      };
    }
    return {
      success: false,
      error: 'Invalid credentials'
    };
  },

  // Mock token verification
  verifyToken: async (token) => {
    await delay(200);
    // Mock token verification
    if (token === 'mock-jwt-token') {
      return {
        success: true,
        data: {
          id: 'admin1',
          name: 'Admin User',
          email: 'admin@school.edu',
          role: 'admin'
        }
      };
    }
    return {
      success: false,
      error: 'Invalid token'
    };
  },
};

export default mockApiService;
