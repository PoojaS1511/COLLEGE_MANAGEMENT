const express = require('express');
const router = express.Router();
const { supabase } = require('../supabase_client');

// Get all subjects with optional filters and pagination
router.get('/', async (req, res) => {
  console.log('\n=== New Request ===');
  console.log('Request URL:', req.originalUrl);
  console.log('Request Method:', req.method);
  console.log('Request Query:', req.query);
  
  try {
    const { 
      course_id, 
      search = '', 
      limit = 1000, 
      page = 1,
      semester
    } = req.query;
    
    // Validate course_id is provided
    if (!course_id) {
      const error = new Error('course_id is required');
      error.status = 400;
      throw error;
    }

    // Convert course_id to integer
    const courseIdInt = parseInt(course_id, 10);
    if (isNaN(courseIdInt)) {
      const error = new Error(`Invalid course_id: ${course_id}. Must be a number.`);
      error.status = 400;
      throw error;
    }

    // Convert page and limit to numbers
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = limit === 'all' ? null : Math.min(parseInt(limit, 10) || 1000, 1000);
    const offset = limitNum ? (pageNum - 1) * limitNum : 0;

    console.log('Fetching subjects for course_id:', courseIdInt, 'with pagination:', { page: pageNum, limit: limitNum });
    
    // Verify Supabase client is initialized
    if (!supabase) {
      const error = new Error('Supabase client not initialized');
      error.status = 500;
      throw error;
    }

    // Base query for counting
    let countQuery = supabase
      .from('subjects')
      .select('*', { count: 'exact', head: true })
       WHERE course_id', courseIdInt);

    // Base query for data
    let dataQuery = supabase
      .from('subjects')
      .select('*')
       WHERE course_id', courseIdInt);

    // Apply search filter if provided
    if (search) {
      const searchTerm = `%${search}%`;
      // Using or with the correct syntax for Supabase JS
      countQuery = countQuery.or(`name ILIKE ${searchTerm},code ILIKE ${searchTerm}`);
      dataQuery = dataQuery.or(`name ILIKE ${searchTerm},code ILIKE ${searchTerm}`);
    }

    // Apply semester filter if provided
    if (semester) {
      const semesterNum = parseInt(semester, 10);
      if (!isNaN(semesterNum)) {
        countQuery = countQuery WHERE semester', semesterNum);
        dataQuery = dataQuery WHERE semester', semesterNum);
      }
    }

    // Get total count
    const { count, error: countError } = await countQuery;
    if (countError) throw countError;

    // Apply ordering and pagination to data query
    dataQuery = dataQuery
       ORDER BY 'semester', { ascending: true })
       ORDER BY 'name', { ascending: true });

    if (limitNum !== null) {
      dataQuery = dataQuery.range(offset, offset + limitNum - 1);
    }

    // Execute data query
    const { data: subjects, error: subjectsError } = await dataQuery;

    if (subjectsError) {
      console.error('Error fetching subjects:', subjectsError);
      throw new Error(`Failed to fetch subjects: ${subjectsError.message}`);
    }

    console.log(`Found ${count || 0} total subjects, returning ${subjects?.length || 0} subjects`);

    // Get course details
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
       WHERE id', courseIdInt)
      .single();

    if (courseError) {
      console.error('Error fetching course details:', courseError);
      // Continue without course details if there's an error
    }

    // Format the response with course details and pagination info
    const responseData = {
      status: 'success',
      data: subjects?.map(subject => ({
        ...subject,
        course: course || null
      })) || [],
      pagination: {
        total: count || 0,
        page: pageNum,
        limit: limitNum || count || 0,
        totalPages: limitNum ? Math.ceil((count || 0) / limitNum) : 1
      }
    };
    
    return res.json(responseData);
      
  } catch (error) {
    console.error('Error in subjects route:', {
      message: error.message,
      code: error.code,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    
    const statusCode = error.status || 500;
    res.status(statusCode).json({
      status: 'error',
      message: error.message || 'An error occurred while fetching subjects',
      ...(process.env.NODE_ENV === 'development' && { 
        error: {
          name: error.name,
          code: error.code,
          details: error.details,
          stack: error.stack
        }
      })
    });
  }
});

