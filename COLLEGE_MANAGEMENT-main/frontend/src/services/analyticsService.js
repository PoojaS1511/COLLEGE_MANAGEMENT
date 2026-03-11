import axios from 'axios';
import { supabase } from './supabaseClient';
import { format, subMonths } from 'date-fns';

const API_BASE_URL = '/api/analytics';

const handleResponse = (response) => {
  if (response.data && response.data.data) {
    return response.data.data;
  }
  return response.data;
};

const handleError = (error, defaultMessage) => {
  const errorMessage = error.response?.data?.error || error.message || defaultMessage;
  console.error(defaultMessage, error);
  throw new Error(errorMessage);
};

const AnalyticsService = {
  /**
   * Get admission analytics data
   * @param {Object} filters - Filter criteria
   * @returns {Promise<{data: Array, count: number}>} Admission applications and count
   */
  getAdmissionAnalytics: async (filters = {}) => {
    try {
      let query = supabase
        .from('admission_applications')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters.status && filters.status.length > 0) {
        query = query.in('status', filters.status);
      }
      
      if (filters.gender && filters.gender.length > 0) {
        query = query.in('gender', filters.gender);
      }
      
      if (filters.location) {
        query = query.ilike('address', `%${filters.location}%`);
      }
      
      if (filters.school) {
        query = query.ilike('previous_school', `%${filters.school}%`);
      }
      
      if (filters.department) {
        query = query.eq('course_id', filters.department);
      }
      
      if (filters.start_date && filters.end_date) {
        query = query.gte('created_at', filters.start_date).lte('created_at', filters.end_date);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      // Transform data to match frontend expectations
      const formattedData = data.map(item => ({
        ...item,
        department: item.course_id,
        location: item.address,
        school: item.previous_school
      }));

      return { 
        data: formattedData, 
        count,
        summary: {
          total: count,
          byStatus: data.reduce((acc, item) => {
            acc[item.status] = (acc[item.status] || 0) + 1;
            return acc;
          }, {})
        }
      };
    } catch (error) {
      console.error('Error in getAdmissionAnalytics:', error);
      throw error;
    }
  },
  
  /**
   * Get filter options for admission analytics
   * @returns {Promise<Object>} Filter options
   */
  getFilterOptions: async () => {
    try {
      // Get unique statuses
      const { data: statusData, error: statusError } = await supabase
        .from('admission_applications')
        .select('status')
        .not('status', 'is', null);
      
      if (statusError) throw statusError;
      
      // Get unique genders
      const { data: genderData, error: genderError } = await supabase
        .from('admission_applications')
        .select('gender')
        .not('gender', 'is', null);
      
      if (genderError) throw genderError;
      
      // Get unique schools (previous_school)
      const { data: schoolData, error: schoolError } = await supabase
        .from('admission_applications')
        .select('previous_school')
        .not('previous_school', 'is', null);
      
      if (schoolError) throw schoolError;
      
      // Get unique course_ids (departments)
      const { data: courseData, error: courseError } = await supabase
        .from('admission_applications')
        .select('course_id')
        .not('course_id', 'is', null);
      
      if (courseError) throw courseError;
      
      return {
        statuses: [...new Set(statusData.map(item => item.status))],
        genders: [...new Set(genderData.map(item => item.gender))],
        schools: [...new Set(schoolData.map(item => item.previous_school))],
        departments: [...new Set(courseData.map(item => item.course_id))]
      };
    } catch (error) {
      console.error('Error in getFilterOptions:', error);
      throw error;
    }
  },

  /**
   * Get performance analytics data
   * @param {Object} filters - Filter criteria
   * @param {string} [filters.subject_id] - Filter by subject ID
   * @param {string} [filters.student_id] - Filter by student ID
   * @param {string} [filters.start_date] - Start date (YYYY-MM-DD)
   * @param {string} [filters.end_date] - End date (YYYY-MM-DD)
   * @returns {Promise<Object>} Performance analytics data
   */
  getPerformanceAnalytics: async (filters = {}) => {
    try {
      // First try the API endpoint with filters
      try {
        const response = await axios.get(`${API_BASE_URL}/performance`, { params: filters });
        return handleResponse(response);
      } catch (apiError) {
        console.warn('API endpoint failed, trying direct Supabase query...', apiError);
        
        // Fallback to direct Supabase query if API fails
        if (!supabase) {
          throw new Error('Supabase client is not properly initialized');
        }
        
        // Build query for direct Supabase access
        let query = supabase
          .from('exam_results')
          .select(`
            *,
            student:student_id(*),
            subject:subject_id(*),
            exam:exam_id(*)
          `);
          
        // Apply filters
        if (filters.subject_id) {
          query = query.eq('subject_id', filters.subject_id);
        }
        
        if (filters.student_id) {
          query = query.eq('student_id', filters.student_id);
        }
        
        if (filters.start_date && filters.end_date) {
          query = query.gte('exam.exam_date', filters.start_date)
                      .lte('exam.exam_date', filters.end_date);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        // Process data to match the expected format
        const processedData = processPerformanceData(data);
        return processedData;
      }
    } catch (error) {
      console.error('Error in getPerformanceAnalytics:', error);
      // Return mock data if both API and direct query fail
      return getMockPerformanceData();
    }
  },

  /**
   * Get resource utilization analytics data
   * @returns {Promise<Object>} Resource utilization analytics data
   */
  getUtilizationAnalytics: async () => {
    try {
      // First try the API endpoint
      try {
        const response = await axios.get(`${API_BASE_URL}/utilization`);
        return handleResponse(response);
      } catch (apiError) {
        console.warn('API endpoint failed, trying direct Supabase query...', apiError);
        
        // Fallback to direct Supabase query if API fails
        if (!supabase) {
          throw new Error('Supabase client is not properly initialized');
        }
        
        // Fetch resource utilization data directly from Supabase
        const { data, error } = await supabase
          .from('resource_utilization') // Adjust the table name as per your schema
          .select('*');
          
        if (error) throw error;
        
        // Return mock data if no data found
        if (!data || data.length === 0) {
          return {
            utilizationData: [],
            summary: {
              totalResources: 0,
              averageUtilization: 0,
              peakUtilization: 0
            }
          };
        }
        
        // Transform data to match expected format
        return {
          utilizationData: data,
          summary: {
            totalResources: new Set(data.map(item => item.resource_id)).size,
            averageUtilization: data.reduce((acc, item) => acc + (parseFloat(item.utilization_percentage) || 0), 0) / (data.length || 1),
            peakUtilization: Math.max(...data.map(item => parseFloat(item.utilization_percentage) || 0), 0)
          }
        };
      }
    } catch (error) {
      console.error('Error in getUtilizationAnalytics:', error);
      // Return default empty data structure on error
      return {
        utilizationData: [],
        summary: {
          totalResources: 0,
          averageUtilization: 0,
          peakUtilization: 0
        },
        error: error.message
      };
    }
  },

  /**
   * Get placement reports data
   * @returns {Promise<Object>} Placement reports data
   */
  getPlacementReports: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/placements`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error, 'Error fetching placement reports:');
    }
  },

  /**
   * Get exam reports data
   * @returns {Promise<Object>} Exam reports data
   */
  getExamReports: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/exams`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error, 'Error fetching exam reports:');
    }
  },

  /**
   * Get fee reports data
   * @returns {Promise<Object>} Fee reports data
   */
  getFeeReports: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/fees`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error, 'Error fetching fee reports:');
    }
  },

  /**
   * Get dashboard statistics
   * @returns {Promise<Object>} Dashboard statistics
   */
  getDashboardStats: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error, 'Error fetching dashboard statistics:');
    }
  },

  /**
   * Get student performance data
   * @param {string} studentId - Student ID
   * @returns {Promise<Object>} Student performance data
   */
  getStudentPerformance: async (studentId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/students/${studentId}/performance`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error, 'Error fetching student performance:');
    }
  },

  /**
   * Get admission applications with optional filters
   * @param {Object} filters - Filter criteria
   * @param {Array<string>} [filters.status] - Filter by status
   * @param {string} [filters.start_date] - Start date for filtering
   * @param {string} [filters.end_date] - End date for filtering
   * @returns {Promise<{data: Array, count: number}>} Admission applications and count
   */
  getAdmissionApplications: async (filters = {}) => {
    try {
      let query = supabase
        .from('admission_applications')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters.status && filters.status.length > 0) {
        query = query.in('status', filters.status);
      }
      
      if (filters.start_date && filters.end_date) {
        query = query.gte('created_at', filters.start_date).lte('created_at', filters.end_date);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return { data, count };
    } catch (error) {
      console.error('Error fetching admission applications:', error);
      throw error;
    }
  },
};

