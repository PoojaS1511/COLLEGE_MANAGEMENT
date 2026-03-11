"""
Setup script for Payroll tables in Supabase
Creates the payroll table with proper schema and indexes
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from supabase_client import get_supabase
import asyncio

async def setup_payroll_tables():
    """Setup payroll tables in Supabase"""
    supabase = get_supabase(admin=True)
    
    print("🔧 Setting up Payroll tables in Supabase...")
    
    # Create payroll table
    payroll_table_sql = """
    CREATE TABLE IF NOT EXISTS payroll (
        id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        faculty_id UUID NOT NULL,
        pay_month DATE NOT NULL,
        total_days INTEGER DEFAULT 0,
        present_days INTEGER DEFAULT 0,
        absent_days INTEGER DEFAULT 0,
        basic_salary NUMERIC(12,2) DEFAULT 0.00,
        deductions NUMERIC(12,2) DEFAULT 0.00,
        net_salary NUMERIC(12,2) DEFAULT 0.00,
        status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Paid')),
        role TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        CONSTRAINT unique_faculty_month UNIQUE (faculty_id, pay_month)
    );
    """
    
    # Create indexes for better performance
    indexes_sql = [
        "CREATE INDEX IF NOT EXISTS idx_payroll_faculty_id ON payroll(faculty_id);",
        "CREATE INDEX IF NOT EXISTS idx_payroll_pay_month ON payroll(pay_month);",
        "CREATE INDEX IF NOT EXISTS idx_payroll_status ON payroll(status);",
        "CREATE INDEX IF NOT EXISTS idx_payroll_role ON payroll(role);",
        "CREATE INDEX IF NOT EXISTS idx_payroll_faculty_month ON payroll(faculty_id, pay_month);"
    ]
    
    # Enable RLS (Row Level Security)
    rls_sql = """
    ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;
    
    -- Create policies for different roles
    CREATE POLICY "HR can view all payroll records" ON payroll
        FOR SELECT USING (
            auth.jwt() ->> 'role' = 'HR'
        );
    
    CREATE POLICY "HR can insert payroll records" ON payroll
        FOR INSERT WITH CHECK (
            auth.jwt() ->> 'role' = 'HR'
        );
    
    CREATE POLICY "HR can update payroll records" ON payroll
        FOR UPDATE USING (
            auth.jwt() ->> 'role' = 'HR'
        );
    
    CREATE POLICY "Faculty can view own payroll records" ON payroll
        FOR SELECT USING (
            auth.jwt() ->> 'faculty_id' = faculty_id::text
        );
    """
    
    try:
        # Execute table creation
        print("📊 Creating payroll table...")
        result = supabase.rpc('execute_sql', {'sql': payroll_table_sql}).execute()
        
        # Execute indexes
        print("📈 Creating indexes...")
        for index_sql in indexes_sql:
            supabase.rpc('execute_sql', {'sql': index_sql}).execute()
        
        # Enable RLS
        print("🔒 Enabling Row Level Security...")
        supabase.rpc('execute_sql', {'sql': rls_sql}).execute()
        
        print("✅ Payroll tables setup completed successfully!")
        print("📋 Table schema:")
        print("   - id (BIGINT, Primary Key)")
        print("   - faculty_id (UUID, NOT NULL)")
        print("   - pay_month (DATE, NOT NULL)")
        print("   - total_days (INTEGER, DEFAULT 0)")
        print("   - present_days (INTEGER, DEFAULT 0)")
        print("   - absent_days (INTEGER, DEFAULT 0)")
        print("   - basic_salary (NUMERIC(12,2), DEFAULT 0.00)")
        print("   - deductions (NUMERIC(12,2), DEFAULT 0.00)")
        print("   - net_salary (NUMERIC(12,2), DEFAULT 0.00)")
        print("   - status (TEXT, DEFAULT 'Pending')")
        print("   - role (TEXT)")
        print("   - created_at (TIMESTAMP, DEFAULT NOW())")
        
    except Exception as e:
        print(f"❌ Error setting up payroll tables: {str(e)}")
        return False
    
    return True

async def insert_sample_data():
    """Insert sample payroll data for testing"""
    supabase = get_supabase(admin=True)
    
    print("\n📝 Inserting sample payroll data...")
    
    sample_data = [
        {
            'faculty_id': '550e8400-e29b-41d4-a716-446655440001',
            'pay_month': '2025-01-01',
            'total_days': 22,
            'present_days': 20,
            'absent_days': 2,
            'basic_salary': 50000.00,
            'deductions': 2500.00,
            'net_salary': 47500.00,
            'status': 'Pending',
            'role': 'Professor'
        },
        {
            'faculty_id': '550e8400-e29b-41d4-a716-446655440002',
            'pay_month': '2025-01-01',
            'total_days': 22,
            'present_days': 22,
            'absent_days': 0,
            'basic_salary': 45000.00,
            'deductions': 2250.00,
            'net_salary': 42750.00,
            'status': 'Approved',
            'role': 'Associate Professor'
        },
        {
            'faculty_id': '550e8400-e29b-41d4-a716-446655440003',
            'pay_month': '2025-01-01',
            'total_days': 22,
            'present_days': 18,
            'absent_days': 4,
            'basic_salary': 40000.00,
            'deductions': 3000.00,
            'net_salary': 37000.00,
            'status': 'Paid',
            'role': 'Assistant Professor'
        }
    ]
    
    try:
        for data in sample_data:
            result = supabase.table('payroll').insert(data).execute()
            print(f"✅ Inserted payroll record for faculty {data['faculty_id']}")
        
        print(f"✅ Successfully inserted {len(sample_data)} sample payroll records")
        
    except Exception as e:
        print(f"❌ Error inserting sample data: {str(e)}")
        return False
    
    return True

async def main():
    """Main setup function"""
    print("🚀 Starting Payroll Module Setup")
    print("=" * 50)
    
    # Setup tables
    if await setup_payroll_tables():
        # Insert sample data
        await insert_sample_data()
        print("\n🎉 Payroll module setup completed successfully!")
    else:
        print("\n💥 Payroll module setup failed!")

if __name__ == "__main__":
    asyncio.run(main())
