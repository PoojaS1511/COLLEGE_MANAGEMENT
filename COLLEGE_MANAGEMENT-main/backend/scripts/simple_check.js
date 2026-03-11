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
    
    // Try to get column information
    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .limit(1);
    
    if (error) throw error;
    
    console.log('✅ Exams table exists with columns:', Object.keys(data[0] || {}));
    
    // Get some sample data
    const { data: exams, error: fetchError } = await supabase
      .from('exams')
      .select('*')
      .limit(5);
    
    if (fetchError) throw fetchError;
    
    console.log('\n📋 Sample exam data:');
    console.table(exams);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

checkExams();