/**
 * Process raw performance data into structured format
 * @param {Array} data - Raw performance data
 * @returns {Object} Processed performance data
 */
function processPerformanceData(data) {
  if (!data || !Array.isArray(data)) {
    return getMockPerformanceData();
  }

  // Calculate summary metrics
  const studentIds = new Set(data.map(item => item.student_id));
  const subjectIds = new Set(data.map(item => item.subject_id));
  const examIds = new Set(data.map(item => item.exam_id));
  
  const scores = data.map(item => parseFloat(item.marks_obtained) || 0);
  const averageScore = scores.length > 0 
    ? scores.reduce((sum, score) => sum + score, 0) / scores.length 
    : 0;
    
  const passRate = scores.length > 0
    ? (scores.filter(score => score >= 40).length / scores.length) * 100
    : 0;

  // Group by subject
  const subjectPerformance = Array.from(subjectIds).map(subjectId => {
    const subjectData = data.filter(item => item.subject_id === subjectId);
    const subjectScores = subjectData.map(item => parseFloat(item.marks_obtained) || 0);
    const subjectAvg = subjectScores.length > 0 
      ? subjectScores.reduce((sum, score) => sum + score, 0) / subjectScores.length 
      : 0;
      
    return {
      subject_id: subjectId,
      subject_name: subjectData[0]?.subject?.name || 'Unknown',
      student_count: new Set(subjectData.map(item => item.student_id)).size,
      average_score: subjectAvg,
      pass_rate: subjectScores.length > 0
        ? (subjectScores.filter(score => score >= 40).length / subjectScores.length) * 100
        : 0,
      highest_score: Math.max(...subjectScores, 0),
      lowest_score: subjectScores.length > 0 ? Math.min(...subjectScores) : 0
    };
  });

  // Group by month for trends
  const monthlyData = {};
  data.forEach(item => {
    if (!item.exam?.exam_date) return;
    
    const month = item.exam.exam_date.slice(0, 7); // YYYY-MM format
    if (!monthlyData[month]) {
      monthlyData[month] = {
        month,
        scores: [],
        studentIds: new Set()
      };
    }
    monthlyData[month].scores.push(parseFloat(item.marks_obtained) || 0);
    monthlyData[month].studentIds.add(item.student_id);
  });
  
  const performanceTrends = Object.values(monthlyData).map(monthData => ({
    month: monthData.month,
    average_score: monthData.scores.length > 0 
      ? monthData.scores.reduce((sum, score) => sum + score, 0) / monthData.scores.length 
      : 0,
    student_count: monthData.studentIds.size
  })).sort((a, b) => a.month.localeCompare(b.month));

  // Get top performers
  const studentAverages = {};
  data.forEach(item => {
    if (!studentAverages[item.student_id]) {
      studentAverages[item.student_id] = {
        student_id: item.student_id,
        student_name: item.student 
          ? `${item.student.first_name || ''} ${item.student.last_name || ''}`.trim() 
          : 'Unknown',
        roll_number: item.student?.roll_number || '',
        scores: [],
        subjectIds: new Set()
      };
    }
    const score = parseFloat(item.marks_obtained) || 0;
    studentAverages[item.student_id].scores.push(score);
    studentAverages[item.student_id].subjectIds.add(item.subject_id);
  });

  const topPerformers = Object.values(studentAverages)
    .filter(student => student.subjectIds.size >= 3) // Only include students with at least 3 subjects
    .map(student => ({
      ...student,
      average_score: student.scores.length > 0 
        ? student.scores.reduce((sum, score) => sum + score, 0) / student.scores.length 
        : 0,
      subjects_count: student.subjectIds.size
    }))
    .sort((a, b) => b.average_score - a.average_score)
    .slice(0, 10); // Top 10 performers

  return {
    summary: {
      total_students: studentIds.size,
      total_subjects: subjectIds.size,
      total_exams: examIds.size,
      average_score: averageScore,
      pass_rate: passRate,
      highest_score: scores.length > 0 ? Math.max(...scores) : 0,
      lowest_score: scores.length > 0 ? Math.min(...scores) : 0,
      failed_count: scores.filter(score => score < 40).length
    },
    subjectPerformance,
    performanceTrends,
    topPerformers,
    filters: {},
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Generate mock performance data for fallback
 * @returns {Object} Mock performance data
 */
function getMockPerformanceData() {
  const subjects = [
    { id: 'math', name: 'Mathematics' },
    { id: 'sci', name: 'Science' },
    { id: 'eng', name: 'English' },
    { id: 'hist', name: 'History' },
    { id: 'comp', name: 'Computer Science' }
  ];
  
  const months = [];
  const today = new Date();
  for (let i = 5; i >= 0; i--) {
    const date = new Date(today);
    date.setMonth(date.getMonth() - i);
    months.push(date.toISOString().slice(0, 7));
  }
  
  const subjectPerformance = subjects.map((subject, idx) => ({
    subject_id: subject.id,
    subject_name: subject.name,
    student_count: Math.floor(Math.random() * 50) + 50, // 50-100 students
    average_score: Math.floor(Math.random() * 30) + 50, // 50-80
    pass_rate: Math.floor(Math.random() * 50) + 50, // 50-100%
    highest_score: Math.floor(Math.random() * 20) + 80, // 80-100
    lowest_score: Math.floor(Math.random() * 40) // 0-40
  }));
  
  const performanceTrends = months.map(month => ({
    month,
    average_score: Math.floor(Math.random() * 20) + 60, // 60-80
    student_count: Math.floor(Math.random() * 100) + 50 // 50-150 students
  }));
  
  const topPerformers = Array(10).fill(0).map((_, idx) => ({
    student_id: `student-${idx + 1}`,
    student_name: `Student ${String.fromCharCode(65 + idx)}`,
    roll_number: `ROLL${1000 + idx}`,
    average_score: Math.floor(Math.random() * 20) + 80, // 80-100
    subjects_count: Math.floor(Math.random() * 3) + 3 // 3-5 subjects
  })).sort((a, b) => b.average_score - a.average_score);
  
  return {
    summary: {
      total_students: new Set(topPerformers.map(s => s.student_id)).size,
      total_subjects: subjects.length,
      total_exams: Math.floor(Math.random() * 20) + 10, // 10-30 exams
      average_score: Math.floor(Math.random() * 20) + 65, // 65-85
      pass_rate: Math.floor(Math.random() * 30) + 60, // 60-90%
      highest_score: 100,
      lowest_score: 0,
      failed_count: Math.floor(Math.random() * 20) // 0-20
    },
    subjectPerformance,
    performanceTrends,
    topPerformers,
    filters: {},
    lastUpdated: new Date().toISOString(),
    _isMock: true
  };
}

/**
 * Get marks analytics data
 * @param {Object} filters - Filter options
 * @param {string} [filters.student_id] - Student ID filter
 * @param {string} [filters.semester] - Semester filter
 * @param {string} [filters.exam_type] - Exam type filter
 * @param {number} [filters.min_marks] - Minimum marks filter
 * @param {Date} [filters.start_date] - Start date filter
 * @param {Date} [filters.end_date] - End date filter
 * @returns {Promise<Object>} Marks analytics data
 */
/**
 * Get marks analytics data from marks_staging table
 * @param {Object} filters - Filter options
 * @param {string} [filters.student_id] - Student ID filter
 * @param {string} [filters.subject_id] - Subject ID filter
 * @param {string} [filters.semester] - Semester filter
 * @param {string} [filters.exam_type] - Exam type filter
 * @param {number} [filters.min_marks] - Minimum marks filter
 * @param {Date|string} [filters.start_date] - Start date filter
 * @param {Date|string} [filters.end_date] - End date filter
 * @returns {Promise<Object>} Marks analytics data
 */
export const getMarksAnalytics = async (filters = {}) => {
  try {
    if (!supabase) {
      throw new Error('Supabase client is not initialized');
    }

    console.log("Fetching marks analytics with filters:", filters);

    // Build the base query
    let query = supabase
      .from('marks_staging')
      .select('*');

    // Apply filters
    if (filters.student_id) {
      query = query.eq('student_id', filters.student_id);
    }
    
    if (filters.subject_id) {
      query = query.eq('subject_id', filters.subject_id);
    }
    
    if (filters.semester) {
      query = query.eq('semester', filters.semester);
    }
    
    if (filters.exam_type) {
      query = query.eq('exam_type', filters.exam_type);
    }
    
    if (filters.min_marks) {
      query = query.gte('marks_obtained', filters.min_marks);
    }
    
    // Format dates if they are Date objects
    if (filters.start_date) {
      const startDate = typeof filters.start_date === 'string' 
        ? filters.start_date 
        : format(new Date(filters.start_date), 'yyyy-MM-dd');
      query = query.gte('exam_date', startDate);
    }
    
    if (filters.end_date) {
      const endDate = typeof filters.end_date === 'string'
        ? filters.end_date
        : format(new Date(filters.end_date), 'yyyy-MM-dd');
      query = query.lte('exam_date', endDate);
    }

    console.log("Executing query...");
    const { data: marksData, error } = await query;
    
    if (error) {
      console.error("Supabase query error:", error);
      throw new Error(`Database error: ${error.message}`);
    }

    console.log(`Retrieved ${marksData?.length || 0} records from marks_staging`);

    // If no data, return empty structure
    if (!marksData || marksData.length === 0) {
      console.warn("No marks data found for the given filters");
      return {
        studentPerformance: [],
        subjectPerformance: [],
        examTrends: [],
        gradeDistribution: [],
        studentTrends: []
      };
    }

    // Process the data
    const processedData = {
      studentPerformance: [],
      subjectPerformance: [],
      examTrends: [],
      gradeDistribution: generateGradeDistribution(marksData),
      studentTrends: filters.student_id ? generateStudentTrends(marksData, filters.student_id) : []
    };
    
    console.log("Processed data structure:", {
      studentCount: processedData.studentPerformance.length,
      subjectCount: processedData.subjectPerformance.length,
      examTrendsCount: processedData.examTrends.length,
      gradeDistribution: processedData.gradeDistribution.length,
      studentTrends: processedData.studentTrends.length
    });

    // Group data by student
    const studentMap = new Map();
    const subjectMap = new Map();
    const examMap = new Map();

    marksData.forEach(record => {
      // Process student performance
      if (!studentMap.has(record.student_id)) {
        studentMap.set(record.student_id, {
          student_id: record.student_id,
          student_name: `Student ${record.student_id}`, // Fallback name
          total_marks: 0,
          count: 0,
          max_marks: 0,
          min_marks: 100,
          subjects: new Set()
        });
      }
      const student = studentMap.get(record.student_id);
      student.total_marks += record.marks_obtained || 0;
      student.count++;
      student.max_marks = Math.max(student.max_marks, record.marks_obtained || 0);
      student.min_marks = Math.min(student.min_marks, record.marks_obtained || 100);
      student.subjects.add(record.subject_id);
      
      // Process subject performance
      if (!subjectMap.has(record.subject_id)) {
        subjectMap.set(record.subject_id, {
          subject_id: record.subject_id,
          subject_name: `Subject ${record.subject_id}`, // Fallback name
          total_marks: 0,
          count: 0,
          pass_count: 0,
          max_marks: 0,
          min_marks: 100
        });
      }
      const subject = subjectMap.get(record.subject_id);
      subject.total_marks += record.marks_obtained || 0;
      subject.count++;
      subject.pass_count += (record.marks_obtained || 0) >= (record.passing_marks || 0) ? 1 : 0;
      subject.max_marks = Math.max(subject.max_marks, record.marks_obtained || 0);
      subject.min_marks = Math.min(subject.min_marks, record.marks_obtained || 100);
      
      // Process exam trends
      const examKey = `${record.exam_id || 'unknown'}_${record.subject_id}`;
      if (!examMap.has(examKey)) {
        examMap.set(examKey, {
          exam_id: record.exam_id || 'unknown',
          exam_name: record.exam_type || 'Exam',
          subject_id: record.subject_id,
          subject_name: `Subject ${record.subject_id}`,
          total_marks: 0,
          count: 0,
          date: record.exam_date || new Date().toISOString().split('T')[0]
        });
      }
      const exam = examMap.get(examKey);
      exam.total_marks += record.marks_obtained || 0;
      exam.count++;
    });

    // Calculate student performance
    processedData.studentPerformance = Array.from(studentMap.values()).map(student => ({
      ...student,
      avg_marks: student.count > 0 ? student.total_marks / student.count : 0,
      subjects_count: student.subjects.size
    }));

    // Calculate subject performance
    processedData.subjectPerformance = Array.from(subjectMap.values()).map(subject => ({
      ...subject,
      avg_marks: subject.count > 0 ? subject.total_marks / subject.count : 0,
      pass_rate: subject.count > 0 ? (subject.pass_count / subject.count) * 100 : 0
    }));

    // Format exam trends
    processedData.examTrends = Array.from(examMap.values()).map(exam => ({
      ...exam,
      avg_marks: exam.count > 0 ? exam.total_marks / exam.count : 0,
      date: exam.date
    }));

    // Generate grade distribution
    processedData.gradeDistribution = generateGradeDistribution(marksData);

    // Generate student trends if student_id filter is applied
    if (filters.student_id) {
      processedData.studentTrends = generateStudentTrends(marksData, filters.student_id);
    }

    return processedData;
    
  } catch (error) {
    console.error('Error in getMarksAnalytics:', error);
    // Return empty data structure on error
    return {
      studentPerformance: [],
      subjectPerformance: [],
      examTrends: [],
      gradeDistribution: [],
      studentTrends: []
    };
  }
};

// Helper function to generate grade distribution
function generateGradeDistribution(marksData) {
  // Simple grade distribution based on percentage
  const distribution = {
    'A+': 0,
    'A': 0,
    'B+': 0,
    'B': 0,
    'C': 0,
    'D': 0,
    'F': 0
  };

  marksData.forEach(record => {
    if (!record.marks_obtained || !record.max_marks) return;
    
    const percentage = (record.marks_obtained / record.max_marks) * 100;
    if (percentage >= 90) distribution['A+']++;
    else if (percentage >= 80) distribution['A']++;
    else if (percentage >= 70) distribution['B+']++;
    else if (percentage >= 60) distribution['B']++;
    else if (percentage >= 50) distribution['C']++;
    else if (percentage >= 40) distribution['D']++;
    else distribution['F']++;
  });

  return Object.entries(distribution).map(([grade, count]) => ({
    grade,
    count,
    percentage: marksData.length > 0 ? (count / marksData.length) * 100 : 0
  }));
}

// Helper function to generate student trends
function generateStudentTrends(marksData, studentId) {
  const studentMarks = marksData
    .filter(record => record.student_id === studentId)
    .sort((a, b) => new Date(a.exam_date) - new Date(b.exam_date));

  return studentMarks.map((record, index) => ({
    exam_name: `Exam ${index + 1}`,
    marks: record.marks_obtained,
    date: record.exam_date || new Date().toISOString().split('T')[0],
    subject_id: record.subject_id,
    subject_name: `Subject ${record.subject_id}` 
  }));
}

export default AnalyticsService;
