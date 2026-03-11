import { supabase } from '../lib/supabase';

const HostelService = {
  // Get current mess status
  async getMessStatus() {
    try {
      const { data, error } = await supabase
        .from('mess_status')
        .select('*')
        .order('meal_type', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching mess status:', error);
      throw error;
    }
  },
  // Get weekly menu
  async getWeeklyMenu() {
    try {
      const { data, error } = await supabase
        .from('weekly_menu')
        .select('*')
        .order('day', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching weekly menu:', error);
      throw error;
    }
  },

  // Update daily menu
  async updateDailyMenu(day, menuData) {
    try {
      // Check if the day already exists
      const { data: existing } = await supabase
        .from('weekly_menu')
        .select('day')
        .eq('day', day)
        .single();

      let data, error;

      if (existing) {
        // Update existing day
        const { data: updateData, error: updateError } = await supabase
          .from('weekly_menu')
          .update(menuData)
          .eq('day', day)
          .select();

        data = updateData;
        error = updateError;
      } else {
        // Insert new day
        const { data: insertData, error: insertError } = await supabase
          .from('weekly_menu')
          .insert([{ day, ...menuData }])
          .select();

        data = insertData;
        error = insertError;
      }

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating menu:', error);
      throw error;
    }
  },

  // Initialize weekly menu with default values if empty
  async initializeWeeklyMenu() {
    try {
      const { data: existing } = await supabase
        .from('weekly_menu')
        .select('day')
        .limit(1);

      if (!existing || existing.length === 0) {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const defaultMenu = days.map(day => ({
          day,
          morning: 'Tea/Coffee, Biscuits',
          breakfast: 'Idli, Sambar, Chutney',
          lunch: 'Rice, Dal, Sabzi, Roti, Curd',
          evening: 'Tea, Snacks',
          dinner: 'Roti, Sabzi, Dal, Rice, Sweet'
        }));

        const { error } = await supabase
          .from('weekly_menu')
          .insert(defaultMenu);

        if (error) throw error;
        return defaultMenu;
      }
      return existing;
    } catch (error) {
      console.error('Error initializing weekly menu:', error);
      throw error;
    }
  },

  // Create a new mess status
  async createMessStatus(statusData) {
    try {
      const { data, error } = await supabase
        .from('mess_status')
        .insert([statusData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating mess status:', error);
      throw error;
    }
  },

  // Update an existing mess status
  async updateMessStatus(id, updates) {
    try {
      const { data, error } = await supabase
        .from('mess_status')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating mess status:', error);
      throw error;
    }
  },

  // Delete a mess status
  async deleteMessStatus(id) {
    try {
      const { error } = await supabase
        .from('mess_status')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting mess status:', error);
      throw error;
    }
  },

  // Get all mess statuses
  async getMessStatuses() {
    try {
      const { data, error } = await supabase
        .from('mess_status')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching mess statuses:', error);
      throw error;
    }
  }
};

export default HostelService;
