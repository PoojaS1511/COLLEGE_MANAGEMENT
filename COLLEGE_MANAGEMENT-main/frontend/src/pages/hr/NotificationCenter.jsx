/**
 * Notification Center Component
 * Displays payroll notifications in a centralized location
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Spinner } from '../../components/ui/spinner';
import { Dropdown, DropdownMenu, DropdownToggle, DropdownItem } from '../../components/ui/dropdown';
import payrollNotificationService from '../../services/payrollNotificationService';
import { 
  Bell,
  CheckCircle,
  DollarSign,
  FileText,
  Calculator,
  AlertTriangle,
  X,
  Check,
  Trash2,
  Settings
} from 'lucide-react';

const NotificationCenter = ({ userId = 'CURRENT_USER', isHR = false }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchNotifications();
    
    // Subscribe to real-time notifications
    const unsubscribe = payrollNotificationService.subscribeToPayrollEvents((event) => {
      fetchNotifications(); // Refresh notifications when new one arrives
    });

    return () => unsubscribe();
  }, [userId]);

  const fetchNotifications = () => {
    try {
      setLoading(true);
      const userNotifications = payrollNotificationService.getNotifications(userId);
      setNotifications(userNotifications);
      setUnreadCount(payrollNotificationService.getUnreadCount(userId));
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = (notificationId) => {
    payrollNotificationService.markAsRead(notificationId);
    fetchNotifications();
  };

  const handleMarkAllAsRead = () => {
    notifications.forEach(notification => {
      if (!notification.read) {
        payrollNotificationService.markAsRead(notification.id);
      }
    });
    fetchNotifications();
  };

  const handleClearAll = () => {
    payrollNotificationService.clearNotifications(userId);
    fetchNotifications();
  };

  const getNotificationIcon = (type) => {
    const icons = {
      'PAYROLL_APPROVED': <CheckCircle className="h-4 w-4 text-blue-500" />,
      'PAYROLL_PAID': <DollarSign className="h-4 w-4 text-green-500" />,
      'PAYSLIP_GENERATED': <FileText className="h-4 w-4 text-purple-500" />,
      'PAYROLL_CALCULATED': <Calculator className="h-4 w-4 text-yellow-500" />,
      'PAYROLL_ERROR': <AlertTriangle className="h-4 w-4 text-red-500" />,
    };
    return icons[type] || <Bell className="h-4 w-4 text-gray-500" />;
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const NotificationDropdown = () => (
    <Dropdown open={showDropdown} onOpenChange={setShowDropdown}>
      <DropdownToggle asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="danger" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownToggle>
      <DropdownMenu align="end" className="w-96">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Mark all read
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Spinner size="sm" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No notifications</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownItem
                key={notification.id}
                className={`p-4 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer ${
                  !notification.read ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleMarkAsRead(notification.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className={`text-sm font-medium ${
                        !notification.read ? 'text-gray-900' : 'text-gray-600'
                      }`}>
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatTimestamp(notification.timestamp)}
                    </p>
                  </div>
                </div>
              </DropdownItem>
            ))
          )}
        </div>
        
        <div className="p-3 border-t">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="w-full"
          >
            <Link to="/admin/payroll/notifications">View all notifications</Link>
          </Button>
        </div>
      </DropdownMenu>
    </Dropdown>
  );

  // If used as a dropdown (in header)
  if (showDropdown !== undefined) {
    return <NotificationDropdown />;
  }

  // Full notification center page
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notification Center</h1>
          <p className="text-gray-600 mt-1">
            {isHR ? 'HR' : 'Employee'} notifications and updates
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={handleMarkAllAsRead}
            >
              <Check className="h-4 w-4 mr-2" />
              Mark All as Read
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleClearAll}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Notifications</p>
                <p className="text-2xl font-bold">{notifications.length}</p>
              </div>
              <Bell className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-blue-600">{unreadCount}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Payroll Updates</p>
                <p className="text-2xl font-bold text-green-600">
                  {notifications.filter(n => 
                    ['PAYROLL_APPROVED', 'PAYROLL_PAID'].includes(n.type)
                  ).length}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Payslips</p>
                <p className="text-2xl font-bold text-purple-600">
                  {notifications.filter(n => n.type === 'PAYSLIP_GENERATED').length}
                </p>
              </div>
              <FileText className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>All Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Spinner size="lg" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-500">You're all caught up! No new notifications.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border rounded-lg ${
                    !notification.read ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className={`font-semibold ${
                          !notification.read ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <Badge variant="info" className="text-xs">
                              New
                            </Badge>
                          )}
                          <span className="text-sm text-gray-500">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification.id)}
                            disabled={notification.read}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-gray-600">{notification.message}</p>
                      
                      {notification.data && (
                        <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                          <div className="grid grid-cols-2 gap-2">
                            {notification.data.faculty_id && (
                              <div>
                                <span className="text-gray-500">Faculty ID:</span>
                                <span className="ml-2 font-medium">{notification.data.faculty_id}</span>
                              </div>
                            )}
                            {notification.data.net_salary && (
                              <div>
                                <span className="text-gray-500">Amount:</span>
                                <span className="ml-2 font-medium">
                                  {new Intl.NumberFormat('en-IN', {
                                    style: 'currency',
                                    currency: 'INR',
                                  }).format(notification.data.net_salary)}
                                </span>
                              </div>
                            )}
                            {notification.data.pay_month && (
                              <div>
                                <span className="text-gray-500">Month:</span>
                                <span className="ml-2 font-medium">
                                  {new Date(notification.data.pay_month).toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'long' 
                                  })}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationCenter;
