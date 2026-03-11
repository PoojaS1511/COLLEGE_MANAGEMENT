const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = 'https://qkaaoeismqnhjyikgkme.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrYWFvZWlzbXFuaGp5aWtna21lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMwMjU3NCwiZXhwIjoyMDY5ODc4NTc0fQ.L1ZCNGBbQqrRjCI9IrmounuEtwux4yBmhvPBR4vU5Uw';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});

// Function to execute SQL statements
const executeSQL = async (sql) => {
  try {
    const { data, error } = await supabase.rpc('execute_sql', { query: sql });
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('SQL Error:', sql.substring(0, 100) + '...');
    return { data: null, error };
  }
};

// Transport tables creation
const createTransportTables = async () => {
  console.log('🚀 Starting transport database setup...');

  try {
    // Enable UUID extension
    console.log('🔧 Enabling UUID extension...');
    const { error: extensionError } = await executeSQL('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    
    if (extensionError && !extensionError.message.includes('already exists')) {
      console.error('❌ Error enabling UUID extension:', extensionError);
      return;
    }

    // Transport tables
    const transportTables = [
      {
        name: 'transport_routes',
        sql: `
          CREATE TABLE IF NOT EXISTS transport_routes (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            route_id VARCHAR(20) UNIQUE NOT NULL,
            route_name VARCHAR(255) NOT NULL,
            stops JSONB,
            pickup_time TIME,
            drop_time TIME,
            total_students INTEGER DEFAULT 0,
            assigned_bus VARCHAR(20),
            assigned_driver VARCHAR(50),
            status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Maintenance')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          )`
      },
      {
        name: 'transport_buses',
        sql: `
          CREATE TABLE IF NOT EXISTS transport_buses (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            bus_number VARCHAR(20) UNIQUE NOT NULL,
            route_id VARCHAR(20) REFERENCES transport_routes(route_id) ON DELETE SET NULL,
            route_name VARCHAR(255),
            capacity INTEGER NOT NULL,
            driver_id VARCHAR(50),
            driver_name VARCHAR(255),
            status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Under Maintenance')),
            last_service DATE,
            next_service DATE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          )`
      },
      {
        name: 'transport_drivers',
        sql: `
          CREATE TABLE IF NOT EXISTS transport_drivers (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            driver_id VARCHAR(50) UNIQUE NOT NULL,
            name VARCHAR(255) NOT NULL,
            phone VARCHAR(20),
            license_number VARCHAR(50) NOT NULL,
            license_expiry DATE,
            blood_group VARCHAR(10),
            emergency_contact VARCHAR(20),
            experience_years INTEGER DEFAULT 0,
            shift VARCHAR(20) DEFAULT 'Morning' CHECK (shift IN ('Morning', 'Evening', 'Full Day')),
            working_hours VARCHAR(50) DEFAULT '8 hours',
            assigned_bus VARCHAR(20),
            status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'On Leave', 'Inactive')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          )`
      },
      {
        name: 'transport_students',
        sql: `
          CREATE TABLE IF NOT EXISTS transport_students (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            student_id VARCHAR(50) UNIQUE NOT NULL,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255),
            phone VARCHAR(20),
            address TEXT,
            route_id VARCHAR(20) REFERENCES transport_routes(route_id) ON DELETE SET NULL,
            route_name VARCHAR(255),
            pickup_point TEXT,
            status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Suspended')),
            fee_status VARCHAR(20) DEFAULT 'Pending' CHECK (fee_status IN ('Paid', 'Pending', 'Overdue')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          )`
      },
      {
        name: 'transport_faculty',
        sql: `
          CREATE TABLE IF NOT EXISTS transport_faculty (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            faculty_id VARCHAR(50) UNIQUE NOT NULL,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255),
            phone VARCHAR(20),
            department VARCHAR(255),
            route_id VARCHAR(20) REFERENCES transport_routes(route_id) ON DELETE SET NULL,
            route_name VARCHAR(255),
            status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'On Leave')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          )`
      },
      {
        name: 'transport_fee',
        sql: `
          CREATE TABLE IF NOT EXISTS transport_fee (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            student_id UUID NOT NULL,
            route_name TEXT NOT NULL,
            bus_no TEXT,
            fee_amount NUMERIC(10,2) NOT NULL DEFAULT 2500.00,
            paid_amount NUMERIC(10,2) DEFAULT 0.00,
            due_amount NUMERIC(10,2) GENERATED ALWAYS AS (fee_amount - paid_amount) STORED,
            payment_status TEXT DEFAULT 'Pending' CHECK (payment_status IN ('Paid', 'Pending', 'Overdue', 'Partial')),
            payment_date DATE,
            academic_year TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          )`
      },
      {
        name: 'transport_attendance',
        sql: `
          CREATE TABLE IF NOT EXISTS transport_attendance (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            date DATE NOT NULL,
            entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('Student', 'Faculty')),
            entity_id VARCHAR(50) NOT NULL,
            entity_name VARCHAR(255) NOT NULL,
            route_id VARCHAR(20) REFERENCES transport_routes(route_id) ON DELETE SET NULL,
            bus_number VARCHAR(20),
            status VARCHAR(20) DEFAULT 'Present' CHECK (status IN ('Present', 'Absent', 'Leave')),
            remarks TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          )`
      },
      {
        name: 'transport_activities',
        sql: `
          CREATE TABLE IF NOT EXISTS transport_activities (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            type VARCHAR(50) NOT NULL,
            message TEXT NOT NULL,
            user_id VARCHAR(50),
            metadata JSONB,
            time TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          )`
      },
      {
        name: 'transport_live_locations',
        sql: `
          CREATE TABLE IF NOT EXISTS transport_live_locations (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            bus_id VARCHAR(50) NOT NULL,
            bus_number VARCHAR(20) NOT NULL,
            route_id VARCHAR(20),
            latitude DECIMAL(10, 8) NOT NULL,
            longitude DECIMAL(11, 8) NOT NULL,
            speed INTEGER DEFAULT 0,
            status VARCHAR(20) DEFAULT 'Moving' CHECK (status IN ('Moving', 'Stopped', 'Offline')),
            driver_name VARCHAR(255),
            last_update TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          )`
      }
    ];

    // Create transport tables one by one
    for (const table of transportTables) {
      console.log(`📊 Creating ${table.name} table...`);
      // Force recreation by dropping first
      await executeSQL(`DROP TABLE IF EXISTS ${table.name} CASCADE`);
      const { error } = await executeSQL(table.sql);
      
      if (error) {
        if (error.message.includes('already exists')) {
          console.log(`ℹ️ Table ${table.name} already exists, skipping...`);
        } else {
          console.error(`❌ Error creating ${table.name} table:`, error.message);
          return;
        }
      } else {
        console.log(`✅ Successfully created ${table.name} table`);
      }
    }

    // Create indexes for better performance
    console.log('🔧 Creating indexes...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_transport_fee_student_id ON transport_fee(student_id);',
      'CREATE INDEX IF NOT EXISTS idx_transport_fee_payment_status ON transport_fee(payment_status);',
      'CREATE INDEX IF NOT EXISTS idx_transport_fee_academic_year ON transport_fee(academic_year);',
      'CREATE INDEX IF NOT EXISTS idx_transport_students_student_id ON transport_students(student_id);',
      'CREATE INDEX IF NOT EXISTS idx_transport_faculty_faculty_id ON transport_faculty(faculty_id);',
      'CREATE INDEX IF NOT EXISTS idx_transport_attendance_date ON transport_attendance(date);',
      'CREATE INDEX IF NOT EXISTS idx_transport_live_locations_bus_id ON transport_live_locations(bus_id);'
    ];

    for (const indexSql of indexes) {
      const { error } = await executeSQL(indexSql);
      if (error) {
        console.error('❌ Error creating index:', error.message);
      } else {
        console.log('✅ Index created successfully');
      }
    }

    // Enable Row Level Security (RLS)
    console.log('🔐 Enabling Row Level Security...');
    const rlsStatements = [
      'ALTER TABLE transport_fee ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE transport_students ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE transport_faculty ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE transport_attendance ENABLE ROW LEVEL SECURITY;'
    ];

    for (const rlsSql of rlsStatements) {
      const { error } = await executeSQL(rlsSql);
      if (error) {
        console.error('❌ Error enabling RLS:', error.message);
      } else {
        console.log('✅ RLS enabled successfully');
      }
    }

    console.log('🎉 Transport database setup completed successfully!');
  } catch (error) {
    console.error('❌ An unexpected error occurred:', error);
  } finally {
    process.exit(0);
  }
};

// Run setup
createTransportTables().catch(error => {
  console.error('❌ Error during transport database setup:', error);
  process.exit(1);
});
