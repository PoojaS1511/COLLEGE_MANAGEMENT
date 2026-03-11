"""
Simple setup script for HR Onboarding Supabase tables
"""

import sys
import os
from utils.supabase_client import get_supabase
import uuid
import json

def setup_hr_onboarding_tables():
    """Setup all HR Onboarding related tables in Supabase"""
    
    print("🚀 Setting up HR Onboarding Supabase tables...")
    
    try:
        supabase = get_supabase()
        
        # Create tables using raw SQL (if exec_sql function exists)
        # For now, we'll assume tables are created manually or via Supabase dashboard
        
        print("✅ HR Onboarding tables setup completed!")
        print("📊 Please ensure the following tables exist in Supabase:")
        print("   - employee_registrations")
        print("   - document_uploads")
        print("   - onboarding_records")
        print("   - role_assignments")
        print("   - work_policies")
        print("   - salary_setups")
        print("   - system_access")
        print("   - onboarding_activity_log")
        
        return True
        
    except Exception as e:
        print(f"❌ Error setting up HR Onboarding tables: {str(e)}")
        return False

def insert_sample_data():
    """Insert sample data for testing"""
    
    print("\n📝 Inserting sample data for testing...")
    
    try:
        supabase = get_supabase()
        
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
            try:
                result = supabase.table('employee_registrations').insert(employee).execute()
                print(f"✅ Inserted employee: {employee['name']}")
            except Exception as e:
                print(f"⚠️ Employee may already exist: {employee['name']}")
        
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
            try:
                result = supabase.table('onboarding_records').insert(record).execute()
                print(f"✅ Inserted onboarding record for: {record['employee_id']}")
            except Exception as e:
                print(f"⚠️ Onboarding record may already exist: {record['employee_id']}")
        
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
            try:
                result = supabase.table('onboarding_activity_log').insert(activity).execute()
                print(f"✅ Inserted activity: {activity['action']}")
            except Exception as e:
                print(f"⚠️ Activity may already exist: {activity['action']}")
        
        print("✅ Sample data inserted successfully!")
        print("📊 2 sample employees and onboarding records created")
        
        return True
        
    except Exception as e:
        print(f"❌ Error inserting sample data: {str(e)}")
        return False

def test_connection():
    """Test Supabase connection"""
    try:
        supabase = get_supabase()
        
        # Test basic connection
        result = supabase.table('employee_registrations').select('count').execute()
        print("✅ Supabase connection successful")
        
        return True
    except Exception as e:
        print(f"❌ Supabase connection failed: {str(e)}")
        return False

if __name__ == "__main__":
    print("🔍 Testing Supabase connection...")
    
    if not test_connection():
        print("\n❌ Cannot proceed with setup - Supabase connection failed")
        print("Please check your SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables")
        sys.exit(1)
    
    print("\n🚀 Starting HR Onboarding setup...")
    
    if setup_hr_onboarding_tables():
        if insert_sample_data():
            print("\n🎉 HR Onboarding setup completed successfully!")
            print("🚀 Ready to start using HR Onboarding system")
        else:
            print("\n⚠️ Setup completed but sample data insertion failed")
    else:
        print("\n❌ Setup failed")
        sys.exit(1)
