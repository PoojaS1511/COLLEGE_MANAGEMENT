import apiService from './api';
import { supabase } from '../lib/supabase';

class NotificationService {
  // Get all notifications with optional filters
  static async getNotifications(filters = {}) {
    try {
      let query = supabase
        .from('notifications')
        .select('*');

      // Apply filters
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      if (filters.sender_id) {
        query = query.eq('sender_id', filters.sender_id);
      }
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,message.ilike.%${filters.search}%`);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return { success: false, error: error.message };
    }
  }

  // Create a new notification
  static async createNotification(notificationData) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          ...notificationData,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString()
        }])
        .select();

      if (error) throw error;
      return { success: true, data: data[0] };
    } catch (error) {
      console.error('Error creating notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Update an existing notification
  static async updateNotification(id, updates) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) throw error;
      return { success: true, data: data[0] };
    } catch (error) {
      console.error('Error updating notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete a notification
  static async deleteNotification(id) {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error deleting notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Send notification to specific audience
  static async sendNotification({ title, message, type = 'general', category = 'announcement', targetAudience }) {
    try {
      // First create the notification
      const { data: notification, error: createError } = await supabase    
        .from('notifications')
        .insert([{
          id: crypto.randomUUID(),
          title,
          message,
          type,
          category,
          created_at: new Date().toISOString(),
          // Get the current user's ID from the session
          sender_id: (await supabase.auth.getSession()).data.session?.user.id
        }])
        .select();

      if (createError) throw createError;

      // Here you would typically add logic to send the notification       
      // to the specified target audience (students, faculty, etc.)        
      // This would involve querying the appropriate user tables and sending emails/SMS
      
      return { 
        success: true, 
        data: notification[0],
        message: 'Notification sent successfully' 
      };
    } catch (error) {
      console.error('Error sending notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Get notifications for the current user
  static async getUserNotifications(userId) {
    try {
      // This is a simplified example - you might want to implement more complex logic
      // based on user roles, courses, etc.
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .or(`target_audience.cs.{"user_ids": ["${userId}"]},target_audience.is.null`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all notification recipients with optional filters
  static async getNotificationRecipients(filters = {}) {
    try {
      let query = supabase
        .from('notification_recipients')
        .select(`
          *,
          notifications (*),
          profiles (id, name, email, role)
        `);

      if (filters.notification_id) {
        query = query.eq('notification_id', filters.notification_id);      
      }
      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id);
      }
      if (filters.is_read !== undefined) {
        query = query.eq('is_read', filters.is_read);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching notification recipients:', error);     
      return { success: false, error: error.message };
    }
  }

  // Create a new notification recipient
  static async createNotificationRecipient(recipientData) {
    try {
      const { data, error } = await supabase
        .from('notification_recipients')
        .insert([{
          ...recipientData,
          id: crypto.randomUUID(),
          is_read: false
        }])
        .select();

      if (error) throw error;
      return { success: true, data: data[0] };
    } catch (error) {
      console.error('Error creating notification recipient:', error);      
      return { success: false, error: error.message };
    }
  }

  // Update a notification recipient
  static async updateNotificationRecipient(id, updates) {
    try {
      const { data, error } = await supabase
        .from('notification_recipients')
        .update({
          ...updates,
          ...(updates.is_read && !updates.read_at ? { read_at: new Date().toISOString() } : {})
        })
        .eq('id', id)
        .select();

      if (error) throw error;
      return { success: true, data: data[0] };
    } catch (error) {
      console.error('Error updating notification recipient:', error);      
      return { success: false, error: error.message };
    }
  }

  // Delete a notification recipient
  static async deleteNotificationRecipient(id) {
    try {
      const { error } = await supabase
        .from('notification_recipients')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error deleting notification recipient:', error);      
      return { success: false, error: error.message };
    }
  }
}

export default NotificationService;