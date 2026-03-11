/**
 * Finance Service
 * Handles all finance-related API calls
 */
import httpClient from './httpClient';

class FinanceService {
  constructor() {
    this.baseUrl = '/finance';
  }

  // ==================== DASHBOARD ====================
  
  async getDashboardMetrics(filters = {}) {
    try {
      const response = await httpClient.get(`${this.baseUrl}/dashboard/metrics`, { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      return { success: false, error: error.message };
    }
  }

  async getRevenueExpensesData(filters = {}) {
    try {
      const response = await httpClient.get(`${this.baseUrl}/dashboard/revenue-expenses`, { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching revenue/expenses data:', error);
      return { success: false, error: error.message };
    }
  }

  async getFeeCollectionData(filters = {}) {
    try {
      const response = await httpClient.get(`${this.baseUrl}/dashboard/fee-collection`, { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching fee collection data:', error);
      return { success: false, error: error.message };
    }
  }

  async getBudgetAnalysisData(filters = {}) {
    try {
      const response = await httpClient.get(`${this.baseUrl}/dashboard/budget-analysis`, { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching budget analysis data:', error);
      return { success: false, error: error.message };
    }
  }

  async getFinancialTrendsData(filters = {}) {
    try {
      const response = await httpClient.get(`${this.baseUrl}/dashboard/financial-trends`, { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching financial trends data:', error);
      return { success: false, error: error.message };
    }
  }

  async getSalaryDistributionData(filters = {}) {
    try {
      const response = await httpClient.get(`${this.baseUrl}/dashboard/salary-distribution`, { params: filters });
      return response.data;
      } catch (error) {
      console.error('Error fetching salary distribution data:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== STUDENT FEES ====================
  
  async getStudentFees(filters = {}) {
    try {
      const response = await httpClient.get(`${this.baseUrl}/student-fees`, { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching student fees:', error);
      return { success: false, error: error.message };
    }
  }

  async getStudentFee(id) {
    try {
      const response = await httpClient.get(`${this.baseUrl}/student-fees/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching student fee:', error);
      return { success: false, error: error.message };
    }
  }

  async createStudentFee(feeData) {
    try {
      const response = await httpClient.post(`${this.baseUrl}/student-fees`, feeData);
      return response.data;
    } catch (error) {
      console.error('Error creating student fee:', error);
      return { success: false, error: error.message };
    }
  }

  async updateStudentFee(id, updates) {
    try {
      const response = await httpClient.put(`${this.baseUrl}/student-fees/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating student fee:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteStudentFee(id) {
    try {
      await httpClient.delete(`${this.baseUrl}/student-fees/${id}`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting student fee:', error);
      return { success: false, error: error.message };
    }
  }

  
  // ==================== EXPENSES ====================
  
  async getExpenses(filters = {}) {
    try {
      const response = await httpClient.get(`${this.baseUrl}/expenses`, { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching expenses:', error);
      return { success: false, error: error.message };
    }
  }

  async getExpense(id) {
    try {
      const response = await httpClient.get(`${this.baseUrl}/expenses/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching expense:', error);
      return { success: false, error: error.message };
    }
  }

  async createExpense(expenseData) {
    try {
      const response = await httpClient.post(`${this.baseUrl}/expenses`, expenseData);
      return response.data;
    } catch (error) {
      console.error('Error creating expense:', error);
      return { success: false, error: error.message };
    }
  }

  async updateExpense(id, updates) {
    try {
      const response = await httpClient.put(`${this.baseUrl}/expenses/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating expense:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteExpense(id) {
    try {
      await httpClient.delete(`${this.baseUrl}/expenses/${id}`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting expense:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== VENDORS ====================
  
  async getVendors(filters = {}) {
    try {
      const response = await httpClient.get(`${this.baseUrl}/vendors`, { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching vendors:', error);
      return { success: false, error: error.message };
    }
  }

  async getVendor(id) {
    try {
      const response = await httpClient.get(`${this.baseUrl}/vendors/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching vendor:', error);
      return { success: false, error: error.message };
    }
  }

  async createVendor(vendorData) {
    try {
      const response = await httpClient.post(`${this.baseUrl}/vendors`, vendorData);
      return response.data;
    } catch (error) {
      console.error('Error creating vendor:', error);
      return { success: false, error: error.message };
    }
  }

  async updateVendor(id, updates) {
    try {
      const response = await httpClient.put(`${this.baseUrl}/vendors/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating vendor:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteVendor(id) {
    try {
      await httpClient.delete(`${this.baseUrl}/vendors/${id}`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting vendor:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== BUDGET ALLOCATION ====================
  
  async getBudgetAllocations(filters = {}) {
    try {
      const response = await httpClient.get(`${this.baseUrl}/budget-allocation`, { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching budget allocations:', error);
      return { success: false, error: error.message };
    }
  }

  async getBudgetAllocation(id) {
    try {
      const response = await httpClient.get(`${this.baseUrl}/budget-allocation/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching budget allocation:', error);
      return { success: false, error: error.message };
    }
  }

  async createBudgetAllocation(budgetData) {
    try {
      const response = await httpClient.post(`${this.baseUrl}/budget-allocation`, budgetData);
      return response.data;
    } catch (error) {
      console.error('Error creating budget allocation:', error);
      return { success: false, error: error.message };
    }
  }

  async updateBudgetAllocation(id, updates) {
    try {
      const response = await httpClient.put(`${this.baseUrl}/budget-allocation/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating budget allocation:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteBudgetAllocation(id) {
    try {
      await httpClient.delete(`${this.baseUrl}/budget-allocation/${id}`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting budget allocation:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== MAINTENANCE ====================
  
  async getMaintenanceRequests(filters = {}) {
    try {
      const response = await httpClient.get(`${this.baseUrl}/maintenance`, { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
      return { success: false, error: error.message };
    }
  }

  async getMaintenanceRequest(id) {
    try {
      const response = await httpClient.get(`${this.baseUrl}/maintenance/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching maintenance request:', error);
      return { success: false, error: error.message };
    }
  }

  async createMaintenanceRequest(requestData) {
    try {
      const response = await httpClient.post(`${this.baseUrl}/maintenance`, requestData);
      return response.data;
    } catch (error) {
      console.error('Error creating maintenance request:', error);
      return { success: false, error: error.message };
    }
  }

  async updateMaintenanceRequest(id, updates) {
    try {
      const response = await httpClient.put(`${this.baseUrl}/maintenance/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating maintenance request:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteMaintenanceRequest(id) {
    try {
      await httpClient.delete(`${this.baseUrl}/maintenance/${id}`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting maintenance request:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== AI ASSISTANT ====================
  
  async sendMessage(message, conversationHistory = []) {
    try {
      const response = await httpClient.post(`${this.baseUrl}/ai-assistant/chat`, {
        message,
        conversationHistory,
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message to AI assistant:', error);
      return { success: false, error: error.message };
    }
  }

  async getConversationHistory(sessionId) {
    try {
      const response = await httpClient.get(`${this.baseUrl}/ai-assistant/history/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching conversation history:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new FinanceService();