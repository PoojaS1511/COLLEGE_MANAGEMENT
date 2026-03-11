"""
Setup script for HR Onboarding Supabase tables
"""

import sys
import os
from supabase import create_client, Client
from dotenv import load_dotenv
import uuid

# Load environment variables
load_dotenv()

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not supabase_url or not supabase_key:
    print("❌ Missing Supabase configuration in environment variables")
    print("Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set")
    sys.exit(1)

supabase: Client = create_client(supabase_url, supabase_key)

def setup_hr_onboarding_tables():
    """Setup all HR Onboarding related tables in Supabase"""
    
    print("🚀 Setting up HR Onboarding Supabase tables...")
    
    try:
        # Create employee_registrations table
        create_employee_registrations_table()
        
        # Create document_uploads table
        create_document_uploads_table()
        
        # Create onboarding_records table
        create_onboarding_records_table()
        
        # Create role_assignments table
        create_role_assignments_table()
        
        # Create work_policies table
        create_work_policies_table()
        
        # Create salary_setups table
        create_salary_setups_table()
        
        # Create system_access table
        create_system_access_table()
        
        # Create onboarding_activity_log table
        create_activity_log_table()
        
        print("\n🎉 All HR Onboarding tables created successfully!")
        print("📊 Supabase is now ready for HR Onboarding operations")
        
    except Exception as e:
        print(f"❌ Error setting up HR Onboarding tables: {str(e)}")
        raise

def create_employee_registrations_table():
    """Create employee_registrations table"""
    print("📋 Creating employee_registrations table...")
    
    sql = """
    CREATE TABLE IF NOT EXISTS employee_registrations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id VARCHAR(20) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        phone VARCHAR(10) NOT NULL,
        type VARCHAR(20) NOT NULL CHECK (type IN ('Faculty', 'Staff')),
        department VARCHAR(100) NOT NULL,
        designation VARCHAR(100) NOT NULL,
        joining_date DATE NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('Faculty', 'Staff', 'Admin')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    """
    
    result = supabase.rpc('exec_sql', {'sql': sql}).execute()
    print("✅ employee_registrations table created successfully")

def create_document_uploads_table():
    """Create document_uploads table"""
    print("📁 Creating document_uploads table...")
    
    sql = """
    CREATE TABLE IF NOT EXISTS document_uploads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id VARCHAR(20) NOT NULL,
        document_type VARCHAR(50) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_size DECIMAL(5,2) NOT NULL,
        file_type VARCHAR(10) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
        uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        verified_at TIMESTAMP WITH TIME ZONE,
        verified_by VARCHAR(100),
        FOREIGN KEY (employee_id) REFERENCES employee_registrations(employee_id)
    );
    """
    
    result = supabase.rpc('exec_sql', {'sql': sql}).execute()
    print("✅ document_uploads table created successfully")

def create_onboarding_records_table():
    """Create onboarding_records table"""
    print("📊 Creating onboarding_records table...")
    
    sql = """
    CREATE TABLE IF NOT EXISTS onboarding_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id VARCHAR(20) UNIQUE NOT NULL,
        status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'active', 'terminated')),
        current_step INTEGER DEFAULT 0,
        completed_steps JSON,
        registration_id UUID,
        role_assignment_id UUID,
        work_policy_id UUID,
        salary_setup_id UUID,
        system_access_id UUID,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        completed_at TIMESTAMP WITH TIME ZONE,
        FOREIGN KEY (employee_id) REFERENCES employee_registrations(employee_id)
    );
    """
    
    result = supabase.rpc('exec_sql', {'sql': sql}).execute()
    print("✅ onboarding_records table created successfully")

def create_role_assignments_table():
    """Create role_assignments table"""
    print("👤 Creating role_assignments table...")
    
    sql = """
    CREATE TABLE IF NOT EXISTS role_assignments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id VARCHAR(20) NOT NULL,
        academic_role VARCHAR(100) NOT NULL,
        reporting_manager VARCHAR(100) NOT NULL,
        department_mapping VARCHAR(100) NOT NULL,
        permissions JSON,
        assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        assigned_by VARCHAR(100) NOT NULL,
        FOREIGN KEY (employee_id) REFERENCES employee_registrations(employee_id)
    );
    """
    
    result = supabase.rpc('exec_sql', {'sql': sql}).execute()
    print("✅ role_assignments table created successfully")

def create_work_policies_table():
    """Create work_policies table"""
    print("📋 Creating work_policies table...")
    
    sql = """
    CREATE TABLE IF NOT EXISTS work_policies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id VARCHAR(20) NOT NULL,
        working_hours JSON,
        shift VARCHAR(20) NOT NULL,
        weekly_off_days JSON,
        probation_period VARCHAR(10) NOT NULL,
        leave_policy JSON,
        effective_from DATE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        FOREIGN KEY (employee_id) REFERENCES employee_registrations(employee_id)
    );
    """
    
    result = supabase.rpc('exec_sql', {'sql': sql}).execute()
    print("✅ work_policies table created successfully")

