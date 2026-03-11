import { supabase } from '@/lib/supabase';

export const facilitiesApi = {
  // Get all facilities
  async getAllFacilities() {
    const { data, error } = await supabase
      .from('facilities')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Get a single facility by ID
  async getFacilityById(id) {
    const { data, error } = await supabase
      .from('facilities')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create a new facility
  async createFacility(facilityData) {
    const { data, error } = await supabase
      .from('facilities')
      .insert([facilityData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update a facility
  async updateFacility(id, updates) {
    const { data, error } = await supabase
      .from('facilities')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a facility
  async deleteFacility(id) {
    const { error } = await supabase
      .from('facilities')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  // Get bookings for a facility
  async getFacilityBookings(facilityId) {
    const { data, error } = await supabase
      .from('facility_bookings')
      .select(`
        *,
        user:user_id (id, full_name, email)
      `)
      .eq('facility_id', facilityId)
      .order('start_time', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Book a facility
  async bookFacility(bookingData) {
    const { data, error } = await supabase
      .from('facility_bookings')
      .insert([bookingData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update booking status
  async updateBookingStatus(bookingId, status) {
    const { data, error } = await supabase
      .from('facility_bookings')
      .update({ status })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
