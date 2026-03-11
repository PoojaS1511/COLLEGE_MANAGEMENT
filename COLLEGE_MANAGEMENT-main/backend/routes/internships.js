const express = require('express');
const router = express.Router();
const { supabase } = require('../supabase_client');
const { v4: uuidv4 } = require('uuid');

// Helper function to format internship data
const formatInternship = (internship) => ({
  id: internship.id || uuidv4(),
  type: internship.type || 'internship',
  title: internship.title || internship.position || 'Internship Position',
  company: internship.company || internship.company_name || 'Company Name',
  location: internship.location || 'Remote',
  description: internship.description || 'No description available',
  requirements: internship.requirements || [],
  responsibilities: internship.responsibilities || [],
  skills: internship.skills || [],
  start_date: internship.start_date || new Date().toISOString().split('T')[0],
  end_date: internship.end_date || null,
  is_current: internship.is_current || false,
  is_remote: internship.is_remote || false,
  min_stipend: internship.min_stipend || 0,
  max_stipend: internship.max_stipend || 0,
  is_unpaid: internship.is_unpaid || false,
  posted_date: internship.posted_date || new Date().toISOString(),
  application_deadline: internship.application_deadline || null,
  application_url: internship.application_url || null,
  is_active: internship.is_active !== undefined ? internship.is_active : true,
  created_at: internship.created_at || new Date().toISOString(),
  updated_at: internship.updated_at || new Date().toISOString()
});

/**
 * @route GET /api/internships/student
 * @description Get all available internships
 * @access Public
 */
router.get('/student', async (req, res) => {
  console.log('Internships request received:', req.query);
  
  try {
    const { student_id, search, job_type, location, min_stipend, max_stipend, is_unpaid, limit = 20, offset = 0 } = req.query;
    
    console.log('Building query with params:', {
      student_id,
      search,
      job_type,
      location,
      min_stipend,
      max_stipend,
      is_unpaid,
      limit,
      offset
    });
    
    // Build the base query
    let query = supabase
      .from('internships')
      .select('*', { count: 'exact' });
    
    // Apply search filter if provided
    if (search) {
      query = query.or(`title.ilike.%${search}%,company_name.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    // Apply other filters
    if (job_type) {
      query = query.eq('job_type', job_type);
    }
    
    if (location) {
      query = query.ilike('location', `%${location}%`);
    }
    
    if (min_stipend && !isNaN(min_stipend)) {
      query = query.gte('min_stipend', parseFloat(min_stipend));
    }
    
    if (max_stipend && !isNaN(max_stipend)) {
      query = query.lte('max_stipend', parseFloat(max_stipend));
    }
    
    if (is_unpaid === 'true') {
      query = query.eq('is_unpaid', true);
    } else if (is_unpaid === 'false') {
      query = query.eq('is_unpaid', false);
    }

    // Add sorting and pagination
    query = query
      .order('posted_date', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    console.log('Executing query...');
    const { data: internships, error, count } = await query;
    
    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }
    
    // Get total count separately if needed
    let totalCount = 0;
    if (count) {
      totalCount = count;
    } else {
      // If count is not available, get it with a separate count query
      const { count: total } = await supabase
        .from('internships')
        .select('*', { count: 'exact', head: true });
      totalCount = total || 0;
    }

    console.log(`Found ${internships?.length || 0} internships`);
    
    // Format the response to match expected schema
    const formattedInternships = Array.isArray(internships) 
      ? internships.map(formatInternship)
      : [];
    
    // Ensure we have valid data
    if (!formattedInternships || !Array.isArray(formattedInternships)) {
      throw new Error('Failed to format internships data');
    }
    
    res.status(200).json({
      success: true,
      data: formattedInternships || [],
      pagination: {
        total: totalCount || 0,
        limit: parseInt(limit) || 20,
        offset: parseInt(offset) || 0
      }
    });
  } catch (error) {
    console.error('Error in /api/internships/student:', {
      message: error.message,
      stack: error.stack,
      query: req.query,
      name: error.name,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch internships',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
});

/**
 * @route GET /api/internships/:id
 * @description Get internship details by ID
 * @access Public
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`Fetching internship with ID: ${id}`);
  
  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'Internship ID is required'
    });
  }

  try {
    console.log('Executing Supabase query...');
    const { data: internship, error } = await supabase
      .from('internships')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }
    
    if (!internship) {
      console.log(`Internship with ID ${id} not found`);
      return res.status(404).json({
        success: false,
        message: 'Internship not found'
      });
    }

    console.log(`Successfully retrieved internship: ${internship.id}`);
    
    // Format the response to match expected schema
    const formattedInternship = formatInternship(internship);
    
    res.status(200).json({
      success: true,
      data: formattedInternship
    });

  } catch (error) {
    console.error('Error in /api/internships/:id:', {
      message: error.message,
      stack: error.stack,
      internshipId: id
    });
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch internship details',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
});

module.exports = router;
