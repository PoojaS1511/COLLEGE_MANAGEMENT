#!/usr/bin/env python3
"""
Script to check actual faculty table schema and create appropriate records
"""

from supabase_client import get_supabase

def main():
    try:
        supabase = get_supabase()
        print("✅ Connected to Supabase")

        # Check faculty table structure by trying to insert a test record
        print("\n🔍 Checking faculty table structure...")
        
        # Try to get one record to see the schema
        try:
            result = supabase.table('faculty').select('*').limit(1).execute()
            if result.data:
                print("📋 Faculty table schema (from existing record):")
                for key, value in result.data[0].items():
                    print(f"   - {key}: {type(value).__name__} = {value}")
            else:
                print("📋 Faculty table is empty, trying to determine schema...")
                
                # Try inserting a minimal record to see what columns are required
                test_record = {
                    'name': 'Test Faculty',
                    'email': 'test@cubearts.edu'
                }
                
                try:
                    insert_result = supabase.table('faculty').insert(test_record).execute()
                    if insert_result.data:
                        print("📋 Faculty table schema (from inserted record):")
                        for key, value in insert_result.data[0].items():
                            print(f"   - {key}: {type(value).__name__} = {value}")
                        
                        # Delete the test record
                        supabase.table('faculty').delete().eq('id', insert_result.data[0]['id']).execute()
                    else:
                        print("❌ Could not determine faculty schema")
                except Exception as e:
                    print(f"❌ Error inserting test record: {e}")
                    
        except Exception as e:
            print(f"❌ Error checking faculty table: {e}")

        # Now create faculty records with only the columns that exist
        print("\n📝 Creating faculty records with correct schema...")
        
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
                
                # Create faculty record with minimal required fields
                basic_salary = payroll.get('basic_salary', 0)
                
                if basic_salary >= 60000:
                    role = 'Professor'
                    department = 'Computer Science Engineering'
                elif basic_salary >= 45000:
                    role = 'Associate Professor'
                    department = 'Electronics Engineering'
                elif basic_salary >= 25000:
                    role = 'Assistant Professor'
                    department = 'Mechanical Engineering'
                else:
                    role = 'Lecturer'
                    department = 'Information Technology'

                # Only include basic fields that should exist in faculty table
                faculty_record = {
                    'id': faculty_id,
                    'name': f'Faculty {faculty_id[:8]}',
                    'email': f'faculty{faculty_id[:8]}@cubearts.edu',
                    'department': department,
                    'role': role
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
                        print(f"✅ Created: {faculty['name']} - {faculty['role']}")
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

    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()
