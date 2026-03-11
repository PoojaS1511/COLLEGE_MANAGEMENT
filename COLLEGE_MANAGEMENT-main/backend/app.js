require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const supabase = require('./supabase_client');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5002; // Changed from 5001 to 5002 to avoid conflicts

// Basic middleware with request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

app.use(express.json());
app.use(morgan('dev'));

// Simple root endpoint for health check
app.get('/', (req, res) => {
  console.log('Health check endpoint hit');
  res.status(200).json({ 
    status: 'ok', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Test database connection
app.get('/api/test-db', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('internships')
      .select('*')
      .limit(1);
      
    if (error) {
      console.error('Database test error:', error);
      return res.status(500).json({
        success: false,
        message: 'Database test failed',
        error: error.message
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Database connection successful',
      data: data || []
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// API health check endpoint
app.get('/api/health', (req, res) => {
  console.log('API Health check endpoint hit');
  res.status(200).json({ 
    status: 'ok', 
    message: 'API is healthy',
    timestamp: new Date().toISOString()
  });
});

// Environment check endpoint
app.get('/api/env-check', (req, res) => {
  const envVars = {
    node_env: process.env.NODE_ENV,
    supabase_url: process.env.SUPABASE_URL ? 'Set' : 'Not set',
    supabase_key: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not set',
    port: process.env.PORT
  };
  
  console.log('Environment variables check:', envVars);
  
  res.status(200).json({
    success: true,
    environment: envVars
  });
});

// CORS Configuration - Simplified
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'x-api-key'],
  exposedHeaders: ['Content-Length', 'Content-Type', 'Authorization'],
  maxAge: 600,
  optionsSuccessStatus: 200
};

// Apply CORS with options - this must be before any route definitions
app.use(cors(corsOptions));

// Import routes
const studentRoutes = require('./routes/students');
const courseRoutes = require('./routes/courses');
const subjectRoutes = require('./routes/subjects');
const examRoutes = require('./routes/exams');
const attendanceRoutes = require('./routes/attendance');
const feeRoutes = require('./routes/fees');
const clubRoutes = require('./routes/clubs');
const internshipRoutes = require('./routes/internships');
// const analyticsRoutes = require('./routes/analytics');

// Quality & Accreditation Management Routes
const qualityDashboardRoutes = require('./routes/quality/dashboard');
const qualityFacultyRoutes = require('./routes/quality/faculty');
const qualityAuditsRoutes = require('./routes/quality/audits');
const qualityGrievancesRoutes = require('./routes/quality/grievances');
const qualityPoliciesRoutes = require('./routes/quality/policies');
const qualityAccreditationRoutes = require('./routes/quality/accreditation');
const qualityAnalyticsRoutes = require('./routes/quality/analytics');

// Use routes
app.use('/api/students', studentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/internships', internshipRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/fees', feeRoutes);
// app.use('/api/analytics', analyticsRoutes);

// Quality & Accreditation Management Routes
app.use('/api/quality/dashboard', qualityDashboardRoutes);
app.use('/api/quality/faculty', qualityFacultyRoutes);
app.use('/api/quality/audits', qualityAuditsRoutes);
app.use('/api/quality/grievances', qualityGrievancesRoutes);
app.use('/api/quality/policies', qualityPoliciesRoutes);
app.use('/api/quality/accreditation', qualityAccreditationRoutes);
app.use('/api/quality/analytics', qualityAnalyticsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    status: 'error', 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Route not found' });
});

// Start server with error handling
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log(`  - GET  /`);
  console.log(`  - GET  /api/health`);
  console.log(`  - GET  /api/students`);
  console.log(`  - GET  /api/courses`);
  console.log(`  - GET  /api/clubs`);
  // Add more endpoints as needed
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please stop any other servers using this port.`);
  } else {
    console.error('Server error:', error);
  }
  process.exit(1);
});

module.exports = app;
