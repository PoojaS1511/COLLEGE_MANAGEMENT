import supabase from '../lib/supabase';
import { getAuthToken } from '../utils/auth';
import { API_URL } from '../config';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || API_URL; // Uses frontend config which includes /api

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Something went wrong');
  }
  return response.json();
};

const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  if (config.body) {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    return await handleResponse(response);
  } catch (error) {
    console.error(`API request failed: ${error.message}`);
    throw error;
  }
};

// ====================================
// Club Methods
// ====================================

export const getClubs = async () => {
  try {
    const response = await apiRequest('/clubs', {
      method: 'GET',
    });

    // Return the data array directly for easier consumption by components
    if (response && response.data) {
      return response.data;
    } else if (Array.isArray(response)) {
      return response;
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error in getClubs:', error);
    return [];
  }
};

export const getClub = async (id) => {
  try {
    const response = await apiRequest(`/clubs/${id}`, {
      method: 'GET',
    });
    return response;
  } catch (error) {
    console.error('Error in getClub:', error);
    return { success: false, message: error.message };
  }
};

export const createClub = async (clubData) => {
  try {
    const { data, error } = await supabase
      .from('clubs')
      .insert([{
        ...clubData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select();

    if (error) throw error;
    
    return { 
      success: true, 
      data: data?.[0],
      message: 'Club created successfully' 
    };
  } catch (error) {
    console.error('Error in createClub:', error);
    return { success: false, message: error.message };
  }
};

export const updateClub = async (id, updates) => {
  try {
    const { data, error } = await supabase
      .from('clubs')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) throw error;
    
    return { 
      success: true, 
      data: data?.[0],
      message: 'Club updated successfully' 
    };
  } catch (error) {
    console.error('Error in updateClub:', error);
    return { success: false, message: error.message };
  }
};

export const deleteClub = async (id) => {
  try {
    const { error } = await supabase
      .from('clubs')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    return { 
      success: true, 
      message: 'Club deleted successfully' 
    };
  } catch (error) {
    console.error('Error in deleteClub:', error);
    return { success: false, message: error.message };
  }
};

// ====================================
// Club Categories Methods
// ====================================

export const getClubCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('club_categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error in getClubCategories:', error);
    return [];
  }
};

// ====================================
// Club Members Methods
// ====================================

export const getClubMembers = async (clubId) => {
  try {
    // Use the backend API endpoint instead of direct Supabase call
    const response = await apiRequest(`/clubs/${clubId}/members`, {
      method: 'GET',
    });

    // Return the data array directly for easier consumption by components
    if (response && response.data) {
      return response.data;
    } else if (Array.isArray(response)) {
      return response;
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error in getClubMembers:', error);
    return [];
  }
};

export const inviteClubMember = async ({ club_id, email, role = 'member' }) => {
  try {
    const response = await apiRequest(`/clubs/${club_id}/members/invite`, {
      method: 'POST',
      body: { email, role }
    });

    if (response && response.data) {
      return { success: true, data: response.data, message: response.message };
    } else {
      return { success: true, message: 'Invitation sent successfully' };
    }
  } catch (error) {
    console.error('Error in inviteClubMember:', error);
    return {
      success: false,
      message: error.message || 'Failed to invite member'
    };
  }
};

export const updateClubMemberRole = async (clubId, memberId, role) => {
  try {
    const response = await apiRequest(`/clubs/${clubId}/members/${memberId}/role`, {
      method: 'PUT',
      body: { role }
    });

    if (response && response.data) {
      return { success: true, data: response.data };
    } else {
      return { success: true };
    }
  } catch (error) {
    console.error('Error in updateClubMemberRole:', error);
    return { success: false, message: error.message };
  }
};

export const removeClubMember = async (clubId, memberId) => {
  try {
    const response = await apiRequest(`/clubs/${clubId}/members/${memberId}`, {
      method: 'DELETE'
    });

    return { success: true, message: 'Member removed successfully' };
  } catch (error) {
    console.error('Error in removeClubMember:', error);
    return { success: false, message: error.message };
  }
};

// ====================================
// Club Events Methods
// ====================================

export const getClubEvents = async (clubId, { status, limit } = {}) => {
  try {
    // Validate clubId parameter
    if (!clubId || clubId === 'undefined' || clubId === 'null' || clubId === '') {
      throw new Error('Valid clubId is required');
    }

    let query = supabase
      .from('club_events')
      .select('*', { count: 'exact' })
      .eq('club_id', clubId);
    
    // Apply filters if provided
    if (status === 'upcoming') {
      query = query.gt('end_date', new Date().toISOString());
    } else if (status === 'past') {
      query = query.lt('end_date', new Date().toISOString());
    } else if (status === 'ongoing') {
      const now = new Date().toISOString();
      query = query.lte('start_date', now).gte('end_date', now);
    }
    
    // Apply sorting
    query = query.order('start_date', { ascending: status !== 'past' });
    
    // Apply limit if provided
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    return { 
      success: true, 
      data: data || [],
      count: count || 0
    };
  } catch (error) {
    console.error('Error in getClubEvents:', error);
    return { success: false, message: error.message };
  }
};

export const getEvent = async (eventId) => {
  try {
    const { data, error } = await supabase
      .from('club_events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error in getEvent:', error);
    return { success: false, message: error.message };
  }
};

export const createEvent = async (eventData) => {
  try {
    const { data, error } = await supabase
      .from('club_events')
      .insert([{
        ...eventData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select();

    if (error) throw error;
    
    return { 
      success: true, 
      data: data?.[0],
      message: 'Event created successfully' 
    };
  } catch (error) {
    console.error('Error in createEvent:', error);
    return { success: false, message: error.message };
  }
};

export const updateEvent = async (eventId, updates) => {
  try {
    const { data, error } = await supabase
      .from('club_events')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', eventId)
      .select();

    if (error) throw error;
    
    return { 
      success: true, 
      data: data?.[0],
      message: 'Event updated successfully' 
    };
  } catch (error) {
    console.error('Error in updateEvent:', error);
    return { success: false, message: error.message };
  }
};

export const deleteEvent = async (eventId) => {
  try {
    const { error } = await supabase
      .from('club_events')
      .delete()
      .eq('id', eventId);

    if (error) throw error;
    
    return { 
      success: true, 
      message: 'Event deleted successfully' 
    };
  } catch (error) {
    console.error('Error in deleteEvent:', error);
    return { success: false, message: error.message };
  }
};

// ====================================
// Event Attendance Methods
// ====================================

export const getEventAttendance = async (eventId) => {
  try {
    const { data, error } = await supabase
      .from('event_attendance')
      .select(`
        *,
        user:users(*)
      `)
      .eq('event_id', eventId);

    if (error) throw error;
    
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error in getEventAttendance:', error);
    return { success: false, message: error.message };
  }
};

export const markAttendance = async ({ eventId, userId, status = 'present' }) => {
  try {
    const { data, error } = await supabase
      .from('event_attendance')
      .upsert({
        event_id: eventId,
        user_id: userId,
        status,
        marked_at: new Date().toISOString()
      }, {
        onConflict: 'event_id,user_id'
      })
      .select();

    if (error) throw error;
    
    return { 
      success: true, 
      data: data?.[0],
      message: 'Attendance marked successfully' 
    };
  } catch (error) {
    console.error('Error in markAttendance:', error);
    return { success: false, message: error.message };
  }
};

// ====================================
// Club Gallery Methods
// ====================================

export const getClubGallery = async (clubId, { eventId } = {}) => {
  try {
    let query = supabase
      .from('event_gallery')
      .select('*')
      .eq('club_id', clubId);
    
    if (eventId) {
      query = query.eq('event_id', eventId);
    }
    
    query = query.order('created_at', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error in getClubGallery:', error);
    return { success: false, message: error.message };
  }
};

export const uploadGalleryMedia = async ({ clubId, eventId, file, title, description = '' }) => {
  try {
    // First, upload the file to storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${clubId}/${Date.now()}.${fileExt}`;
    const filePath = `club-gallery/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('club-media')
      .upload(filePath, file);
    
    if (uploadError) throw uploadError;
    
    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('club-media')
      .getPublicUrl(filePath);
    
    // Save the media record to the database
    const { data, error } = await supabase
      .from('event_gallery')
      .insert([{
        club_id: clubId,
        event_id: eventId || null,
        title,
        description,
        file_path: filePath,
        file_url: publicUrl,
        file_type: file.type,
        file_size: file.size,
        uploaded_by: supabase.auth.user()?.id
      }])
      .select();
    
    if (error) throw error;
    
    return { 
      success: true, 
      data: data?.[0],
      message: 'Media uploaded successfully' 
    };
  } catch (error) {
    console.error('Error in uploadGalleryMedia:', error);
    return { success: false, message: error.message };
  }
};

export const deleteGalleryMedia = async (mediaId) => {
  try {
    // First, get the file path
    const { data: media, error: fetchError } = await supabase
      .from('event_gallery')
      .select('file_path')
      .eq('id', mediaId)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Delete the file from storage
    const { error: deleteError } = await supabase.storage
      .from('club-media')
      .remove([media.file_path]);
    
    if (deleteError) throw deleteError;
    
    // Delete the record from the database
    const { error } = await supabase
      .from('event_gallery')
      .delete()
      .eq('id', mediaId);
    
    if (error) throw error;
    
    return { 
      success: true, 
      message: 'Media deleted successfully' 
    };
  } catch (error) {
    console.error('Error in deleteGalleryMedia:', error);
    return { success: false, message: error.message };
  }
};

// ====================================
// Club Awards Methods
// ====================================

export const getClubAwards = async (clubId) => {
  try {
    if (!clubId) {
      throw new Error('Club ID is required');
    }

    const { data, error, count } = await supabase
      .from('club_awards')
      .select('*, awarded_to:students(*), awarded_by:students(*)')
      .eq('club_id', clubId)
      .order('awarded_at', { ascending: false });

    if (error) throw error;

    return {
      success: true,
      data: data || [],
      count: count || 0
    };
  } catch (error) {
    console.error('Error in getClubAwards:', error);
    return { success: false, message: error.message };
  }
};

// Club Members Methods
// ====================================
export const createAward = async (awardData) => {
  try {
    const { data, error } = await supabase
      .from('club_awards')
      .insert([{
        ...awardData,
        awarded_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      }])
      .select();

    if (error) throw error;
    
    return { 
      success: true, 
      data: data?.[0],
      message: 'Award created successfully' 
    };
  } catch (error) {
    console.error('Error in createAward:', error);
    return { success: false, message: error.message };
  }
};

export const deleteAward = async (awardId) => {
  try {
    const { error } = await supabase
      .from('club_awards')
      .delete()
      .eq('id', awardId);

    if (error) throw error;
    
    return { 
      success: true, 
      message: 'Award deleted successfully' 
    };
  } catch (error) {
    console.error('Error in deleteAward:', error);
    return { success: false, message: error.message };
  }
};

export default {
  // Club methods
  getClubs,
  getClub,
  createClub,
  updateClub,
  deleteClub,
  
  // Category methods
  getClubCategories,
  
  // Member methods
  getClubMembers,
  inviteClubMember,
  updateClubMemberRole,
  removeClubMember,
  
  // Event methods
  getClubEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  
  // Attendance methods
  getEventAttendance,
  markAttendance,
  
  // Gallery methods
  getClubGallery,
  uploadGalleryMedia,
  deleteGalleryMedia,
  
  // Award methods
  getClubAwards,
  createAward,
  deleteAward
};
