import { supabase, TABLES } from '../lib/supabase';

// Fetch all classrooms with related data
export const fetchClassrooms = async () => {
  try {
    console.log('Fetching classrooms from Supabase...');
    const { data, error, status } = await supabase
      .from('classrooms')
      .select(`
        *,
        building:buildings(*),
        room_type:room_types(*),
        schedules:class_schedule(
          *,
          course:courses(*),
          faculty:faculty(*)
        )
      `)
      .order('name', { ascending: true });

    if (error) throw error;
    
    console.log(`Successfully fetched ${data?.length || 0} classrooms`);
    return data || [];
  } catch (error) {
    console.error('Error in fetchClassrooms:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    throw new Error(`Failed to load classrooms: ${error.message}`);
  }
};

// Create a new classroom
export const createClassroom = async (classroomData) => {
  const { data, error } = await supabase
    .from('classrooms')
    .insert([classroomData])
    .select();

  if (error) {
    console.error('Error creating classroom:', error);
    throw error;
  }
  return data[0];
};

// Update a classroom
export const updateClassroom = async (id, updates) => {
  const { data, error } = await supabase
    .from('classrooms')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error updating classroom:', error);
    throw error;
  }
  return data[0];
};

// Delete a classroom
export const deleteClassroom = async (id) => {
  const { error } = await supabase
    .from('classrooms')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting classroom:', error);
    throw error;
  }
};

// Fetch all buildings
export const fetchBuildings = async () => {
  try {
    console.log('Fetching buildings from Supabase...');
    const { data, error } = await supabase
      .from('buildings')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    
    console.log(`Successfully fetched ${data?.length || 0} buildings`);
    return data || [];
  } catch (error) {
    console.error('Error in fetchBuildings:', error);
    throw new Error(`Failed to load buildings: ${error.message}`);
  }
};

// Fetch all room types
export const fetchRoomTypes = async () => {
  try {
    console.log('Fetching room types from Supabase...');
    const { data, error } = await supabase
      .from('room_types')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    
    console.log(`Successfully fetched ${data?.length || 0} room types`);
    return data || [];
  } catch (error) {
    console.error('Error in fetchRoomTypes:', error);
    throw new Error(`Failed to load room types: ${error.message}`);
  }
};

// Helper function to get day name from day number
export const getDayName = (dayNumber) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayNumber] || 'Unknown';
};
