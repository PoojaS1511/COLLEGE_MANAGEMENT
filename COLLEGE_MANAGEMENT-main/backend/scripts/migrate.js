import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';

dotenv.config();

dotenv.config();

// Get the directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Path to migrations directory
const migrationsDir = path.join(__dirname, '..', 'migrations');

// Table to track migrations
const MIGRATIONS_TABLE = 'migrations';

// Create migrations table if it doesn't exist
async function ensureMigrationsTable() {
  const { error } = await supabase.rpc('create_migrations_table_if_not_exists');
  
  if (error && error.code !== '42P07') { // 42P07 is "duplicate table" error
    console.error('Error creating migrations table:', error);
    throw error;
  }
}

// Get list of applied migrations
async function getAppliedMigrations() {
  const { data, error } = await supabase
    .from(MIGRATIONS_TABLE)
    .select('name')
    .order('applied_at', { ascending: true });
    
  if (error) {
    console.error('Error fetching applied migrations:', error);
    throw error;
  }
  
  return data.map(m => m.name);
}

// Apply a single migration
async function applyMigration(migrationName) {
  const migrationPath = path.join(migrationsDir, migrationName);
  const sql = await fs.readFile(migrationPath, 'utf8');
  
  console.log(`Applying migration: ${migrationName}`);
  
  // Execute the SQL
  const { error } = await supabase.rpc('execute_sql', { sql });
  
  if (error) {
    console.error(`Error applying migration ${migrationName}:`, error);
    throw error;
  }
  
  // Record the migration
  const { error: insertError } = await supabase
    .from(MIGRATIONS_TABLE)
    .insert([{ name: migrationName, applied_at: new Date().toISOString() }]);
    
  if (insertError) {
    console.error('Error recording migration:', insertError);
    throw insertError;
  }
  
  console.log(`Applied migration: ${migrationName}`);
}

// Run migrations
async function runMigrations() {
  try {
    console.log('Starting database migrations...');
    
    // Ensure migrations table exists
    await ensureMigrationsTable();
    
    // Get list of applied migrations
    const appliedMigrations = new Set(await getAppliedMigrations());
    
    // Get list of migration files
    const files = await fs.readdir(migrationsDir);
    const migrationFiles = files
      .filter(f => f.endsWith('.sql'))
      .sort();
    
    // Apply pending migrations
    for (const file of migrationFiles) {
      if (!appliedMigrations.has(file)) {
        await applyMigration(file);
      }
    }
    
    console.log('Database migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Execute migrations
runMigrations();
