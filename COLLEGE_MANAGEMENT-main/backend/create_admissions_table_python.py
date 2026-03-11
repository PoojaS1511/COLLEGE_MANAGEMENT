#!/usr/bin/env python3
"""
Create the admissions table in Supabase using Python client
"""
import os
import sys
from supabase_client import get_supabase

def create_admissions_table():
    try:
        supabase = get_supabase()

        # First, check if table already exists
        try:
            response = supabase.table('admissions').select('id', count='exact').limit(1).execute()
            print("✅ Admissions table already exists!")
            print(f"   Current record count: {response.count}")
            return True
        except Exception as e:
            if "relation" in str(e).lower() and "does not exist" in str(e).lower():
                print("❌ Admissions table does not exist, creating it...")
            else:
                print(f"❌ Unexpected error checking table: {str(e)}")
                return False

        # Create the table using raw SQL
        create_table_sql = """
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
        """

        # Execute the CREATE TABLE statement
        # Note: This might not work if RPC is not set up, but let's try
        try:
            # Try using rpc if available
            result = supabase.rpc('exec_sql', {'sql': create_table_sql}).execute()
            print("✅ Table created successfully via RPC")
        except Exception as rpc_error:
            print(f"❌ RPC method failed: {str(rpc_error)}")
            print("📝 Please run the following SQL manually in your Supabase SQL Editor:")
            print(create_table_sql)
            return False

        # Create indexes
        index_sqls = [
            "CREATE INDEX IF NOT EXISTS idx_admissions_status ON public.admissions(status);",
            "CREATE INDEX IF NOT EXISTS idx_admissions_course_id ON public.admissions(course_id);",
            "CREATE INDEX IF NOT EXISTS idx_admissions_email ON public.admissions(email);",
            "CREATE INDEX IF NOT EXISTS idx_admissions_application_number ON public.admissions(application_number);",
            "CREATE INDEX IF NOT EXISTS idx_admissions_created_at ON public.admissions(created_at);"
        ]

        for index_sql in index_sqls:
            try:
                supabase.rpc('exec_sql', {'sql': index_sql}).execute()
                print("✅ Index created")
            except Exception as index_error:
                print(f"⚠️  Index creation failed: {str(index_error)}")

        # Enable RLS
        rls_sql = "ALTER TABLE public.admissions ENABLE ROW LEVEL SECURITY;"
        try:
            supabase.rpc('exec_sql', {'sql': rls_sql}).execute()
            print("✅ RLS enabled")
        except Exception as rls_error:
            print(f"⚠️  RLS enable failed: {str(rls_error)}")

        # Create policies
        policies = [
            """CREATE POLICY "Enable read access for authenticated users" ON public.admissions FOR SELECT USING (auth.role() = 'authenticated');""",
            """CREATE POLICY "Enable insert for authenticated users" ON public.admissions FOR INSERT WITH CHECK (auth.role() = 'authenticated');""",
            """CREATE POLICY "Enable update for authenticated users" ON public.admissions FOR UPDATE USING (auth.role() = 'authenticated');"""
        ]

        for policy_sql in policies:
            try:
                supabase.rpc('exec_sql', {'sql': policy_sql}).execute()
                print("✅ Policy created")
            except Exception as policy_error:
                print(f"⚠️  Policy creation failed: {str(policy_error)}")

        # Verify table creation
        try:
            verify_response = supabase.table('admissions').select('id', count='exact').limit(1).execute()
            print("✅ Admissions table created and verified successfully!")
            print(f"   Record count: {verify_response.count}")
            return True
        except Exception as verify_error:
            print(f"❌ Table verification failed: {str(verify_error)}")
            return False

    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")
        return False

if __name__ == "__main__":
    success = create_admissions_table()
    sys.exit(0 if success else 1)
