"""
Setup Employee Onboarding Tables in Supabase
Creates all necessary tables for the employee management system
"""

import os
import sys
from supabase import create_client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

def setup_employee_tables():
    """Create all employee onboarding tables in Supabase"""
    
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("❌ Supabase credentials not found in environment variables")
        return False
    
    try:
        # Initialize Supabase client
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        print("🔧 Setting up employee onboarding tables...")
        
        # 1. Employee Master Table
        print("\n📋 Creating employee_master table...")
        employee_master_sql = """
        CREATE TABLE IF NOT EXISTS employee_master (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            employee_id VARCHAR(20) UNIQUE NOT NULL,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            phone_number VARCHAR(20),
            role VARCHAR(50) NOT NULL CHECK (role IN ('Faculty', 'Staff', 'Admin')),
            department VARCHAR(100) NOT NULL,
            designation VARCHAR(100) NOT NULL,
            employee_type VARCHAR(20) NOT NULL CHECK (employee_type IN ('Faculty', 'Staff')),
            joining_date DATE NOT NULL,
            status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'OnLeave')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_by UUID REFERENCES employee_master(id)
        );
        """
        
        result = supabase.rpc('execute_sql', {'sql': employee_master_sql}).execute()
        print("✅ employee_master table created successfully")
        
        # 2. Employee Documents Table
        print("\n📁 Creating employee_documents table...")
        employee_documents_sql = """
        CREATE TABLE IF NOT EXISTS employee_documents (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            employee_id UUID NOT NULL REFERENCES employee_master(id) ON DELETE CASCADE,
            doc_type VARCHAR(50) NOT NULL CHECK (doc_type IN ('Aadhaar', 'PAN', 'Educational_Certificate', 'Appointment_Letter', 'Experience_Certificate', 'Resume', 'Photo')),
            doc_name VARCHAR(255) NOT NULL,
            doc_url TEXT NOT NULL,
            file_size INTEGER,
            upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            uploaded_by UUID REFERENCES employee_master(id)
        );
        """
        
        result = supabase.rpc('execute_sql', {'sql': employee_documents_sql}).execute()
        print("✅ employee_documents table created successfully")
        
        # 3. Salary Structure Table
        print("\n💰 Creating salary_structure table...")
        salary_structure_sql = """
        CREATE TABLE IF NOT EXISTS salary_structure (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            employee_id UUID NOT NULL REFERENCES employee_master(id) ON DELETE CASCADE,
            basic_pay DECIMAL(12,2) NOT NULL,
            hra DECIMAL(12,2) DEFAULT 0,
            da DECIMAL(12,2) DEFAULT 0,
            allowances DECIMAL(12,2) DEFAULT 0,
            pf_deduction DECIMAL(12,2) DEFAULT 0,
            tax_deduction DECIMAL(12,2) DEFAULT 0,
            other_deductions DECIMAL(12,2) DEFAULT 0,
            net_salary DECIMAL(12,2) GENERATED ALWAYS AS (
                basic_pay + hra + da + allowances - pf_deduction - tax_deduction - other_deductions
            ) STORED,
            effective_from DATE NOT NULL,
            effective_to DATE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_by UUID REFERENCES employee_master(id)
        );
        """
        
        result = supabase.rpc('execute_sql', {'sql': salary_structure_sql}).execute()
        print("✅ salary_structure table created successfully")
        
        # 4. Leave Policy Mapping Table
        print("\n🏖️ Creating leave_policy_mapping table...")
        leave_policy_sql = """
        CREATE TABLE IF NOT EXISTS leave_policy_mapping (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            employee_id UUID NOT NULL REFERENCES employee_master(id) ON DELETE CASCADE,
            academic_year VARCHAR(20) NOT NULL,
            casual_leave_total INTEGER DEFAULT 12,
            casual_leave_used INTEGER DEFAULT 0,
            sick_leave_total INTEGER DEFAULT 10,
            sick_leave_used INTEGER DEFAULT 0,
            earned_leave_total INTEGER DEFAULT 15,
            earned_leave_used INTEGER DEFAULT 0,
            probation_end_date DATE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(employee_id, academic_year)
        );
        """
        
        result = supabase.rpc('execute_sql', {'sql': leave_policy_sql}).execute()
        print("✅ leave_policy_mapping table created successfully")
        
        # 5. Work Policy Table
        print("\n⏰ Creating work_policy table...")
        work_policy_sql = """
        CREATE TABLE IF NOT EXISTS work_policy (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            employee_id UUID NOT NULL REFERENCES employee_master(id) ON DELETE CASCADE,
            work_start_time TIME DEFAULT '09:00:00',
            work_end_time TIME DEFAULT '16:00:00',
            weekly_off_days TEXT[] DEFAULT ARRAY['Sunday'],
            lunch_break_start TIME DEFAULT '13:00:00',
            lunch_break_end TIME DEFAULT '14:00:00',
            flexible_timings BOOLEAN DEFAULT false,
            remote_work_allowed BOOLEAN DEFAULT false,
            effective_from DATE NOT NULL,
            effective_to DATE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_by UUID REFERENCES employee_master(id)
        );
        """
        
        result = supabase.rpc('execute_sql', {'sql': work_policy_sql}).execute()
        print("✅ work_policy table created successfully")
        
        # 6. Employee Login Credentials Table
        print("\n🔐 Creating employee_credentials table...")
        employee_credentials_sql = """
        CREATE TABLE IF NOT EXISTS employee_credentials (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            employee_id UUID NOT NULL REFERENCES employee_master(id) ON DELETE CASCADE,
            username VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            email_verified BOOLEAN DEFAULT false,
            last_login TIMESTAMP WITH TIME ZONE,
            password_changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            account_locked BOOLEAN DEFAULT false,
            login_attempts INTEGER DEFAULT 0,
            temporary_password BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        """
        
        result = supabase.rpc('execute_sql', {'sql': employee_credentials_sql}).execute()
        print("✅ employee_credentials table created successfully")
        
        # 7. Department Table (for reference)
        print("\n🏢 Creating departments table...")
        departments_sql = """
        CREATE TABLE IF NOT EXISTS departments (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            name VARCHAR(100) UNIQUE NOT NULL,
            code VARCHAR(10) UNIQUE NOT NULL,
            hod_id UUID REFERENCES employee_master(id),
            description TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        INSERT INTO departments (name, code, description) VALUES
        ('Computer Science Engineering', 'CSE', 'Department of Computer Science and Engineering'),
        ('Electronics and Communication', 'ECE', 'Department of Electronics and Communication Engineering'),
        ('Mechanical Engineering', 'ME', 'Department of Mechanical Engineering'),
        ('Civil Engineering', 'CE', 'Department of Civil Engineering'),
        ('Electrical Engineering', 'EE', 'Department of Electrical Engineering'),
        ('Human Resources', 'HR', 'Human Resources Department'),
        ('Administration', 'ADMIN', 'General Administration'),
        ('Finance', 'FIN', 'Finance and Accounts Department')
        ON CONFLICT (code) DO NOTHING;
        """
        
        result = supabase.rpc('execute_sql', {'sql': departments_sql}).execute()
        print("✅ departments table created successfully")
        
        # 8. Designation Table (for reference)
        print("\n👔 Creating designations table...")
        designations_sql = """
        CREATE TABLE IF NOT EXISTS designations (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            title VARCHAR(100) UNIQUE NOT NULL,
            category VARCHAR(20) NOT NULL CHECK (category IN ('Faculty', 'Staff', 'Admin')),
            level INTEGER,
            description TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        INSERT INTO designations (title, category, level, description) VALUES
        ('Professor', 'Faculty', 1, 'Senior Faculty Position'),
        ('Associate Professor', 'Faculty', 2, 'Mid-level Faculty Position'),
        ('Assistant Professor', 'Faculty', 3, 'Junior Faculty Position'),
        ('Lecturer', 'Faculty', 4, 'Entry-level Faculty Position'),
        ('Lab Assistant', 'Staff', 1, 'Laboratory Support Staff'),
        ('Office Assistant', 'Staff', 2, 'Administrative Support Staff'),
        ('Accountant', 'Staff', 3, 'Finance Department Staff'),
        ('HR Manager', 'Admin', 1, 'Human Resources Manager'),
        ('System Administrator', 'Admin', 2, 'IT System Administrator'),
        ('Principal', 'Admin', 1, 'Head of Institution')
        ON CONFLICT (title) DO NOTHING;
        """
        
        result = supabase.rpc('execute_sql', {'sql': designations_sql}).execute()
        print("✅ designations table created successfully")
        
        # Create Indexes for better performance
        print("\n📊 Creating indexes...")
        indexes_sql = """
        CREATE INDEX IF NOT EXISTS idx_employee_master_email ON employee_master(email);
        CREATE INDEX IF NOT EXISTS idx_employee_master_employee_id ON employee_master(employee_id);
        CREATE INDEX IF NOT EXISTS idx_employee_master_department ON employee_master(department);
        CREATE INDEX IF NOT EXISTS idx_employee_master_status ON employee_master(status);
        CREATE INDEX IF NOT EXISTS idx_employee_documents_employee_id ON employee_documents(employee_id);
        CREATE INDEX IF NOT EXISTS idx_salary_structure_employee_id ON salary_structure(employee_id);
        CREATE INDEX IF NOT EXISTS idx_leave_policy_employee_id ON leave_policy_mapping(employee_id);
        CREATE INDEX IF NOT EXISTS idx_work_policy_employee_id ON work_policy(employee_id);
        CREATE INDEX IF NOT EXISTS idx_employee_credentials_employee_id ON employee_credentials(employee_id);
        CREATE INDEX IF NOT EXISTS idx_employee_credentials_username ON employee_credentials(username);
        """
        
        result = supabase.rpc('execute_sql', {'sql': indexes_sql}).execute()
        print("✅ Indexes created successfully")
        
        # Enable Row Level Security (RLS)
        print("\n🔒 Enabling Row Level Security...")
        rls_sql = """
        ALTER TABLE employee_master ENABLE ROW LEVEL SECURITY;
        ALTER TABLE employee_documents ENABLE ROW LEVEL SECURITY;
        ALTER TABLE salary_structure ENABLE ROW LEVEL SECURITY;
        ALTER TABLE leave_policy_mapping ENABLE ROW LEVEL SECURITY;
        ALTER TABLE work_policy ENABLE ROW LEVEL SECURITY;
        ALTER TABLE employee_credentials ENABLE ROW LEVEL SECURITY;
        """
        
        result = supabase.rpc('execute_sql', {'sql': rls_sql}).execute()
        print("✅ Row Level Security enabled")
        
        print("\n🎉 Employee onboarding tables setup completed successfully!")
        print("\n📋 Tables created:")
        print("  • employee_master - Main employee information")
        print("  • employee_documents - Document storage")
        print("  • salary_structure - Salary details")
        print("  • leave_policy_mapping - Leave policies")
        print("  • work_policy - Work schedule and policies")
        print("  • employee_credentials - Login credentials")
        print("  • departments - Department reference")
        print("  • designations - Designation reference")
        
        return True
        
    except Exception as e:
        print(f"❌ Error setting up employee tables: {str(e)}")
        return False

def verify_tables():
    """Verify that all tables were created successfully"""
    
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        tables_to_check = [
            'employee_master',
            'employee_documents', 
            'salary_structure',
            'leave_policy_mapping',
            'work_policy',
            'employee_credentials',
            'departments',
            'designations'
        ]
        
        print("\n🔍 Verifying table creation...")
        
        for table in tables_to_check:
            try:
                result = supabase.table(table).select('count', count='exact').execute()
                count = result.count if hasattr(result, 'count') else 0
                print(f"  ✅ {table}: {count} records")
            except Exception as e:
                print(f"  ❌ {table}: Error - {str(e)}")
        
        print("\n✅ Table verification completed")
        
    except Exception as e:
        print(f"❌ Error verifying tables: {str(e)}")

if __name__ == "__main__":
    print("🚀 Starting Employee Onboarding Database Setup")
    print("=" * 50)
    
    success = setup_employee_tables()
    
    if success:
        verify_tables()
        print("\n🎯 Setup completed successfully!")
    else:
        print("\n💥 Setup failed. Please check the error messages above.")
        sys.exit(1)
