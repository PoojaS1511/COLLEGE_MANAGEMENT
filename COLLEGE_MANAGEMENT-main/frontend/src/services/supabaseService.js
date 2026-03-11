// Re-export the Supabase client from the main configuration file
// This ensures we only have one instance of the Supabase client
import supabase from '../lib/supabase';

class SupabaseService {
  // ====================================
  // Mess Status Methods
  // ====================================
  static async getMessStatuses() {
    try {
      const { data, error } = await supabase
        .from('mess_status')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error in getMessStatuses:', error);
      throw error;
    }
  }

  // ====================================
  // Exam Methods
  // ====================================
  static async getExams(filters = {}) {
    try {
      let query = supabase
        .from('exams')
        .select('*')
        .order('exam_date', { ascending: true });

      // Apply filters if provided
      if (filters.subject_id) {
        query = query.eq('subject_id', filters.subject_id);
      }
      if (filters.course_id) {
        query = query.eq('course_id', filters.course_id);
      }
      if (filters.semester) {
        query = query.eq('semester', filters.semester);
      }
      if (filters.exam_type) {
        query = query.eq('exam_type', filters.exam_type);
      }
      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { 
        success: true, 
        data: data || [] 
      };
    } catch (error) {
      console.error('Error fetching exams:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to fetch exams',
        data: [] 
      };
    }
  }

