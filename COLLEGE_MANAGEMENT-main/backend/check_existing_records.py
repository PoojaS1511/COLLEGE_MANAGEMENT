#!/usr/bin/env python3
"""
Script to check existing faculty records and adapt payroll accordingly
"""

from supabase_client import get_supabase

def main():
    try:
        supabase = get_supabase()
        print("✅ Connected to Supabase")

        # Check faculty records
        print("\n🔍 Checking faculty records:")
        try:
            faculty_result = supabase.table('faculty').select('*').execute()
            
            if faculty_result.data:
                print(f"📊 Found {len(faculty_result.data)} faculty records:")
                for i, faculty in enumerate(faculty_result.data):
                    print(f"   {i+1}. {faculty.get('name', 'Unknown')} - {faculty.get('department', 'N/A')} - {faculty.get('role', 'N/A')}")
                    print(f"      ID: {faculty.get('id', 'N/A')}")
                    print(f"      Email: {faculty.get('email', 'N/A')}")
            else:
                print("📋 No faculty records found")
                
        except Exception as e:
            print(f"❌ Error checking faculty: {e}")

        # Check transport_faculty records as backup
        print("\n🔍 Checking transport_faculty records:")
        try:
            transport_result = supabase.table('transport_faculty').select('*').execute()
            
            if transport_result.data:
                print(f"📊 Found {len(transport_result.data)} transport_faculty records:")
                for i, faculty in enumerate(transport_result.data[:5]):  # Show first 5
                    print(f"   {i+1}. {faculty.get('name', 'Unknown')} - {faculty.get('department', 'N/A')}")
                    print(f"      ID: {faculty.get('id', 'N/A')}")
            else:
                print("📋 No transport_faculty records found")
                
        except Exception as e:
            print(f"❌ Error checking transport_faculty: {e}")

        # Check current payroll records
        print("\n🔍 Checking payroll records:")
        try:
            payroll_result = supabase.table('payroll').select('*').execute()
            
            if payroll_result.data:
                print(f"📊 Found {len(payroll_result.data)} payroll records:")
                for i, payroll in enumerate(payroll_result.data):
                    print(f"   {i+1}. Faculty ID: {payroll.get('faculty_id', 'N/A')} - Month: {payroll.get('pay_month', 'N/A')} - Status: {payroll.get('status', 'N/A')}")
                    print(f"      Basic Salary: {payroll.get('basic_salary', 0)} - Net Salary: {payroll.get('net_salary', 0)}")
            else:
                print("📋 No payroll records found")
                
        except Exception as e:
            print(f"❌ Error checking payroll: {e}")

        print("\n🎯 Next steps:")
        print("1. Update the payroll model to work with your existing faculty table")
        print("2. Ensure faculty_id references are correct")
        print("3. Test the frontend components")

    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()
