require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { supabase } = require('./supabase_client');

const app = express();
const PORT = 5001;

// Middleware
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

// Test database connection
app.get('/api/test-db', async (req, res) => {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const { data, error } = await supabase
      .from('policies')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
        hint: 'Tables may not exist. Please run create_quality_tables.sql in Supabase SQL Editor.'
      });
    }
    
    res.json({
      success: true,
      message: 'Database connection successful',
      data: data || []
    });
  } catch (error) {
    console.error('Test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test policies API (simplified)
app.get('/api/quality/policies', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('policies')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    res.json({
      success: true,
      data: data || [],
      pagination: {
        page: 1,
        limit: 10,
        total: data?.length || 0,
        totalPages: 1
      }
    });
  } catch (error) {
    console.error('Error fetching policies:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Add policy (simplified)
app.post('/api/quality/policies', async (req, res) => {
  try {
    const policyData = {
      ...req.body,
      compliance_status: 'pending_review',
      last_reviewed: new Date().toISOString().split('T')[0],
      compliance_score: req.body.compliance_score || 0,
      documents: req.body.documents || []
    };

    const { data, error } = await supabase
      .from('policies')
      .insert([policyData])
      .select();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data: data[0],
      message: 'Policy added successfully'
    });
  } catch (error) {
    console.error('Error adding policy:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Quality Module Test Server is running',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Quality Module Test Server running on http://localhost:${PORT}`);
  console.log(`📊 Available endpoints:`);
  console.log(`   GET  / - Health check`);
  console.log(`   GET  /api/test-db - Test database connection`);
  console.log(`   GET  /api/quality/policies - Get policies`);
  console.log(`   POST /api/quality/policies - Add policy`);
  console.log(`\n⚠️  If database errors occur, run create_quality_tables.sql in Supabase SQL Editor`);
});
