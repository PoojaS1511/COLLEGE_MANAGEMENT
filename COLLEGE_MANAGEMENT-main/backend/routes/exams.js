const express = require('express');
const router = express.Router();
const { supabase } = require('../supabase_client');

// Get all exams with optional filters
router.get('/', async (req, res) => {
  try {
    const { 
      course_id, 
      subject_id, 
      exam_date, 
      start_date, 
      end_date,
      search = ''
    } = req.query;
    
    let query = supabase
      .from('exams')
      .select('*, courses(*), subjects(*)', { count: 'exact' });

    // Apply search
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply filters
    if (course_id) {
      query = query.eq('course_id', course_id);
    }
    
    if (subject_id) {
      query = query.eq('subject_id', subject_id);
    }
    
    if (exam_date) {
      query = query.eq('exam_date', exam_date);
    }
    
    if (start_date && end_date) {
      query = query.gte('exam_date', start_date).lte('exam_date', end_date);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    res.json({ status: 'success', data, count });
  } catch (error) {
    console.error('Error fetching exams:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch exams' });
  }
});

// Get single exam by ID with results
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get exam details
    const { data: exam, error: examError } = await supabase
      .from('exams')
      .select('*, courses(*), subjects(*)')
      .eq('id', id)
      .single();

    if (examError) throw examError;
    if (!exam) {
      return res.status(404).json({ status: 'error', message: 'Exam not found' });
    }

    // Get exam results
    const { data: results, error: resultsError } = await supabase
      .from('exam_results')
      .select('*, students(*)')
      .eq('exam_id', id);

    if (resultsError) throw resultsError;

    res.json({
      status: 'success',
      data: {
        ...exam,
        results: results || []
      }
    });
  } catch (error) {
    console.error('Error fetching exam:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch exam' });
  }
});

// Create new exam
router.post('/', async (req, res) => {
  try {
    const examData = req.body;
    
    // Validate required fields
    if (!examData.name || !examData.exam_date || !examData.course_id || !examData.subject_id) {
      return res.status(400).json({
        status: 'error',
        message: 'Name, exam date, course ID, and subject ID are required'
      });
    }
    
    // Check if course exists
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id')
      .eq('id', examData.course_id)
      .single();

    if (courseError || !course) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Invalid course ID' 
      });
    }
    
    // Check if subject exists and belongs to the course
    const { data: subject, error: subjectError } = await supabase
      .from('subjects')
      .select('id, course_id')
      .eq('id', examData.subject_id)
      .single();

    if (subjectError || !subject) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Invalid subject ID' 
      });
    }
    
    if (subject.course_id !== examData.course_id) {
      return res.status(400).json({
        status: 'error',
        message: 'Subject does not belong to the selected course'
      });
    }
    
    const { data, error } = await supabase
      .from('exams')
      .insert([examData])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ status: 'success', data });
  } catch (error) {
    console.error('Error creating exam:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create exam' });
  }
});

// Update exam
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // If subject_id is being updated, validate it
    if (updates.subject_id) {
      // Get current exam to check course_id
      const { data: currentExam, error: currentError } = await supabase
        .from('exams')
        .select('course_id')
        .eq('id', id)
        .single();

      if (currentError) throw currentError;
      
      if (currentExam) {
        // Check if subject exists and belongs to the course
        const { data: subject, error: subjectError } = await supabase
          .from('subjects')
          .select('id, course_id')
          .eq('id', updates.subject_id)
          .single();

        if (subjectError || !subject) {
          return res.status(400).json({ 
            status: 'error', 
            message: 'Invalid subject ID' 
          });
        }
        
        if (subject.course_id !== currentExam.course_id) {
          return res.status(400).json({
            status: 'error',
            message: 'Subject does not belong to the exam\'s course'
          });
        }
      }
    }
    
    const { data, error } = await supabase
      .from('exams')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ status: 'error', message: 'Exam not found' });
    }

    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error updating exam:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update exam' });
  }
});

// Delete exam
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if there are any results for this exam
    const { data: results, error: resultsError } = await supabase
      .from('exam_results')
      .select('id')
      .eq('exam_id', id)
      .limit(1);

    if (resultsError) throw resultsError;
    
    if (results?.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete exam with existing results'
      });
    }
    
    const { error } = await supabase
      .from('exams')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ status: 'success', message: 'Exam deleted successfully' });
  } catch (error) {
    console.error('Error deleting exam:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete exam' });
  }
});

// Add/Update exam result
router.post('/:id/results', async (req, res) => {
  try {
    const { id: exam_id } = req.params;
    const { student_id, marks_obtained, remarks } = req.body;
    
    if (!student_id || marks_obtained === undefined) {
      return res.status(400).json({
        status: 'error',
        message: 'Student ID and marks obtained are required'
      });
    }
    
    // Check if exam exists
    const { data: exam, error: examError } = await supabase
      .from('exams')
      .select('max_marks, passing_marks')
      .eq('id', exam_id)
      .single();

    if (examError || !exam) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Exam not found' 
      });
    }
    
    // Check if student exists and is enrolled in the course
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
    
    // Check if marks are valid
    if (marks_obtained < 0 || marks_obtained > exam.max_marks) {
      return res.status(400).json({
        status: 'error',
        message: `Marks must be between 0 and ${exam.max_marks}`
      });
    }
    
    // Calculate grade
    const percentage = (marks_obtained / exam.max_marks) * 100;
    let grade = 'F';
    
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B';
    else if (percentage >= 60) grade = 'C';
    else if (percentage >= 50) grade = 'D';
    else if (percentage >= exam.passing_marks) grade = 'E';
    
    // Check if result already exists
    const { data: existingResult, error: existingError } = await supabase
      .from('exam_results')
      .select('id')
      .eq('exam_id', exam_id)
      .eq('student_id', student_id)
      .maybeSingle();
    
    let result;
    
    if (existingResult) {
      // Update existing result
      const { data, error } = await supabase
        .from('exam_results')
        .update({
          marks_obtained,
          grade,
          remarks: remarks || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingResult.id)
        .select()
        .single();
        
      if (error) throw error;
      result = data;
    } else {
      // Create new result
      const { data, error } = await supabase
        .from('exam_results')
        .insert([{
          exam_id,
          student_id,
          marks_obtained,
          grade,
          remarks: remarks || null
        }])
        .select()
        .single();
        
      if (error) throw error;
      result = data;
    }

    res.json({ status: 'success', data: result });
  } catch (error) {
    console.error('Error saving exam result:', error);
    res.status(500).json({ status: 'error', message: 'Failed to save exam result' });
  }
});

// Get exam results
router.get('/:id/results', async (req, res) => {
  try {
    const { id: exam_id } = req.params;
    
    // Get exam details
    const { data: exam, error: examError } = await supabase
      .from('exams')
      .select('*')
      .eq('id', exam_id)
      .single();

    if (examError || !exam) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Exam not found' 
      });
    }
    
    // Get results with student details
    const { data: results, error: resultsError } = await supabase
      .from('exam_results')
      .select('*, students(*)')
      .eq('exam_id', exam_id);

    if (resultsError) throw resultsError;

    res.json({
      status: 'success',
      data: {
        exam,
        results: results || []
      }
    });
  } catch (error) {
    console.error('Error fetching exam results:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch exam results' });
  }
});

module.exports = router;
