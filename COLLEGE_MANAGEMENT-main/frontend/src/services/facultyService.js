import { supabase } from '../lib/supabase';

// Helper function to handle errors
const handleError = (error, context) => {
  console.error(`Error in ${context}:`, error);
  throw new Error(`Failed to ${context}: ${error.message}`);
};

// Fetch all departments
export const getDepartments = async () => {
  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .order('name', { ascending: true });
    
  if (error) {
    console.error('Error fetching departments:', error);
    throw error;
  }
  return data || [];
};

// Fetch all faculty members with department information
export const getFaculty = async () => {
  try {
    const { data, error } = await supabase
      .from('faculties')
      .select('id, full_name, employee_id, designation, is_hod, department_id, status, departments (name, code)')
      .order('full_name', { ascending: true });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    handleError(error, 'fetch faculty');
    return [];
  }
};

// Fetch a single faculty member by ID
export const getFacultyById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('faculties')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    handleError(error, 'fetch faculty by ID');
  }
};

// Create a new faculty member using Edge Function
export const createFaculty = async (facultyData) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('No active session. Please log in again.');
    }

    // Format phone number (remove +91 if present)
    if (facultyData.phone) {
      facultyData.phone = facultyData.phone.replace(/^\+91/, '');
    }

    // Ensure department_id is a number
    if (facultyData.department_id) {
      facultyData.department_id = Number(facultyData.department_id);
    }

    // Use the correct endpoint - replace with your actual function URL
    const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-faculty`;
    
    // Debug logging
    console.log("About to call Edge Function with data:", facultyData);
    console.log("URL:", functionUrl);
    
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(facultyData)
    });

    if (!response.ok) {
      let errorMessage = `Failed to create faculty (HTTP ${response.status})`;
      let errorData = null;
      
      try {
        errorData = await response.json();
        console.log("Edge Function returned error body:", errorData);
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (jsonErr) {
        const text = await response.text();
        console.log("Edge Function raw error response:", text);
        errorMessage += ` - ${text || 'no response body'}`;
      }
      
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in create faculty:', error);
    throw error;
  }
};

// Update a faculty member
export const updateFaculty = async (id, updates) => {
  try {
    const { data, error } = await supabase
      .from('faculties')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    handleError(error, 'update faculty');
  }
};

// Delete a faculty member
export const deleteFaculty = async (id) => {
  try {
    const { error } = await supabase
      .from('faculties')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return true;
  } catch (error) {
    handleError(error, 'delete faculty');
  }
};

// Get faculty attendance records for a specific date range
export const getFacultyAttendance = async (facultyId, startDate, endDate) => {
  if (!facultyId) {
    throw new Error('Faculty ID is required');
  }
  
  try {
    const { data, error } = await supabase
      .from('faculty_attendance')
      .select('*')
      .eq('faculty_id', facultyId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    handleError(error, 'fetch faculty attendance');
  }
};

export const markFacultyAttendance = async (attendanceData) => {
  try {
    const { data, error } = await supabase
      .from('faculty_attendance')
      .upsert([attendanceData], { onConflict: 'faculty_id,date' })
      .select();
      
    if (error) throw error;
    return data?.[0] || null;
  } catch (error) {
    handleError(error, 'mark faculty attendance');
  }
};

export const deleteFacultyAttendance = async (id) => {
  try {
    const { error } = await supabase
      .from('faculty_attendance')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return true;
  } catch (error) {
    handleError(error, 'delete faculty attendance');
  }
};

export const getFacultyCountByDepartment = async () => {
  try {
    const { data, error } = await supabase
      .from('faculties')
      .select('department_id, departments(name)')
      .eq('status', 'active')
      .order('count', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    handleError(error, 'fetch faculty count by department');
    return [];
  }
};
