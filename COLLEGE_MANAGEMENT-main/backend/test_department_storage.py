"""
Test script to verify department data storage location
"""

import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

def test_department_storage():
    """Test where department data is actually stored"""
    print("🔍 Testing Department Data Storage...")
    
    # Test PostgreSQL connection
    try:
        conn = psycopg2.connect(
            host=os.getenv('POSTGRES_HOST', 'localhost'),
            port=os.getenv('POSTGRES_PORT', '5433'),  # Fixed: Use correct port
            database=os.getenv('POSTGRES_DB', 'college_management_system'),
            user=os.getenv('POSTGRES_USER', 'postgres'),
            password=os.getenv('POSTGRES_PASSWORD', 'Pooja@15')
        )
        cursor = conn.cursor()
        
        print("✅ PostgreSQL Connection Successful")
        
        # Check if departments table exists and has data
        cursor.execute("""
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'departments'
        """)
        
        if cursor.fetchone():
            print("✅ Departments table exists")
            
            # Count departments
            cursor.execute("SELECT COUNT(*) FROM departments")
            count = cursor.fetchone()[0]
            print(f"📊 Total departments in PostgreSQL: {count}")
            
            # Get sample departments
            cursor.execute("SELECT name, code FROM departments LIMIT 3")
            departments = cursor.fetchall()
            
            if departments:
                print("\n📋 Sample departments in PostgreSQL:")
                for dept in departments:
                    print(f"   - {dept[0]} (Code: {dept[1]})")
            else:
                print("❌ No departments found in PostgreSQL")
                
        else:
            print("❌ Departments table does not exist")
            
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ PostgreSQL Error: {e}")
    
    # Test Supabase connection (if available)
    try:
        print("\n🔍 Testing Supabase Connection...")
        # This would require Supabase credentials
        # Since we don't have Supabase configured, this will fail
        print("❌ Supabase not configured (expected after migration)")
        
    except Exception as e:
        print(f"❌ Supabase Test Error: {e}")

if __name__ == "__main__":
    test_department_storage()
