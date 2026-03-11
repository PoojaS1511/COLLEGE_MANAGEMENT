"""
Setup script for HR Onboarding database tables
"""

import sys
import os

# Add the parent directory to the path to import from models
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models.hr_onboarding import EmployeeRegistrationDB, DocumentUploadDB, OnboardingRecordDB
from utils.database import DatabaseConnection

def setup_hr_onboarding_tables():
    """Setup all HR Onboarding related tables"""
    
    print("🚀 Setting up HR Onboarding database tables...")
    
    try:
        # Initialize database connection
        db = DatabaseConnection()
        
        # Initialize models
        employee_reg_model = EmployeeRegistrationDB(db)
        document_model = DocumentUploadDB(db)
        onboarding_model = OnboardingRecordDB(db)
        
        # Create tables
        print("📋 Creating employee_registrations table...")
        employee_reg_model.create_table()
        print("✅ employee_registrations table created successfully")
        
        print("📁 Creating document_uploads table...")
        document_model.create_table()
        print("✅ document_uploads table created successfully")
        
        print("📊 Creating onboarding_records table...")
        onboarding_model.create_table()
        print("✅ onboarding_records table created successfully")
        
        # Create additional tables for role assignment, work policy, salary setup, system access
        create_additional_tables(db)
        
        print("\n🎉 All HR Onboarding tables created successfully!")
        print("📊 Database is now ready for HR Onboarding operations")
        
    except Exception as e:
        print(f"❌ Error setting up HR Onboarding tables: {str(e)}")
        raise

def create_additional_tables(db):
    """Create additional tables for role assignment, work policy, salary setup, and system access"""
    
    # Role Assignment Table
    role_assignment_query = """
    CREATE TABLE IF NOT EXISTS role_assignments (
        id VARCHAR(36) PRIMARY KEY,
        employee_id VARCHAR(20) NOT NULL,
        academic_role VARCHAR(100) NOT NULL,
        reporting_manager VARCHAR(100) NOT NULL,
        department_mapping VARCHAR(100) NOT NULL,
        permissions JSON,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        assigned_by VARCHAR(100) NOT NULL,
        FOREIGN KEY (employee_id) REFERENCES employee_registrations(employee_id)
    )
    """
    db.execute_query(role_assignment_query)
    print("✅ role_assignments table created successfully")
    
    # Work Policy Table
    work_policy_query = """
    CREATE TABLE IF NOT EXISTS work_policies (
        id VARCHAR(36) PRIMARY KEY,
        employee_id VARCHAR(20) NOT NULL,
        working_hours JSON,
        shift VARCHAR(20) NOT NULL,
        weekly_off_days JSON,
        probation_period VARCHAR(10) NOT NULL,
        leave_policy JSON,
        effective_from DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employee_registrations(employee_id)
    )
    """
    db.execute_query(work_policy_query)
    print("✅ work_policies table created successfully")
    
    # Salary Setup Table
    salary_setup_query = """
    CREATE TABLE IF NOT EXISTS salary_setups (
        id VARCHAR(36) PRIMARY KEY,
        employee_id VARCHAR(20) NOT NULL,
        earnings JSON,
        deductions JSON,
        basic_salary DECIMAL(10,2) NOT NULL,
        hra DECIMAL(10,2) NOT NULL,
        total_earnings DECIMAL(10,2) NOT NULL,
        total_deductions DECIMAL(10,2) NOT NULL,
        net_salary DECIMAL(10,2) NOT NULL,
        effective_from DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employee_registrations(employee_id)
    )
    """
    db.execute_query(salary_setup_query)
    print("✅ salary_setups table created successfully")
    
    # System Access Table
    system_access_query = """
    CREATE TABLE IF NOT EXISTS system_access (
        id VARCHAR(36) PRIMARY KEY,
        employee_id VARCHAR(20) NOT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        temporary_password BOOLEAN DEFAULT TRUE,
        modules JSON,
        send_welcome_email BOOLEAN DEFAULT TRUE,
        is_active BOOLEAN DEFAULT FALSE,
        activated_at TIMESTAMP NULL,
        activated_by VARCHAR(100) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employee_registrations(employee_id)
    )
    """
    db.execute_query(system_access_query)
    print("✅ system_access table created successfully")
    
    # Dashboard Activity Log Table
    activity_log_query = """
    CREATE TABLE IF NOT EXISTS onboarding_activity_log (
        id VARCHAR(36) PRIMARY KEY,
        employee_id VARCHAR(20) NOT NULL,
        action VARCHAR(100) NOT NULL,
        description TEXT,
        status VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by VARCHAR(100),
        FOREIGN KEY (employee_id) REFERENCES employee_registrations(employee_id)
    )
    """
    db.execute_query(activity_log_query)
    print("✅ onboarding_activity_log table created successfully")

def insert_sample_data():
    """Insert sample data for testing"""
    
    print("\n📝 Inserting sample data for testing...")
    
    try:
        db = DatabaseConnection()
        
        # Sample employee registration
        employee_query = """
        INSERT INTO employee_registrations 
        (id, employee_id, name, email, phone, type, department, designation, joining_date, role)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        import uuid
        sample_employees = [
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
        
        for employee in sample_employees:
            db.execute_query(employee_query, (
                employee['id'],
                employee['employee_id'],
                employee['name'],
                employee['email'],
                employee['phone'],
                employee['type'],
                employee['department'],
                employee['designation'],
                employee['joining_date'],
                employee['role']
            ))
        
        # Sample onboarding records
        onboarding_query = """
        INSERT INTO onboarding_records 
        (id, employee_id, status, current_step, completed_steps)
        VALUES (%s, %s, %s, %s, %s)
        """
        
        import json
        sample_onboarding = [
            {
                'id': str(uuid.uuid4()),
                'employee_id': 'EMP20241001',
                'status': 'completed',
                'current_step': 6,
                'completed_steps': json.dumps([0, 1, 2, 3, 4, 5, 6])
            },
            {
                'id': str(uuid.uuid4()),
                'employee_id': 'EMP20241002',
                'status': 'in_progress',
                'current_step': 2,
                'completed_steps': json.dumps([0, 1, 2])
            }
        ]
        
        for record in sample_onboarding:
            db.execute_query(onboarding_query, (
                record['id'],
                record['employee_id'],
                record['status'],
                record['current_step'],
                record['completed_steps']
            ))
        
        # Sample activity log
        activity_query = """
        INSERT INTO onboarding_activity_log 
        (id, employee_id, action, description, status, created_by)
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        
        sample_activities = [
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
        
        for activity in sample_activities:
            db.execute_query(activity_query, (
                activity['id'],
                activity['employee_id'],
                activity['action'],
                activity['description'],
                activity['status'],
                activity['created_by']
            ))
        
        print("✅ Sample data inserted successfully!")
        print("📊 2 sample employees and onboarding records created")
        
    except Exception as e:
        print(f"❌ Error inserting sample data: {str(e)}")
        raise

if __name__ == "__main__":
    try:
        setup_hr_onboarding_tables()
        insert_sample_data()
        print("\n🎉 HR Onboarding database setup completed successfully!")
        print("🚀 Ready to start using HR Onboarding system")
    except Exception as e:
        print(f"\n❌ Setup failed: {str(e)}")
        sys.exit(1)
