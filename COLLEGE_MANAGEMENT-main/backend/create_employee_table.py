"""
Simple script to create employee_master table in Supabase using REST API
"""

import requests
import json

# Supabase configuration
SUPABASE_URL = "https://qkaaoeismqnhjyikgkme.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrYWFvZWlzbXFuaGp5aWtna21lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMwMjU3NCwiZXhwIjoyMDY5ODc4NTc0fQ.L1ZCNGBbQqrRjCI9IrmounuEtwux4yBmhvPBR4vU5Uw"

def create_table_via_sql():
    """Create table using SQL via REST API"""
    
    # SQL to create employee_master table
    sql = """
    CREATE TABLE IF NOT EXISTS employee_master (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        employee_id VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone_number VARCHAR(20),
        role VARCHAR(50) DEFAULT 'Faculty',
        department VARCHAR(100),
        designation VARCHAR(100),
        employee_type VARCHAR(50) DEFAULT 'Faculty',
        joining_date DATE,
        status VARCHAR(20) DEFAULT 'Active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_employee_master_employee_id ON employee_master(employee_id);
    CREATE INDEX IF NOT EXISTS idx_employee_master_email ON employee_master(email);
    CREATE INDEX IF NOT EXISTS idx_employee_master_department ON employee_master(department);
    CREATE INDEX IF NOT EXISTS idx_employee_master_status ON employee_master(status);
    CREATE INDEX IF NOT EXISTS idx_employee_master_role ON employee_master(role);
    """
    
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
    }
    
    # Try to execute SQL via RPC
    try:
        response = requests.post(
            f"{SUPABASE_URL}/rest/v1/rpc/exec_sql",
            headers=headers,
            json={'sql': sql}
        )
        
        if response.status_code == 200:
            print("✅ Employee table created successfully via SQL!")
            return True
        else:
            print(f"❌ SQL execution failed: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Error executing SQL: {str(e)}")
    
    # If SQL fails, we'll need to create it manually via dashboard
    print("\n📝 Please create the table manually in Supabase dashboard:")
    print("1. Go to: https://supabase.com/dashboard/project/qkaaoeismqnhjyikgkme")
    print("2. Navigate to SQL Editor")
    print("3. Paste and execute the following SQL:")
    print("=" * 50)
    print(sql)
    print("=" * 50)
    
    return False

def test_table_exists():
    """Test if employee_master table exists"""
    try:
        headers = {
            'apikey': SUPABASE_KEY,
            'Authorization': f'Bearer {SUPABASE_KEY}'
        }
        
        response = requests.get(
            f"{SUPABASE_URL}/rest/v1/employee_master?limit=1",
            headers=headers
        )
        
        if response.status_code == 200:
            print("✅ Employee table exists and is accessible!")
            return True
        elif response.status_code == 404:
            print("❌ Employee table does not exist")
            return False
        else:
            print(f"❌ Error checking table: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error checking table existence: {str(e)}")
        return False

def main():
    """Main function"""
    print("🔍 Checking if employee_master table exists...")
    
    if test_table_exists():
        print("🎉 Table is ready!")
    else:
        print("🔨 Creating employee_master table...")
        if create_table_via_sql():
            print("✅ Table creation completed!")
        else:
            print("⚠️  Please create the table manually using the SQL provided above")

if __name__ == "__main__":
    main()
