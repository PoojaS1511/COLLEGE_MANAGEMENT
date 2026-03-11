import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { 
  BellIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  CheckCircleIcon,
  XMarkIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

const StudentNotifications = () => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, unread, academic, administrative, events

  useEffect(() => {
    fetchNotifications()
  }, [user])

  const fetchNotifications = useCallback(async () => {
    if (!user?.user_id) {
      console.log('No user ID found in user object:', user);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching notifications for auth user ID:', user.user_id);

      // Fetch notification recipients for this user using the auth user_id
      const { data: recipients, error: recipientsError } = await supabase
        .from('notification_recipients')
        .select(`
          id,
          is_read,
          read_at,
          notification_id,
          notifications!notification_id(
            id,
            title,
            message,
            type,
            category,
            created_at,
            sender_id
          )
        `)
        .eq('user_id', user.user_id)  // Using user.user_id which contains the auth ID
        .order('created_at', { 
          foreignTable: 'notifications', 
          ascending: false 
        });

      if (recipientsError) {
        console.error('Error fetching notification recipients:', recipientsError);
        throw recipientsError;
      }

      console.log('Found notification recipients:', recipients?.length || 0);

      if (!recipients?.length) {
        console.log('No notification recipients found for user:', user.user_id);
        setNotifications([]);
        return;
      }

      // Format the notifications data according to the actual schema
      const formattedNotifications = recipients.map(recipient => ({
        id: recipient.id,
        notification_id: recipient.notification_id,
        title: recipient.notifications?.title || 'No Title',
        message: recipient.notifications?.message || '',
        type: recipient.notifications?.type || 'general',
        category: recipient.notifications?.category || 'general',
        read: recipient.is_read || false,
        created_at: recipient.notifications?.created_at || new Date().toISOString(),
        sender_id: recipient.notifications?.sender_id,
        read_at: recipient.read_at
      }));

      // Sort by created_at in descending order
      formattedNotifications.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );

      setNotifications(formattedNotifications);
    } catch (error) {
      console.error('Error in fetchNotifications:', error);
      // You might want to show an error toast here
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Set up real-time subscription for notifications
  useEffect(() => {
    if (!user) return;

    // Subscribe to changes in notification_recipients for this user
    const subscription = supabase
      .channel('notification_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'notification_recipients',
          filter: `user_id=eq.${user.user_id}`  // Using user.user_id for consistency
        }, 
        () => {
          fetchNotifications(); // Refresh notifications on any change
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user, fetchNotifications]);

  const markAsRead = async (notificationId) => {
    try {
      // Update the notification as read in the database
      const { error } = await supabase
        .from('notification_recipients')
        .update({ 
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId)

      if (error) throw error

      // Optimistically update the UI
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
      // You might want to show an error toast here
    }
  }

  const markAllAsRead = async () => {
    try {
      // Get all unread notification IDs
      const unreadIds = notifications
        .filter(notif => !notif.read)
        .map(notif => notif.id)

      if (unreadIds.length === 0) return

      // Mark all as read in the database
      const { error } = await supabase
        .from('notification_recipients')
        .update({ 
          is_read: true,
          read_at: new Date().toISOString()
        })
        .in('id', unreadIds)

      if (error) throw error

      // Optimistically update the UI
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      )
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      // You might want to show an error toast here
    }
  }

  const deleteNotification = async (notificationId) => {
    try {
      // Delete the notification from the database
      const { error } = await supabase
        .from('notification_recipients')
        .delete()
        .eq('id', notificationId)

      if (error) throw error

      // Optimistically update the UI
      setNotifications(prev => 
        prev.filter(notif => notif.id !== notificationId)
      )
    } catch (error) {
      console.error('Error deleting notification:', error)
      // You might want to show an error toast here
    }
  }

  const getFilteredNotifications = () => {
    let filtered = notifications

    switch (filter) {
      case 'unread':
        filtered = notifications.filter(notif => !notif.read)
        break
      case 'academic':
        filtered = notifications.filter(notif => notif.type === 'academic')
        break
      case 'administrative':
        filtered = notifications.filter(notif => notif.type === 'administrative')
        break
      case 'events':
        filtered = notifications.filter(notif => notif.type === 'events')
        break
      default:
        filtered = notifications
    }

    return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }

  const getNotificationIcon = (type, priority) => {
    if (priority === 'high') {
      return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
    }
    
    switch (type) {
      case 'academic':
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />
      case 'administrative':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'events':
        return <BellIcon className="h-5 w-5 text-purple-500" />
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-500" />
    }
  }

  const getUnreadCount = () => {
    return notifications.filter(notif => !notif.read).length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-royal-600"></div>
      </div>
    )
  }

  const filteredNotifications = getFilteredNotifications()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Notifications</h2>
            <p className="text-gray-600">
              {getUnreadCount()} unread notifications ??? {notifications.length} total
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-royal-600 text-white rounded-lg hover:bg-royal-700 transition-colors duration-200"
            >
              Mark All Read
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-4">
          <FunnelIcon className="h-5 w-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Filter:</span>
          <div className="flex space-x-2">
            {[
              { key: 'all', label: 'All' },
              { key: 'unread', label: 'Unread' },
              { key: 'academic', label: 'Academic' },
              { key: 'administrative', label: 'Administrative' },
              { key: 'events', label: 'Events' }
            ].map(filterOption => (
              <button
                key={filterOption.key}
                onClick={() => setFilter(filterOption.key)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                  filter === filterOption.key
                    ? 'bg-royal-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {filterOption.label}
                {filterOption.key === 'unread' && getUnreadCount() > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1">
                    {getUnreadCount()}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow-md">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Notifications</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? 'You have no notifications at the moment.' 
                : `No ${filter} notifications found.`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-6 hover:bg-gray-50 transition-colors duration-200 ${
                  !notification.read ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type, notification.priority)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className={`text-lg font-semibold ${
                          !notification.read ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                            New
                          </span>
                        )}
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          notification.priority === 'high' ? 'bg-red-100 text-red-800' :
                          notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {notification.priority}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-2">{notification.message}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>From: {notification.sender}</span>
                        <span>???</span>
                        <span>
                          {new Date(notification.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        <span>???</span>
                        <span className="capitalize">{notification.type}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Mark Read
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Notification Preferences</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Email Notifications</h4>
              <p className="text-sm text-gray-600">Receive notifications via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-royal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-royal-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">SMS Notifications</h4>
              <p className="text-sm text-gray-600">Receive important alerts via SMS</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-royal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-royal-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Push Notifications</h4>
              <p className="text-sm text-gray-600">Browser push notifications</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-royal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-royal-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentNotifications
