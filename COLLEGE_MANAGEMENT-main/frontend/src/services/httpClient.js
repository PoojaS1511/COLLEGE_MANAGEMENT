import axios from 'axios';
import { getSupabase } from '../lib/supabase';
import { API_URL } from '../config';

const API_BASE_URL = process.env.REACT_APP_API_URL || API_URL.replace(/\/$/, '');

const httpClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token to requests
httpClient.interceptors.request.use(
  async (config) => {
    try {
      const { data: { session } } = await getSupabase().auth.getSession();
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
      return config;
    } catch (error) {
      console.error('Error in request interceptor:', error);
      return config;
    }
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the session
        const { data, error: refreshError } = await getSupabase().auth.refreshSession();
        
        if (refreshError) throw refreshError;
        
        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${data.session.access_token}`;
        return httpClient(originalRequest);
      } catch (refreshError) {
        console.error('Session refresh failed:', refreshError);
        // Redirect to login or handle session expiration
        if (window.location.pathname !== '/admin/login') {
          window.location.href = '/admin/login';
        }
        return Promise.reject(refreshError);
      }
    }
    
    // Handle other errors
    return Promise.reject(error);
  }
);

export default httpClient;
