#!/usr/bin/env python3
"""
Supabase Connection Test for transport_students table
"""
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from supabase_client import get_supabase
import json

def test_supabase_connection():
    """Test Supabase connection and transport_students table"""
    print("🔍 Testing Supabase Connection...")
    
    try:
        # Get Supabase client
        supabase = get_supabase()
        print("✅ Supabase client initialized successfully")
        
        # Test basic connection by checking transport_students table directly
        print("\n📋 Testing basic connection...")
        result = supabase.table('transport_students').select('id').limit(1).execute()
        print("✅ Basic connection test passed")
        
    except Exception as e:
        print(f"❌ Basic connection test failed: {str(e)}")
        return False
    
    try:
        # Check if transport_students table exists
        print("\n📊 Checking transport_students table...")
        result = supabase.table('transport_students').select('*').limit(1).execute()
        print("✅ transport_students table exists and is accessible")
        
        # Get total record count
        print("\n🔢 Counting total records...")
        count_result = supabase.table('transport_students').select('id', count='exact').execute()
        total_count = count_result.count if hasattr(count_result, 'count') else len(count_result.data)
        print(f"📈 Total records in transport_students: {total_count}")
        
        if total_count >= 1500 and total_count <= 2500:
            print("✅ Record count is within expected range (~2000)")
        else:
            print(f"⚠️  Record count {total_count} is outside expected range (~2000)")
        
        # Get sample data
        print("\n📝 Fetching sample data...")
        sample_result = supabase.table('transport_students').select('*').limit(5).execute()
        
        if sample_result.data:
            print("✅ Sample data fetched successfully")
            print(f"📋 Sample record structure:")
            for key, value in sample_result.data[0].items():
                print(f"   - {key}: {type(value).__name__} = {str(value)[:50]}...")
        else:
            print("⚠️  No sample data returned")
            
        return True
        
    except Exception as e:
        print(f"❌ Error accessing transport_students table: {str(e)}")
        return False

def test_table_schema():
    """Test table schema matches expected structure"""
    print("\n🏗️  Testing table schema...")
    
    expected_columns = {
        'id', 'register_number', 'full_name', 'email', 'phone', 'gender',
        'department_id', 'course_id', 'year', 'quota', 'category',
        'hostel_required', 'transport_required', 'admission_year',
        'current_semester', 'father_name', 'mother_name', 'status', 'created_at'
    }
    
    try:
        supabase = get_supabase()
        result = supabase.table('transport_students').select('*').limit(1).execute()
        
        if result.data:
            actual_columns = set(result.data[0].keys())
            
            print(f"📋 Expected columns: {len(expected_columns)}")
            print(f"📋 Actual columns: {len(actual_columns)}")
            
            missing_columns = expected_columns - actual_columns
            extra_columns = actual_columns - expected_columns
            
            if missing_columns:
                print(f"❌ Missing columns: {missing_columns}")
            if extra_columns:
                print(f"⚠️  Extra columns: {extra_columns}")
            
            if not missing_columns and not extra_columns:
                print("✅ Schema matches expected structure")
            else:
                print("⚠️  Schema differences detected")
                
        return True
        
    except Exception as e:
        print(f"❌ Error testing schema: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 Starting Supabase Connection Verification")
    print("=" * 50)
    
    success = test_supabase_connection()
    if success:
        test_table_schema()
    
    print("\n" + "=" * 50)
    if success:
        print("✅ Supabase connection verification completed")
    else:
        print("❌ Supabase connection verification failed")
