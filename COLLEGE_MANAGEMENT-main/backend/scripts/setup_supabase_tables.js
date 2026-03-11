import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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

// Table creation functions
const createTables = async () => {
  console.log('🚀 Starting database setup...');

  try {
    // Enable UUID extension
    console.log('🔧 Enabling UUID extension...');
    const { error: extensionError } = await executeSQL('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    
    if (extensionError && !extensionError.message.includes('already exists')) {
      console.error('❌ Error enabling UUID extension:', extensionError);
      return;
    }

    // Create tables
    const tables = [
      {
        name: 'departments',
        sql: `
          CREATE TABLE IF NOT EXISTS departments (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name VARCHAR(255) NOT NULL,
            code VARCHAR(50) UNIQUE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          )`
      },
      {
        name: 'courses',
        sql: `
          CREATE TABLE IF NOT EXISTS courses (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name VARCHAR(255) NOT NULL,
            code VARCHAR(50) UNIQUE NOT NULL,
            department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
            duration_years INTEGER NOT NULL,
            description TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          )`
      },
      {
        name: 'subjects',
        sql: `
          CREATE TABLE IF NOT EXISTS subjects (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name VARCHAR(255) NOT NULL,
            code VARCHAR(50) NOT NULL,
            course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
            semester INTEGER NOT NULL,
            credits INTEGER NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(code, course_id)
          )`
      },
      {
        name: 'students',
        sql: `
          CREATE TABLE IF NOT EXISTS students (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID UNIQUE,
            first_name VARCHAR(100) NOT NULL,
            last_name VARCHAR(100) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            phone VARCHAR(20),
            date_of_birth DATE,
            gender VARCHAR(10),
            address TEXT,
            city VARCHAR(100),
            state VARCHAR(100),
            country VARCHAR(100),
            pincode VARCHAR(20),
            admission_date DATE,
            course_id UUID REFERENCES courses(id),
            current_semester INTEGER DEFAULT 1,
            register_number VARCHAR(50) UNIQUE NOT NULL,
            roll_number VARCHAR(50),
            blood_group VARCHAR(10),
            parent_name VARCHAR(200),
            parent_phone VARCHAR(20),
            parent_email VARCHAR(255),
            parent_occupation VARCHAR(100),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          )`
      },
      {
        name: 'faculty',
        sql: `
          CREATE TABLE IF NOT EXISTS faculty (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID UNIQUE,
            first_name VARCHAR(100) NOT NULL,
            last_name VARCHAR(100) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            phone VARCHAR(20),
            date_of_birth DATE,
            gender VARCHAR(10),
            address TEXT,
            qualification TEXT,
            department_id UUID REFERENCES departments(id),
            designation VARCHAR(100),
            joining_date DATE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          )`
      },
      {
        name: 'exams',
        sql: `
          CREATE TABLE IF NOT EXISTS exams (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name VARCHAR(255) NOT NULL,
            description TEXT,
            course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
            subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
            exam_date DATE NOT NULL,
            start_time TIME NOT NULL,
            end_time TIME NOT NULL,
            max_marks INTEGER NOT NULL,
            passing_marks INTEGER NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          )`
      },
      {
        name: 'exam_results',
        sql: `
          CREATE TABLE IF NOT EXISTS exam_results (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
            student_id UUID REFERENCES students(id) ON DELETE CASCADE,
            marks_obtained DECIMAL(5,2) NOT NULL,
            grade VARCHAR(5),
            remarks TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(exam_id, student_id)
          )`
      },
      {
        name: 'attendance',
        sql: `
          CREATE TABLE IF NOT EXISTS attendance (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            student_id UUID REFERENCES students(id) ON DELETE CASCADE,
            subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
            date DATE NOT NULL,
            status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'leave')),
            remarks TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(student_id, subject_id, date)
          )`
      },
      {
        name: 'fees',
        sql: `
          CREATE TABLE IF NOT EXISTS fees (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name VARCHAR(255) NOT NULL,
            description TEXT,
            amount DECIMAL(10,2) NOT NULL,
            course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
            semester INTEGER,
            is_one_time BOOLEAN DEFAULT false,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          )`
      },
      {
        name: 'admission_applications',
        sql: `
          CREATE TABLE IF NOT EXISTS admission_applications (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            first_name VARCHAR(100) NOT NULL,
            last_name VARCHAR(100) NOT NULL,
            phone VARCHAR(20) NOT NULL,
            course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
            status VARCHAR(50) DEFAULT 'pending',
            application_date DATE DEFAULT CURRENT_DATE,
            date_of_birth DATE,
            gender VARCHAR(10),
            address TEXT,
            city VARCHAR(100),
            state VARCHAR(100),
            country VARCHAR(100),
            pincode VARCHAR(20),
            qualification TEXT,
            documents JSONB,
            remarks TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          )`
      }
    ];

    // Create tables one by one
    for (const table of tables) {
      console.log(`📊 Creating ${table.name} table...`);
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

    console.log('🎉 Database setup completed successfully!');
  } catch (error) {
    console.error('❌ An unexpected error occurred:', error);
  } finally {
    process.exit(0);
  }
};

// Run the setup
createTables().catch(error => {
  console.error('❌ Error during database setup:', error);
  process.exit(1);
});
