const express = require('express');
const router = express.Router();
const { supabase } = require('../supabase_client');

// ✅ Get all courses (no pagination)
router.get('/', async (req, res) => {
  try {
    const { department_id, search = '' } = req.query;

    let query = supabase
      .from('courses')
      .select('*, departments(*)')
      .order('name', { ascending: true });

    // 🔍 Apply optional search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%`);
    }

    // 🏫 Apply optional department filter
    if (department_id) {
      query = query.eq('department_id', department_id);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({
      status: 'success',
      data,
      total: data?.length || 0
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch courses' });
  }
});

// ✅ Get single course by ID (with department, subjects, students)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*, departments(*)')
      .eq('id', id)
      .single();

    if (courseError) throw courseError;
    if (!course) {
      return res.status(404).json({ status: 'error', message: 'Course not found' });
    }

    const { data: subjects, error: subjectsError } = await supabase
      .from('subjects')
      .select('*')
      .eq('course_id', id);

    if (subjectsError) throw subjectsError;

    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('*')
      .eq('course_id', id);

    if (studentsError) throw studentsError;

    res.json({
      status: 'success',
      data: {
        ...course,
        subjects: subjects || [],
        student_count: students?.length || 0
      }
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch course' });
  }
});

// ✅ Create new course
router.post('/', async (req, res) => {
  try {
    const courseData = req.body;
    const { data, error } = await supabase
      .from('courses')
      .insert([courseData])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ status: 'success', data });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create course' });
  }
});

// ✅ Update course
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('courses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ status: 'error', message: 'Course not found' });
    }

    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update course' });
  }
});

// ✅ Delete course (only if no students or subjects linked)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: students } = await supabase
      .from('students')
      .select('id')
      .eq('course_id', id)
      .limit(1);

    const { data: subjects } = await supabase
      .from('subjects')
      .select('id')
      .eq('course_id', id)
      .limit(1);

    if (students?.length > 0 || subjects?.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete course with associated students or subjects'
      });
    }

    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ status: 'success', message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete course' });
  }
});

module.exports = router;
