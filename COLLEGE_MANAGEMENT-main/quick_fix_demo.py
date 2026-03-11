#!/usr/bin/env python3
"""
Quick fix demo - update just 3 records to show the solution works
"""
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from supabase_client import get_supabase

def quick_fix_demo():
    """Update 3 records as a demo"""
    print("🔧 Quick Fix Demo - Updating 3 records...")
    
    try:
        supabase = get_supabase()
        
        # Get records with missing data
        result = supabase.table('transport_students').select('*').execute()
        
        if not result.data:
            print("❌ No data found")
            return
            
        students = result.data
        
        # Find first 3 records with missing data
        updates = []
        for student in students:
            if not student.get('full_name') or not student.get('register_number'):
                updates.append({
                    'id': student['id'],
                    'full_name': 'Demo Student',
                    'register_number': 'DEMO001'
                })
                if len(updates) >= 3:
                    break
        
        print(f"📊 Updating {len(updates)} records...")
        
        # Update each record
        for i, update in enumerate(updates):
            try:
                result = supabase.table('transport_students').update({
                    'full_name': update['full_name'],
                    'register_number': update['register_number']
                }).eq('id', update['id']).execute()
                
                if result.data:
                    print(f"✅ Record {i+1} updated successfully")
                    print(f"   ID: {update['id'][:8]}...")
                    print(f"   Name: {update['full_name']}")
                    print(f"   Register: {update['register_number']}")
                else:
                    print(f"❌ Record {i+1} update failed")
                    
            except Exception as e:
                print(f"❌ Error updating record {i+1}: {str(e)}")
        
        print(f"\n🎯 Check your frontend now - you should see the updated records!")
        print(f"📝 If this works, run the full fix script to update all records.")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    quick_fix_demo()
