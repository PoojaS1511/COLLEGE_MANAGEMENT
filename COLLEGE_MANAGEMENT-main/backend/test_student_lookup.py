"""
Test student lookup to debug the issue
"""
from supabase_client import get_supabase

def test_student_lookup():
    """Test looking up a student"""
    supabase = get_supabase()
    
    # Test user_id from the error
    test_user_id = "e356c5a3-e1bf-44a2-8462-9bbd004e6e63"
    
    print(f"\n=== Testing Student Lookup ===")
    print(f"Looking for user_id: {test_user_id}")
    
    # Try to find by user_id
    print("\n1. Searching by user_id...")
    try:
        result = supabase.table('students').select('id, user_id, full_name, email').eq('user_id', test_user_id).execute()
        if result.data:
            print(f"✅ Found by user_id: {result.data}")
        else:
            print(f"❌ Not found by user_id")
    except Exception as e:
        print(f"❌ Error searching by user_id: {e}")
    
    # Try to find by id
    print("\n2. Searching by id...")
    try:
        result = supabase.table('students').select('id, user_id, full_name, email').eq('id', test_user_id).execute()
        if result.data:
            print(f"✅ Found by id: {result.data}")
        else:
            print(f"❌ Not found by id")
    except Exception as e:
        print(f"❌ Error searching by id: {e}")
    
    # List all students to see what we have
    print("\n3. Listing all students (first 5)...")
    try:
        result = supabase.table('students').select('id, user_id, full_name, email').limit(5).execute()
        if result.data:
            print(f"✅ Found {len(result.data)} students:")
            for student in result.data:
                print(f"  - ID: {student.get('id')}, user_id: {student.get('user_id')}, name: {student.get('full_name')}")
        else:
            print(f"❌ No students found")
    except Exception as e:
        print(f"❌ Error listing students: {e}")

if __name__ == "__main__":
    test_student_lookup()

