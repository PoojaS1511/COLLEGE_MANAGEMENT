import { supabase } from './supabaseClient';

// Fetch attendance for a specific date
export const getFacultyAttendance = async (date) => {
  const dateStr = date.toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('faculty_attendance')
    .select(`
      *,
      faculty:faculty_id (id, full_name, employee_id, department_id)
    `)
    .eq('attendance_date', dateStr);
    
  if (error) {
    console.error('Error fetching attendance:', error);
    throw error;
  }
  
  return data || [];
};

// Update or create attendance record
export const updateFacultyAttendance = async ({ 
  facultyId, 
  date, 
  status, 
  markedBy, 
  markedByAdmin,
  remarks = '' 
}) => {
  const dateStr = date.toISOString().split('T')[0];
  
  // Prepare update data
  const updateData = {
    status,
    remarks,
    updated_at: new Date().toISOString(),
    marked_by: markedBy,
    marked_by_admin: markedByAdmin || null
  };
  
  // Check if record exists
  const { data: existingRecord } = await supabase
    .from('faculty_attendance')
    .select('id')
    .eq('faculty_id', facultyId)
    .eq('attendance_date', dateStr)
    .single();
    
  if (existingRecord) {
    // Update existing record
    const { data, error } = await supabase
      .from('faculty_attendance')
      .update(updateData)
      .eq('id', existingRecord.id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } else {
    // Create new record
    const { data, error } = await supabase
      .from('faculty_attendance')
      .insert([{
        faculty_id: facultyId,
        attendance_date: dateStr,
        status,
        remarks,
        marked_by: markedBy,
        marked_by_admin: markedByAdmin || null
      }])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }
};

// Batch update attendance
export const batchUpdateAttendance = async (attendanceData, { markedBy, markedByAdmin }) => {
  const operations = attendanceData.map(record => {
    const dateStr = new Date(record.attendance_date).toISOString().split('T')[0];
    
    return supabase
      .from('faculty_attendance')
      .upsert({
        ...record,
        attendance_date: dateStr,
        marked_by: markedBy,
        marked_by_admin: markedByAdmin,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'faculty_id,attendance_date',
        returning: 'minimal'
      });
  });
  
  const results = await Promise.all(operations);
  const errors = results.filter(result => result.error);
  
  if (errors.length > 0) {
    console.error('Errors in batch update:', errors);
    throw new Error(`Failed to save ${errors.length} attendance records`);
  }
  
  return results.map(result => result.data);
};

// Get attendance summary for a date range
export const getAttendanceSummary = async (startDate, endDate) => {
  const start = startDate.toISOString().split('T')[0];
  const end = endDate.toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('faculty_attendance')
    .select(`
      *,
      faculty:faculty_id (id, full_name, employee_id, department_id)
    `)
    .gte('attendance_date', start)
    .lte('attendance_date', end);
    
  if (error) {
    console.error('Error fetching attendance summary:', error);
    throw error;
  }
  
  return data || [];
};
