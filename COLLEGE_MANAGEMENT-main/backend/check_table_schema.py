#!/usr/bin/env python3
"""
Check transport_faculty table schema
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

def check_schema():
    """Check table schema"""
    print("🧪 Checking transport_faculty table schema...")
    
    try:
        supabase = get_supabase()
        
        # Get sample data to see schema
        result = supabase.table('transport_faculty').select('*').limit(1).execute()
        
        if result.data:
            sample = result.data[0]
            print("✅ Current schema:")
            for key, value in sample.items():
                print(f"  - {key}: {type(value).__name__} = {value}")
        else:
            print("⚠️  No data found. Checking table info...")
            
            # Try to get table info through RPC or system tables
            try:
                # This might not work with anon key, but let's try
                result = supabase.table('transport_faculty').select('*').limit(0).execute()
                print("✅ Table exists but no data")
            except Exception as e:
                print(f"❌ Error checking table: {e}")
        
        # Check if we can insert a test record
        print("\n🧪 Testing column names...")
        test_columns = ['id', 'faculty_id', 'name', 'email', 'phone', 'phone_number', 'department']
        
        for col in test_columns:
            try:
                result = supabase.table('transport_faculty').select(col).limit(1).execute()
                print(f"✅ Column '{col}' exists")
            except Exception as e:
                print(f"❌ Column '{col}' error: {e}")
        
    except Exception as e:
        print(f"❌ Error checking schema: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    check_schema()
