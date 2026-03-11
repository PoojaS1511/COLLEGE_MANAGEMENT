const { Pool } = require('pg');

// PostgreSQL connection configuration
const pool = new Pool({
  connectionString: 'postgresql://postgres:Pooja@15@localhost:5433/college_management_system',
  ssl: false
});

// Database tables
const TABLES = {
  USERS: 'users',
  STUDENTS: 'students',
  FACULTY: 'faculty',
  DEPARTMENTS: 'departments',
  COURSES: 'courses',
  STUDENT_COURSES: 'student_courses',
  SUBJECTS: 'subjects',
  EXAMS: 'exams',
  EXAM_RESULTS: 'exam_results',
  ATTENDANCE: 'attendance',
  FEES: 'fees',
  FEE_PAYMENTS: 'fee_payments',
  ADMISSION_APPLICATIONS: 'admission_applications'
};

// Utility functions for common database operations
const database = {
  // Test connection
  testConnection: async () => {
    try {
      const client = await pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      console.log('PostgreSQL connected successfully');
      return true;
    } catch (error) {
      console.error('PostgreSQL connection error:', error);
      return false;
    }
  },

  // Fetch all records from a table
  fetchAll: async (table) => {
    const client = await pool.connect();
    try {
      const result = await client.query(`SELECT * FROM ${table}`);
      return result.rows;
    } finally {
      client.release();
    }
  },

  // Fetch a single record by ID
  fetchById: async (table, id) => {
    const client = await pool.connect();
    try {
      const result = await client.query(`SELECT * FROM ${table} WHERE id = $1`, [id]);
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  // Insert a new record
  insert: async (table, record) => {
    const client = await pool.connect();
    try {
      const columns = Object.keys(record);
      const values = Object.values(record);
      const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
      
      const query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`;
      const result = await client.query(query, values);
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  // Update a record
  update: async (table, id, updates) => {
    const client = await pool.connect();
    try {
      const columns = Object.keys(updates);
      const values = Object.values(updates);
      const setClause = columns.map((col, index) => `${col} = $${index + 1}`).join(', ');
      
      const query = `UPDATE ${table} SET ${setClause} WHERE id = $${columns.length + 1} RETURNING *`;
      const result = await client.query(query, [...values, id]);
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  // Delete a record
  delete: async (table, id) => {
    const client = await pool.connect();
    try {
      const result = await client.query(`DELETE FROM ${table} WHERE id = $1`, [id]);
      return result.rowCount > 0;
    } finally {
      client.release();
    }
  },

  // Custom query
  query: async (text, params) => {
    const client = await pool.connect();
    try {
      const result = await client.query(text, params);
      return result.rows;
    } finally {
      client.release();
    }
  },

  // Execute raw SQL
  execute: async (text, params) => {
    const client = await pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }
};

module.exports = {
  pool,
  TABLES,
  database
};
