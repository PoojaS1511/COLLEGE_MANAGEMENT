/**
 * Payroll Notification Service
 * Handles notifications for payroll events
 */
import { toast, notification } from '../components/ui';

class PayrollNotificationService {
  constructor() {
    this.notificationTypes = {
      PAYROLL_APPROVED: {
        title: 'Payroll Approved',
        message: 'Your payroll has been approved and is ready for payment.',
        type: 'success',
        icon: 'check-circle'
      },
      PAYROLL_PAID: {
        title: 'Salary Credited',
        message: 'Salary credited',
        type: 'success',
        icon: 'dollar-sign'
      },
      PAYSLIP_GENERATED: {
        title: 'Payslip Available',
        message: 'Payslip available',
        type: 'info',
        icon: 'file-text'
      },
      PAYROLL_CALCULATED: {
        title: 'Payroll Calculated',
        message: 'Payroll calculation completed successfully.',
        type: 'success',
        icon: 'calculator'
      },
      PAYROLL_ERROR: {
        title: 'Payroll Error',
        message: 'There was an error processing your payroll.',
        type: 'error',
        icon: 'alert-triangle'
      }
    };
  }

  // Show toast notification
  showToast(type, title, message, options = {}) {
    toast({
      title,
      description: message,
      variant: type,
      duration: options.duration || 5000,
      action: options.action,
      ...options
    });
  }

