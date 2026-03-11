#!/usr/bin/env python3
"""
Check if the admissions table exists in Supabase
"""
import os
import sys
from supabase_client import get_supabase

def check_admissions_table():
    try:
        supabase = get_supabase()

        # Try to select from admissions table
        response = supabase.table('admissions').select('id', count='exact').limit(1).execute()

        if response:
            print("✅ Admissions table exists!")
            print(f"   Current record count: {response.count}")
            return True
        else:
            print("❌ Admissions table does not exist")
            return False

    except Exception as e:
        print(f"❌ Error checking admissions table: {str(e)}")
        return False

if __name__ == "__main__":
    success = check_admissions_table()
    sys.exit(0 if success else 1)
