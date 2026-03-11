import axios from 'axios';

import { API_URL } from '../config';

const API_BASE_URL = API_URL.replace(/\/$/, '');

// Sample data to use as fallback
const SAMPLE_COURSES = [
  {
    id: 'default-1',
    title: 'Introduction to Computer Science',
    platform: 'Harvard CS50',
    organization: 'Harvard University',
    thumbnail: 'https://cs50.harvard.edu/x/2023/og.png',
    url: 'https://cs50.harvard.edu/x/2023/',
    description: 'Introduction to the intellectual enterprises of computer science and the art of programming.',
    category: 'Computer Science'
  },
  {
    id: 'default-2',
    title: 'Python for Data Science',
    platform: 'edX',
    organization: 'IBM',
    thumbnail: 'https://images.unsplash.com/photo-1547658719-da2b51169166?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
    url: 'https://www.edx.org/course/python-for-data-science',
    description: 'Learn the fundamentals of data science with Python and how to analyze and visualize data.',
    category: 'Data Science'
  }
];

const courseService = {
  // Fetch all career preparation courses
  getCourses: async (filters = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/career/courses`, { 
        params: filters,
        timeout: 10000 // 10 second timeout
      });
      
      if (response.data && response.data.success) {
        const courses = Array.isArray(response.data.data) ? response.data.data : [];
        return { 
          data: courses,
          count: courses.length,
          total: courses.length,
          cached: response.data.cached || false
        };
      }
      
      // If no data or error in response, return sample data
      return { 
        data: SAMPLE_COURSES,
        count: SAMPLE_COURSES.length,
        total: SAMPLE_COURSES.length,
        cached: false
      };
      
    } catch (error) {
      console.error('Error fetching career courses:', error);
      // Return sample data if there's an error
      return { 
        data: SAMPLE_COURSES,
        count: SAMPLE_COURSES.length,
        total: SAMPLE_COURSES.length,
        cached: false,
        error: error.message
      };
    }
  },

  // Force refresh the courses cache
  refreshCourses: async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/career/courses/refresh`);
      return response.data;
    } catch (error) {
      console.error('Error refreshing courses:', error);
      throw error;
    }
  },

  // Search courses with filters
  searchCourses: async (query, filters = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/career/courses/search`, {
        params: { q: query, ...filters }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching courses:', error);
      throw error;
    }
  },

  // Get course by ID
  getCourseById: async (courseId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/career/courses/${courseId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching course ${courseId}:`, error);
      throw error;
    }
  },

  // Get unique categories from courses
  getCategories: (courses) => {
    const categories = new Set(['All']);
    courses.forEach(course => {
      if (course.category) {
        categories.add(course.category);
      }
    });
    return Array.from(categories);
  },

  // Get unique platforms from courses
  getPlatforms: (courses) => {
    const platforms = new Set(['All']);
    courses.forEach(course => {
      if (course.platform) {
        platforms.add(course.platform);
      }
    });
    return Array.from(platforms);
  }
};

export default courseService;