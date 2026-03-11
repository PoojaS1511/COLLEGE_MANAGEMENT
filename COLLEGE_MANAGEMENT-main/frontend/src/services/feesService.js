import { supabase } from '../lib/supabase';

// Helper function to handle API timeouts
const withTimeout = (promise, ms = 10000) => {
  const timeout = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Request timed out')), ms)
  );
  return Promise.race([promise, timeout]);
};

// Helper function to validate and transform fee data
const transformFeeData = (payment) => {
  if (!payment || typeof payment !== 'object') {
    console.warn('[FeesService] Invalid payment record:', payment);
    return null;
  }

  // Ensure required fields have default values
  const transformed = {
    id: payment.id || `temp-${Math.random().toString(36).substr(2, 9)}`,
    studentId: payment.student_id || null,
    studentName: payment.students?.full_name || 'Unknown Student',
    registerNumber: payment.students?.register_number || 'N/A',
    department: payment.students?.departments?.name || 'N/A',
    amount: Number(payment.amount) || 0,
    paymentDate: payment.payment_date || null,
    paymentMode: payment.payment_mode || 'Unknown',
    transactionId: payment.transaction_id || 'N/A',
    status: ['paid', 'partial', 'unpaid'].includes(payment.status?.toLowerCase()) 
      ? payment.status.toLowerCase() 
      : 'unpaid',
    feeType: payment.fee_type || 'Tuition',
    semester: payment.semester || '1',
    academicYear: payment.academic_year || new Date().getFullYear().toString(),
    lateFee: Number(payment.late_fee) || 0,
    dueDate: payment.due_date || null,
    createdAt: payment.created_at || new Date().toISOString(),
    updatedAt: payment.created_at || new Date().toISOString()  // Use created_at since updated_at doesn't exist
  };

  return transformed;
};

