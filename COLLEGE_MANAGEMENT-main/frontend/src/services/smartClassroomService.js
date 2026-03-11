import { supabase } from '../lib/supabase';

class SmartClassroomService {
  // Fetch all smart classrooms with their equipment and current schedule
  static async getSmartClassrooms(filters = {}) {
    try {
      // First, let's try to get just the smart classrooms without any joins
      let query = supabase
        .from('smart_classrooms')
        .select('*');

      // Add filters if provided
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      console.log('Fetched smart classrooms:', data); // Debug log
      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error in getSmartClassrooms:', error);
      console.log('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details
      });
      return { success: false, error: error.message };
    }
  }

  // Fetch smart classroom equipment
  static async getSmartClassroomEquipment(classroomId) {
    try {
      const { data, error } = await supabase
        .from('smart_classroom_equipment')
        .select('*')
        .eq('smart_classroom_id', classroomId)
        .order('name');

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error in getSmartClassroomEquipment:', error);
      return { success: false, error: error.message };
    }
  }

  // Fetch smart classroom schedules
  static async getSmartClassroomSchedules(classroomId) {
    try {
      const { data, error } = await supabase
        .from('smart_classroom_schedules')
        .select('*')
        .eq('smart_classroom_id', classroomId)
        .eq('is_active', true)
        .order('start_time');

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error in getSmartClassroomSchedules:', error);
      return { success: false, error: error.message };
    }
  }

  // Update smart classroom status
  static async updateSmartClassroomStatus(classroomId, status) {
    try {
      const { data, error } = await supabase
        .from('smart_classrooms')
        .update({
          status,
          last_active: new Date().toISOString()
        })
        .eq('id', classroomId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error in updateSmartClassroomStatus:', error);
      return { success: false, error: error.message };
    }
  }

  // Update equipment status
  static async updateEquipmentStatus(equipmentId, status) {
    try {
      const { data, error } = await supabase
        .from('smart_classroom_equipment')
        .update({
          status,
          last_checked: new Date().toISOString()
        })
        .eq('id', equipmentId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error in updateEquipmentStatus:', error);
      return { success: false, error: error.message };
    }
  }

  // Get current active class for a classroom
  static async getCurrentActiveClass(classroomId) {
    try {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
      const currentDay = now.toLocaleDateString('en-US', { weekday: 'short' });

      const { data, error } = await supabase
        .from('smart_classroom_schedules')
        .select('*')
        .eq('smart_classroom_id', classroomId)
        .eq('is_active', true)
        .contains('days_of_week', [currentDay])
        .lte('start_time', currentTime)
        .gte('end_time', currentTime)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return { success: true, data };
    } catch (error) {
      console.error('Error in getCurrentActiveClass:', error);
      return { success: false, error: error.message };
    }
  }

  // Get next class for a classroom
  static async getNextClass(classroomId) {
    try {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
      const currentDay = now.toLocaleDateString('en-US', { weekday: 'short' });

      const { data, error } = await supabase
        .from('smart_classroom_schedules')
        .select('*')
        .eq('smart_classroom_id', classroomId)
        .eq('is_active', true)
        .or(`start_time.gt.${currentTime},and(start_time.eq.${currentTime},days_of_week.neq.${currentDay})`)
        .order('start_time')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return { success: true, data };
    } catch (error) {
      console.error('Error in getNextClass:', error);
      return { success: false, error: error.message };
    }
  }
}

export default SmartClassroomService;
