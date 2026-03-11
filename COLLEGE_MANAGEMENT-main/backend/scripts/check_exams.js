import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

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

async function checkExams() {
  try {
    console.log('🔍 Checking exams table...');
    
    // Check if exams table exists and get some data
    const { data: exams, error: fetchError } = await supabase
      .from('exams')
      .select('*')
      .limit(5);
    
    if (fetchError) {
      if (fetchError.code === '42P01') { // Table does not exist
        console.error('❌ Exams table does not exist. Please run the database setup script first.');
        process.exit(1);
      }
      throw fetchError;
    }
    
    console.log('✅ Exams table exists');
    
    if (fetchError) throw fetchError;
    
    if (exams.length === 0) {
      console.log('ℹ️ No exams found in the database. The table is empty.');
      console.log('   You may want to add some exam data through the admin panel or run a seed script.');
    } else {
      console.log('📋 Found exams:', exams);
    }
    
    // Check RLS policies
    console.log('\n🔒 Checking RLS policies...');
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'exams');
    
    if (policiesError) throw policiesError;
    
    if (policies.length === 0) {
      console.warn('⚠️  No RLS policies found for the exams table.');
      console.log('   You may want to enable RLS and create appropriate policies.');
    } else {
      console.log('✅ RLS policies for exams table:', policies);
    }
    
  } catch (error) {
    console.error('❌ Error checking exams:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

checkExams();
