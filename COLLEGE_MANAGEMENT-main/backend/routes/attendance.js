const express = require('express');
const router = express.Router();
const { supabase } = require('../supabase_client');

// Get all attendance records with filters
router.get('/', async (req, res) => {
  try {
    const { 
      student_id, 
      subject_id, 
      date, 
      status, 
      start_date, 
      end_date,
      page = 1,
      limit = 20
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    let query = supabase
      .from('attendance')
      .select('*, students(*), subjects(*)', { count: 'exact' });

    // Apply filters
    if (student_id) {
      query = query.eq('student_id', student_id);
    }
    
    if (subject_id) {
      query = query.eq('subject_id', subject_id);
    }
    
    if (date) {
      query = query.eq('date', date);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (start_date && end_date) {
      query = query.gte('date', start_date).lte('date', end_date);
    }
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    
    // Order by date descending
    query = query.order('date', { ascending: false });
    
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
    console.error('Error fetching attendance records:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch attendance records' });
  }
});

// Get single attendance record by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('attendance')
      .select('*, students(*), subjects(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ status: 'error', message: 'Attendance record not found' });
    }

    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error fetching attendance record:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch attendance record' });
  }
});

// Create new attendance record
router.post('/', async (req, res) => {
  try {
    const { student_id, subject_id, date, status, remarks } = req.body;
    
    // Validate required fields
    if (!student_id || !subject_id || !date || !status) {
      return res.status(400).json({
        status: 'error',
        message: 'Student ID, subject ID, date, and status are required'
      });
    }
    
    // Validate status
    if (!['present', 'absent', 'late', 'excused'].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status. Must be one of: present, absent, late, excused'
      });
    }
    
    // Check if student exists
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id')
      .eq('id', student_id)
      .single();

    if (studentError || !student) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Invalid student ID' 
      });
    }
    
    // Check if subject exists
    const { data: subject, error: subjectError } = await supabase
      .from('subjects')
      .select('id')
      .eq('id', subject_id)
      .single();

    if (subjectError || !subject) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Invalid subject ID' 
      });
    }
    
    // Check if attendance record already exists for this student, subject, and date
    const { data: existingRecord, error: existingError } = await supabase
      .from('attendance')
      .select('id')
      .eq('student_id', student_id)
      .eq('subject_id', subject_id)
      .eq('date', date)
      .maybeSingle();

    if (existingError) throw existingError;
    
    if (existingRecord) {
      return res.status(400).json({
        status: 'error',
        message: 'Attendance record already exists for this student, subject, and date'
      });
    }
    
    // Create new attendance record
    const { data, error } = await supabase
      .from('attendance')
      .insert([{
        student_id,
        subject_id,
        date,
        status,
        remarks: remarks || null
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ status: 'success', data });
  } catch (error) {
    console.error('Error creating attendance record:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create attendance record' });
  }
});

// Update attendance record
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;
    
    // Validate status if provided
    if (status && !['present', 'absent', 'late', 'excused'].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status. Must be one of: present, absent, late, excused'
      });
    }
    
    // Build update object
    const updates = {};
    if (status) updates.status = status;
    if (remarks !== undefined) updates.remarks = remarks;
    
    // Add updated_at timestamp
    updates.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('attendance')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ status: 'error', message: 'Attendance record not found' });
    }

    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error updating attendance record:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update attendance record' });
  }
});

// Delete attendance record
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('attendance')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ status: 'success', message: 'Attendance record deleted successfully' });
  } catch (error) {
    console.error('Error deleting attendance record:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete attendance record' });
  }
});

// Bulk upload attendance
router.post('/bulk', async (req, res) => {
  try {
    const { records } = req.body;
    
    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No attendance records provided'
      });
    }
    
    // Validate each record
    const validStatuses = ['present', 'absent', 'late', 'excused'];
    
    for (const record of records) {
      if (!record.student_id || !record.subject_id || !record.date || !record.status) {
        return res.status(400).json({
          status: 'error',
          message: 'Each record must have student_id, subject_id, date, and status'
        });
      }
      
      if (!validStatuses.includes(record.status)) {
        return res.status(400).json({
          status: 'error',
          message: `Invalid status '${record.status}'. Must be one of: ${validStatuses.join(', ')}`
        });
      }
      
      // Check if student exists
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('id')
        .eq('id', record.student_id)
        .single();

      if (studentError || !student) {
        return res.status(400).json({ 
          status: 'error', 
          message: `Invalid student ID: ${record.student_id}`
        });
      }
      
      // Check if subject exists
      const { data: subject, error: subjectError } = await supabase
        .from('subjects')
        .select('id')
        .eq('id', record.subject_id)
        .single();

      if (subjectError || !subject) {
        return res.status(400).json({ 
          status: 'error', 
          message: `Invalid subject ID: ${record.subject_id}`
        });
      }
    }
    
    // Check for existing records to avoid duplicates
    const existingRecords = [];
    
    for (const record of records) {
      const { data, error } = await supabase
        .from('attendance')
        .select('id')
        .eq('student_id', record.student_id)
        .eq('subject_id', record.subject_id)
        .eq('date', record.date)
        .maybeSingle();
        
      if (error) throw error;
      
      if (data) {
        existingRecords.push({
          student_id: record.student_id,
          subject_id: record.subject_id,
          date: record.date
        });
      }
    }
    
    if (existingRecords.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Some attendance records already exist',
        existing_records: existingRecords
      });
    }
    
    // Prepare records for insertion
    const recordsToInsert = records.map(record => ({
      student_id: record.student_id,
      subject_id: record.subject_id,
      date: record.date,
      status: record.status,
      remarks: record.remarks || null
    }));
    
    // Insert records in batches of 100 (Supabase limit)
    const BATCH_SIZE = 100;
    const results = [];
    
    for (let i = 0; i < recordsToInsert.length; i += BATCH_SIZE) {
      const batch = recordsToInsert.slice(i, i + BATCH_SIZE);
      const { data, error } = await supabase
        .from('attendance')
        .insert(batch)
        .select();
        
      if (error) throw error;
      
      results.push(...data);
    }
    
    res.status(201).json({
      status: 'success',
      data: results,
      count: results.length
    });
  } catch (error) {
    console.error('Error in bulk attendance upload:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to process bulk attendance upload',
      error: error.message
    });
  }
});

