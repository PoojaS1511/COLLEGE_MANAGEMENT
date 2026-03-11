#!/usr/bin/env python3
"""
Script to check existing faculty table schema and adapt payroll accordingly
"""

from supabase_client import get_supabase

def main():
    try:
        supabase = get_supabase()
        print("✅ Connected to Supabase")

        # Check existing tables
        tables_to_check = [
            'faculty',
            'employees', 
            'staff',
            'users',
            'transport_faculty'
        ]
        
        existing_tables = {}
        
        for table in tables_to_check:
            print(f"\n🔍 Checking table: {table}")
            try:
                result = supabase.table(table).select('*').limit(1).execute()
                if result.data is not None:
                    print(f"✅ Table '{table}' exists")
                    existing_tables[table] = result.data[0] if result.data else {}
                    print("🏗️  Schema:", list(existing_tables[table].keys()) if existing_tables[table] else "Empty table")
                else:
                    print(f"❌ Table '{table}' does not exist")
            except Exception as e:
                print(f"❌ Table '{table}' error: {str(e)}")

        # Check if payroll table already exists
        print(f"\n🔍 Checking payroll table")
        try:
            payroll_result = supabase.table('payroll').select('*').limit(1).execute()
            if payroll_result.data is not None:
                print("✅ Payroll table already exists")
                print("🏗️  Current schema:", list(payroll_result.data[0].keys()) if payroll_result.data else "Empty table")
            else:
                print("❌ Payroll table does not exist - will create")
        except Exception as e:
            print("❌ Payroll table does not exist - will create")

        # Determine the best faculty/staff table to use
        faculty_table = None
        if 'faculty' in existing_tables:
            faculty_table = 'faculty'
        elif 'employees' in existing_tables:
            faculty_table = 'employees'
        elif 'staff' in existing_tables:
            faculty_table = 'staff'
        elif 'transport_faculty' in existing_tables:
            faculty_table = 'transport_faculty'

        if faculty_table:
            print(f"\n🎯 Will use '{faculty_table}' table for payroll integration")
            print(f"📋 Schema: {list(existing_tables[faculty_table].keys())}")
        else:
            print("\n❌ No faculty/staff table found - will create basic faculty table")

        return faculty_table, existing_tables.get(faculty_table, {})

    except Exception as e:
        print(f"❌ Error: {e}")
        return None, {}

if __name__ == "__main__":
    main()
