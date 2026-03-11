import httpClient from './httpClient';

class TransportService {
  // Helper method for API calls
  static async apiCall(endpoint, options = {}) {
    try {
      const response = await httpClient.get(`${endpoint}${options.params ? '?' + new URLSearchParams(options.params).toString() : ''}`);
      return response.data;
    } catch (error) {
      console.error(`API call to ${endpoint} failed:`, error);
      throw error;
    }
  }

  // ====================================
  // DASHBOARD METRICS
  // ====================================

  static async getDashboardMetrics() {
    try {
      const response = await httpClient.get('/api/transport/dashboard/metrics');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      return { success: false, error: error.message };
    }
  }

  // ====================================
  // STUDENT MANAGEMENT
  // ====================================

  static async getTransportStudents(filters = {}) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const endpoint = `/api/transport/students${queryString ? '?' + queryString : ''}`;
      const response = await httpClient.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching transport students:', error);
      return { success: false, error: error.message };
    }
  }

  static async addTransportStudent(studentData) {
    try {
      const response = await httpClient.post('/api/transport/students', studentData);
      return response.data;
    } catch (error) {
      console.error('Error adding transport student:', error);
      return { success: false, error: error.message };
    }
  }

  static async updateTransportStudent(id, updates) {
    try {
      const response = await httpClient.put(`/api/transport/students/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating transport student:', error);
      return { success: false, error: error.message };
    }
  }

  static async deleteTransportStudent(id) {
    try {
      const response = await httpClient.delete(`/api/transport/students/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting transport student:', error);
      return { success: false, error: error.message };
    }
  }

  // ====================================
  // FACULTY MANAGEMENT
  // ====================================

  static async getTransportFaculty(filters = {}) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const endpoint = `/api/transport/faculty${queryString ? '?' + queryString : ''}`;
      const response = await httpClient.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching transport faculty:', error);
      return { success: false, error: error.message };
    }
  }

  static async addTransportFaculty(facultyData) {
    try {
      const response = await httpClient.post('/api/transport/faculty', facultyData);
      return response.data;
    } catch (error) {
      console.error('Error adding transport faculty:', error);
      return { success: false, error: error.message };
    }
  }

  static async updateTransportFaculty(id, updates) {
    try {
      const response = await httpClient.put(`/api/transport/faculty/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating transport faculty:', error);
      return { success: false, error: error.message };
    }
  }

  static async deleteTransportFaculty(id) {
    try {
      const response = await httpClient.delete(`/api/transport/faculty/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting transport faculty:', error);
      return { success: false, error: error.message };
    }
  }

  // ====================================
  // BUS MANAGEMENT
  // ====================================

  static async getBuses(filters = {}) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const endpoint = `/api/transport/buses${queryString ? '?' + queryString : ''}`;
      const response = await httpClient.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching buses:', error);
      return { success: false, error: error.message };
    }
  }

  static async addBus(busData) {
    try {
      const response = await httpClient.post('/api/transport/buses', busData);
      return response.data;
    } catch (error) {
      console.error('Error adding bus:', error);
      return { success: false, error: error.message };
    }
  }

  static async updateBus(id, updates) {
    try {
      const response = await httpClient.put(`/api/transport/buses/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating bus:', error);
      return { success: false, error: error.message };
    }
  }

  static async deleteBus(id) {
    try {
      const response = await httpClient.delete(`/api/transport/buses/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting bus:', error);
      return { success: false, error: error.message };
    }
  }

  // ====================================
  // DRIVER MANAGEMENT
  // ====================================

  static async getDrivers(filters = {}) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const endpoint = `/api/transport/drivers${queryString ? '?' + queryString : ''}`;
      const response = await httpClient.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching drivers:', error);
      return { success: false, error: error.message };
    }
  }

  static async addDriver(driverData) {
    try {
      const response = await httpClient.post('/api/transport/drivers', driverData);
      return response.data;
    } catch (error) {
      console.error('Error adding driver:', error);
      return { success: false, error: error.message };
    }
  }

  static async updateDriver(id, updates) {
    try {
      const response = await httpClient.put(`/api/transport/drivers/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating driver:', error);
      return { success: false, error: error.message };
    }
  }

  static async deleteDriver(id) {
    try {
      const response = await httpClient.delete(`/api/transport/drivers/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting driver:', error);
      return { success: false, error: error.message };
    }
  }

  // ====================================
  // ROUTE MANAGEMENT
  // ====================================

  static async getRoutes(filters = {}) {
    try {
      // Use the unified /api/transport/routes endpoint which we've synced to Supabase
      const queryString = new URLSearchParams(filters).toString();
      const endpoint = `/api/transport/routes${queryString ? '?' + queryString : ''}`;
      const response = await httpClient.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching routes:', error);
      return { success: false, error: error.message };
    }
  }

  static async getRouteById(id) {
    try {
      const response = await httpClient.get(`/api/transport/routes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching route:', error);
      return { success: false, error: error.message };
    }
  }

  static async addRoute(routeData) {
    try {
      const response = await httpClient.post('/api/transport/routes', routeData);
      return response.data;
    } catch (error) {
      console.error('Error adding route:', error);
      return { success: false, error: error.message };
    }
  }

  static async updateRoute(id, updates) {
    try {
      const response = await httpClient.put(`/api/transport/routes/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating route:', error);
      return { success: false, error: error.message };
    }
  }

  static async deleteRoute(id) {
    try {
      const response = await httpClient.delete(`/api/transport/routes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting route:', error);
      return { success: false, error: error.message };
    }
  }

  // ====================================
  // FEES MANAGEMENT
  // ====================================

  static async getTransportFees(filters = {}) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const endpoint = `/api/transport/fees${queryString ? '?' + queryString : ''}`;
      const response = await httpClient.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching transport fees:', error);
      return { success: false, error: error.message };
    }
  }

  static async recordPayment(paymentData) {
    try {
      const response = await httpClient.post('/api/transport/fees/payment', paymentData);
      return response.data;
    } catch (error) {
      console.error('Error recording payment:', error);
      return { success: false, error: error.message };
    }
  }

  static async updateFeeStatus(id, status) {
    try {
      const response = await httpClient.put(`/api/transport/fees/${id}/status`, status);
      return response.data;
    } catch (error) {
      console.error('Error updating fee status:', error);
      return { success: false, error: error.message };
    }
  }

  // ====================================
  // ATTENDANCE MANAGEMENT
  // ====================================

  static async getAttendance(filters = {}) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const endpoint = `/api/transport/attendance${queryString ? '?' + queryString : ''}`;
      const response = await httpClient.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching attendance:', error);
      return { success: false, error: error.message };
    }
  }

  static async markAttendance(attendanceData) {
    try {
      const response = await httpClient.post('/api/transport/attendance', attendanceData);
      return response.data;
    } catch (error) {
      console.error('Error marking attendance:', error);
      return { success: false, error: error.message };
    }
  }

  // ====================================
  // LIVE TRACKING
  // ====================================

  static async getLiveLocations() {
    try {
      const response = await httpClient.get('/api/transport/live-locations');
      return response.data;
    } catch (error) {
      console.error('Error fetching live locations:', error);
      return { success: false, error: error.message };
    }
  }

  static async getRouteHistory(busId, date) {
    try {
      const response = await httpClient.get(`/api/transport/route-history/${busId}/${date}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching route history:', error);
      return { success: false, error: error.message };
    }
  }

  // ====================================
  // REPORTS
  // ====================================

  static async generateReport(reportType, filters = {}) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const endpoint = `/api/transport/reports/${reportType}${queryString ? '?' + queryString : ''}`;
      const response = await httpClient.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error generating report:', error);
      return { success: false, error: error.message };
    }
  }

  // ====================================
  // UTILITY FUNCTIONS
  // ====================================

  static formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  }

  static formatDate(dateString) {
    if (!dateString) return '-';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      return d.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (e) {
      return dateString;
    }
  }

  static getStatusColor(status) {
    const statusColors = {
      Active: 'success',
      Inactive: 'default',
      'Under Maintenance': 'warning',
      'On Leave': 'warning',
      Paid: 'success',
      Pending: 'warning',
      Overdue: 'error',
      Present: 'success',
      Absent: 'error',
      Moving: 'success',
      Stopped: 'warning',
    };
    return statusColors[status] || 'default';
  }
}

export default TransportService;
