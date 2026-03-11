import { supabase } from '../lib/supabase';

// Helper function to log detailed error information
const handleSupabaseError = (error, context) => {
  console.error(`Supabase Error (${context}):`, {
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code,
    stack: error.stack
  });
  throw error;
};

// Fetch all relieving requests with faculty details
export const getRelievingRequests = async () => {
  try {
    console.log('Fetching relieving requests...');
    const { data, error } = await supabase
      .from('relieving_requests')
      .select(`
        id,
        faculty_id,
        applied_date,
        proposed_last_working_day,
        reason,
        resignation_letter_url,
        status,
        relieving_letter_ready,
        experience_cert_ready,
        service_cert_ready,
        settlement_ready,
        approved_last_working_day,
        updated_at,
        admin_remarks,
        faculty:faculty_id (
          id,
          full_name,
          employee_id,
          email,
          departments (
            name
          )
        )
      `)
      .order('applied_date', { ascending: false });

    if (error) {
      handleSupabaseError(error, 'getRelievingRequests');
    }

    console.log('Successfully fetched relieving requests:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('Error in getRelievingRequests:', error);
    throw error;
  }
};

// Fetch a single relieving request by ID
export const getRelievingRequestById = async (id) => {
  try {
    console.log(`Fetching relieving request with ID: ${id}`);
    const { data, error } = await supabase
      .from('relieving_requests')
      .select(`
        *,
        faculty:faculty_id (
          id,
          full_name,
          employee_id,
          email,
          departments (
            name
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      handleSupabaseError(error, `getRelievingRequestById(${id})`);
    }

    console.log('Successfully fetched relieving request:', data?.id);
    return data;
  } catch (error) {
    console.error(`Error in getRelievingRequestById(${id}):`, error);
    throw error;
  }
};

// Create a new relieving request
export const createRelievingRequest = async (requestData) => {
  try {
    console.log('Creating new relieving request:', requestData);
    const user = (await supabase.auth.getUser()).data?.user;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const payload = {
      ...requestData,
      faculty_id: requestData.faculty_id || user.id,
      applied_date: new Date().toISOString()
    };

    console.log('Sending payload to Supabase:', payload);
    const { data, error } = await supabase
      .from('relieving_requests')
      .insert([payload])
      .select();

    if (error) {
      handleSupabaseError(error, 'createRelievingRequest');
    }

    console.log('Successfully created relieving request:', data?.[0]?.id);
    return data?.[0];
  } catch (error) {
    console.error('Error in createRelievingRequest:', error);
    throw error;
  }
};

// Update a relieving request
export const updateRelievingRequest = async (id, updates) => {
  try {
    console.log(`Updating relieving request ${id} with:`, updates);
    const payload = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('relieving_requests')
      .update(payload)
      .eq('id', id)
      .select();

    if (error) {
      handleSupabaseError(error, `updateRelievingRequest(${id})`);
    }

    console.log('Successfully updated relieving request:', id);
    return data?.[0];
  } catch (error) {
    console.error(`Error in updateRelievingRequest(${id}):`, error);
    throw error;
  }
};

// Delete a relieving request
export const deleteRelievingRequest = async (id) => {
  try {
    console.log(`Deleting relieving request: ${id}`);
    const { error } = await supabase
      .from('relieving_requests')
      .delete()
      .eq('id', id);

    if (error) {
      handleSupabaseError(error, `deleteRelievingRequest(${id})`);
    }

    console.log('Successfully deleted relieving request:', id);
    return true;
  } catch (error) {
    console.error(`Error in deleteRelievingRequest(${id}):`, error);
    throw error;
  }
};

// Update request status
export const updateRequestStatus = async (id, status, adminRemarks = '') => {
  try {
    console.log(`Updating status for request ${id} to ${status}`, 
      adminRemarks ? `with remarks: ${adminRemarks}` : '');

    const updates = {
      status,
      updated_at: new Date().toISOString()
    };

    if (adminRemarks) {
      updates.admin_remarks = adminRemarks;
    }

    const { data, error } = await supabase
      .from('relieving_requests')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) {
      handleSupabaseError(error, `updateRequestStatus(${id}, ${status})`);
    }

    console.log(`Successfully updated status for request ${id}`);
    return data?.[0];
  } catch (error) {
    console.error(`Error in updateRequestStatus(${id}, ${status}):`, error);
    throw error;
  }
};
