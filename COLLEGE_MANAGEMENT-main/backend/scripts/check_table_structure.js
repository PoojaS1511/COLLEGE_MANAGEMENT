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

async function checkTableStructure() {
  try {
    console.log('🔍 Checking exams table structure...');
    
    // Get table structure using a direct query
    const { data: columns, error } = await supabase.rpc('get_table_columns', { 
      table_name: 'exams' 
    });
    
    if (error) throw error;
    
    console.log('📋 Exams table structure:');
    console.table(columns);
    
    // Check RLS status
    const { data: rlsStatus, error: rlsError } = await supabase.rpc('get_rls_status', { 
      table_name: 'exams' 
    });
    
    if (rlsError) throw rlsError;
    
    console.log('\n🔒 RLS Status:');
    console.table(rlsStatus);
    
  } catch (error) {
    console.error('❌ Error checking table structure:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

checkTableStructure();