  // Show system notification (browser notification)
  showSystemNotification(type, title, message, options = {}) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/favicon.ico',
        tag: options.tag || 'payroll-notification',
        ...options
      });
    }
  }

  // Trigger payroll approved notification
  notifyPayrollApproved(payrollData, recipientInfo) {
    const notificationConfig = this.notificationTypes.PAYROLL_APPROVED;
    const message = `${notificationConfig.message} Amount: ${this.formatCurrency(payrollData.net_salary)}`;
    
    // Show toast
    this.showToast(notificationConfig.type, notificationConfig.title, message);
    
    // Add to notification center
    this.addToNotificationCenter({
      type: 'PAYROLL_APPROVED',
      title: notificationConfig.title,
      message,
      recipientId: payrollData.faculty_id,
      data: payrollData,
      timestamp: new Date().toISOString()
    });

    // Send email notification (mock)
    this.sendEmailNotification(recipientInfo.email, notificationConfig.title, message);
  }

  // Trigger payroll paid notification
  notifyPayrollPaid(payrollData, recipientInfo) {
    const notificationConfig = this.notificationTypes.PAYROLL_PAID;
    const message = `${notificationConfig.message} Amount: ${this.formatCurrency(payrollData.net_salary)}`;
    
    // Show toast
    this.showToast(notificationConfig.type, notificationConfig.title, message);
    
    // Add to notification center
    this.addToNotificationCenter({
      type: 'PAYROLL_PAID',
      title: notificationConfig.title,
      message,
      recipientId: payrollData.faculty_id,
      data: payrollData,
      timestamp: new Date().toISOString()
    });

    // Send email notification
    this.sendEmailNotification(recipientInfo.email, notificationConfig.title, message);
  }

  // Trigger payslip generated notification
  notifyPayslipGenerated(payrollData, recipientInfo) {
    const notificationConfig = this.notificationTypes.PAYSLIP_GENERATED;
    const month = new Date(payrollData.pay_month).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    const message = `${notificationConfig.message} Month: ${month}`;
    
    // Show toast
    this.showToast(notificationConfig.type, notificationConfig.title, message);
    
    // Add to notification center
    this.addToNotificationCenter({
      type: 'PAYSLIP_GENERATED',
      title: notificationConfig.title,
      message,
      recipientId: payrollData.faculty_id,
      data: payrollData,
      timestamp: new Date().toISOString()
    });

    // Send email notification
    this.sendEmailNotification(recipientInfo.email, notificationConfig.title, message);
  }

  // Trigger payroll calculated notification (for HR)
  notifyPayrollCalculated(calculationData) {
    const notificationConfig = this.notificationTypes.PAYROLL_CALCULATED;
    const message = `${notificationConfig.message} Faculty: ${calculationData.faculty_id}, Month: ${calculationData.pay_month}`;
    
    // Show toast
    this.showToast(notificationConfig.type, notificationConfig.title, message);
    
    // Add to notification center
    this.addToNotificationCenter({
      type: 'PAYROLL_CALCULATED',
      title: notificationConfig.title,
      message,
      recipientId: 'HR_TEAM', // Special recipient for HR notifications
      data: calculationData,
      timestamp: new Date().toISOString()
    });
  }

  // Trigger payroll error notification
  notifyPayrollError(errorData, recipientInfo) {
    const notificationConfig = this.notificationTypes.PAYROLL_ERROR;
    const message = `${notificationConfig.message} Error: ${errorData.error}`;
    
    // Show toast
    this.showToast(notificationConfig.type, notificationConfig.title, message);
    
    // Add to notification center
    this.addToNotificationCenter({
      type: 'PAYROLL_ERROR',
      title: notificationConfig.title,
      message,
      recipientId: recipientInfo?.id || 'SYSTEM',
      data: errorData,
      timestamp: new Date().toISOString()
    });
  }

  // Add notification to notification center
  addToNotificationCenter(notificationData) {
    // Get existing notifications from localStorage
    const existingNotifications = JSON.parse(localStorage.getItem('payroll_notifications') || '[]');
    
    // Add new notification
    const newNotification = {
      id: this.generateNotificationId(),
      ...notificationData,
      read: false
    };
    
    existingNotifications.unshift(newNotification);
    
    // Keep only last 50 notifications
    const limitedNotifications = existingNotifications.slice(0, 50);
    
    // Save to localStorage
    localStorage.setItem('payroll_notifications', JSON.stringify(limitedNotifications));
    
    // Trigger custom event for notification center update
    window.dispatchEvent(new CustomEvent('payrollNotification', { 
      detail: newNotification 
    }));
  }

  // Get notifications for a user
  getNotifications(userId) {
    const allNotifications = JSON.parse(localStorage.getItem('payroll_notifications') || '[]');
    return allNotifications.filter(notification => 
      notification.recipientId === userId || 
      notification.recipientId === 'HR_TEAM' ||
      notification.recipientId === 'SYSTEM'
    );
  }

  // Mark notification as read
  markAsRead(notificationId) {
    const notifications = JSON.parse(localStorage.getItem('payroll_notifications') || '[]');
    const updatedNotifications = notifications.map(notification => 
      notification.id === notificationId 
        ? { ...notification, read: true }
        : notification
    );
    localStorage.setItem('payroll_notifications', JSON.stringify(updatedNotifications));
  }

  // Clear all notifications for a user
  clearNotifications(userId) {
    const notifications = JSON.parse(localStorage.getItem('payroll_notifications') || '[]');
    const remainingNotifications = notifications.filter(notification => 
      notification.recipientId !== userId
    );
    localStorage.setItem('payroll_notifications', JSON.stringify(remainingNotifications));
  }

  // Send email notification (mock implementation)
  sendEmailNotification(email, subject, message) {
    // In a real implementation, this would call an email service
    console.log(`Email sent to ${email}:`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${message}`);
    
    // Mock email sending
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, messageId: 'email_' + Date.now() });
      }, 1000);
    });
  }

  // Format currency helper
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  }

  // Generate unique notification ID
  generateNotificationId() {
    return 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Get unread count for a user
  getUnreadCount(userId) {
    const notifications = this.getNotifications(userId);
    return notifications.filter(notification => !notification.read).length;
  }

  // Subscribe to payroll events (for real-time updates)
  subscribeToPayrollEvents(callback) {
    window.addEventListener('payrollNotification', callback);
    
    // Return unsubscribe function
    return () => {
      window.removeEventListener('payrollNotification', callback);
    };
  }
}

// Create singleton instance
const payrollNotificationService = new PayrollNotificationService();

export default payrollNotificationService;
