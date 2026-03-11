import axios from 'axios';
import { supabase } from '../lib/supabase';

import { API_URL } from '../config';

const API_BASE_URL = API_URL.replace(/\/$/, '');

const internshipService = {
  // Fetch all internships
  getInternships: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/internships`);
      console.log('Raw API response:', response.data);
      
      // The backend returns { success, data, count, total }
      if (response.data && response.data.success) {
        return { 
          data: {
            internships: response.data.data || [],
            count: response.data.count || 0,
            total: response.data.total || 0
          } 
        };
      }
      return { data: { internships: [], count: 0, total: 0 } };
    } catch (error) {
      console.error('Error fetching internships:', error);
      return { data: { internships: [], count: 0, total: 0 } };
    }
  },

  // Get student's internship applications
  getStudentInternships: async (studentId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/internships/student`, {
        params: { student_id: studentId }
      });
      // Ensure the response has the expected structure
      if (response.data && response.data.internships) {
        return { data: response.data };
      }
      return { data: { internships: [] } };
    } catch (error) {
      console.error('Error fetching student internships:', error);
      // Return empty array instead of throwing to prevent UI crash
      return { data: { internships: [] } };
    }
  },

  // Apply to an internship
  applyToInternship: async (studentId, internshipId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/internships/student`, {
        student_id: studentId,
        internship_id: internshipId,
        status: 'applied'
      });
      return response.data;
    } catch (error) {
      console.error('Error applying to internship:', error);
      // Return a consistent error structure
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to apply to internship' 
      };
    }
  },

  // Upload resume
  uploadResume: async (studentId, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('student_id', studentId);

      const response = await axios.post(`${API_BASE_URL}/api/resume/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading resume:', error);
      // Return a consistent error structure
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to upload resume' 
      };
    }
  },

  // Get resume details
  getResume: async (studentId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/resume/${studentId}`, {
        validateStatus: status => status < 500 // Don't throw for 404 errors
      });
      
      // If we get a 404, return a consistent structure
      if (response.status === 404) {
        return { 
          uploaded: false,
          success: false,
          error: 'Resume not found'
        };
      }
      
      // If we get a successful response but no data, return as not uploaded
      if (!response.data) {
        return { 
          uploaded: false,
          success: true,
          message: 'No resume found'
        };
      }
      
      // Return the response data with uploaded status
      return {
        ...response.data,
        uploaded: true,
        success: true
      };
    } catch (error) {
      console.error('Error fetching resume:', error);
      // For any other errors, return a consistent error structure
      return { 
        uploaded: false,
        success: false,
        error: error.response?.data?.error || 'Failed to fetch resume',
        details: error.message
      };
    }
  },
};

export default internshipService;
