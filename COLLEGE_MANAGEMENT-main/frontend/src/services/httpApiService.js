/**
 * HTTP API Service for Flask Backend
 * Makes HTTP requests to the Flask backend server instead of using Supabase directly
 */

import { API_URL } from '../config';

const API_BASE_URL = process.env.VITE_API_BASE_URL || API_URL; // Uses frontend config, which includes /api

class HttpApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const config = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    try {
      console.log(`Making ${config.method} request to: ${url}`);
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error making request to ${url}:`, error);
      throw error;
    }
  }

  // ====================================
  // Course Methods
  // ====================================
  async getCourses(filters = {}) {
    try {
      const params = new URLSearchParams();

      if (filters.department_id) {
        params.append('department_id', filters.department_id);
      }
      if (filters.search) {
        params.append('search', filters.search);
      }

      const queryString = params.toString();
      const endpoint = `/academics/courses${queryString ? `?${queryString}` : ''}`;

      const response = await this.request(endpoint);

      if (response && response.success) {
        return {
          success: true,
          data: response.data || []
        };
      }

      return {
        success: false,
        data: [],
        message: response?.message || 'Failed to fetch courses'
      };
    } catch (error) {
      console.error('Error in getCourses:', error);
      return {
        success: false,
        data: [],
        message: error.message || 'Failed to fetch courses'
      };
    }
  }

  async getCourse(id) {
    try {
      const response = await this.request(`/academics/courses/${id}`);

      if (response && response.success) {
        return {
          success: true,
          data: response.data
        };
      }

      return {
        success: false,
        data: null,
        message: response?.error || 'Course not found'
      };
    } catch (error) {
      console.error('Error in getCourse:', error);
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to fetch course'
      };
    }
  }

  async createCourse(courseData) {
    try {
      const response = await this.request('/academics/courses', {
        method: 'POST',
        body: courseData
      });

      if (response && response.success) {
        return {
          success: true,
          data: response.data,
          message: 'Course created successfully'
        };
      }

      return {
        success: false,
        message: response?.error || 'Failed to create course'
      };
    } catch (error) {
      console.error('Error in createCourse:', error);
      return {
        success: false,
        message: error.message || 'Failed to create course'
      };
    }
  }

  async updateCourse(id, updates) {
    try {
      const response = await this.request(`/academics/courses/${id}`, {
        method: 'PUT',
        body: updates
      });

      if (response && response.success) {
        return {
          success: true,
          data: response.data,
          message: 'Course updated successfully'
        };
      }

      return {
        success: false,
        message: response?.error || 'Failed to update course'
      };
    } catch (error) {
      console.error('Error in updateCourse:', error);
      return {
        success: false,
        message: error.message || 'Failed to update course'
      };
    }
  }

  async deleteCourse(id) {
    try {
      const response = await this.request(`/academics/courses/${id}`, {
        method: 'DELETE'
      });

      if (response && response.success) {
        return {
          success: true,
          message: 'Course deleted successfully'
        };
      }

      return {
        success: false,
        message: response?.error || 'Failed to delete course'
      };
    } catch (error) {
      console.error('Error in deleteCourse:', error);
      return {
        success: false,
        message: error.message || 'Failed to delete course'
      };
    }
  }

  // ====================================
  // Subject Methods
  // ====================================
  async getSubjects(filters = {}) {
    try {
      const params = new URLSearchParams();

      if (filters.course_id) {
        params.append('course_id', filters.course_id);
      }
      if (filters.semester) {
        params.append('semester', filters.semester);
      }
      if (filters.search) {
        params.append('search', filters.search);
      }

      const queryString = params.toString();
      const endpoint = `/academics/subjects${queryString ? `?${queryString}` : ''}`;

      const response = await this.request(endpoint);

      if (response && response.success) {
        return {
          success: true,
          data: response.data || []
        };
      }

      return {
        success: false,
        data: [],
        message: response?.error || 'Failed to fetch subjects'
      };
    } catch (error) {
      console.error('Error in getSubjects:', error);
      return {
        success: false,
        data: [],
        message: error.message || 'Failed to fetch subjects'
      };
    }
  }

  async getSubject(id) {
    try {
      const response = await this.request(`/academics/subjects/${id}`);

      if (response && response.success) {
        return {
          success: true,
          data: response.data
        };
      }

      return {
        success: false,
        data: null,
        message: response?.error || 'Subject not found'
      };
    } catch (error) {
      console.error('Error in getSubject:', error);
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to fetch subject'
      };
    }
  }

  async createSubject(subjectData) {
    try {
      const response = await this.request('/academics/subjects', {
        method: 'POST',
        body: subjectData
      });

      if (response && response.success) {
        return {
          success: true,
          data: response.data,
          message: 'Subject created successfully'
        };
      }

      return {
        success: false,
        message: response?.error || 'Failed to create subject'
      };
    } catch (error) {
      console.error('Error in createSubject:', error);
      return {
        success: false,
        message: error.message || 'Failed to create subject'
      };
    }
  }

  async updateSubject(id, updates) {
    try {
      const response = await this.request(`/academics/subjects/${id}`, {
        method: 'PUT',
        body: updates
      });

      if (response && response.success) {
        return {
          success: true,
          data: response.data,
          message: 'Subject updated successfully'
        };
      }

      return {
        success: false,
        message: response?.error || 'Failed to update subject'
      };
    } catch (error) {
      console.error('Error in updateSubject:', error);
      return {
        success: false,
        message: error.message || 'Failed to update subject'
      };
    }
  }

  async deleteSubject(id) {
    try {
      const response = await this.request(`/academics/subjects/${id}`, {
        method: 'DELETE'
      });

      if (response && response.success) {
        return {
          success: true,
          message: 'Subject deleted successfully'
        };
      }

      return {
        success: false,
        message: response?.error || 'Failed to delete subject'
      };
    } catch (error) {
      console.error('Error in deleteSubject:', error);
      return {
        success: false,
        message: error.message || 'Failed to delete subject'
      };
    }
  }

  // ====================================
  // Exam Methods
  // ====================================
  async getExams(filters = {}) {
    try {
      const params = new URLSearchParams();

      if (filters.subject_id) {
        params.append('subject_id', filters.subject_id);
      }
      if (filters.exam_type) {
        params.append('exam_type', filters.exam_type);
      }
      if (filters.academic_year) {
        params.append('academic_year', filters.academic_year);
      }
      if (filters.semester) {
        params.append('semester', filters.semester);
      }
      if (filters.search) {
        params.append('search', filters.search);
      }

      const queryString = params.toString();
      const endpoint = `/exams${queryString ? `?${queryString}` : ''}`;

      const response = await this.request(endpoint);

      if (response && response.success) {
        return {
          success: true,
          data: response.data || []
        };
      }

      return {
        success: false,
        data: [],
        message: response?.error || 'Failed to fetch exams'
      };
    } catch (error) {
      console.error('Error in getExams:', error);
      return {
        success: false,
        data: [],
        message: error.message || 'Failed to fetch exams'
      };
    }
  }

  async getExam(id) {
    try {
      const response = await this.request(`/exams/${id}`);

      if (response && response.success) {
        return {
          success: true,
          data: response.data
        };
      }

      return {
        success: false,
        data: null,
        message: response?.error || 'Exam not found'
      };
    } catch (error) {
      console.error('Error in getExam:', error);
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to fetch exam'
      };
    }
  }

  async createExam(examData) {
    try {
      const response = await this.request('/exams', {
        method: 'POST',
        body: examData
      });

      if (response && response.success) {
        return {
          success: true,
          data: response.data,
          message: 'Exam created successfully'
        };
      }

      return {
        success: false,
        message: response?.error || 'Failed to create exam'
      };
    } catch (error) {
      console.error('Error in createExam:', error);
      return {
        success: false,
        message: error.message || 'Failed to create exam'
      };
    }
  }

  async updateExam(id, updates) {
    try {
      const response = await this.request(`/exams/${id}`, {
        method: 'PUT',
        body: updates
      });

      if (response && response.success) {
        return {
          success: true,
          data: response.data,
          message: 'Exam updated successfully'
        };
      }

      return {
        success: false,
        message: response?.error || 'Failed to update exam'
      };
    } catch (error) {
      console.error('Error in updateExam:', error);
      return {
        success: false,
        message: error.message || 'Failed to update exam'
      };
    }
  }

  async deleteExam(id) {
    try {
      const response = await this.request(`/exams/${id}`, {
        method: 'DELETE'
      });

      if (response && response.success) {
        return {
          success: true,
          message: 'Exam deleted successfully'
        };
      }

      return {
        success: false,
        message: response?.error || 'Failed to delete exam'
      };
    } catch (error) {
      console.error('Error in deleteExam:', error);
      return {
        success: false,
        message: error.message || 'Failed to delete exam'
      };
    }
  }

  // ====================================
  // Marks Methods
  // ====================================
  async getMarks(filters = {}) {
    try {
      const params = new URLSearchParams();

      if (filters.student_id) {
        params.append('student_id', filters.student_id);
      }
      if (filters.exam_id) {
        params.append('exam_id', filters.exam_id);
      }
      if (filters.subject_id) {
        params.append('subject_id', filters.subject_id);
      }

      const queryString = params.toString();
      const endpoint = `/marks${queryString ? `?${queryString}` : ''}`;

      const response = await this.request(endpoint);

      if (response && response.success) {
        return {
          success: true,
          data: response.data || []
        };
      }

      return {
        success: false,
        data: [],
        message: response?.error || 'Failed to fetch marks'
      };
    } catch (error) {
      console.error('Error in getMarks:', error);
      return {
        success: false,
        data: [],
        message: error.message || 'Failed to fetch marks'
      };
    }
  }

  async createMarks(marksData) {
    try {
      const response = await this.request('/marks', {
        method: 'POST',
        body: marksData
      });

      if (response && response.success) {
        return {
          success: true,
          data: response.data,
          message: 'Marks created successfully'
        };
      }

      return {
        success: false,
        message: response?.error || 'Failed to create marks'
      };
    } catch (error) {
      console.error('Error in createMarks:', error);
      return {
        success: false,
        message: error.message || 'Failed to create marks'
      };
    }
  }

  async updateMarks(id, updates) {
    try {
      const response = await this.request(`/marks/${id}`, {
        method: 'PUT',
        body: updates
      });

      if (response && response.success) {
        return {
          success: true,
          data: response.data,
          message: 'Marks updated successfully'
        };
      }

      return {
        success: false,
        message: response?.error || 'Failed to update marks'
      };
    } catch (error) {
      console.error('Error in updateMarks:', error);
      return {
        success: false,
        message: error.message || 'Failed to update marks'
      };
    }
  }

  // ====================================
  // Department Methods
  // ====================================
  async getAllDepartments() {
    try {
      const response = await this.request('/academics/departments');

      if (response && response.success) {
        return {
          success: true,
          data: response.data || []
        };
      }

      return {
        success: false,
        data: [],
        message: response?.error || 'Failed to fetch departments'
      };
    } catch (error) {
      console.error('Error in getAllDepartments:', error);
      return {
        success: false,
        data: [],
        message: error.message || 'Failed to fetch departments'
      };
    }
  }
}

// Create a singleton instance
const httpApiService = new HttpApiService();

export default httpApiService;
