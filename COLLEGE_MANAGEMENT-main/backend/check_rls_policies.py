#!/usr/bin/env python3
"""
Script to check Row Level Security policies on quality_policy table
"""

from supabase_client import get_supabase

def check_rls_policies():
    """Check RLS policies on quality_policy table"""
    try:
        supabase = get_supabase()
        print("✅ Connected to Supabase")

        # Check if RLS is enabled
        print("\n🔍 Checking RLS status on quality_policy table...")

        # Try to query the table
        try:
            result = supabase.table('quality_policy').select('*', count='exact').limit(5).execute()
            print("✅ Query successful")
            print(f"   📊 Records accessible: {len(result.data) if result.data else 0}")
            print(f"   📊 Total count: {result.count if hasattr(result, 'count') else 'N/A'}")

            if result.data and len(result.data) > 0:
                print("   📋 Sample record:")
                for key, value in result.data[0].items():
                    print(f"      {key}: {value}")

        except Exception as e:
            print(f"❌ Query failed: {str(e)}")
            print("   💡 This might indicate RLS blocking access")

        # Try with admin client
        print("\n🔍 Testing with admin client...")
        try:
            from supabase_client import get_supabase
            admin_supabase = get_supabase(admin=True)
            admin_result = admin_supabase.table('quality_policy').select('*', count='exact').limit(5).execute()
            print("✅ Admin query successful")
            print(f"   📊 Admin records accessible: {len(admin_result.data) if admin_result.data else 0}")
            print(f"   📊 Admin total count: {admin_result.count if hasattr(admin_result, 'count') else 'N/A'}")
        except Exception as e:
            print(f"❌ Admin query failed: {str(e)}")

    except Exception as e:
        print(f"❌ Error connecting to Supabase: {e}")

def check_table_schema():
    """Check the table schema and policies"""
    try:
        supabase = get_supabase()

        # Check table information
        print("\n🔍 Checking table information...")

        # Try to get table info (this might not work with anon key)
        try:
            # This is a workaround to check if table exists
            result = supabase.table('quality_policy').select('policy_id').limit(1).execute()
            print("✅ Table exists and is accessible")
        except Exception as e:
            print(f"❌ Table access issue: {str(e)}")

    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("🚀 RLS POLICY CHECK")
    print("=" * 50)
    check_rls_policies()
    check_table_schema()
    print("\n" + "=" * 50)
    print("✅ Check completed")
