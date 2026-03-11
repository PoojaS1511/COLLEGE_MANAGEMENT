import { supabase } from '../lib/supabase';

// Base service for common sports operations
class BaseSportsService {
  constructor(tableName) {
    this.tableName = tableName;
  }

  // Common methods for all sports services
  async getAll(filters = {}) {
    let query = supabase.from(this.tableName).select('*');
    
    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          query = query.in(key, value);
        } else if (typeof value === 'object' && value.operator) {
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
    const query = supabase
      .from(this.tableName)
      .select(relations || '*')
      .eq('id', id);
      
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

// Equipment Management Service
export const equipmentService = {
  ...new BaseSportsService('sports_equipment'),

  async getAvailableEquipment(filters = {}) {
    let query = supabase
      .from('sports_equipment')
      .select('*')
      .gt('quantity_available', 0);

    // Apply additional filters
    if (filters.name) {
      query = query.ilike('name', `%${filters.name}%`);
    }
    if (filters.condition) {
      query = query.eq('condition', filters.condition);
    }
    if (filters.needs_maintenance) {
      query = query.lt('condition', 'Good');
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async bookEquipment(equipmentId, userId, bookingData) {
    // Start a transaction
    const { data, error } = await supabase.rpc('book_sports_equipment', {
      p_equipment_id: equipmentId,
      p_user_id: userId,
      p_quantity: bookingData.quantity,
      p_booking_date: bookingData.booking_date,
      p_return_date: bookingData.return_date,
      p_notes: bookingData.notes || ''
    });

    if (error) throw error;
    return data;
  },

  async getEquipmentBookings(filters = {}) {
    let query = supabase
      .from('equipment_bookings')
      .select(`
        *,
        equipment:sports_equipment(*),
        student:profiles!equipment_bookings_student_id_fkey(
          id,
          first_name,
          last_name,
          email,
          avatar_url
        ),
        approver:profiles!equipment_bookings_approved_by_fkey(
          id,
          first_name,
          last_name
        )
      `);

    // Apply filters
    if (filters.student_id) {
      query = query.eq('student_id', filters.student_id);
    }
    if (filters.status) {
      query = query.in('status', Array.isArray(filters.status) ? filters.status : [filters.status]);
    }
    if (filters.equipment_id) {
      query = query.eq('equipment_id', filters.equipment_id);
    }
    if (filters.date_from && filters.date_to) {
      query = query.gte('booking_date', filters.date_from)
                   .lte('return_date', filters.date_to);
    }

    // Sorting
    const sortField = filters.sortBy || 'booking_date';
    const sortOrder = filters.sortOrder === 'asc' ? { ascending: true } : { ascending: false };
    query = query.order(sortField, sortOrder);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async updateBookingStatus(bookingId, status, approverId = null) {
    const updates = {
      status,
      updated_at: new Date().toISOString()
    };

    if (approverId) {
      updates.approved_by = approverId;
    }

    if (status === 'returned') {
      updates.actual_return_date = new Date().toISOString();
    }

    return this.update(bookingId, updates);
  }
};

// Facility Management Service
export const facilityService = {
  ...new BaseSportsService('sports_grounds'),

  async getAvailableFacilities(filters = {}) {
    let query = supabase
      .from('sports_grounds')
      .select('*')
      .eq('is_active', true);

    if (filters.name) {
      query = query.ilike('name', `%${filters.name}%`);
    }
    if (filters.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }
    if (filters.capacity) {
      query = query.gte('capacity', filters.capacity);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async checkAvailability(groundId, startTime, endTime) {
    const { data, error } = await supabase.rpc('check_ground_availability', {
      p_ground_id: groundId,
      p_start_time: startTime,
      p_end_time: endTime
    });

    if (error) throw error;
    return data;
  },

  async reserveGround(reservationData) {
    // Check availability first
    const isAvailable = await this.checkAvailability(
      reservationData.ground_id,
      reservationData.start_time,
      reservationData.end_time
    );

    if (!isAvailable) {
      throw new Error('The selected time slot is not available');
    }

    // Create reservation
    const { data, error } = await supabase
      .from('ground_reservations')
      .insert([{
        ...reservationData,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getReservations(filters = {}) {
    let query = supabase
      .from('ground_reservations')
      .select(`
        *,
        ground:sports_grounds(*),
        user:profiles!ground_reservations_booked_by_fkey(
          id,
          first_name,
          last_name,
          email,
          avatar_url
        ),
        approver:profiles!ground_reservations_approved_by_fkey(
          id,
          first_name,
          last_name
        )
      `);

    // Apply filters
    if (filters.ground_id) {
      query = query.eq('ground_id', filters.ground_id);
    }
    if (filters.booked_by) {
      query = query.eq('booked_by', filters.booked_by);
    }
    if (filters.status) {
      query = query.in('status', Array.isArray(filters.status) ? filters.status : [filters.status]);
    }
    if (filters.date_from && filters.date_to) {
      query = query.gte('start_time', filters.date_from)
                   .lte('end_time', filters.date_to);
    } else if (filters.date) {
      // Get all reservations for a specific day
      const startOfDay = new Date(filters.date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(filters.date);
      endOfDay.setHours(23, 59, 59, 999);
      
      query = query.gte('start_time', startOfDay.toISOString())
                   .lte('end_time', endOfDay.toISOString());
    }

    // Sorting
    const sortField = filters.sortBy || 'start_time';
    const sortOrder = filters.sortOrder === 'asc' ? { ascending: true } : { ascending: false };
    query = query.order(sortField, sortOrder);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async updateReservationStatus(reservationId, status, approverId = null) {
    const updates = {
      status,
      updated_at: new Date().toISOString()
    };

    if (approverId) {
      updates.approved_by = approverId;
      updates.approval_date = new Date().toISOString();
    }

    if (status === 'rejected' || status === 'cancelled') {
      updates.end_time = new Date().toISOString();
    }

    return this.update(reservationId, updates);
  }
};

// Fitness Tracking Service
export const fitnessService = {
  ...new BaseSportsService('fitness_logs'),

  async logActivity(userId, activityData) {
    const { data, error } = await this.create({
      user_id: userId,
      ...activityData,
      log_date: activityData.log_date || new Date().toISOString()
    });

    if (error) throw error;
    return data;
  },

  async getActivityLogs(userId, filters = {}) {
    let query = supabase
      .from('fitness_logs')
      .select('*')
      .eq('user_id', userId);

    // Apply filters
    if (filters.activity_type) {
      query = query.eq('activity_type', filters.activity_type);
    }
    if (filters.date_from && filters.date_to) {
      query = query.gte('log_date', filters.date_from)
                   .lte('log_date', filters.date_to);
    }

    // Group by date for summary
    if (filters.group_by_date) {
      query = query.select(`, 
        log_date,
        total_duration:duration_minutes(sum),
        total_calories:calories_burned(sum),
        activity_count(count)
      `).group('log_date');
    }

    // Sorting
    const sortField = filters.sortBy || 'log_date';
    const sortOrder = filters.sortOrder === 'asc' ? { ascending: true } : { ascending: false };
    query = query.order(sortField, sortOrder);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getActivitySummary(userId, period = 'month') {
    let dateFilter = new Date();
    
    switch (period) {
      case 'week':
        dateFilter.setDate(dateFilter.getDate() - 7);
        break;
      case 'month':
        dateFilter.setMonth(dateFilter.getMonth() - 1);
        break;
      case 'year':
        dateFilter.setFullYear(dateFilter.getFullYear() - 1);
        break;
      default:
        dateFilter.setMonth(dateFilter.getMonth() - 1);
    }

    const { data, error } = await supabase
      .from('fitness_logs')
      .select(`
        activity_type,
        total_duration:duration_minutes(sum),
        total_calories:calories_burned(sum),
        activity_count:count
      `)
      .eq('user_id', userId)
      .gte('log_date', dateFilter.toISOString())
      .group('activity_type');

    if (error) throw error;
    return data || [];
  }
};

// Sports Events Service
export const eventService = {
  ...new BaseSportsService('sports_events'),

  async getUpcomingEvents(filters = {}) {
    let query = supabase
      .from('sports_events')
      .select(`
        *,
        organizer:profiles!sports_events_organizer_id_fkey(
          id,
          first_name,
          last_name,
          avatar_url
        ),
        participants:event_participants!event_id(
          participant_id,
          participant_type,
          role,
          status,
          profile:profiles!event_participants_participant_id_fkey(
            id,
            first_name,
            last_name,
            avatar_url
          )
        )
      `)
      .gte('end_datetime', new Date().toISOString())
      .order('start_datetime', { ascending: true });

    // Apply filters
    if (filters.event_type) {
      query = query.eq('event_type', filters.event_type);
    }
    if (filters.organizer_id) {
      query = query.eq('organizer_id', filters.organizer_id);
    }
    if (filters.participant_id) {
      query = query.contains('participants', [{ participant_id: filters.participant_id }]);
    }
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async registerForEvent(eventId, participantData) {
    // Check if event exists and has available spots
    const { data: event, error: eventError } = await this.getById(eventId, 'id, max_participants, participant_count:event_participants(count)');
    if (eventError) throw eventError;

    if (event.max_participants && event.participant_count >= event.max_participants) {
      throw new Error('This event has reached its maximum capacity');
    }

    // Check if already registered
    const { data: existingRegistration, error: checkError } = await supabase
      .from('event_participants')
      .select('*')
      .eq('event_id', eventId)
      .eq('participant_id', participantData.participant_id)
      .maybeSingle();

    if (checkError) throw checkError;
    if (existingRegistration) {
      throw new Error('You are already registered for this event');
    }

    // Register participant
    const { data, error } = await supabase
      .from('event_participants')
      .insert([{
        event_id: eventId,
        ...participantData,
        status: 'registered'
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateParticipantStatus(eventId, participantId, status) {
    const { data, error } = await supabase
      .from('event_participants')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('event_id', eventId)
      .eq('participant_id', participantId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getEventParticipants(eventId, filters = {}) {
    let query = supabase
      .from('event_participants')
      .select(`
        *,
        participant:profiles!event_participants_participant_id_fkey(
          id,
          first_name,
          last_name,
          email,
          avatar_url,
          department:departments(name)
        )
      `)
      .eq('event_id', eventId);

    // Apply filters
    if (filters.status) {
      query = query.in('status', Array.isArray(filters.status) ? filters.status : [filters.status]);
    }
    if (filters.role) {
      query = query.eq('role', filters.role);
    }
    if (filters.search) {
      query = query.or(`
        profiles.first_name.ilike.%${filters.search}%,
        profiles.last_name.ilike.%${filters.search}%,
        profiles.email.ilike.%${filters.search}%
      `);
    }

    // Sorting
    const sortField = filters.sortBy || 'created_at';
    const sortOrder = filters.sortOrder === 'asc' ? { ascending: true } : { ascending: false };
    query = query.order(sortField, sortOrder);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }
};

// Export all services
export default {
  equipment: equipmentService,
  facilities: facilityService,
  fitness: fitnessService,
  events: eventService
};