def create_salary_setups_table():
    """Create salary_setups table"""
    print("💰 Creating salary_setups table...")
    
    sql = """
    CREATE TABLE IF NOT EXISTS salary_setups (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id VARCHAR(20) NOT NULL,
        earnings JSON,
        deductions JSON,
        basic_salary DECIMAL(10,2) NOT NULL,
        hra DECIMAL(10,2) NOT NULL,
        total_earnings DECIMAL(10,2) NOT NULL,
        total_deductions DECIMAL(10,2) NOT NULL,
        net_salary DECIMAL(10,2) NOT NULL,
        effective_from DATE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        FOREIGN KEY (employee_id) REFERENCES employee_registrations(employee_id)
    );
    """
    
    result = supabase.rpc('exec_sql', {'sql': sql}).execute()
    print("✅ salary_setups table created successfully")

def create_system_access_table():
    """Create system_access table"""
    print("🔐 Creating system_access table...")
    
    sql = """
    CREATE TABLE IF NOT EXISTS system_access (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id VARCHAR(20) NOT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        temporary_password BOOLEAN DEFAULT TRUE,
        modules JSON,
        send_welcome_email BOOLEAN DEFAULT TRUE,
        is_active BOOLEAN DEFAULT FALSE,
        activated_at TIMESTAMP WITH TIME ZONE,
        activated_by VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        FOREIGN KEY (employee_id) REFERENCES employee_registrations(employee_id)
    );
    """
    
    result = supabase.rpc('exec_sql', {'sql': sql}).execute()
    print("✅ system_access table created successfully")

def create_activity_log_table():
    """Create onboarding_activity_log table"""
    print("📝 Creating onboarding_activity_log table...")
    
    sql = """
    CREATE TABLE IF NOT EXISTS onboarding_activity_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id VARCHAR(20) NOT NULL,
        action VARCHAR(100) NOT NULL,
        description TEXT,
        status VARCHAR(20) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_by VARCHAR(100),
        FOREIGN KEY (employee_id) REFERENCES employee_registrations(employee_id)
    );
    """
    
    result = supabase.rpc('exec_sql', {'sql': sql}).execute()
    print("✅ onboarding_activity_log table created successfully")

def insert_sample_data():
    """Insert sample data for testing"""
    
    print("\n📝 Inserting sample data for testing...")
    
    try:
        # Sample employee registrations
        employees = [
            {
                'id': str(uuid.uuid4()),
                'employee_id': 'EMP20241001',
                'name': 'John Smith',
                'email': 'john.smith@college.edu',
                'phone': '9876543210',
                'type': 'Faculty',
                'department': 'Computer Science',
                'designation': 'Assistant Professor',
                'joining_date': '2024-01-15',
                'role': 'Faculty'
            },
            {
                'id': str(uuid.uuid4()),
                'employee_id': 'EMP20241002',
                'name': 'Sarah Johnson',
                'email': 'sarah.johnson@college.edu',
                'phone': '9876543211',
                'type': 'Staff',
                'department': 'Human Resources',
                'designation': 'HR Manager',
                'joining_date': '2024-01-20',
                'role': 'Staff'
            }
        ]
        
        for employee in employees:
            result = supabase.table('employee_registrations').insert(employee).execute()
        
        # Sample onboarding records
        onboarding_records = [
            {
                'id': str(uuid.uuid4()),
                'employee_id': 'EMP20241001',
                'status': 'completed',
                'current_step': 6,
                'completed_steps': [0, 1, 2, 3, 4, 5, 6]
            },
            {
                'id': str(uuid.uuid4()),
                'employee_id': 'EMP20241002',
                'status': 'in_progress',
                'current_step': 2,
                'completed_steps': [0, 1, 2]
            }
        ]
        
        for record in onboarding_records:
            result = supabase.table('onboarding_records').insert(record).execute()
        
        # Sample activity log
        activities = [
            {
                'id': str(uuid.uuid4()),
                'employee_id': 'EMP20241001',
                'action': 'Completed Registration',
                'description': 'Employee registration completed successfully',
                'status': 'completed',
                'created_by': 'admin'
            },
            {
                'id': str(uuid.uuid4()),
                'employee_id': 'EMP20241002',
                'action': 'Started Document Upload',
                'description': 'Document upload process initiated',
                'status': 'in_progress',
                'created_by': 'hr_manager'
            }
        ]
        
        for activity in activities:
            result = supabase.table('onboarding_activity_log').insert(activity).execute()
        
        print("✅ Sample data inserted successfully!")
        print("📊 2 sample employees and onboarding records created")
        
    except Exception as e:
        print(f"❌ Error inserting sample data: {str(e)}")
        raise

if __name__ == "__main__":
    try:
        setup_hr_onboarding_tables()
        insert_sample_data()
        print("\n🎉 HR Onboarding Supabase setup completed successfully!")
        print("🚀 Ready to start using HR Onboarding system")
    except Exception as e:
        print(f"\n❌ Setup failed: {str(e)}")
        sys.exit(1)