// Get attendance summary for a student
router.get('/summary/student/:student_id', async (req, res) => {
  try {
    const { student_id } = req.params;
    const { subject_id, start_date, end_date } = req.query;
    
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
    
    // Build query
    let query = supabase
      .from('attendance')
      .select('*, subjects(*, courses(*))')
      .eq('student_id', student_id);
    
    // Apply filters
    if (subject_id) {
      query = query.eq('subject_id', subject_id);
    }
    
    if (start_date && end_date) {
      query = query.gte('date', start_date).lte('date', end_date);
    }
    
    const { data: attendance, error } = await query;
    
    if (error) throw error;
    
    // Calculate summary
    const summary = {};
    
    attendance.forEach(record => {
      const subjectId = record.subject_id;
      
      if (!summary[subjectId]) {
        summary[subjectId] = {
          subject: record.subjects,
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
          percentage: 0
        };
      }
      
      summary[subjectId].total++;
      
      switch (record.status) {
        case 'present':
          summary[subjectId].present++;
          break;
        case 'absent':
          summary[subjectId].absent++;
          break;
        case 'late':
          summary[subjectId].late++;
          break;
        case 'excused':
          summary[subjectId].excused++;
          break;
      }
      
      // Calculate percentage (excluding excused absences)
      const totalCounted = summary[subjectId].total - summary[subjectId].excused;
      const presentCount = summary[subjectId].present + summary[subjectId].late;
      
      summary[subjectId].percentage = totalCounted > 0 
        ? Math.round((presentCount / totalCounted) * 100) 
        : 0;
    });
    
    // Convert to array
    const result = Object.values(summary);
    
    res.json({
      status: 'success',
      data: result,
      student: {
        id: student.id,
        name: student.first_name ? `${student.first_name} ${student.last_name || ''}`.trim() : null
      }
    });
  } catch (error) {
    console.error('Error fetching attendance summary:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to fetch attendance summary' 
    });
  }
});

// Get attendance summary for a subject
router.get('/summary/subject/:subject_id', async (req, res) => {
  try {
    const { subject_id } = req.params;
    const { date, start_date, end_date } = req.query;
    
    // Check if subject exists
    const { data: subject, error: subjectError } = await supabase
      .from('subjects')
      .select('id, name, code, courses(*)')
      .eq('id', subject_id)
      .single();

    if (subjectError || !subject) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Subject not found' 
      });
    }
    
    // Build query
    let query = supabase
      .from('attendance')
      .select('*, students(*)')
      .eq('subject_id', subject_id);
    
    // Apply date filters
    if (date) {
      query = query.eq('date', date);
    } else if (start_date && end_date) {
      query = query.gte('date', start_date).lte('date', end_date);
    }
    
    const { data: attendance, error } = await query;
    
    if (error) throw error;
    
    // Group by student
    const studentSummary = {};
    
    attendance.forEach(record => {
      const studentId = record.student_id;
      
      if (!studentSummary[studentId]) {
        studentSummary[studentId] = {
          student: record.students,
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
          percentage: 0
        };
      }
      
      studentSummary[studentId].total++;
      
      switch (record.status) {
        case 'present':
          studentSummary[studentId].present++;
          break;
        case 'absent':
          studentSummary[studentId].absent++;
          break;
        case 'late':
          studentSummary[studentId].late++;
          break;
        case 'excused':
          studentSummary[studentId].excused++;
          break;
      }
      
      // Calculate percentage (excluding excused absences)
      const student = studentSummary[studentId];
      const totalCounted = student.total - student.excused;
      const presentCount = student.present + student.late;
      
      student.percentage = totalCounted > 0 
        ? Math.round((presentCount / totalCounted) * 100) 
        : 0;
    });
    
    // Calculate overall summary
    const overall = {
      total_students: Object.keys(studentSummary).length,
      total_records: attendance.length,
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      average_percentage: 0
    };
    
    let totalPercentage = 0;
    let studentCount = 0;
    
    Object.values(studentSummary).forEach(student => {
      overall.present += student.present;
      overall.absent += student.absent;
      overall.late += student.late;
      overall.excused += student.excused;
      
      if (student.total > student.excused) {
        totalPercentage += student.percentage;
        studentCount++;
      }
    });
    
    overall.average_percentage = studentCount > 0 
      ? Math.round(totalPercentage / studentCount) 
      : 0;
    
    // Convert to array
    const result = {
      subject,
      overall,
      students: Object.values(studentSummary)
    };
    
    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    console.error('Error fetching subject attendance summary:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to fetch subject attendance summary' 
    });
  }
});

module.exports = router;
