import { supabase } from '../lib/supabase';

/**
 * Creates a new auth user in Supabase
 * @param {Object} userData - User data including email, password, and user_metadata
 * @returns {Promise<Object>} - The created user data or error
 */
export const createAuthUser = async (userData) => {
  try {
    const { email, password, user_metadata } = userData;
    
    // First, check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      throw new Error('A user with this email already exists');
    }

    // Create the user using Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          ...user_metadata,
          role: 'student'
        },
        emailRedirectTo: window.location.origin + '/auth/callback',
      },
    });

    if (error) throw error;
    
    return {
      success: true,
      user: data.user,
      session: data.session
    };
  } catch (error) {
    console.error('Error creating auth user:', error);
    return {
      success: false,
      error: error.message || 'Failed to create auth user'
    };
  }
};

/**
 * Creates a new student user with both auth and profile data
 * @param {Object} studentData - Student data including email and password
 * @returns {Promise<Object>} - The created student data or error
 */
export const createStudentWithAuth = async (studentData) => {
  try {
    const { email, password, ...profileData } = studentData;
    
    // Create auth user
    const authResult = await createAuthUser({
      email,
      password,
      user_metadata: {
        full_name: profileData.full_name,
        student_id: profileData.register_number,
        phone: profileData.phone,
        department_id: profileData.department_id,
        course_id: profileData.course_id,
      }
    });

    if (!authResult.success) {
      throw new Error(authResult.error);
    }

    // Create student profile
    const { data, error } = await supabase
      .from('students')
      .insert([{
        ...profileData,
        id: authResult.user.id, // Use the same ID as auth user
        email,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      // If student creation fails, try to clean up the auth user
      await supabase.auth.admin.deleteUser(authResult.user.id).catch(console.error);
      throw error;
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error creating student with auth:', error);
    return {
      success: false,
      error: error.message || 'Failed to create student'
    };
  }
};
