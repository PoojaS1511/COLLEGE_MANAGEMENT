import apiService from './api';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';

class ReportService {
  // Generate and download exam report
  static async generateExamReport(filters = {}) {
    try {
      // Add default format if not specified
      const reportFilters = { format: 'pdf', ...filters };
      
      // Generate report
      const response = await apiService.generateReport('exam', reportFilters);
      
      // Create filename with timestamp
      const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
      const filename = `exam_report_${timestamp}.${reportFilters.format}`;
      
      // Save the file
      saveAs(new Blob([response]), filename);
      
      return { success: true, filename };
    } catch (error) {
      console.error('Error generating exam report:', error);
      return { success: false, error: error.message };
    }
  }

  // Generate and download fee report
  static async generateFeeReport(filters = {}) {
    try {
      // Add default format if not specified
      const reportFilters = { format: 'pdf', ...filters };
      
      // Generate report
      const response = await apiService.generateReport('fee', reportFilters);
      
      // Create filename with timestamp
      const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
      const filename = `fee_report_${timestamp}.${reportFilters.format}`;
      
      // Save the file
      saveAs(new Blob([response]), filename);
      
      return { success: true, filename };
    } catch (error) {
      console.error('Error generating fee report:', error);
      return { success: false, error: error.message };
    }
  }

  // Get report templates
  static async getReportTemplates() {
    try {
      const response = await apiService.request('/report-templates');
      return { success: true, data: response };
    } catch (error) {
      console.error('Error fetching report templates:', error);
      return { success: false, error: error.message };
    }
  }

  // Get report history
  static async getReportHistory(filters = {}) {
    try {
      const response = await apiService.request('/reports/history', { params: filters });
      return { success: true, data: response };
    } catch (error) {
      console.error('Error fetching report history:', error);
      return { success: false, error: error.message };
    }
  }

  // Export data to Excel/CSV
  static async exportData(data, filename, type = 'xlsx') {
    try {
      let blob;
      
      if (type === 'csv') {
        // Convert data to CSV
        const headers = Object.keys(data[0] || {});
        const csvRows = [
          headers.join(','),
          ...data.map(row => 
            headers.map(fieldName => 
              JSON.stringify(row[fieldName] || '')
            ).join(',')
          )
        ];
        
        blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      } else {
        // For Excel, we'll use xlsx library
        const XLSX = await import('xlsx');
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        XLSX.writeFile(workbook, `${filename}.xlsx`);
        return { success: true };
      }
      
      // For CSV and other formats
      saveAs(blob, `${filename}.${type}`);
      return { success: true };
    } catch (error) {
      console.error('Error exporting data:', error);
      return { success: false, error: error.message };
    }
  }

  // Get available report formats
  static getAvailableFormats() {
    return [
      { id: 'pdf', name: 'PDF', description: 'Portable Document Format' },
      { id: 'xlsx', name: 'Excel', description: 'Microsoft Excel Format' },
      { id: 'csv', name: 'CSV', description: 'Comma Separated Values' },
      { id: 'json', name: 'JSON', description: 'JavaScript Object Notation' }
    ];
  }
}

export default ReportService;
