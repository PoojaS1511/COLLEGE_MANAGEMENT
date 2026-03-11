#!/usr/bin/env python3
"""
Check which records have missing register_number and full_name
"""
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from supabase_client import get_supabase

def check_missing_data():
    """Check for missing register_number and full_name"""
    print("🔍 Checking for Missing Data...")
    
    try:
        supabase = get_supabase()
        
        # Get all records
        result = supabase.table('transport_students').select('*').execute()
        
        if not result.data:
            print("❌ No data found")
            return
            
        students = result.data
        print(f"📊 Total records: {len(students)}")
        
        # Check for missing data
        missing_register = []
        missing_name = []
        missing_both = []
        complete_records = []
        
        for i, student in enumerate(students):
            has_register = bool(student.get('register_number') and str(student['register_number']).strip())
            has_name = bool(student.get('full_name') and str(student['full_name']).strip())
            
            if not has_register and not has_name:
                missing_both.append((i+1, student))
            elif not has_register:
                missing_register.append((i+1, student))
            elif not has_name:
                missing_name.append((i+1, student))
            else:
                complete_records.append((i+1, student))
        
        print(f"\n📋 Data Quality Summary:")
        print(f"   ✅ Complete records: {len(complete_records)}")
        print(f"   ⚠️  Missing register_number: {len(missing_register)}")
        print(f"   ⚠️  Missing full_name: {len(missing_name)}")
        print(f"   ❌ Missing both: {len(missing_both)}")
        
        # Show details of problematic records
        if missing_both:
            print(f"\n❌ Records Missing Both Fields:")
            for idx, student in missing_both[:5]:  # Show first 5
                print(f"   Record {idx}: ID={student.get('id', 'N/A')}")
                print(f"   - register_number: '{student.get('register_number', '')}'")
                print(f"   - full_name: '{student.get('full_name', '')}'")
                print(f"   - email: {student.get('email', 'N/A')}")
                print()
        
        if missing_register:
            print(f"\n⚠️  Records Missing Register Number:")
            for idx, student in missing_register[:3]:  # Show first 3
                print(f"   Record {idx}: {student.get('full_name', 'No Name')} - ID={student.get('id', 'N/A')[:8]}...")
        
        if missing_name:
            print(f"\n⚠️  Records Missing Full Name:")
            for idx, student in missing_name[:3]:  # Show first 3
                print(f"   Record {idx}: {student.get('register_number', 'No Reg')} - ID={student.get('id', 'N/A')[:8]}...")
        
        # Show complete records
        if complete_records:
            print(f"\n✅ Sample Complete Records:")
            for idx, student in complete_records[:3]:  # Show first 3
                print(f"   Record {idx}: {student.get('full_name')} ({student.get('register_number')})")
        
        # Recommendations
        print(f"\n💡 Recommendations:")
        if missing_both:
            print(f"   🔧 Update {len(missing_both)} records missing both fields")
        if missing_register:
            print(f"   🔧 Update {len(missing_register)} records missing register_number")
        if missing_name:
            print(f"   🔧 Update {len(missing_name)} records missing full_name")
        
        if len(missing_both) + len(missing_register) + len(missing_name) > 0:
            print(f"   📝 Consider adding validation to prevent empty fields")
            print(f"   🔄 Run data cleanup script to fix missing values")
        else:
            print(f"   🎉 All records have complete data!")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    check_missing_data()
