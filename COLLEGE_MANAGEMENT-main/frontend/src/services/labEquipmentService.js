import { supabase } from '../lib/supabase';

/**
 * Fetches all equipment types from the database
 * @returns {Promise<Array>} Array of equipment types
 */
export const fetchEquipmentTypes = async () => {
  try {
    const { data, error } = await supabase
      .from('equipment_types')
      .select('*')
      .order('name');
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching equipment types:', error);
    throw error;
  }
};

/**
 * Fetches all labs from the database
 * @returns {Promise<Array>} Array of labs
 */
export const fetchLabs = async () => {
  console.log('Starting to fetch labs...');
  try {
    // First verify Supabase is initialized
    if (!supabase) {
      const error = new Error('Supabase client is not initialized');
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('Supabase client initialized, making query...');
    const { data, error, status, statusText } = await supabase
      .from('labs')
      .select('*')
      .order('name');
      
    console.log('Labs query completed', { status, statusText, error });
    
    if (error) {
      console.error('Supabase query error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }
    
    console.log(`Fetched ${data?.length || 0} labs`);
    return data || [];
  } catch (error) {
    console.error('Error in fetchLabs:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
};

/**
 * Fetches lab equipment with optional filters
 * @param {Object} filters - Optional filters for equipment
 * @returns {Promise<Array>} Array of lab equipment
 */
export const fetchLabEquipment = async (filters = {}) => {
  console.log('Fetching lab equipment with filters:', filters);
  try {
    // First, verify the Supabase client is initialized
    if (!supabase) {
      console.error('Supabase client is not initialized');
      throw new Error('Database connection error');
    }

    // Try to fetch a count of records first to verify table access
    const { count, error: countError } = await supabase
      .from('lab_equipment')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error counting lab equipment:', countError);
      throw countError;
    }

    console.log(`Found ${count} lab equipment records`);

    let query = supabase
      .from('lab_equipment')
      .select(`
        *,
        lab:lab_id (id, name, location),
        type:equipment_type_id (id, name)
      `, { count: 'exact' });

    // Apply filters
    if (filters.status) {
      console.log('Applying status filter:', filters.status);
      query = query.eq('status', filters.status);
    }
    if (filters.lab_id) {
      console.log('Applying lab filter:', filters.lab_id);
      query = query.eq('lab_id', filters.lab_id);
    }
    if (filters.equipment_type_id) {
      console.log('Applying type filter:', filters.equipment_type_id);
      query = query.eq('equipment_type_id', filters.equipment_type_id);
    }
    if (filters.search) {
      console.log('Applying search filter:', filters.search);
      query = query.ilike('name', `%${filters.search}%`);
    }

    console.log('Executing query...');
    const { data, error, status, statusText } = await query.order('name');
    
    if (error) {
      console.error('Supabase query error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }

    console.log(`Query successful. Found ${data?.length || 0} items.`);
    console.log('Sample data:', data?.slice(0, 2)); // Log first 2 items for debugging
    
    return data || [];
  } catch (error) {
    console.error('Error in fetchLabEquipment:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
};

/**
 * Creates a new equipment entry
 * @param {Object} equipmentData - Equipment data to create
 * @returns {Promise<Object>} Created equipment data
 */
export const createEquipment = async (equipmentData) => {
  try {
    const { data, error } = await supabase
      .from('lab_equipment')
      .insert([{
        ...equipmentData,
        status: equipmentData.status || 'available',
        last_maintenance_date: equipmentData.last_maintenance_date || null,
        next_maintenance_date: equipmentData.next_maintenance_date || null
      }])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating equipment:', error);
    throw error;
  }
};

/**
 * Updates an existing equipment entry
 * @param {string} id - ID of the equipment to update
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated equipment data
 */
export const updateEquipment = async (id, updates) => {
  try {
    const { data, error } = await supabase
      .from('lab_equipment')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error updating equipment ${id}:`, error);
    throw error;
  }
};

/**
 * Deletes an equipment entry
 * @param {string} id - ID of the equipment to delete
 * @returns {Promise<boolean>} True if successful
 */
export const deleteEquipment = async (id) => {
  try {
    const { error } = await supabase
      .from('lab_equipment')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error deleting equipment ${id}:`, error);
    throw error;
  }
};

/**
 * Creates a new equipment booking
 * @param {Object} bookingData - Booking details
 * @returns {Promise<Object>} Created booking data
 */
export const createBooking = async (bookingData) => {
  try {
    const { data, error } = await supabase
      .from('equipment_bookings')
      .insert([{
        ...bookingData,
        status: 'scheduled'
      }])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

/**
 * Checks if equipment is available for booking during a specific time period
 * @param {string} equipmentId - ID of the equipment to check
 * @param {string} startTime - Start time of the desired booking
 * @param {string} endTime - End time of the desired booking
 * @param {string} [excludeBookingId] - Optional booking ID to exclude from conflict check
 * @returns {Promise<boolean>} True if equipment is available
 */
export const checkAvailability = async (equipmentId, startTime, endTime, excludeBookingId = null) => {
  try {
    let query = supabase
      .from('equipment_bookings')
      .select('*', { count: 'exact' })
      .eq('equipment_id', equipmentId)
      .eq('status', 'scheduled')
      .or(`and(start_time.lte.${endTime},end_time.gte.${startTime})`);

    if (excludeBookingId) {
      query = query.neq('id', excludeBookingId);
    }

    const { count, error } = await query;
    
    if (error) throw error;
    return count === 0;
  } catch (error) {
    console.error('Error checking equipment availability:', error);
    throw error;
  }
};

/**
 * Gets equipment by ID with related data
 * @param {string} id - Equipment ID
 * @returns {Promise<Object>} Equipment details with related data
 */
export const getEquipmentById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('lab_equipment')
      .select(`
        *,
        lab:lab_id (id, name, location),
        type:equipment_type_id (id, name)
      `)
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching equipment ${id}:`, error);
    throw error;
  }
};
