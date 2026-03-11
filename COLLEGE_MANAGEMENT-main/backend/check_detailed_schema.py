#!/usr/bin/env python3
"""
Script to get detailed schema of existing tables
"""

from supabase_client import get_supabase

def main():
    try:
        supabase = get_supabase()
        print("✅ Connected to Supabase")

        # Get transport_faculty structure since it might have data
        print("\n🔍 Checking transport_faculty table structure:")
        try:
            # Try to get column info by describing the table
            result = supabase.table('transport_faculty').select('*').limit(1).execute()
            
            if result.data:
                print("📋 Schema from transport_faculty:")
                for key, value in result.data[0].items():
                    print(f"   - {key}: {type(value).__name__} = {value}")
            else:
                print("📋 transport_faculty is empty, checking other tables...")
                
                # Check if there are any faculty records in transport_faculty
                count_result = supabase.table('transport_faculty').select('*', count='exact').execute()
                print(f"📊 Total transport_faculty records: {count_result.count}")
                
                if count_result.count > 0:
                    # Get some sample data
                    sample_result = supabase.table('transport_faculty').select('*').limit(3).execute()
                    print("📋 Sample transport_faculty records:")
                    for i, record in enumerate(sample_result.data):
                        print(f"   Record {i+1}: {record}")
                        
        except Exception as e:
            print(f"❌ Error checking transport_faculty: {e}")

        # Check payroll table structure
        print("\n🔍 Checking payroll table structure:")
        try:
            payroll_result = supabase.table('payroll').select('*').limit(3).execute()
            
            if payroll_result.data:
                print("📋 Current payroll schema:")
                for key, value in payroll_result.data[0].items():
                    print(f"   - {key}: {type(value).__name__} = {value}")
                    
                print(f"\n📊 Total payroll records: {len(payroll_result.data)}")
                
            else:
                print("📋 Payroll table is empty")
                
        except Exception as e:
            print(f"❌ Error checking payroll: {e}")

    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()
