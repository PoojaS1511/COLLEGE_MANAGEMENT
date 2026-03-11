import httpClient from './httpClient';

class HROnboardingService {
  constructor() {
    this.baseUrl = '/api/hr-onboarding';
  }

  // Dashboard endpoints
  async getDashboardStats() {
    try {
      const response = await httpClient.get(`${this.baseUrl}/dashboard/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  // Registration endpoints
  async submitRegistration(registrationData) {
    try {
      const response = await httpClient.post(`${this.baseUrl}/registration`, registrationData);
      return response.data;
    } catch (error) {
      console.error('Error submitting registration:', error);
      throw error;
    }
  }

  async getRegistration(employeeId) {
    try {
      const response = await httpClient.get(`${this.baseUrl}/registration/${employeeId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching registration:', error);
      throw error;
    }
  }

  async updateRegistration(employeeId, updateData) {
    try {
      const response = await httpClient.put(`${this.baseUrl}/registration/${employeeId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating registration:', error);
      throw error;
    }
  }

  // Documents endpoints
  async uploadDocument(documentData) {
    try {
      const response = await httpClient.post(`${this.baseUrl}/documents/upload`, documentData);
      return response.data;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  async verifyDocument(documentId) {
    try {
      const response = await httpClient.post(`${this.baseUrl}/documents/${documentId}/verify`);
      return response.data;
    } catch (error) {
      console.error('Error verifying document:', error);
      throw error;
    }
  }

  async getDocuments(employeeId) {
    try {
      const response = await httpClient.get(`${this.baseUrl}/documents/${employeeId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  }

  async deleteDocument(documentId) {
    try {
      const response = await httpClient.delete(`${this.baseUrl}/documents/${documentId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  // Role Assignment endpoints
  async assignRole(roleData) {
    try {
      const response = await httpClient.post(`${this.baseUrl}/role-assignment`, roleData);
      return response.data;
    } catch (error) {
      console.error('Error assigning role:', error);
      throw error;
    }
  }

  async getRoleAssignment(employeeId) {
    try {
      const response = await httpClient.get(`${this.baseUrl}/role-assignment/${employeeId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching role assignment:', error);
      throw error;
    }
  }

  async updateRoleAssignment(employeeId, updateData) {
    try {
      const response = await httpClient.put(`${this.baseUrl}/role-assignment/${employeeId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating role assignment:', error);
      throw error;
    }
  }

  // Work Policy endpoints
  async assignWorkPolicy(policyData) {
    try {
      const response = await httpClient.post(`${this.baseUrl}/work-policy`, policyData);
      return response.data;
    } catch (error) {
      console.error('Error assigning work policy:', error);
      throw error;
    }
  }

  async getWorkPolicy(employeeId) {
    try {
      const response = await httpClient.get(`${this.baseUrl}/work-policy/${employeeId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching work policy:', error);
      throw error;
    }
  }

  async updateWorkPolicy(employeeId, updateData) {
    try {
      const response = await httpClient.put(`${this.baseUrl}/work-policy/${employeeId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating work policy:', error);
      throw error;
    }
  }

  // Salary Setup endpoints
  async setupSalary(salaryData) {
    try {
      const response = await httpClient.post(`${this.baseUrl}/salary-setup`, salaryData);
      return response.data;
    } catch (error) {
      console.error('Error setting up salary:', error);
      throw error;
    }
  }

  async getSalarySetup(employeeId) {
    try {
      const response = await httpClient.get(`${this.baseUrl}/salary-setup/${employeeId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching salary setup:', error);
      throw error;
    }
  }

  async updateSalarySetup(employeeId, updateData) {
    try {
      const response = await httpClient.put(`${this.baseUrl}/salary-setup/${employeeId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating salary setup:', error);
      throw error;
    }
  }

  // System Access endpoints
  async grantSystemAccess(accessData) {
    try {
      const response = await httpClient.post(`${this.baseUrl}/system-access`, accessData);
      return response.data;
    } catch (error) {
      console.error('Error granting system access:', error);
      throw error;
    }
  }

  async activateSystemAccess(employeeId) {
    try {
      const response = await httpClient.post(`${this.baseUrl}/system-access/activate`, { employee_id: employeeId });
      return response.data;
    } catch (error) {
      console.error('Error activating system access:', error);
      throw error;
    }
  }

  async getSystemAccess(employeeId) {
    try {
      const response = await httpClient.get(`${this.baseUrl}/system-access/${employeeId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching system access:', error);
      throw error;
    }
  }

  async revokeSystemAccess(employeeId) {
    try {
      const response = await httpClient.delete(`${this.baseUrl}/system-access/${employeeId}`);
      return response.data;
    } catch (error) {
      console.error('Error revoking system access:', error);
      throw error;
    }
  }

  // Complete Record endpoints
  async getEmployeeRecord(employeeId) {
    try {
      const response = await httpClient.get(`${this.baseUrl}/record/${employeeId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching employee record:', error);
      throw error;
    }
  }

  async getOnboardingProgress(employeeId) {
    try {
      const response = await httpClient.get(`${this.baseUrl}/progress/${employeeId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching onboarding progress:', error);
      throw error;
    }
  }

  // Helper methods
  getStatusColor(status) {
    const colors = {
      'pending': 'warning',
      'in_progress': 'info',
      'completed': 'success',
      'verified': 'success',
      'rejected': 'error',
      'active': 'success',
      'inactive': 'default'
    };
    return colors[status] || 'default';
  }

  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  }

  // Validation helpers
  validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  validatePhone(phone) {
    return /^\d{10}$/.test(phone);
  }

  validateRequiredFields(data, requiredFields) {
    const missing = requiredFields.filter(field => !data[field]);
    return missing.length === 0 ? null : missing;
  }
}

// Create singleton instance
const hrOnboardingService = new HROnboardingService();

export default hrOnboardingService;
