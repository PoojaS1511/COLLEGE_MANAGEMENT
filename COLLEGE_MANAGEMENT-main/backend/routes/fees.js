const express = require('express');
const router = express.Router();
const { supabase } = require('../supabase_client');

// Get all fee structures with optional filters
router.get('/structures', async (req, res) => {
  try {
    const { course_id, semester, is_active, search = '' } = req.query;
    
    let query = supabase
      .from('fees')
      .select('*, courses(*)', { count: 'exact' });

    // Apply search
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply filters
    if (course_id) {
      query = query.eq('course_id', course_id);
    }
    
    if (semester) {
      query = query.eq('semester', semester);
    }
    
    if (is_active !== undefined) {
      query = query.eq('is_active', is_active === 'true');
    }

    const { data, error, count } = await query;

    if (error) throw error;

    res.json({ status: 'success', data, count });
  } catch (error) {
    console.error('Error fetching fee structures:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch fee structures' });
  }
});

// Get single fee structure by ID
router.get('/structures/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('fees')
      .select('*, courses(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ status: 'error', message: 'Fee structure not found' });
    }

    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error fetching fee structure:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch fee structure' });
  }
});

// Create new fee structure
router.post('/structures', async (req, res) => {
  try {
    const feeData = req.body;
    
    // Validate required fields
    if (!feeData.name || !feeData.amount || !feeData.course_id) {
      return res.status(400).json({
        status: 'error',
        message: 'Name, amount, and course ID are required'
      });
    }
    
    // Check if course exists
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id')
      .eq('id', feeData.course_id)
      .single();

    if (courseError || !course) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Invalid course ID' 
      });
    }
    
    // Check if fee structure with same name already exists for the course
    const { data: existingFee, error: existingError } = await supabase
      .from('fees')
      .select('id')
      .eq('name', feeData.name)
      .eq('course_id', feeData.course_id)
      .maybeSingle();

    if (existingError) throw existingError;
    if (existingFee) {
      return res.status(400).json({
        status: 'error',
        message: 'Fee structure with this name already exists for the course'
      });
    }
    
    const { data, error } = await supabase
      .from('fees')
      .insert([feeData])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ status: 'success', data });
  } catch (error) {
    console.error('Error creating fee structure:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create fee structure' });
  }
});

// Update fee structure
router.put('/structures/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Check if fee structure exists
    const { data: existingFee, error: existingError } = await supabase
      .from('fees')
      .select('id, course_id')
      .eq('id', id)
      .single();

    if (existingError || !existingFee) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Fee structure not found' 
      });
    }
    
    // If name is being updated, check for duplicates
    if (updates.name) {
      const { data: duplicateFee, error: duplicateError } = await supabase
        .from('fees')
        .select('id')
        .eq('name', updates.name)
        .eq('course_id', updates.course_id || existingFee.course_id)
        .neq('id', id)
        .maybeSingle();

      if (duplicateError) throw duplicateError;
      
      if (duplicateFee) {
        return res.status(400).json({
          status: 'error',
          message: 'Another fee structure with this name already exists for the course'
        });
      }
    }
    
    const { data, error } = await supabase
      .from('fees')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error updating fee structure:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update fee structure' });
  }
});

// Delete fee structure
router.delete('/structures/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if there are any payments for this fee structure
    const { data: payments, error: paymentsError } = await supabase
      .from('fee_payments')
      .select('id')
      .eq('fee_id', id)
      .limit(1);

    if (paymentsError) throw paymentsError;
    
    if (payments?.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete fee structure with existing payments'
      });
    }
    
    const { error } = await supabase
      .from('fees')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ status: 'success', message: 'Fee structure deleted successfully' });
  } catch (error) {
    console.error('Error deleting fee structure:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete fee structure' });
  }
});

