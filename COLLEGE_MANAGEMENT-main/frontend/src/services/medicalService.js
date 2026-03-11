import { supabase } from '../lib/supabase';

class MedicalService {
  constructor() {
    this.tableName = 'medical_appointments';
    this.subscriptions = new Map();
  }

  // Subscribe to real-time updates for appointments
  subscribeToAppointments(callback, filters = {}) {
    let query = supabase
      .channel('custom-all-channel')
      .on(
        'postgres_changes',
        { 
          event: '*',
          schema: 'public',
          table: this.tableName,
          ...(filters.status && { filter: `status=eq.${filters.status}` })
        },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe()
      
    // Store the subscription
    const subscriptionId = `appointments-${Date.now()}`;
    this.subscriptions.set(subscriptionId, query);
    
    // Return unsubscribe function
    return () => {
      const subscription = this.subscriptions.get(subscriptionId);
      if (subscription) {
        subscription.unsubscribe();
        this.subscriptions.delete(subscriptionId);
      }
    };
  }

  // Get all appointments with optional filters
  async getAppointments(filters = {}) {
    // Convert date filter to match the database column name
    if (filters.date) {
      filters.appointment_date = filters.date;
      delete filters.date;
    }
    
    // Build the query
    let query = supabase
      .from(this.tableName)
      .select('*')
      .order('appointment_date', { ascending: true })
      .order('start_time', { ascending: true });
    
    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          query = query.in(key, value);
        } else if (typeof value === 'object' && value.operator) {
          query = query.filter(key, value.operator, value.value);
        } else if (key === 'status' && value.includes(',')) {
          // Handle multiple status values
          const statuses = value.split(',');
          query = query.in('status', statuses);
        } else {
          query = query.eq(key, value);
        }
      }
    });
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  // Get active medical cases
  async getActiveMedicalCases() {
    const { data, error } = await supabase
      .from('medical_emergencies')
      .select('*')
      .or('status.eq.active,status.eq.under_investigation')
      .order('emergency_date', { ascending: false });
      
    if (error) throw error;
    return data || [];
  }
  
  // Create a new appointment
  async createAppointment(appointmentData) {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert([{
        ...appointmentData,
        status: 'scheduled',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }
  
  // Update an appointment
  async updateAppointment(id, updates) {
    const { data, error } = await supabase
      .from(this.tableName)
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }
  
  // Get medical history for a person
  async getMedicalHistory(personId) {
    const { data, error } = await supabase
      .from('medical_records')
      .select('*')
      .eq('person_id', personId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  }
  
  // Get person's medical records with optional filtering
  async getPersonMedicalRecords(personId, recordType = null) {
    let query = supabase
      .from('medical_records')
      .select('*')
      .eq('person_id', personId);
      
    if (recordType) {
      query = query.eq('record_type', recordType);
    }
    
    const { data, error } = await query.order('diagnosis_date', { ascending: false });
    if (error) throw error;
    return data || [];
  }
  
  // Create a new medical record
  async createMedicalRecord(recordData) {
    // Check if person exists
    const { error: personError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', recordData.person_id)
      .single();
      
    if (personError) throw new Error('Person not found');

    const { data, error } = await supabase
      .from('medical_records')
      .insert([{
        ...recordData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }
  
  // Get emergency contacts for a person
  async getEmergencyContacts(personId) {
    const { data, error } = await supabase
      .from('emergency_contacts')
      .select('*')
      .eq('person_id', personId)
      .order('is_primary', { ascending: false });
      
    if (error) throw error;
    return data || [];
  }
  
  // Log a medical emergency
  async logMedicalEmergency(emergencyData) {
    const { data, error } = await supabase
      .from('medical_emergencies')
      .insert([{
        ...emergencyData,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }
}

export const medicalService = new MedicalService();
export default medicalService;
