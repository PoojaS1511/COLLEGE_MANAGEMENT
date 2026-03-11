import React, { useState, useEffect } from 'react';
import { Card, List, Badge, Button, Empty, Typography, Skeleton, message } from 'antd';
import { BellOutlined, CheckOutlined, DeleteOutlined } from '@ant-design/icons';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

// Add relativeTime plugin to dayjs
dayjs.extend(relativeTime);

const FacultyNotificationsPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingRead, setMarkingRead] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch notifications for the current user
  const fetchNotifications = async () => {
    const authUserId = user?.user_id || user?.auth_user_id || user?.id;
    
    if (!authUserId) {
      console.log('No valid auth user ID found in user object:', user);
      setLoading(false);
      return;
    }
    
    console.log('Fetching notifications for auth user ID:', authUserId);
    
    try {
      setLoading(true);
      
      // First, get the faculty record for this auth user
      const { data: faculty, error: facultyError } = await supabase
        .from('faculties')
        .select('*')
        .eq('id', authUserId)
        .maybeSingle();

      if (facultyError) {
        console.warn('Error fetching faculty record:', facultyError);
        message.error('Error fetching faculty information');
        setLoading(false);
        return;
      }

      if (!faculty) {
        console.log('No faculty record found for user');
        message.warning('Faculty profile not found');
        setLoading(false);
        return;
      }

      // Use faculty.user_id to fetch notifications
      const recipientUserId = faculty.user_id;
      console.log('Fetching notifications for faculty user_id:', recipientUserId);
      
      const { data: recipients, error: recipientsError } = await supabase
        .from('notification_recipients')
        .select(`
          id,
          notification_id,
          user_id,
          is_read,
          read_at,
          notifications!notification_id(title, message, type, created_at)
        `)
        .eq('user_id', recipientUserId)
        .order('read_at', { ascending: false, nullsFirst: true });

      console.log('Notification recipients query results:', {
        success: !recipientsError,
        error: recipientsError,
        count: recipients?.length || 0,
        firstRecipient: recipients?.[0] || null
      });

      if (recipientsError) {
        console.error('Error fetching notification recipients:', recipientsError);
        throw recipientsError;
      }

      // Transform the data to match our UI needs
      const formattedNotifications = (recipients || []).map(recipient => ({
        id: recipient.id,
        notification_id: recipient.notification_id,
        title: recipient.notifications?.title || 'Notification',
        message: recipient.notifications?.message || '',
        type: recipient.notifications?.type || 'system',
        timestamp: recipient.notifications?.created_at || recipient.read_at || new Date().toISOString(),
        read: recipient.is_read,
        read_at: recipient.read_at,
        notification: {
          ...recipient.notifications,
          id: recipient.notification_id
        }
      }));

      setNotifications(formattedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      message.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const authUserId = user?.user_id || user?.auth_user_id || user?.id;
    
    if (authUserId) {
      fetchNotifications();
      
      // Set up real-time subscription
      const subscription = supabase
        .channel('notifications')
        .on('postgres_changes', 
          { 
            event: '*',
            schema: 'public',
            table: 'notification_recipients',
            filter: `user_id=eq.${authUserId}`
          }, 
          () => {
            fetchNotifications();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [user?.id]);

  // Mark a notification as read
  const markAsRead = async (id) => {
    if (!user?.id) return;
    try {
      setMarkingRead(true);
      
      const { error } = await supabase
        .from('notification_recipients')
        .update({ 
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setNotifications(notifications.map(notification => 
        notification.id === id 
          ? { ...notification, read: true, read_at: new Date().toISOString() }
          : notification
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      message.error('Failed to mark notification as read');
    } finally {
      setMarkingRead(false);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!user?.id) return;
    try {
      setMarkingRead(true);
      const unreadIds = notifications
        .filter(n => !n.read)
        .map(n => n.id);

      if (unreadIds.length === 0) return;

      const { error } = await supabase
        .from('notification_recipients')
        .update({ 
          is_read: true,
          read_at: new Date().toISOString()
        })
        .in('id', unreadIds);

      if (error) throw error;

      // Update local state
      setNotifications(notifications.map(notification => 
        unreadIds.includes(notification.id)
          ? { ...notification, read: true, read_at: new Date().toISOString() }
          : notification
      ));
    } catch (error) {
      console.error('Error marking all as read:', error);
      message.error('Failed to mark all as read');
    } finally {
      setMarkingRead(false);
    }
  };

  // Delete a notification
  const deleteNotification = async (id) => {
    if (!user?.id) return;
    try {
      setDeleting(true);
      const { error } = await supabase
        .from('notification_recipients')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setNotifications(notifications.filter(n => n.id !== id));
      message.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      message.error('Failed to delete notification');
    } finally {
      setDeleting(false);
    }
  };

  // Clear all notifications
  const clearAll = async () => {
    const authUserId = user?.user_id || user?.auth_user_id || user?.id;
    if (!authUserId) return;
    
    try {
      setDeleting(true);
      const { error } = await supabase
        .from('notification_recipients')
        .delete()
        .eq('user_id', authUserId);

      if (error) throw error;

      setNotifications([]);
      message.success('All notifications cleared');
    } catch (error) {
      console.error('Error clearing notifications:', error);
      message.error('Failed to clear notifications');
    } finally {
      setDeleting(false);
    }
  };

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="p-4">
        <Skeleton active paragraph={{ rows: 4 }} />
        <Skeleton active paragraph={{ rows: 4 }} />
      </div>
    );
  }

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'assignment':
        return <BellOutlined className="text-blue-500" />;
      case 'meeting':
        return <BellOutlined className="text-green-500" />;
      case 'reminder':
        return <BellOutlined className="text-orange-500" />;
      case 'system':
        return <BellOutlined className="text-purple-500" />;
      default:
        return <BellOutlined className="text-gray-500" />;
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
          <p className="text-gray-600">
            {unreadCount > 0 
              ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : 'All caught up!'}
          </p>
        </div>
        <div className="space-x-2">
          {unreadCount > 0 && (
            <Button 
              onClick={markAllAsRead} 
              icon={<CheckOutlined />}
              loading={markingRead}
              disabled={deleting}
            >
              Mark all as read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button 
              onClick={clearAll} 
              danger 
              icon={<DeleteOutlined />}
              loading={deleting}
              disabled={markingRead}
            >
              Clear all
            </Button>
          )}
        </div>
      </div>

      <Card className="shadow-sm">
        {notifications.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={notifications}
            renderItem={(notification) => (
              <List.Item
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  !notification.read ? 'bg-blue-50' : ''
                }`}
                actions={[
                  !notification.read && (
                    <Button 
                      key="mark-read" 
                      type="text" 
                      icon={<CheckOutlined />} 
                      onClick={() => markAsRead(notification.id)}
                      loading={markingRead}
                      disabled={deleting}
                    />
                  ),
<Button 
                    key="delete" 
                    type="text" 
                    danger 
                    icon={<DeleteOutlined />} 
                    onClick={() => deleteNotification(notification.id)}
                    loading={deleting}
                    disabled={markingRead}
                  />
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
                      {getNotificationIcon(notification.type)}
                    </div>
                  }
                  title={
                    <div className="flex items-center">
                      <span className="font-medium">{notification.title}</span>
                      {!notification.read && (
                        <Badge dot className="ml-2" />
                      )}
                      <span className="text-xs text-gray-500 ml-auto">
                        {dayjs(notification.timestamp).fromNow()}
                      </span>
                    </div>
                  }
                  description={
                    <Typography.Text type={notification.read ? 'secondary' : undefined}>
                      {notification.message}
                    </Typography.Text>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty
            description={
              <span className="text-gray-500">No notifications to display</span>
            }
            className="py-12"
          />
        )}
      </Card>
    </div>
  );
};

export default FacultyNotificationsPage;
