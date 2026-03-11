const { pool, TABLES, database } = require('./postgres');

// Test the connection on startup
database.testConnection();

module.exports = {
  pool,
  TABLES,
  database
};
