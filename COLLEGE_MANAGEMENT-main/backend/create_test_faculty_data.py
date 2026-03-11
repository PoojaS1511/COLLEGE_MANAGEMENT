#!/usr/bin/env python3
"""
Create test data for transport_faculty table
"""

import sys
import os
sys.path.append(os.path.dirname(__file__))

# Apply httpx patch for Supabase client
import httpx
_original_init = httpx.Client.__init__
def patched_init(self, *args, **kwargs):
    kwargs.pop('proxy', None)
    return _original_init(self, *args, **kwargs)
httpx.Client.__init__ = patched_init

from supabase_client import get_supabase
import random

def create_test_faculty_data():
    """Create test faculty data"""
    print("🧪 Creating test faculty data...")
    
    try:
        supabase = get_supabase()
        
        # Sample faculty data
        departments = ['CSE', 'ECE', 'MECH', 'EEE', 'CIVIL', 'IT']
        
        faculty_data = []
        for i in range(1, 101):  # Create 100 test records
            faculty_id = f"FAC{i:03d}"
            name = f"Faculty Member {i}"
            email = f"faculty{i}@college.edu"
            phone_number = 9876543210 + i
            department = random.choice(departments)
            
            faculty_data.append({
                'faculty_id': faculty_id,
                'name': name,
                'email': email,
                'phone': phone_number,
                'department': department
            })
        
        # Insert data in batches
        batch_size = 20
        for i in range(0, len(faculty_data), batch_size):
            batch = faculty_data[i:i + batch_size]
            result = supabase.table('transport_faculty').insert(batch).execute()
            print(f"✅ Inserted batch {i//batch_size + 1}: {len(result.data)} records")
        
        # Verify data
        count_result = supabase.table('transport_faculty').select('count').limit(1).execute()
        total_count = count_result.data[0]['count']
        print(f"✅ Total records in transport_faculty: {total_count}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating test data: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = create_test_faculty_data()
    sys.exit(0 if success else 1)