// Get single subject by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the subject by ID
    const { data: subject, error } = await supabase
      .from('subjects')
      .select('*')
       WHERE id', id)
      .single();

    if (error) throw error;

    // Get the course for this subject
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
       WHERE id', subject.course_id)
      .single();

    if (courseError) throw courseError;

    // Format the response
    const data = {
      ...subject,
      course: course || null
    };

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ status: 'error', message: 'Subject not found' });
    }

    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error fetching subject:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch subject' });
  }
});

// Create new subject
router.post('/', async (req, res) => {
  try {
    const subjectData = req.body;
    
    // Check if course exists
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id')
       WHERE id', subjectData.course_id)
      .single();

    if (courseError || !course) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Invalid course ID' 
      });
    }
    
    // Check if subject with same code already exists in the course
    const { data: existingSubject, error: existingError } = await supabase
      .from('subjects')
      .select('id')
       WHERE code', subjectData.code)
       WHERE course_id', subjectData.course_id)
      .maybeSingle();

    if (existingError) throw existingError;
    if (existingSubject) {
      return res.status(400).json({
        status: 'error',
        message: 'Subject with this code already exists in the course'
      });
    }
    
    const { data, error } = await supabase
      .from('subjects')
      .insert([subjectData])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ status: 'success', data });
  } catch (error) {
    console.error('Error creating subject:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create subject' });
  }
});

// Update subject
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // If code is being updated, check for duplicates
    if (updates.code) {
      const { data: existingSubject, error: existingError } = await supabase
        .from('subjects')
        .select('id, course_id')
         WHERE code', updates.code)
         WHERE NOT id', id)
        .maybeSingle();

      if (existingError) throw existingError;
      
      if (existingSubject) {
        // If course_id is being updated, check against the new course_id
        const checkCourseId = updates.course_id || existingSubject.course_id;
        
        if (existingSubject.course_id === checkCourseId) {
          return res.status(400).json({
            status: 'error',
            message: 'Subject with this code already exists in the course'
          });
        }
      }
    }
    
    const { data, error } = await supabase
      .from('subjects')
      .update(updates)
       WHERE id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ status: 'error', message: 'Subject not found' });
    }

    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error updating subject:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update subject' });
  }
});

// Delete subject
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if there are any attendance or exam records for this subject
    const { data: attendance } = await supabase
      .from('attendance')
      .select('id')
       WHERE subject_id', id)
       LIMIT 1);

    const { data: examResults } = await supabase
      .from('exam_results')
      .select('id')
       WHERE subject_id', id)
       LIMIT 1);

    if (attendance?.length > 0 || examResults?.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete subject with associated attendance or exam records'
      });
    }
    
    const { error } = await supabase
      .from('subjects')
      .delete()
       WHERE id', id);

    if (error) throw error;

    res.json({ status: 'success', message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('Error deleting subject:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete subject' });
  }
});

// Get attendance for a subject
router.get('/:id/attendance', async (req, res) => {
  try {
    const { id } = req.params;
    const { date, student_id } = req.query;
    
    let query = supabase
      .from('attendance')
      .select('*, students(*)')
       WHERE subject_id', id);

    if (date) {
      query = query WHERE date', date);
    }
    
    if (student_id) {
      query = query WHERE student_id', student_id);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error fetching subject attendance:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch subject attendance' });
  }
});

// Get exams for a subject
router.get('/:id/exams', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('exams')
      .select('*')
       WHERE subject_id', id);

    if (error) throw error;

    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error fetching subject exams:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch subject exams' });
  }
});

module.exports = router;