export const feesService = {
  /**
   * Get all fees records with student and department details
   * @returns {Promise<Array>} Array of fee records
   */
  getAllFees: async () => {
    try {
      console.log('[FeesService] Fetching fee payments from database...');

      // Define the query
      const query = supabase
        .from('fee_payments')
        .select(`
          id,
          student_id,
          amount,
          status,
          payment_date,
          payment_mode,
          transaction_id,
          fee_type,
          semester,
          academic_year,
          late_fee,
          due_date,
          created_at,
          students:students!inner(
            full_name,
            register_number,
            departments:departments!inner(
              name
            )
          )
        `)
        .order('payment_date', { ascending: false });

      // Execute query with timeout
      const { data: payments, error: paymentsError } = await withTimeout(query);

      if (paymentsError) {
        console.error('[FeesService] Error fetching payments:', {
          message: paymentsError.message,
          details: paymentsError.details,
          hint: paymentsError.hint,
          code: paymentsError.code
        });
        throw new Error(`Failed to fetch fee payments: ${paymentsError.message}`);
      }

      console.log(`[FeesService] Successfully fetched ${payments?.length || 0} fee payments`);

      if (!payments || payments.length === 0) {
        console.warn('[FeesService] No fee payments found in the database');
        return [];
      }

      // Transform and validate the data
      const transformedPayments = payments
        .map(transformFeeData)
        .filter(Boolean); // Remove any invalid entries

      console.log('[FeesService] Successfully transformed fee payments data');
      return transformedPayments;
    } catch (error) {
      console.error('[FeesService] Error in getAllFees:', {
        message: error.message,
        name: error.name,
        ...(error.code && { code: error.code }),
        ...(error.stack && { stack: error.stack })
      });
      
      // Provide more user-friendly error messages
      let errorMessage = 'Failed to fetch fee payments';
      if (error.message.includes('timed out')) {
        errorMessage = 'Request timed out. Please check your connection and try again.';
      } else if (error.message.includes('JWT')) {
        errorMessage = 'Authentication error. Please log in again.';
      } else if (error.message.includes('permission')) {
        errorMessage = 'You do not have permission to view fee records.';
      }
      
      const enhancedError = new Error(errorMessage);
      enhancedError.originalError = error;
      throw enhancedError;
    }
  },

  // Get fees by student ID
  getFeesByStudentId: async (studentId) => {
    try {
      const { data, error } = await supabase
        .from('fee_payments')
        .select(`
          *,
          students (
            id,
            full_name,
            register_number,
            course_id,
            courses (
              id,
              name,
              code
            )
          )
        `)
        .eq('student_id', studentId)
        .order('payment_date', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) return null;

      // Transform data
      return {
        studentId: data[0].students?.id,
        studentName: data[0].students?.full_name,
        enrollmentNumber: data[0].students?.register_number,
        course: data[0].students?.courses?.name || 'N/A',
        semester: data[0].semester || 'N/A',
        totalAmount: data.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0),
        paidAmount: data.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0),
        balance: 0, // Calculate based on fee structure if available
        status: data[0].status,
        paymentHistory: data.map(payment => ({
          id: payment.id,
          date: payment.payment_date,
          amount: payment.amount,
          transactionId: payment.transaction_id,
          method: payment.payment_mode,
          status: payment.status,
          feeType: payment.fee_type,
          lateFee: payment.late_fee
        }))
      };
    } catch (error) {
      console.error('Error fetching student fees:', error);
      throw error;
    }
  },

  /**
   * Record a new payment
   * @param {Object} paymentData - The payment data to record
   * @returns {Promise<Object>} The created payment record
   */
  recordPayment: async (paymentData) => {
    try {
      // Validate required fields
      const requiredFields = ['student_id', 'fee_structure_id', 'amount'];
      const missingFields = requiredFields.filter(field => !paymentData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Validate UUID format for student_id
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      
      if (!uuidRegex.test(paymentData.student_id)) {
        throw new Error('Invalid student ID format. Must be a valid UUID.');
      }

      // Handle fee_structure_id - keep numbers as is, validate UUID format if string with hyphens
      if (typeof paymentData.fee_structure_id === 'number' || 
          (typeof paymentData.fee_structure_id === 'string' && /^\d+$/.test(paymentData.fee_structure_id))) {
        
        // Convert to number if it's a string
        paymentData.fee_structure_id = Number(paymentData.fee_structure_id);
        console.log('[FeesService] Using numeric fee_structure_id:', paymentData.fee_structure_id);
        
      } else if (typeof paymentData.fee_structure_id === 'string' && paymentData.fee_structure_id.includes('-')) {
        // If it's a string with hyphens, validate it as a proper UUID
        if (!uuidRegex.test(paymentData.fee_structure_id)) {
          throw new Error('Invalid fee structure ID format. Must be a valid UUID or numeric ID.');
        }
        // If it's a valid UUID, keep it as is
        console.log('[FeesService] Using UUID fee_structure_id:', paymentData.fee_structure_id);
      } else {
        throw new Error('Invalid fee structure ID format. Must be a number or valid UUID.');
      }

      // Prepare the payment data for the API
      const paymentRecord = {
        student_id: paymentData.student_id,
        fee_structure_id: paymentData.fee_structure_id,
        amount: parseFloat(paymentData.amount),
        payment_date: paymentData.payment_date ? paymentData.payment_date.split('T')[0] : new Date().toISOString().split('T')[0],
        payment_mode: paymentData.payment_method || 'cash',
        transaction_id: paymentData.transaction_id || `TXN-${Date.now()}`,
        fee_type: paymentData.fee_type || 'Tuition',
        academic_year: paymentData.academic_year || new Date().getFullYear().toString(),
        semester: paymentData.semester ? parseInt(paymentData.semester, 10) : 1,
        status: paymentData.status || 'paid',
        due_date: paymentData.due_date || null,
        late_fee: paymentData.late_fee || 0
      };

      console.log('[FeesService] Submitting payment:', JSON.stringify(paymentRecord, null, 2));
      
      // Use direct Supabase call to insert payment record
      const { data, error } = await supabase
        .from('fee_payments')
        .insert([paymentRecord])
        .select()
        .single();

      if (error) {
        console.error('[FeesService] Database Error Details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          error: error
        });
        throw error;
      }
      
      console.log('[FeesService] Payment recorded successfully:', data);
      return data;
    } catch (error) {
      console.error('[FeesService] Error in recordPayment:', {
        message: error.message,
        error: error,
        stack: error.stack
      });
      
      let errorMessage = error.message || 'Failed to record payment';
      
      // Provide more user-friendly error messages
      if (error.message.includes('duplicate key')) {
        errorMessage = 'A payment with these details already exists.';
      } else if (error.message.includes('violates foreign key')) {
        errorMessage = 'Invalid student or fee structure reference. Please check the selected values.';
      } else if (error.message.includes('invalid input syntax')) {
        errorMessage = 'Invalid data format. Please check your input and try again.';
      }
      
      const enhancedError = new Error(errorMessage);
      enhancedError.originalError = error;
      throw enhancedError;
    }
  },

  /**
   * Get fee summary statistics
   * @returns {Promise<Object>} Summary of fee statistics
   */
  getFeeSummary: async () => {
    try {
      console.log('[FeesService] Fetching fee summary...');
      
      const { data, error } = await withTimeout(
        supabase.rpc('get_fee_summary')
      );
      
      if (error) {
        console.error('[FeesService] Error getting fee summary:', error);
        throw new Error(`Failed to fetch fee summary: ${error.message}`);
      }
      
      // Ensure we always return a consistent structure
      return {
        totalPaid: Number(data?.total_paid || 0),
        totalPending: Number(data?.total_pending || 0),
        totalStudents: Number(data?.total_students || 0),
        paidPercentage: Number(data?.paid_percentage || 0),
        pendingPercentage: Number(data?.pending_percentage || 0),
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('[FeesService] Error in getFeeSummary:', {
        message: error.message,
        ...(error.originalError && { originalError: error.originalError })
      });
      
      // Return default values in case of error
      return {
        totalPaid: 0,
        totalPending: 0,
        totalStudents: 0,
        paidPercentage: 0,
        pendingPercentage: 0,
        lastUpdated: new Date().toISOString(),
        error: error.message
      };
    }
  },

  /**
   * Get all students with basic information
   * @returns {Promise<Array>} Array of student records
   */
  getStudents: async () => {
    try {
      const { data, error } = await withTimeout(
        supabase
          .from('students')
          .select('id, full_name, register_number, email, phone, departments (id, name)')
          .order('full_name')
      );

      if (error) {
        throw new Error(`Failed to fetch students: ${error.message}`);
      }

      return (data || []).map(student => ({
        id: student.id,
        full_name: student.full_name || 'Unknown Student',
        register_number: student.register_number || 'N/A',
        email: student.email || '',
        phone: student.phone || '',
        department: student.departments?.name || 'N/A',
        department_id: student.departments?.id || null
      }));
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  },

  /**
   * Get student fee installments
   * @param {string} studentId - The ID of the student
   * @param {string} [academicYear] - Optional academic year filter
   * @param {string} [semester] - Optional semester filter
   * @returns {Promise<Array>} Array of fee installments
   */
  getStudentInstallments: async (studentId, academicYear = null, semester = null) => {
    try {
      if (!studentId) {
        throw new Error('Student ID is required');
      }

      let query = supabase
        .from('fee_installments')
        .select(`
          *,
          fee_structure:fee_structure_id (
            *,
            courses (id, name, code)
          )
        `)
        .eq('student_id', studentId);

      if (academicYear) {
        query = query.eq('fee_structure.academic_year', academicYear);
      }
      if (semester) {
        query = query.eq('fee_structure.semester', semester);
      }

      const { data, error } = await withTimeout(query.order('due_date'));
      
      if (error) {
        throw new Error(`Failed to fetch installments: ${error.message}`);
      }

      return (data || []).map(installment => ({
        id: installment.id,
        amount: Number(installment.amount) || 0,
        due_date: installment.due_date,
        status: installment.status || 'pending',
        paid_amount: Number(installment.paid_amount) || 0,
        fee_structure: installment.fee_structure ? {
          id: installment.fee_structure.id,
          name: installment.fee_structure.name || 'N/A',
          description: installment.fee_structure.description,
          academic_year: installment.fee_structure.academic_year,
          semester: installment.fee_structure.semester,
          course: installment.fee_structure.courses?.name || 'N/A'
        } : null,
        created_at: installment.created_at,
        updated_at: installment.updated_at
      }));
    } catch (error) {
      console.error('[FeesService] Error in getStudentInstallments:', {
        message: error.message,
        studentId,
        academicYear,
        semester
      });
      throw error;
    }
  },
  
  /**
   * Get the fee structure for a specific student
   * @param {string} studentId - The ID of the student
   * @returns {Promise<Object>} The fee structure data
   */
  getStudentFeeStructure: async (studentId) => {
    try {
      if (!studentId) {
        throw new Error('Student ID is required');
      }

      console.log(`[FeesService] Fetching fee structure for student: ${studentId}`);

      // Get student's basic information
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('id, full_name, register_number, department_id')
        .eq('id', studentId)
        .single();

      if (studentError) throw studentError;
      if (!studentData) {
        throw new Error('Student not found');
      }

      console.log(`[FeesService] Student department ID: ${studentData.department_id}`);

      // Get all fee structures for the student's department
      const { data: feeStructures = [], error: feeError } = await supabase
        .from('fee_structures')
        .select('*')
        .eq('department_id', studentData.department_id)
        .order('academic_year', { ascending: false });

      if (feeError) {
        console.error('[FeesService] Error fetching fee structures:', feeError);
        throw feeError;
      }

      console.log(`[FeesService] Found ${feeStructures.length} fee structures for department`);

      // Get the student's payment history
      const { data: payments = [], error: paymentsError } = await supabase
        .from('fee_payments')
        .select('*')
        .eq('student_id', studentId);

      if (paymentsError) {
        console.error('[FeesService] Error fetching payment history:', paymentsError);
        throw paymentsError;
      }

      console.log(`[FeesService] Found ${payments.length} payment records for student`);

      // Process each fee structure
      const processedFeeStructures = feeStructures.map(feeStructure => {
        const totalAmount = Number(feeStructure.amount) || 0;
        const feePayments = payments.filter(p => p.fee_structure_id === feeStructure.id);
        const totalPaid = feePayments
          .filter(p => p.status === 'paid')
          .reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);
        const pendingAmount = Math.max(0, totalAmount - totalPaid);
        const status = pendingAmount <= 0 ? 'paid' : (totalPaid > 0 ? 'partial' : 'unpaid');

        console.log(`[FeesService] Fee structure ${feeStructure.id}: total=${totalAmount}, paid=${totalPaid}, pending=${pendingAmount}, status=${status}`);

        return {
          ...feeStructure,
          totalAmount,
          totalPaid,
          pendingAmount,
          status,
          paymentHistory: feePayments
        };
      });

      // Get department name
      let departmentName = 'N/A';
      if (studentData.department_id) {
        const { data: deptData, error: deptError } = await supabase
          .from('departments')
          .select('name')
          .eq('id', studentData.department_id)
          .single();
          
        if (!deptError && deptData) {
          departmentName = deptData.name;
        } else {
          console.error('[FeesService] Error fetching department:', deptError);
        }
      }

      return {
        success: true,
        data: {
          student: {
            id: studentData.id,
            name: studentData.full_name,
            registerNumber: studentData.register_number,
            department: departmentName
          },
          feeStructures: processedFeeStructures,
          paymentHistory: payments || []
        }
      };
    } catch (error) {
      console.error('[FeesService] Error in getStudentFeeStructure:', {
        message: error.message,
        studentId
      });
      return {
        success: false,
        message: error.message || 'Failed to fetch fee structure',
        error: error
      };
    }
  }
};
