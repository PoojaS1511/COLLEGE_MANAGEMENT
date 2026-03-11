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

// Fix exam and marks tables
const fixExamTables = async () => {
  console.log('🚀 Starting exam tables fix...');

  try {
    // 1. Create marks table if it doesn't exist
    console.log('🔧 Creating/updating marks table...');
    await executeSQL(`
      CREATE TABLE IF NOT EXISTS marks (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
        student_id UUID REFERENCES students(id) ON DELETE CASCADE,
        subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
        marks_obtained DECIMAL(5,2) NOT NULL,
        grade VARCHAR(5),
        remarks TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(exam_id, student_id, subject_id)
      );
    `);

    // 2. Add missing columns to exams table
    console.log('🔧 Updating exams table...');
    await executeSQL(`
      ALTER TABLE exams 
      ADD COLUMN IF NOT EXISTS academic_year VARCHAR(20),
      ADD COLUMN IF NOT EXISTS semester INTEGER,
      ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT FALSE;
    `);

    // 3. Create RLS policies
    console.log('🔧 Setting up RLS policies...');
    await executeSQL(`
      -- Enable RLS on exams
      ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
      
      -- Enable RLS on marks
      ALTER TABLE marks ENABLE ROW LEVEL SECURITY;
      
      -- Create policies for exams
      DROP POLICY IF EXISTS "Enable read access for all users" ON exams;
      CREATE POLICY "Enable read access for all users" 
      ON exams FOR SELECT USING (true);
      
      DROP POLICY IF EXISTS "Enable insert for admins" ON exams;
      CREATE POLICY "Enable insert for admins" 
      ON exams FOR INSERT TO authenticated 
      WITH CHECK (auth.role() = 'authenticated' AND 
                 (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
      
      -- Create policies for marks
      DROP POLICY IF EXISTS "Enable read access for all users" ON marks;
      CREATE POLICY "Enable read access for all users" 
      ON marks FOR SELECT USING (true);
      
      DROP POLICY IF EXISTS "Enable insert for admins" ON marks;
      CREATE POLICY "Enable insert for admins" 
      ON marks FOR INSERT TO authenticated 
      WITH CHECK (auth.role() = 'authenticated' AND 
                 (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
      
      DROP POLICY IF EXISTS "Enable update for admins" ON marks;
      CREATE POLICY "Enable update for admins" 
      ON marks FOR UPDATE TO authenticated 
      USING (auth.role() = 'authenticated' AND 
             (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
    `);

    console.log('✅ Exam tables fixed successfully!');
    
    // 4. Add test data if tables are empty
    const { count: examCount } = await supabase
      .from('exams')
      .select('*', { count: 'exact', head: true });
      
    if (examCount === 0) {
      console.log('📝 Adding test exam data...');
      // Get a course and subject for the test exam
      const { data: courses } = await supabase
        .from('courses')
        .select('id')
        .limit(1);
        
      const { data: subjects } = await supabase
        .from('subjects')
        .select('id, course_id')
        .limit(1);
        
      if (courses && courses.length > 0 && subjects && subjects.length > 0) {
        const courseId = courses[0].id;
        const subjectId = subjects[0].id;
        
        // Add test exam
        const { data: exam, error: examError } = await supabase
          .from('exams')
          .insert([{
            name: 'Midterm Exam',
            description: 'Midterm examination',
            course_id: courseId,
            subject_id: subjectId,
            exam_date: '2024-11-15',
            start_time: '09:00:00',
            end_time: '12:00:00',
            max_marks: 100,
            passing_marks: 35,
            academic_year: '2024-2025',
            semester: 1,
            is_published: true
          }])
          .select()
          .single();
          
        if (examError) {
          console.error('Error adding test exam:', examError);
        } else {
          console.log('✅ Added test exam:', exam.name);
        }
      }
    }
    
    console.log('🎉 Database setup completed successfully!');
  } catch (error) {
    console.error('❌ Error fixing exam tables:', error);
    process.exit(1);
  }
};

// Run the fix
fixExamTables().catch(error => {
  console.error('❌ Error during exam tables fix:', error);
  process.exit(1);
});