  // ====================================
  // Menu Items Methods
  // ====================================
  static async getMenuItems(filters = {}) {
    try {
      let query = supabase
        .from('menu_items')
        .select('*')
        .order('day')
        .order('meal');

      // Apply filters if provided
      if (filters.day) {
        query = query.eq('day', filters.day);
      }
      if (filters.meal) {
        query = query.eq('meal', filters.meal);
      }
      if (filters.is_approved !== undefined) {
        query = query.eq('is_approved', filters.is_approved);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { 
        success: true, 
        data: data || [] 
      };
    } catch (error) {
      console.error('Error fetching menu items:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to fetch menu items',
        data: [] 
      };
    }
  }

  static async getMenuItem(id) {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error fetching menu item:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch menu item',
        data: null
      };
    }
  }

  static async createMenuItem(menuItemData) {
    try {
      const menuItem = {
        day: menuItemData.day,
        meal: menuItemData.meal,
        time: menuItemData.time,
        items: menuItemData.items,
        is_approved: menuItemData.is_approved || false,
        is_weekly_default: menuItemData.is_weekly_default || false,
        is_special: menuItemData.is_special || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('menu_items')
        .insert([menuItem])
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        message: 'Menu item created successfully',
        data
      };
    } catch (error) {
      console.error('Error creating menu item:', error);
      return {
        success: false,
        message: error.message || 'Failed to create menu item',
        data: null
      };
    }
  }

  static async updateMenuItem(id, updates) {
    try {
      const updatedItem = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('menu_items')
        .update(updatedItem)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        message: 'Menu item updated successfully',
        data
      };
    } catch (error) {
      console.error('Error updating menu item:', error);
      return {
        success: false,
        message: error.message || 'Failed to update menu item',
        data: null
      };
    }
  }

  static async deleteMenuItem(id) {
    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return {
        success: true,
        message: 'Menu item deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting menu item:', error);
      return {
        success: false,
        message: error.message || 'Failed to delete menu item'
      };
    }
  }

  // Course Methods
  // Course Methods
  static async createCourse(courseData) {
    try {
      // Ensure required fields are present
      const requiredFields = ['name', 'code', 'department_id', 'credits', 'duration_years'];
      const missingFields = requiredFields.filter(field => !courseData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      const course = {
        ...courseData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('courses')
        .insert([course])
        .select()
        .single();

      if (error) throw error;

      return { 
        success: true, 
        message: 'Course created successfully',
        data 
      };
    } catch (error) {
      console.error('Error creating course:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to create course' 
      };
    }
  }

  static async updateCourse(id, updates) {
    try {
      const updatedCourse = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('courses')
        .update(updatedCourse)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { 
        success: true, 
        message: 'Course updated successfully',
        data 
      };
    } catch (error) {
      console.error('Error updating course:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to update course' 
      };
    }
  }

  static async deleteCourse(id) {
    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { 
        success: true, 
        message: 'Course deleted successfully' 
      };
    } catch (error) {
      console.error('Error deleting course:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to delete course' 
      };
    }
  }

  static async getCourses(filters = {}) {
    try {
      let query = supabase
        .from('courses')
        .select('*');

      // Apply filters if provided
      if (filters.department_id) {
        query = query.eq('department_id', filters.department_id);
      }
      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }

      // Add ordering
      query = query.order('name', { ascending: true });

      const { data, error } = await query;

      if (error) throw error;

      return { 
        success: true, 
        data: data || [] 
      };
    } catch (error) {
      console.error('Error fetching courses:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to fetch courses',
        data: [] 
      };
    }
  }

  // Department Methods
  static async getAllDepartments(filters = {}) {
    try {
      let query = supabase
        .from('departments')
        .select('*')
        .order('name', { ascending: true });

      // Apply filters if provided
      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,code.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { 
        success: true, 
        data: data || []
      };
    } catch (error) {
      console.error('Error fetching departments:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to fetch departments',
        data: []
      };
    }
  }

  static async getDepartment(id) {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return { 
        success: true, 
        data 
      };
    } catch (error) {
      console.error('Error fetching department:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to fetch department',
        data: null
      };
    }
  }

  static async createDepartment(departmentData) {
    try {
      // Add timestamps
      const department = {
        ...departmentData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('departments')
        .insert([department])
        .select()
        .single();

      if (error) throw error;

      return { 
        success: true, 
        message: 'Department created successfully',
        data 
      };
    } catch (error) {
      console.error('Error creating department:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to create department'
      };
    }
  }

  static async updateDepartment(id, updates) {
    try {
      const updatedDepartment = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('departments')
        .update(updatedDepartment)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { 
        success: true, 
        message: 'Department updated successfully',
        data 
      };
    } catch (error) {
      console.error('Error updating department:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to update department'
      };
    }
  }

  static async deleteDepartment(id) {
    try {
      const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { 
        success: true, 
        message: 'Department deleted successfully' 
      };
    } catch (error) {
      console.error('Error deleting department:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to delete department' 
      };
    }
  }

  // ====================================
  // Menu Items Methods
  // ====================================
  static async getMenuItems(filters = {}) {
    try {
      let query = supabase
        .from('menu_items')
        .select('*')
        .order('day')
        .order('meal');

      // Apply filters if provided
      if (filters.day) {
        query = query.eq('day', filters.day);
      }
      if (filters.meal) {
        query = query.eq('meal', filters.meal);
      }
      if (filters.is_approved !== undefined) {
        query = query.eq('is_approved', filters.is_approved);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { 
        success: true, 
        data: data || [] 
      };
    } catch (error) {
      console.error('Error fetching menu items:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to fetch menu items',
        data: [] 
      };
    }
  }

  static async getMenuItem(id) {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error fetching menu item:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch menu item',
        data: null
      };
    }
  }

  static async createMenuItem(menuItemData) {
    try {
      const menuItem = {
        day: menuItemData.day,
        meal: menuItemData.meal,
        time: menuItemData.time,
        items: menuItemData.items,
        is_approved: menuItemData.is_approved || false,
        is_weekly_default: menuItemData.is_weekly_default || false,
        is_special: menuItemData.is_special || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('menu_items')
        .insert([menuItem])
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        message: 'Menu item created successfully',
        data
      };
    } catch (error) {
      console.error('Error creating menu item:', error);
      return {
        success: false,
        message: error.message || 'Failed to create menu item',
        data: null
      };
    }
  }

  static async updateMenuItem(id, updates) {
    try {
      const updatedItem = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('menu_items')
        .update(updatedItem)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        message: 'Menu item updated successfully',
        data
      };
    } catch (error) {
      console.error('Error updating menu item:', error);
      return {
        success: false,
        message: error.message || 'Failed to update menu item',
        data: null
      };
    }
  }

  static async deleteMenuItem(id) {
    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return {
        success: true,
        message: 'Menu item deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting menu item:', error);
      return {
        success: false,
        message: error.message || 'Failed to delete menu item'
      };
    }
  }
}

// Export the Supabase client as default
export default supabase;

// Also export as named exports for backward compatibility
export { supabase, SupabaseService };