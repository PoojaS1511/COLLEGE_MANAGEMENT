import { supabase } from '../lib/supabase';

const adminService = {
  // Get student statistics
  getStudentStats: async () => {
    try {
      // Get the current session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        console.log('No active session found, using default stats');
        return getDefaultStats();
      }
      
      // Use the access token from the session
      const response = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/students/stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token is invalid, refresh it
          const { data, error } = await supabase.auth.refreshSession();
          if (error) {
            console.error('Error refreshing session:', error);
            return getDefaultStats();
          }
          // Use the new access token
          const newResponse = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/students/stats`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${data.session.access_token}`,
              'Content-Type': 'application/json'
            }
          });
          if (!newResponse.ok) {
            throw new Error(`HTTP error! status: ${newResponse.status}`);
          }
          return await newResponse.json();
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching student stats, using default data:', error);
      return getDefaultStats();
    }
  },

  // Add more admin-related API calls here as needed
};

// Default stats to use when API is not available
const getDefaultStats = () => ({
  total: 1250,
  male: 750,
  female: 500,
  departments: 6,
  faculty: 85
});

export default adminService;