// Get all fee payments with filters
router.get('/payments', async (req, res) => {
  try {
    const { 
      student_id, 
      fee_id, 
      payment_date, 
      start_date, 
      end_date,
      payment_mode,
      receipt_number,
      page = 1,
      limit = 20
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    let query = supabase
      .from('fee_payments')
      .select('*, students(*), fees(*)', { count: 'exact' });

    // Apply filters
    if (student_id) {
      query = query.eq('student_id', student_id);
    }
    
    if (fee_id) {
      query = query.eq('fee_id', fee_id);
    }
    
    if (payment_date) {
      query = query.eq('payment_date', payment_date);
    }
    
    if (start_date && end_date) {
      query = query.gte('payment_date', start_date).lte('payment_date', end_date);
    }
    
    if (payment_mode) {
      query = query.eq('payment_mode', payment_mode);
    }
    
    if (receipt_number) {
      query = query.ilike('receipt_number', `%${receipt_number}%`);
    }
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    
    // Order by payment date descending
    query = query.order('payment_date', { ascending: false });
    
    const { data, error, count } = await query;

    if (error) throw error;

    res.json({
      status: 'success',
      data,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching fee payments:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch fee payments' });
  }
});

// Get single payment by ID
router.get('/payments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('fee_payments')
      .select('*, students(*), fees(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ status: 'error', message: 'Payment not found' });
    }

    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch payment' });
  }
});

// Record new payment
router.post('/payments', async (req, res) => {
  try {
    const { 
      student_id, 
      fee_id, 
      amount_paid, 
      payment_date, 
      payment_mode, 
      receipt_number, 
      remarks 
    } = req.body;
    
    // Validate required fields
    if (!student_id || !fee_id || !amount_paid || !payment_date || !payment_mode || !receipt_number) {
      return res.status(400).json({
        status: 'error',
        message: 'Student ID, fee ID, amount paid, payment date, payment mode, and receipt number are required'
      });
    }
    
    // Check if student exists
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id, course_id')
      .eq('id', student_id)
      .single();

    if (studentError || !student) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Invalid student ID' 
      });
    }
    
    // Check if fee structure exists and is active
    const { data: fee, error: feeError } = await supabase
      .from('fees')
      .select('id, amount, course_id, is_active')
      .eq('id', fee_id)
      .single();

    if (feeError || !fee) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Invalid fee structure ID' 
      });
    }
    
    if (!fee.is_active) {
      return res.status(400).json({
        status: 'error',
        message: 'This fee structure is not active'
      });
    }
    
    // Check if fee structure belongs to student's course
    if (fee.course_id !== student.course_id) {
      return res.status(400).json({
        status: 'error',
        message: 'Fee structure does not belong to student\'s course'
      });
    }
    
    // Check if receipt number already exists
    const { data: existingReceipt, error: receiptError } = await supabase
      .from('fee_payments')
      .select('id')
      .eq('receipt_number', receipt_number)
      .maybeSingle();

    if (receiptError) throw receiptError;
    
    if (existingReceipt) {
      return res.status(400).json({
        status: 'error',
        message: 'Receipt number already exists'
      });
    }
    
    // Calculate total paid amount for this fee structure by this student
    const { data: previousPayments, error: paymentsError } = await supabase
      .from('fee_payments')
      .select('amount_paid')
      .eq('student_id', student_id)
      .eq('fee_id', fee_id);

    if (paymentsError) throw paymentsError;
    
    const totalPaid = previousPayments.reduce(
      (sum, payment) => sum + parseFloat(payment.amount_paid), 
      0
    );
    
    const remainingAmount = fee.amount - totalPaid;
    
    // Validate payment amount
    if (amount_paid > remainingAmount) {
      return res.status(400).json({
        status: 'error',
        message: `Amount paid (${amount_paid}) exceeds remaining amount (${remainingAmount})`
      });
    }
    
    // Record payment
    const { data, error } = await supabase
      .from('fee_payments')
      .insert([{
        student_id,
        fee_id,
        amount_paid,
        payment_date,
        payment_mode,
        receipt_number,
        remarks: remarks || null
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ status: 'success', data });
  } catch (error) {
    console.error('Error recording payment:', error);
    res.status(500).json({ status: 'error', message: 'Failed to record payment' });
  }
});

