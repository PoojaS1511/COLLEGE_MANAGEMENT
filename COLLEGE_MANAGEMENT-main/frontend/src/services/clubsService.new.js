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
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  if (config.body && typeof config.body !== 'string') {
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
    return response;
  } catch (error) {
    console.error('Error in getClubs:', error);
    return { success: false, message: error.message };
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
    const response = await apiRequest('/clubs', {
      method: 'POST',
      body: clubData,
    });
    return response;
  } catch (error) {
    console.error('Error in createClub:', error);
    return { success: false, message: error.message };
  }
};

export const updateClub = async (id, updates) => {
  try {
    const response = await apiRequest(`/clubs/${id}`, {
      method: 'PUT',
      body: updates,
    });
    return response;
  } catch (error) {
    console.error('Error in updateClub:', error);
    return { success: false, message: error.message };
  }
};

export const deleteClub = async (id) => {
  try {
    const response = await apiRequest(`/clubs/${id}`, {
      method: 'DELETE',
    });
    return response;
  } catch (error) {
    console.error('Error in deleteClub:', error);
    return { success: false, message: error.message };
  }
};

// ====================================
// Club Members Methods
// ====================================

export const getClubMembers = async (clubId) => {
  try {
    const response = await apiRequest(`/clubs/${clubId}/members`, {
      method: 'GET',
    });
    return response;
  } catch (error) {
    console.error('Error in getClubMembers:', error);
    return { success: false, message: error.message };
  }
};

export const inviteClubMember = async (inviteData) => {
  try {
    const response = await apiRequest(`/clubs/${inviteData.club_id}/members`, {
      method: 'POST',
      body: inviteData,
    });
    return response;
  } catch (error) {
    console.error('Error in inviteClubMember:', error);
    return { success: false, message: error.message };
  }
};

export const updateClubMemberRole = async (clubId, memberId, role) => {
  try {
    const response = await apiRequest(`/clubs/${clubId}/members/${memberId}`, {
      method: 'PUT',
      body: { role },
    });
    return response;
  } catch (error) {
    console.error('Error in updateClubMemberRole:', error);
    return { success: false, message: error.message };
  }
};

export const removeClubMember = async (clubId, memberId) => {
  try {
    const response = await apiRequest(`/clubs/${clubId}/members/${memberId}`, {
      method: 'DELETE',
    });
    return response;
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
    let url = `/clubs/${clubId}/events`;
    const params = new URLSearchParams();
    
    if (status) params.append('status', status);
    if (limit) params.append('limit', limit);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await apiRequest(url, {
      method: 'GET',
    });
    return response;
  } catch (error) {
    console.error('Error in getClubEvents:', error);
    return { success: false, message: error.message };
  }
};

export const getEvent = async (eventId) => {
  try {
    const response = await apiRequest(`/events/${eventId}`, {
      method: 'GET',
    });
    return response;
  } catch (error) {
    console.error('Error in getEvent:', error);
    return { success: false, message: error.message };
  }
};

export const createEvent = async (eventData) => {
  try {
    const response = await apiRequest('/events', {
      method: 'POST',
      body: eventData,
    });
    return response;
  } catch (error) {
    console.error('Error in createEvent:', error);
    return { success: false, message: error.message };
  }
};

export const updateEvent = async (eventId, updates) => {
  try {
    const response = await apiRequest(`/events/${eventId}`, {
      method: 'PUT',
      body: updates,
    });
    return response;
  } catch (error) {
    console.error('Error in updateEvent:', error);
    return { success: false, message: error.message };
  }
};

export const deleteEvent = async (eventId) => {
  try {
    const response = await apiRequest(`/events/${eventId}`, {
      method: 'DELETE',
    });
    return response;
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
    const response = await apiRequest(`/events/${eventId}/attendance`, {
      method: 'GET',
    });
    return response;
  } catch (error) {
    console.error('Error in getEventAttendance:', error);
    return { success: false, message: error.message };
  }
};

export const markAttendance = async (attendanceData) => {
  try {
    const response = await apiRequest('/attendance', {
      method: 'POST',
      body: attendanceData,
    });
    return response;
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
    let url = `/clubs/${clubId}/gallery`;
    if (eventId) {
      url += `?event_id=${eventId}`;
    }
    
    const response = await apiRequest(url, {
      method: 'GET',
    });
    return response;
  } catch (error) {
    console.error('Error in getClubGallery:', error);
    return { success: false, message: error.message };
  }
};

export const uploadGalleryMedia = async (mediaData) => {
  try {
    const formData = new FormData();
    
    // Append all fields from mediaData to formData
    Object.keys(mediaData).forEach(key => {
      formData.append(key, mediaData[key]);
    });
    
    const response = await fetch(`${API_BASE_URL}/gallery/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Error in uploadGalleryMedia:', error);
    return { success: false, message: error.message };
  }
};

export const deleteGalleryMedia = async (mediaId) => {
  try {
    const response = await apiRequest(`/gallery/${mediaId}`, {
      method: 'DELETE',
    });
    return response;
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
    const response = await apiRequest(`/clubs/${clubId}/awards`, {
      method: 'GET',
    });
    return response;
  } catch (error) {
    console.error('Error in getClubAwards:', error);
    return { success: false, message: error.message };
  }
};

export const createAward = async (awardData) => {
  try {
    const response = await apiRequest(`/clubs/${awardData.club_id}/awards`, {
      method: 'POST',
      body: awardData,
    });
    return response;
  } catch (error) {
    console.error('Error in createAward:', error);
    return { success: false, message: error.message };
  }
};

export const deleteAward = async (awardId) => {
  try {
    const response = await apiRequest(`/awards/${awardId}`, {
      method: 'DELETE',
    });
    return response;
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
  
  // Club Members methods
  getClubMembers,
  inviteClubMember,
  updateClubMemberRole,
  removeClubMember,
  
  // Club Events methods
  getClubEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  
  // Event Attendance methods
  getEventAttendance,
  markAttendance,
  
  // Club Gallery methods
  getClubGallery,
  uploadGalleryMedia,
  deleteGalleryMedia,
  
  // Club Awards methods
  getClubAwards,
  createAward,
  deleteAward
};
