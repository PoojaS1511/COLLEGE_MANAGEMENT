// frontend/src/services/courseService.js
import axios from 'axios';
import { API_URL } from '../config';

const API_BASE = API_URL.replace(/\/$/, ''); // Ensure no trailing slash

const getCourses = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });

    const response = await axios.get(`${API_URL}/career/courses?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
};

const getCourseById = async (courseId) => {
  try {
    const response = await axios.get(`${API_URL}/career/courses/${courseId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching course ${courseId}:`, error);
    throw error;
  }
};

const createCourse = async (courseData) => {
  try {
    const response = await axios.post(`${API_URL}/career/courses`, courseData);
    return response.data;
  } catch (error) {
    console.error('Error creating course:', error);
    throw error;
  }
};

const updateCourse = async (courseId, courseData) => {
  try {
    const response = await axios.put(`${API_URL}/career/courses/${courseId}`, courseData);
    return response.data;
  } catch (error) {
    console.error(`Error updating course ${courseId}:`, error);
    throw error;
  }
};

const deleteCourse = async (courseId) => {
  try {
    const response = await axios.delete(`${API_URL}/career/courses/${courseId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting course ${courseId}:`, error);
    throw error;
  }
};

const getCourseFilters = async () => {
  try {
    const response = await axios.get(`${API_URL}/career/courses/filters`);
    return response.data;
  } catch (error) {
    console.error('Error fetching course filters:', error);
    throw error;
  }
};

export default {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseFilters
};