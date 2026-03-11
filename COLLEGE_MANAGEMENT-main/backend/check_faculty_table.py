#!/usr/bin/env python3
"""
Script to check if quality_facultyperformance table exists and get sample data
"""

from supabase_client import get_supabase

def main():
    try:
        supabase = get_supabase()
        print("✅ Connected to Supabase")

        # Check if table exists by trying to select from it
        print("\n🔍 Checking table: quality_facultyperformance")
        try:
            result = supabase.table('quality_facultyperformance').select('*').limit(5).execute()
            print("✅ Table exists")
            print(f"📊 Sample records: {len(result.data)}")
            if result.data:
                print("🏗️  Table schema (from first record):")
                for key in result.data[0].keys():
                    print(f"   - {key}")
                print(f"\n📋 First record: {result.data[0]}")

                # Get total count
                count_result = supabase.table('quality_facultyperformance').select('*', count='exact').execute()
                print(f"📈 Total records: {count_result.count}")

        except Exception as e:
            print(f"❌ Table does not exist or cannot be accessed: {str(e)}")

    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()
