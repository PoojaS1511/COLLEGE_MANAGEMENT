// API configuration
export const API_URL = import.meta.env.VITE_API_URL || '/api';
// Endpoint to receive error logs (POST)
export const LOGGING_URL = import.meta.env.VITE_LOGGING_URL || `${API_URL}/errors`;

// Other configuration constants
export const APP_NAME = 'Student Management System';
export const VERSION = '1.0.0';

export default {
  API_URL,
  LOGGING_URL,
  APP_NAME,
  VERSION
};