// Update payment
router.put('/payments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Check if payment exists and get current data
    const { data: payment, error: paymentError } = await supabase
      .from('fee_payments')
      .select('*')
      .eq('id', id)
      .single();

    if (paymentError || !payment) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Payment not found' 
      });
    }
    
    // If receipt number is being updated, check for duplicates
    if (updates.receipt_number && updates.receipt_number !== payment.receipt_number) {
      const { data: existingReceipt, error: receiptError } = await supabase
        .from('fee_payments')
        .select('id')
        .eq('receipt_number', updates.receipt_number)
        .maybeSingle();

      if (receiptError) throw receiptError;
      
      if (existingReceipt) {
        return res.status(400).json({
          status: 'error',
          message: 'Receipt number already exists'
        });
      }
    }
    
    // If amount is being updated, validate against fee structure
    if (updates.amount_paid !== undefined) {
      // Get all payments for this fee structure and student (excluding current payment)
      const { data: otherPayments, error: paymentsError } = await supabase
        .from('fee_payments')
        .select('amount_paid')
        .eq('student_id', payment.student_id)
        .eq('fee_id', payment.fee_id)
        .neq('id', id);

      if (paymentsError) throw paymentsError;
      
      // Get fee structure amount
      const { data: fee, error: feeError } = await supabase
        .from('fees')
        .select('amount')
        .eq('id', payment.fee_id)
        .single();

      if (feeError) throw feeError;
      
      // Calculate total paid from other payments
      const totalOtherPayments = otherPayments.reduce(
        (sum, p) => sum + parseFloat(p.amount_paid), 
        0
      );
      
      // Check if new amount exceeds remaining
      const remainingAmount = fee.amount - totalOtherPayments;
      
      if (updates.amount_paid > remainingAmount) {
        return res.status(400).json({
          status: 'error',
          message: `Amount paid (${updates.amount_paid}) exceeds remaining amount (${remainingAmount})`
        });
      }
    }
    
    // Update payment
    const { data, error } = await supabase
      .from('fee_payments')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update payment' });
  }
});

// Delete payment
router.delete('/payments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if payment exists
    const { data: payment, error: paymentError } = await supabase
      .from('fee_payments')
      .select('id')
      .eq('id', id)
      .single();

    if (paymentError || !payment) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Payment not found' 
      });
    }
    
    const { error } = await supabase
      .from('fee_payments')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ status: 'success', message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete payment' });
  }
});

// Get fee summary for a student
router.get('/summary/student/:student_id', async (req, res) => {
  try {
    const { student_id } = req.params;
    
    // Check if student exists
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id, course_id')
      .eq('id', student_id)
      .single();

    if (studentError || !student) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Student not found' 
      });
    }
    
    // Get all fee structures for student's course
    const { data: fees, error: feesError } = await supabase
      .from('fees')
      .select('*')
      .eq('course_id', student.course_id)
      .eq('is_active', true);

    if (feesError) throw feesError;
    
    // Get all payments for student
    const { data: payments, error: paymentsError } = await supabase
      .from('fee_payments')
      .select('*')
      .eq('student_id', student_id);

    if (paymentsError) throw paymentsError;
    
    // Calculate summary for each fee structure
    const feeSummary = fees.map(fee => {
      const feePayments = payments.filter(p => p.fee_id === fee.id);
      const totalPaid = feePayments.reduce((sum, p) => sum + parseFloat(p.amount_paid), 0);
      const remaining = fee.amount - totalPaid;
      
      return {
        ...fee,
        total_paid: totalPaid,
        remaining_amount: remaining > 0 ? remaining : 0,
        is_paid: remaining <= 0,
        payment_count: feePayments.length,
        last_payment: feePayments.length > 0 
          ? feePayments.sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date))[0]
          : null
      };
    });
    
    // Calculate overall summary
    const totalFees = fees.reduce((sum, fee) => sum + parseFloat(fee.amount), 0);
    const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount_paid), 0);
    const totalRemaining = totalFees - totalPaid;
    
    const overallSummary = {
      total_fees: totalFees,
      total_paid: totalPaid,
      total_remaining: totalRemaining > 0 ? totalRemaining : 0,
      payment_count: payments.length,
      fee_structures_count: fees.length,
      paid_structures: feeSummary.filter(f => f.is_paid).length,
      pending_structures: feeSummary.filter(f => !f.is_paid).length
    };
    
    res.json({
      status: 'success',
      data: {
        student: {
          id: student.id
        },
        overall: overallSummary,
        fee_structures: feeSummary
      }
    });
  } catch (error) {
    console.error('Error fetching fee summary:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to fetch fee summary' 
    });
  }
});

