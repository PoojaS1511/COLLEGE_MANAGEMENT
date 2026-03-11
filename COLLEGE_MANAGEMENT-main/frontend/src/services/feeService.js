import { supabase } from './supabaseClient';

export const recordFeePayment = async (paymentData) => {
  try {
    const { data, error } = await supabase
      .from('fee_payments')
      .insert([paymentData])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error recording payment:', error);
    return { success: false, error };
  }
};

export const getFeePayments = async (filters = {}) => {
  try {
    let query = supabase.from('fee_payments').select('*');
    
    // Apply filters if provided
    if (filters.studentId) {
      query = query.eq('student_id', filters.studentId);
    }
    if (filters.academicYear) {
      query = query.eq('academic_year', filters.academicYear);
    }
    if (filters.semester) {
      query = query.eq('semester', filters.semester);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching fee payments:', error);
    return { success: false, error };
  }
};

export const getFeeStructure = async (id) => {
  try {
    const { data, error } = await supabase
      .from('fee_structures')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching fee structure:', error);
    return { success: false, error };
  }
};
