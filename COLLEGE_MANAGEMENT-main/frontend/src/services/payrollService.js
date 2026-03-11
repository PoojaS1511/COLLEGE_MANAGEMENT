/**
 * Payroll Service
 * Handles all payroll-related API calls
 */
import httpClient from './httpClient';

class PayrollService {
  constructor() {
    this.baseUrl = '/payroll';  // Base URL is relative to the API root
  }

  // Get all payroll records with pagination and filtering
  async getPayrollList(params = {}) {
    const { page = 1, limit = 50, status, month } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (status) queryParams.append('status', status);
    if (month) queryParams.append('month', month);

    try {
      const response = await httpClient.get(`${this.baseUrl}/?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payroll list:', error);
      throw error;
    }
  }

  // Get payroll record by ID
  async getPayrollById(payrollId) {
    try {
      const response = await httpClient.get(`${this.baseUrl}/${payrollId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payroll record:', error);
      throw error;
    }
  }

  // Get payroll by faculty ID and month
  async getPayrollByFacultyMonth(facultyId, month) {
    try {
      const response = await httpClient.get(`${this.baseUrl}/faculty/${facultyId}/month/${month}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payroll by faculty and month:', error);
      throw error;
    }
  }

  // Create new payroll record
  async createPayroll(payrollData) {
    try {
      const response = await httpClient.post(`${this.baseUrl}/`, payrollData);
      return response.data;
    } catch (error) {
      console.error('Error creating payroll record:', error);
      throw error;
    }
  }

  // Update payroll record
  async updatePayroll(payrollId, updateData) {
    try {
      const response = await httpClient.put(`${this.baseUrl}/${payrollId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating payroll record:', error);
      throw error;
    }
  }

  // Approve payroll record
  async approvePayroll(payrollId) {
    try {
      const response = await httpClient.post(`${this.baseUrl}/${payrollId}/approve`);
      return response.data;
    } catch (error) {
      console.error('Error approving payroll:', error);
      throw error;
    }
  }

  // Mark payroll as paid
  async markPayrollAsPaid(payrollId) {
    try {
      const response = await httpClient.post(`${this.baseUrl}/${payrollId}/pay`);
      return response.data;
    } catch (error) {
      console.error('Error marking payroll as paid:', error);
      throw error;
    }
  }

  // Delete payroll record
  async deletePayroll(payrollId) {
    try {
      const response = await httpClient.delete(`${this.baseUrl}/${payrollId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting payroll record:', error);
      throw error;
    }
  }

  // Get payroll dashboard statistics
  async getPayrollDashboard() {
    try {
      const response = await httpClient.get(`${this.baseUrl}/dashboard`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payroll dashboard:', error);
      throw error;
    }
  }

  // Calculate payroll for a faculty
  async calculatePayroll(calculationData) {
    try {
      const response = await httpClient.post(`${this.baseUrl}/calculate`, calculationData);
      return response.data;
    } catch (error) {
      console.error('Error calculating payroll:', error);
      throw error;
    }
  }

  // Bulk approve payroll records
  async bulkApprovePayroll(payrollIds) {
    try {
      const response = await httpClient.post(`${this.baseUrl}/bulk-approve`, {
        payroll_ids: payrollIds
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk approving payroll:', error);
      throw error;
    }
  }

  // Generate payslip
  async generatePayslip(payrollId) {
    try {
      const response = await httpClient.get(`${this.baseUrl}/payslip/${payrollId}`);
      return response.data;
    } catch (error) {
      console.error('Error generating payslip:', error);
      throw error;
    }
  }

  // Get available months
  async getAvailableMonths() {
    try {
      const response = await httpClient.get(`${this.baseUrl}/months`);
      return response.data;
    } catch (error) {
      console.error('Error fetching available months:', error);
      throw error;
    }
  }

  // Helper method to format currency
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  }

  // Helper method to format date
  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  // Helper method to format month
  formatMonth(monthString) {
    return new Date(monthString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
    });
  }

  // Helper method to get status badge color
  getStatusBadgeColor(status) {
    const colors = {
      'Pending': 'warning',
      'Approved': 'info',
      'Paid': 'success',
      'Cancelled': 'danger'
    };
    return colors[status] || 'secondary';
  }

  // Helper method to check if action is allowed
  canApprove(status, userRole = 'HR') {
    return status === 'Pending' && userRole === 'HR';
  }

  canMarkAsPaid(status, userRole = 'HR') {
    return status === 'Approved' && userRole === 'HR';
  }

  canEdit(status, userRole = 'HR') {
    return status === 'Pending' && userRole === 'HR';
  }

  canDelete(status, userRole = 'HR') {
    return status === 'Pending' && userRole === 'HR';
  }
}

// Create singleton instance
const payrollService = new PayrollService();

export default payrollService;
