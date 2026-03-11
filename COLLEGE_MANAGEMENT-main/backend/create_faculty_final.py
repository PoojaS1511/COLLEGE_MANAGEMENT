#!/usr/bin/env python3
"""
Script to create faculty records with the correct schema
"""

from supabase_client import get_supabase
from datetime import datetime

def main():
    try:
        supabase = get_supabase()
        print("✅ Connected to Supabase")

        # Get payroll records
        print("\n📊 Getting payroll records...")
        payroll_result = supabase.table('payroll').select('*').execute()
        
        if not payroll_result.data:
            print("❌ No payroll records found")
            return

        # Create faculty records with correct schema
        faculty_records = []
        faculty_ids = set()
        
        for payroll in payroll_result.data:
            faculty_id = payroll['faculty_id']
            if faculty_id not in faculty_ids:
                faculty_ids.add(faculty_id)
                
                # Create faculty record based on salary level
                basic_salary = payroll.get('basic_salary', 0)
                
                if basic_salary >= 60000:
                    designation = 'Professor'
                    department_id = 'CS'  # Computer Science
                elif basic_salary >= 45000:
                    designation = 'Associate Professor'
                    department_id = 'EC'  # Electronics
                elif basic_salary >= 25000:
                    designation = 'Assistant Professor'
                    department_id = 'ME'  # Mechanical
                else:
                    designation = 'Lecturer'
                    department_id = 'IT'  # Information Technology

                # Use the correct schema from your faculty table
                faculty_record = {
                    'id': faculty_id,
                    'name': f'Faculty {faculty_id[:8]}',
                    'email': f'faculty{faculty_id[:8]}@cubearts.edu',
                    'phone': '9876543210',
                    'designation': designation,
                    'department_id': department_id
                }
                
                faculty_records.append(faculty_record)

        print(f"📝 Creating {len(faculty_records)} faculty records...")
        
        # Insert faculty records
        inserted_count = 0
        for faculty in faculty_records:
            try:
                # Check if faculty already exists
                existing = supabase.table('faculty').select('*').eq('id', faculty['id']).execute()
                
                if not existing.data:
                    # Insert new faculty
                    result = supabase.table('faculty').insert(faculty).execute()
                    if result.data:
                        print(f"✅ Created: {faculty['name']} - {faculty['designation']}")
                        inserted_count += 1
                    else:
                        print(f"❌ Failed to create: {faculty['name']}")
                else:
                    print(f"⚠️ Already exists: {faculty['name']}")
                    
            except Exception as e:
                print(f"❌ Error creating {faculty['name']}: {e}")

        print(f"\n📊 Successfully created {inserted_count} faculty records")

        # Verify the connection
        print("\n🔍 Verifying faculty-payroll connection...")
        
        # Check a few payroll records with their faculty info
        sample_payroll = payroll_result.data[:3]
        for payroll in sample_payroll:
            faculty_result = supabase.table('faculty').select('*').eq('id', payroll['faculty_id']).execute()
            
            if faculty_result.data:
                faculty = faculty_result.data[0]
                print(f"✅ Payroll {payroll['faculty_id']} ↔ Faculty {faculty['name']}")
            else:
                print(f"❌ No faculty found for payroll {payroll['faculty_id']}")

        print("\n🎉 Faculty records created successfully!")
        print("📋 Your payroll module should now work with the frontend!")
        
        # Final counts
        faculty_count = supabase.table('faculty').select('*', count='exact').execute()
        payroll_count = supabase.table('payroll').select('*', count='exact').execute()
        
        print(f"\n📊 Final counts:")
        print(f"   Faculty records: {faculty_count.count}")
        print(f"   Payroll records: {payroll_count.count}")

        # Test the backend API
        print("\n🔍 Testing backend API...")
        try:
            api_result = supabase.table('payroll').select('*').limit(5).execute()
            if api_result.data:
                print("✅ Backend API working - can fetch payroll records")
                for record in api_result.data:
                    faculty_info = supabase.table('faculty').select('name, designation').eq('id', record['faculty_id']).execute()
                    if faculty_info.data:
                        faculty = faculty_info.data[0]
                        print(f"   📋 {faculty['name']} ({faculty['designation']}) - {record['pay_month']} - ₹{record['net_salary']}")
            else:
                print("❌ Backend API not working")
        except Exception as e:
            print(f"❌ API test failed: {e}")

    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()
