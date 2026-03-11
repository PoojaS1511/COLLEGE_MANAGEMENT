import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

dotenv.config();

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

// Sample data for seeding
const seedData = {
  departments: [
    {
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Computer Science',
      code: 'CS',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      name: 'Information Technology',
      code: 'IT',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      name: 'Electronics and Communication',
      code: 'EC',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  
  courses: [
    {
      id: '44444444-4444-4444-4444-444444444444',
      name: 'Bachelor of Technology in Computer Science',
      code: 'BTECH-CS',
      duration_years: 4,
      department_id: '11111111-1111-1111-1111-111111111111',
      description: 'Undergraduate program in Computer Science',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '55555555-5555-5555-5555-555555555555',
      name: 'Bachelor of Technology in Information Technology',
      code: 'BTECH-IT',
      duration_years: 4,
      department_id: '22222222-2222-2222-2222-222222222222',
      description: 'Undergraduate program in Information Technology',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  
  subjects: [
    {
      id: '66666666-6666-6666-6666-666666666666',
      name: 'Data Structures and Algorithms',
      code: 'CS101',
      course_id: '44444444-4444-4444-4444-444444444444',
      semester: 3,
      credits: 4,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '77777777-7777-7777-7777-777777777777',
      name: 'Database Management Systems',
      code: 'CS102',
      course_id: '44444444-4444-4444-4444-444444444444',
      semester: 3,
      credits: 4,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '88888888-8888-8888-8888-888888888888',
      name: 'Web Technologies',
      code: 'IT101',
      course_id: '55555555-5555-5555-5555-555555555555',
      semester: 3,
      credits: 3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]
};

// Seed the database
async function seedDatabase() {
  try {
    console.log('Starting database seeding...');
    
    // Seed departments
    console.log('Seeding departments...');
    const { error: deptError } = await supabase
      .from('departments')
      .upsert(seedData.departments, { onConflict: 'id' });
      
    if (deptError) throw deptError;
    
    // Seed courses
    console.log('Seeding courses...');
    const { error: courseError } = await supabase
      .from('courses')
      .upsert(seedData.courses, { onConflict: 'id' });
      
    if (courseError) throw courseError;
    
    // Seed subjects
    console.log('Seeding subjects...');
    const { error: subjectError } = await supabase
      .from('subjects')
      .upsert(seedData.subjects, { onConflict: 'id' });
      
    if (subjectError) throw subjectError;
    
    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

// Execute seeding
seedDatabase();
