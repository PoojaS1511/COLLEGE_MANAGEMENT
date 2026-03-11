#!/usr/bin/env python3
"""
Verify the fix is working correctly
"""
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from supabase_client import get_supabase

def verify_fix():
    """Verify that all records now have proper data"""
    print("🔍 Verifying Fix...")
    
    try:
        supabase = get_supabase()
        
        # Get all records
        result = supabase.table('transport_students').select('*').execute()
        
        if not result.data:
            print("❌ No data found")
            return
            
        students = result.data
        print(f"📊 Total records: {len(students)}")
        
        # Check data quality
        complete_records = 0
        demo_records = 0
        email_derived_names = 0
        
        print(f"\n📋 Data Analysis:")
        for i, student in enumerate(students):
            has_name = bool(student.get('full_name') and str(student['full_name']).strip() and str(student['full_name']) != 'Demo Student')
            has_register = bool(student.get('register_number') and str(student['register_number']).strip() and str(student['register_number']) != 'DEMO001')
            has_email = bool(student.get('email'))
            
            if has_name and has_register:
                complete_records += 1
            elif str(student.get('full_name', '')) == 'Demo Student' or str(student.get('register_number', '')) == 'DEMO001':
                demo_records += 1
            elif has_email and not has_name:
                email_derived_names += 1
            
            # Show first few records
            if i < 5:
                name_status = "✅" if has_name else ("📝" if has_email else "❌")
                reg_status = "✅" if has_register else ("📝" if has_email else "❌")
                
                print(f"   {i+1}. {student.get('full_name', 'N/A')} ({student.get('register_number', 'N/A')})")
                print(f"      Email: {student.get('email', 'N/A')}")
                print(f"      Name: {name_status} Register: {reg_status}")
                print()
        
        print(f"\n📊 Summary:")
        print(f"   ✅ Complete records: {complete_records}")
        print(f"   📝 Records needing email-derived names: {email_derived_names}")
        print(f"   🔄 Demo records: {demo_records}")
        
        # Expected frontend behavior
        print(f"\n🎯 Expected Frontend Behavior:")
        print(f"   ✅ Complete records should show actual data")
        print(f"   📝 Email-derived records should show extracted names")
        print(f"   🔄 Demo records should be updated with real data")
        
        if demo_records > 0:
            print(f"\n⚠️  Still have {demo_records} demo records to update")
            print(f"   Run revert script again or update manually")
        elif email_derived_names > 0:
            print(f"\n✅ Frontend should show derived names for {email_derived_names} records")
        else:
            print(f"\n🎉 All records have complete data!")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

if __name__ == "__main__":
    verify_fix()
