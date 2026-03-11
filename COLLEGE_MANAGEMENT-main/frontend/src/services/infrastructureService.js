import { supabase } from '../lib/supabase';

// Auditorium related operations
export const auditoriumService = {
  // Get all auditoriums with optional filters
  async getAuditoriums(filters = {}) {
    let query = supabase
      .from('auditoriums')
      .select('*');

    // Apply filters if provided
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.capacity) {
      query = query.gte('capacity', parseInt(filters.capacity));
    }
    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching auditoriums:', error);
      throw error;
    }

    return data || [];
  },

  // Get auditorium by ID with its bookings
  async getAuditoriumById(id) {
    const { data, error } = await supabase
      .from('auditoriums')
      .select(`
        *,
        bookings:auditorium_bookings(
          id,
          event_name,
          start_time,
          end_time,
          status,
          organizer_name,
          contact_email,
          created_at
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching auditorium ${id}:`, error);
      throw error;
    }

    return data;
  },

  // Create a new booking
  async createBooking(bookingData) {
    const { data, error } = await supabase
      .from('auditorium_bookings')
      .insert([{
        auditorium_id: bookingData.auditoriumId,
        event_name: bookingData.eventName,
        start_time: bookingData.startTime,
        end_time: bookingData.endTime,
        organizer_name: bookingData.organizerName,
        contact_email: bookingData.contactEmail,
        purpose: bookingData.purpose,
        status: 'pending',
        created_by: supabase.auth.user()?.id || 'system'
      }])
      .select();

    if (error) {
      console.error('Error creating booking:', error);
      throw error;
    }

    return data?.[0];
  },

  // Update booking status
  async updateBookingStatus(bookingId, status) {
    const { data, error } = await supabase
      .from('auditorium_bookings')
      .update({ status })
      .eq('id', bookingId)
      .select();

    if (error) {
      console.error(`Error updating booking ${bookingId}:`, error);
      throw error;
    }

    return data?.[0];
  },

  // Get upcoming bookings for an auditorium
  async getUpcomingBookings(auditoriumId) {
    const { data, error } = await supabase
      .from('auditorium_bookings')
      .select('*')
      .eq('auditorium_id', auditoriumId)
      .gte('end_time', new Date().toISOString())
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching upcoming bookings:', error);
      throw error;
    }

    return data || [];
  },

  // Update auditorium status (e.g., available, under_maintenance)
  async updateAuditoriumStatus(auditoriumId, status) {
    const { data, error } = await supabase
      .from('auditoriums')
      .update({ status })
      .eq('id', auditoriumId)
      .select();

    if (error) {
      console.error(`Error updating auditorium ${auditoriumId} status:`, error);
      throw error;
    }

    return data?.[0];
  }
};

// Base service for common CRUD operations
class BaseInfrastructureService {
  constructor(tableName) {
    this.tableName = tableName;
  }

  async getAll(filters = {}) {
    let query = supabase.from(this.tableName).select('*');
    
    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'object' && value.operator) {
          query = query.filter(key, value.operator, value.value);
        } else {
          query = query.eq(key, value);
        }
      }
    });

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getById(id, relations = '') {
    let query = supabase.from(this.tableName).select(relations || '*').eq('id', id);
    const { data, error } = await query.single();
    if (error) throw error;
    return data;
  }

  async create(item) {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert([item])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async update(id, updates) {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async delete(id) {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
}

// Smart Classrooms Service
export const smartClassroomService = {
  ...new BaseInfrastructureService('smart_classrooms'),

  async getRoomsWithEquipment() {
    const { data, error } = await supabase
      .from('smart_classrooms')
      .select(`
        *,
        equipment:smart_classroom_equipment(*)
      `)
      .order('building')
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  async getRoomSchedule(roomId) {
    const { data, error } = await supabase
      .from('smart_classroom_schedules')
      .select('*')
      .eq('smart_classroom_id', roomId)
      .order('start_time');
    
    if (error) throw error;
    return data || [];
  },

  async addEquipment(roomId, equipmentData) {
    const { data, error } = await supabase
      .from('smart_classroom_equipment')
      .insert([{ ...equipmentData, smart_classroom_id: roomId }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateEquipmentStatus(equipmentId, status) {
    const { data, error } = await supabase
      .from('smart_classroom_equipment')
      .update({ status, last_checked: new Date().toISOString() })
      .eq('id', equipmentId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Lab Equipment Service
export const labEquipmentService = {
  ...new BaseInfrastructureService('lab_equipment'),

  async getEquipmentWithDetails(filters = {}) {
    let query = supabase
      .from('lab_equipment')
      .select(`
        *,
        type:equipment_types(*),
        lab:labs(*),
        bookings:equipment_bookings!inner(*)
      `);

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.lab_id) {
      query = query.eq('lab_id', filters.lab_id);
    }
    if (filters.equipment_type_id) {
      query = query.eq('equipment_type_id', filters.equipment_type_id);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async bookEquipment(equipmentId, bookingData) {
    const { data, error } = await supabase
      .from('equipment_bookings')
      .insert([{
        equipment_id: equipmentId,
        ...bookingData,
        status: 'pending'
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getEquipmentBookings(equipmentId) {
    const { data, error } = await supabase
      .from('equipment_bookings')
      .select('*')
      .eq('equipment_id', equipmentId)
      .gte('end_time', new Date().toISOString())
      .order('start_time');
    
    if (error) throw error;
    return data || [];
  },

  async getEquipmentTypes() {
    const { data, error } = await supabase
      .from('equipment_types')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  async scheduleMaintenance(equipmentId, maintenanceData) {
    const { data, error } = await supabase
      .from('lab_equipment')
      .update({
        status: 'under_maintenance',
        last_maintenance_date: new Date().toISOString(),
        next_maintenance_date: maintenanceData.next_maintenance_date,
        maintenance_notes: maintenanceData.notes
      })
      .eq('id', equipmentId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Infrastructure Status Service
export const infrastructureStatusService = {
  async getSystemStatus() {
    // Get counts of available vs. in-use equipment
    const { data: equipmentStatus, error: equipmentError } = await supabase
      .from('lab_equipment')
      .select('status', { count: 'exact' })
      .group('status');
    
    if (equipmentError) throw equipmentError;

    // Get counts of available vs. in-use classrooms
    const { data: classroomStatus, error: classroomError } = await supabase
      .from('smart_classrooms')
      .select('status', { count: 'exact' })
      .group('status');
    
    if (classroomError) throw classroomError;

    // Get maintenance schedule
    const { data: maintenanceSchedule, error: maintenanceError } = await supabase
      .from('lab_equipment')
      .select('id, name, next_maintenance_date')
      .not('next_maintenance_date', 'is', null)
      .order('next_maintenance_date', { ascending: true })
      .limit(5);
    
    if (maintenanceError) throw maintenanceError;

    return {
      equipment: equipmentStatus,
      classrooms: classroomStatus,
      upcomingMaintenance: maintenanceSchedule || []
    };
  }
};

export default {
  auditorium: auditoriumService,
  smartClassroom: smartClassroomService,
  labEquipment: labEquipmentService,
  status: infrastructureStatusService
};
