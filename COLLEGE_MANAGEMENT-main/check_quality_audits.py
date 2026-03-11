#!/usr/bin/env python3
"""
Script to check if quality_audits table exists and verify its schema
"""

from supabase_client import get_supabase

def main():
    try:
        # Get Supabase client
        supabase = get_supabase()
        print("✅ Connected to Supabase")

        # Check if quality_audits table exists
        print("\n🔍 Checking table: quality_audits")
        try:
            # Try to get one row from the table
            result = supabase.table('quality_audits').select("*").limit(1).execute()
            if hasattr(result, 'data'):
                print("   ✅ Table exists")
                if result.data:
                    print(f"   📊 Sample row: {result.data[0]}")
                    print(f"   📊 Total records in sample: {len(result.data)}")
                else:
                    print("   ℹ️ Table is empty")

                # Get all records to check count
                all_result = supabase.table('quality_audits').select("*", count='exact').execute()
                if hasattr(all_result, 'count'):
                    print(f"   📊 Total records: {all_result.count}")

                # Check schema by examining the keys of the first record
                if result.data and len(result.data) > 0:
                    columns = list(result.data[0].keys())
                    print("   🏗️  Table columns:")
                    expected_columns = ['audit_id', 'department', 'auditor_name', 'audit_date', 'compliance_score', 'remarks', 'status']
                    for col in columns:
                        status = "✅" if col in expected_columns else "⚠️"
                        print(f"      {status} {col}")
                    print("   📋 Expected columns:", expected_columns)
                    print("   📋 Actual columns:", columns)
                    if set(columns) == set(expected_columns):
                        print("   ✅ Schema matches exactly")
                    else:
                        print("   ❌ Schema mismatch")
                else:
                    print("   ❌ Cannot determine schema - no data")

        except Exception as e:
            print(f"   ❌ Table does not exist or cannot be accessed: {str(e)}")
            print("   💡 This might indicate the table hasn't been created yet")

    except Exception as e:
        print(f"❌ Error connecting to Supabase: {e}")

if __name__ == "__main__":
    main()
