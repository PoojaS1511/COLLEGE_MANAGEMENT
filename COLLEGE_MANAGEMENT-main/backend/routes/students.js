const express = require('express');
const router = express.Router();
const { database } = require('../config/database');

// Get student statistics
router.get('/stats', async (req, res) => {
  try {
    // Get total count directly from database
    const students = await database.fetchAll('students');
    const totalCount = students.length;

    // Get gender distribution
    let maleCount = 0;
    let femaleCount = 0;
    let otherCount = 0;
    let notSpecified = 0;

    students.forEach(student => {
      if (!student.gender) {
        notSpecified++;
        return;
      }
      
      const gender = String(student.gender).toLowerCase().trim();
      if (gender === 'male') maleCount++;
      else if (gender === 'female') femaleCount++;
      else otherCount++;
    });

    res.json({
      status: 'success',
      data: {
        total: totalCount,
        male: maleCount,
        female: femaleCount,
        other: otherCount,
        notSpecified: notSpecified,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching student statistics:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to fetch student statistics',
      error: error.message 
    });
  }
});

// Get all students with pagination and filters
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', ...filters } = req.query;
    const offset = (page - 1) * limit;

    // Build base query
    let query = `SELECT * FROM students`;
    let queryParams = [];
    let paramIndex = 1;

    // Apply search
    if (search) {
      query += ` WHERE (first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        const whereClause = search ? 'AND' : 'WHERE';
        query += ` ${whereClause} ${key} = $${paramIndex}`;
        queryParams.push(value);
        paramIndex++;
      }
    });

    // Add pagination
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(parseInt(limit), offset);

    const data = await database.query(query, queryParams);

    // Get total count for pagination
    let countQuery = `SELECT COUNT(*) as total FROM students`;
    let countParams = [];
    let countParamIndex = 1;

    if (search) {
      countQuery += ` WHERE (first_name ILIKE $${countParamIndex} OR last_name ILIKE $${countParamIndex} OR email ILIKE $${countParamIndex})`;
      countParams.push(`%${search}%`);
      countParamIndex++;
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        const whereClause = search ? 'AND' : 'WHERE';
        countQuery += ` ${whereClause} ${key} = $${countParamIndex}`;
        countParams.push(value);
        countParamIndex++;
      }
    });

    const countResult = await database.query(countQuery, countParams);
    const count = parseInt(countResult[0]?.total || 0);

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
    console.error('Error fetching students:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch students' });
  }
});

// Get single student by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const data = await database.fetchById('students', id);

    if (!data) {
      return res.status(404).json({ status: 'error', message: 'Student not found' });
    }

    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch student' });
  }
});

// Create new student
router.post('/', async (req, res) => {
  try {
    const studentData = req.body;
    
    // Map the incoming data to match the database schema
    const mappedData = {
      name: studentData.first_name && studentData.last_name 
        ? `${studentData.first_name} ${studentData.last_name}` 
        : studentData.name || studentData.first_name || '',
      email: studentData.email,
      phone: studentData.phone,
      register_number: studentData.register_number,
      date_of_birth: studentData.date_of_birth,
      gender: studentData.gender,
      address: studentData.address,
      blood_group: studentData.blood_group,
      guardian_name: studentData.parent_name || studentData.guardian_name,
      guardian_phone: studentData.parent_phone || studentData.guardian_phone,
      // Add other fields as needed
      ...studentData
    };
    
    // Remove first_name and last_name as they don't exist in the table
    delete mappedData.first_name;
    delete mappedData.last_name;
    
    const data = await database.insert('students', mappedData);

    res.status(201).json({ status: 'success', data });
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create student', error: error.message });
  }
});

// Update student
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const data = await database.update('students', id, updates);

    if (!data) {
      return res.status(404).json({ status: 'error', message: 'Student not found' });
    }

    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update student' });
  }
});

// Delete student
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const success = await database.delete('students', id);

    if (!success) {
      return res.status(404).json({ status: 'error', message: 'Student not found' });
    }

    res.json({ status: 'success', message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete student' });
  }
});

// Get student attendance
router.get('/:id/attendance', async (req, res) => {
  try {
    const { id } = req.params;
    const { start_date, end_date, subject_id } = req.query;
    
    let query = `SELECT * FROM attendance WHERE student_id = $1`;
    let queryParams = [id];
    let paramIndex = 2;

    if (start_date && end_date) {
      query += ` AND date >= $${paramIndex} AND date <= $${paramIndex + 1}`;
      queryParams.push(start_date, end_date);
      paramIndex += 2;
    }

    if (subject_id) {
      query += ` AND subject_id = $${paramIndex}`;
      queryParams.push(subject_id);
    }

    const data = await database.query(query, queryParams);

    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error fetching student attendance:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch attendance' });
  }
});

// Get student exam results
router.get('/:id/results', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT er.*, e.name as exam_name, e.exam_date, e.max_marks, e.passing_marks,
             s.name as subject_name, s.code as subject_code
      FROM exam_results er
      JOIN exams e ON er.exam_id = e.id
      JOIN subjects s ON e.subject_id = s.id
      WHERE er.student_id = $1
    `;
    
    const data = await database.query(query, [id]);

    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error fetching student results:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch results' });
  }
});

module.exports = router;
