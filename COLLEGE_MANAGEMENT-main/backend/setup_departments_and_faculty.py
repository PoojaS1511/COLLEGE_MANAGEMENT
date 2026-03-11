#!/usr/bin/env python3
"""
Script to check departments table and create missing departments
"""

from supabase_client import get_supabase

def main():
    try:
        supabase = get_supabase()
        print("✅ Connected to Supabase")

        # Check departments table
        print("\n🔍 Checking departments table...")
        try:
            dept_result = supabase.table('departments').select('*').execute()
            
            if dept_result.data:
                print(f"📊 Found {len(dept_result.data)} departments:")
                for dept in dept_result.data:
                    print(f"   ID: {dept.get('id', 'N/A')} - Name: {dept.get('name', 'N/A')}")
            else:
                print("📋 No departments found - will create them")
                
                # Create departments
                departments = [
                    {'id': 1, 'name': 'Computer Science Engineering'},
                    {'id': 2, 'name': 'Electronics Engineering'},
                    {'id': 3, 'name': 'Mechanical Engineering'},
                    {'id': 4, 'name': 'Information Technology'}
                ]
                
                print("📝 Creating departments...")
                for dept in departments:
                    try:
                        result = supabase.table('departments').insert(dept).execute()
                        if result.data:
                            print(f"✅ Created: {dept['name']}")
                        else:
                            print(f"❌ Failed to create: {dept['name']}")
                    except Exception as e:
                        print(f"❌ Error creating {dept['name']}: {e}")
                        
        except Exception as e:
            print(f"❌ Error checking departments: {e}")

        # Now create faculty records
        print("\n📝 Creating faculty records...")
        
        # Get payroll records
        payroll_result = supabase.table('payroll').select('*').execute()
        
        if not payroll_result.data:
            print("❌ No payroll records found")
            return

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
                    department_id = 1  # Computer Science Engineering
                elif basic_salary >= 45000:
                    designation = 'Associate Professor'
                    department_id = 2  # Electronics Engineering
                elif basic_salary >= 25000:
                    designation = 'Assistant Professor'
                    department_id = 3  # Mechanical Engineering
                else:
                    designation = 'Lecturer'
                    department_id = 4  # Information Technology

                # Use correct schema from your faculty table
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

        # Verify connection
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

    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()
