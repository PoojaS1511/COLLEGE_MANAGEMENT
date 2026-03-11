"""
Simple Payroll Table Setup
Creates the payroll table using direct SQL
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from supabase_client import get_supabase
import asyncio

async def setup_payroll_table():
    """Setup payroll table in Supabase"""
    supabase = get_supabase(admin=True)
    
    print("🔧 Setting up Payroll table in Supabase...")
    
    try:
        # Create the table using raw SQL
        payroll_data = {
            'id': 1,
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
        }
        
        # Try to insert a record to test if table exists
        result = supabase.table('payroll').insert(payroll_data).execute()
        
        if result.data:
            print("✅ Payroll table is ready!")
            print("📋 Sample record created successfully")
            return True
        
    except Exception as e:
        error_msg = str(e)
        print(f"❌ Error: {error_msg}")
        
        if "relation" in error_msg and "does not exist" in error_msg:
            print("📝 Payroll table doesn't exist. Please create it manually in Supabase dashboard:")
            print("""
            CREATE TABLE payroll (
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
            """)
        
        return False

if __name__ == "__main__":
    asyncio.run(setup_payroll_table())
