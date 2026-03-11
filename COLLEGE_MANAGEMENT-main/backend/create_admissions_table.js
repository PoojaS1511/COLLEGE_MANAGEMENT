const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdmissionsTable() {
  try {
    console.log('Creating admissions table...');

    // Create the admissions table
    const { data, error } = await supabase.rpc('create_admissions_table', {});

    if (error) {
      console.error('Error creating table via RPC:', error);

      // Fallback: Try direct SQL execution if RPC doesn't exist
      console.log('Attempting direct SQL execution...');

      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS public.admissions (
          id SERIAL PRIMARY KEY,
          application_number VARCHAR(50) UNIQUE NOT NULL,
          full_name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          phone VARCHAR(20),
          date_of_birth DATE,
          gender VARCHAR(20),
          blood_group VARCHAR(10),
          aadhar_number VARCHAR(20),
          religion VARCHAR(50),
          caste VARCHAR(50),
          community VARCHAR(50),
          father_name VARCHAR(255),
          father_phone VARCHAR(20),
          mother_name VARCHAR(255),
          mother_phone VARCHAR(20),
          guardian_name VARCHAR(255),
          annual_income DECIMAL(10,2),
          permanent_address TEXT,
          communication_address TEXT,
          city VARCHAR(100),
          state VARCHAR(100),
          pincode VARCHAR(10),
          tenth_board VARCHAR(255),
          tenth_year INTEGER,
          tenth_marks DECIMAL(5,2),
          twelfth_board VARCHAR(255),
          twelfth_year INTEGER,
          twelfth_marks DECIMAL(5,2),
          group_studied VARCHAR(255),
          medium_of_instruction VARCHAR(255),
          course_id INTEGER REFERENCES public.courses(id),
          shift_preference VARCHAR(20),
          quota_type VARCHAR(50),
          first_graduate BOOLEAN DEFAULT FALSE,
          hostel_required BOOLEAN DEFAULT FALSE,
          transport_required BOOLEAN DEFAULT FALSE,
          status VARCHAR(20) DEFAULT 'pending',
          reviewed_by INTEGER,
          remarks TEXT,
          reviewed_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_admissions_status ON public.admissions(status);
        CREATE INDEX IF NOT EXISTS idx_admissions_course_id ON public.admissions(course_id);
        CREATE INDEX IF NOT EXISTS idx_admissions_email ON public.admissions(email);
        CREATE INDEX IF NOT EXISTS idx_admissions_application_number ON public.admissions(application_number);
        CREATE INDEX IF NOT EXISTS idx_admissions_created_at ON public.admissions(created_at);

        -- Enable Row Level Security
        ALTER TABLE public.admissions ENABLE ROW LEVEL SECURITY;

        -- Create policies for admissions table
        CREATE POLICY "Enable read access for authenticated users" ON public.admissions
          FOR SELECT USING (auth.role() = 'authenticated');

        CREATE POLICY "Enable insert for authenticated users" ON public.admissions
          FOR INSERT WITH CHECK (auth.role() = 'authenticated');

        CREATE POLICY "Enable update for authenticated users" ON public.admissions
          FOR UPDATE USING (auth.role() = 'authenticated');
      `;

      // Note: Direct SQL execution might not be available in all Supabase setups
      // This is a fallback approach
      console.log('Please run the following SQL in your Supabase SQL editor:');
      console.log(createTableSQL);

    } else {
      console.log('Admissions table created successfully via RPC');
    }

    // Verify the table was created
    const { data: verifyData, error: verifyError } = await supabase
      .from('admissions')
      .select('id')
      .limit(1);

    if (verifyError) {
      console.error('Error verifying table creation:', verifyError);
    } else {
      console.log('Admissions table verified successfully');
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the function
createAdmissionsTable().then(() => {
  console.log('Script completed');
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