// Get payment summary for a fee structure
router.get('/summary/fee/:fee_id', async (req, res) => {
  try {
    const { fee_id } = req.params;
    
    // Check if fee structure exists
    const { data: fee, error: feeError } = await supabase
      .from('fees')
      .select('*')
      .eq('id', fee_id)
      .single();

    if (feeError || !fee) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Fee structure not found' 
      });
    }
    
    // Get all students in the course
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('*')
      .eq('course_id', fee.course_id);

    if (studentsError) throw studentsError;
    
    // Get all payments for this fee structure
    const { data: payments, error: paymentsError } = await supabase
      .from('fee_payments')
      .select('*')
      .eq('fee_id', fee_id);

    if (paymentsError) throw paymentsError;
    
    // Calculate summary for each student
    const studentSummary = students.map(student => {
      const studentPayments = payments.filter(p => p.student_id === student.id);
      const totalPaid = studentPayments.reduce((sum, p) => sum + parseFloat(p.amount_paid), 0);
      const remaining = fee.amount - totalPaid;
      
      return {
        student,
        total_paid: totalPaid,
        remaining_amount: remaining > 0 ? remaining : 0,
        is_paid: remaining <= 0,
        payment_count: studentPayments.length,
        last_payment: studentPayments.length > 0 
          ? studentPayments.sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date))[0]
          : null
      };
    });
    
    // Calculate overall summary
    const totalStudents = students.length;
    const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount_paid), 0);
    const totalExpected = fee.amount * totalStudents;
    const totalRemaining = totalExpected - totalPaid;
    
    const paidStudents = studentSummary.filter(s => s.is_paid).length;
    const pendingStudents = studentSummary.filter(s => !s.is_paid).length;
    
    const overallSummary = {
      total_students: totalStudents,
      total_expected: totalExpected,
      total_paid: totalPaid,
      total_remaining: totalRemaining > 0 ? totalRemaining : 0,
      collection_percentage: Math.round((totalPaid / totalExpected) * 100) || 0,
      paid_students: paidStudents,
      pending_students: pendingStudents,
      payment_count: payments.length,
      average_payment: payments.length > 0 ? totalPaid / payments.length : 0
    };
    
    res.json({
      status: 'success',
      data: {
        fee_structure: fee,
        overall: overallSummary,
        students: studentSummary
      }
    });
  } catch (error) {
    console.error('Error fetching fee structure summary:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to fetch fee structure summary' 
    });
  }
});

// Generate receipt for a payment
router.get('/receipt/:payment_id', async (req, res) => {
  try {
    const { payment_id } = req.params;
    
    // Get payment details with student and fee information
    const { data: payment, error: paymentError } = await supabase
      .from('fee_payments')
      .select('*, students(*), fees(*)')
      .eq('id', payment_id)
      .single();

    if (paymentError || !payment) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Payment not found' 
      });
    }
    
    // Get college information (you would typically have a settings or college table)
    const collegeInfo = {
      name: 'College Name',
      address: 'College Address',
      city: 'City',
      state: 'State',
      pincode: '123456',
      phone: '+1234567890',
      email: 'info@college.edu',
      logo_url: 'https://example.com/college-logo.png'
    };
    
    // Format receipt data
    const receipt = {
      receipt_number: payment.receipt_number,
      date: new Date().toLocaleDateString(),
      payment_date: new Date(payment.payment_date).toLocaleDateString(),
      student: {
        id: payment.students.id,
        name: `${payment.students.first_name} ${payment.students.last_name || ''}`.trim(),
        course: payment.students.course_id, // You might want to join with courses table for name
        semester: payment.students.current_semester,
        register_number: payment.students.register_number
      },
      fee: {
        id: payment.fees.id,
        name: payment.fees.name,
        description: payment.fees.description,
        amount: payment.fees.amount
      },
      payment: {
        amount: payment.amount_paid,
        mode: payment.payment_mode,
        transaction_id: payment.transaction_id || 'N/A',
        remarks: payment.remarks || 'N/A'
      },
      college: collegeInfo
    };
    
    // In a real application, you would generate a PDF here
    // For now, we'll return the receipt data
    res.json({
      status: 'success',
      data: receipt
    });
  } catch (error) {
    console.error('Error generating receipt:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to generate receipt' 
    });
  }
});

module.exports = router;
