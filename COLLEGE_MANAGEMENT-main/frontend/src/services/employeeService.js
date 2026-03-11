import { API_URL } from '../config.js';

class EmployeeService {
  // Get all employees with pagination and filters
  async getEmployees(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${API_URL}/employees?${queryString}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  }

  // Get employee by ID
  async getEmployee(employeeId) {
    try {
      const response = await fetch(`${API_URL}/employees/${employeeId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching employee:', error);
      throw error;
    }
  }

  // Create new employee
  async createEmployee(employeeData) {
    try {
      const response = await fetch(`${API_URL}/employees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(employeeData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating employee:', error);
      throw error;
    }
  }

  // Update employee
  async updateEmployee(employeeId, employeeData) {
    try {
      const response = await fetch(`${API_URL}/employees/${employeeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(employeeData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating employee:', error);
      throw error;
    }
  }

  // Delete employee (soft delete)
  async deleteEmployee(employeeId) {
    try {
      const response = await fetch(`${API_URL}/employees/${employeeId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting employee:', error);
      throw error;
    }
  }

  // Upload employee document
  async uploadDocument(documentData) {
    try {
      const response = await fetch(`${API_URL}/hr/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(documentData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  // Get employee documents
  async getEmployeeDocuments(employeeId) {
    try {
      const response = await fetch(`${API_URL}/hr/documents/${employeeId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching employee documents:', error);
      throw error;
    }
  }

  // Create salary structure
  async createSalaryStructure(salaryData) {
    try {
      const response = await fetch(`${API_URL}/hr/salary-structures`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(salaryData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating salary structure:', error);
      throw error;
    }
  }

  // Get department statistics
  async getDepartmentStats() {
    try {
      const response = await fetch(`${API_URL}/employees/stats/departments`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching department stats:', error);
      throw error;
    }
  }

  // Get dashboard statistics
  async getDashboardStats() {
    try {
      const response = await fetch(`${API_URL}/hr/dashboard`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  // Search employees
  async searchEmployees(query, filters = {}) {
    try {
      const params = { search, ...filters };
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${API_URL}/employees?${queryString}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching employees:', error);
      throw error;
    }
  }

  // Helper method to handle file upload to cloud storage
  async uploadFileToStorage(file, documentType, employeeId) {
    try {
      // This is a placeholder for file upload logic
      // In a real implementation, you would upload to Supabase Storage or another cloud service
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);
      formData.append('employeeId', employeeId);

      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  // Get employee count by status
  async getEmployeeCountByStatus() {
    try {
      const response = await fetch(`${API_URL}/employees/stats/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching employee status stats:', error);
      throw error;
    }
  }

  // Get recent joiners
  async getRecentJoiners(days = 30) {
    try {
      const response = await fetch(`${API_URL}/employees/recent?days=${days}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching recent joiners:', error);
      throw error;
    }
  }

  // Create leave policy
  async createLeavePolicy(leaveData) {
    try {
      const response = await fetch(`${API_URL}/hr/leave-policies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leaveData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating leave policy:', error);
      throw error;
    }
  }

  // Get leave policies
  async getLeavePolicies(employeeId = null) {
    try {
      const url = employeeId 
        ? `${API_URL}/hr/leave-policies?employee_id=${employeeId}`
        : `${API_URL}/hr/leave-policies`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching leave policies:', error);
      throw error;
    }
  }

  // Create work policy
  async createWorkPolicy(policyData) {
    try {
      const response = await fetch(`${API_URL}/hr/work-policies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(policyData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating work policy:', error);
      throw error;
    }
  }

  // Get work policies
  async getWorkPolicies(employeeId = null) {
    try {
      const url = employeeId 
        ? `${API_URL}/hr/work-policies?employee_id=${employeeId}`
        : `${API_URL}/hr/work-policies`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching work policies:', error);
      throw error;
    }
  }
}

export const employeeService = new EmployeeService();
