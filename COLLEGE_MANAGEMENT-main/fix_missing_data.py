#!/usr/bin/env python3
"""
Fix missing register_number and full_name in transport_students table
"""
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from supabase_client import get_supabase
import re

def extract_name_from_email(email):
    """Extract name from email address"""
    if not email:
        return None
    
    # Get part before @
    local_part = email.split('@')[0]
    
    # Handle common patterns
    # Pattern: firstname.lastname
    if '.' in local_part:
        parts = local_part.split('.')
        if len(parts) >= 2:
            first_name = parts[0].title()
            last_name = parts[1].title() if len(parts[1]) > 2 else ''
            return f"{first_name} {last_name}".strip()
    
    # Pattern: firstname_lastname or firstname-lastname
    if '_' in local_part or '-' in local_part:
        separator = '_' if '_' in local_part else '-'
        parts = local_part.split(separator)
        if len(parts) >= 2:
            first_name = parts[0].title()
            last_name = parts[1].title() if len(parts[1]) > 2 else ''
            return f"{first_name} {last_name}".strip()
    
    # Pattern: firstname with numbers
    # Remove numbers and capitalize
    clean_name = re.sub(r'\d+', '', local_part).title()
    return clean_name if clean_name else None

def generate_register_number(index, year=2025):
    """Generate a register number"""
    return f"REG{year}{index:05d}"

def fix_missing_data():
    """Fix missing register_number and full_name"""
    print("🔧 Fixing Missing Data...")
    
    try:
        supabase = get_supabase()
        
        # Get all records with missing data
        result = supabase.table('transport_students').select('*').execute()
        
        if not result.data:
            print("❌ No data found")
            return
            
        students = result.data
        updates_needed = []
        
        for i, student in enumerate(students):
            has_register = bool(student.get('register_number') and str(student['register_number']).strip())
            has_name = bool(student.get('full_name') and str(student['full_name']).strip())
            
            if not has_register or not has_name:
                # Extract info from email
                email = student.get('email', '')
                extracted_name = extract_name_from_email(email)
                
                update_data = {
                    'id': student['id']
                }
                
                if not has_register:
                    # Generate register number based on index
                    update_data['register_number'] = generate_register_number(i + 1)
                
                if not has_name and extracted_name:
                    update_data['full_name'] = extracted_name
                
                if len(update_data) > 1:  # More than just 'id'
                    updates_needed.append(update_data)
        
        print(f"📊 Found {len(updates_needed)} records to update")
        
        if not updates_needed:
            print("✅ All records have complete data!")
            return
        
        # Show what will be updated
        print(f"\n📋 Preview of Updates:")
        for i, update in enumerate(updates_needed[:5]):  # Show first 5
            student_id = update['id'][:8] + '...'
            changes = []
            if 'register_number' in update:
                changes.append(f"register_number={update['register_number']}")
            if 'full_name' in update:
                changes.append(f"full_name={update['full_name']}")
            print(f"   Record {i+1} ({student_id}): {', '.join(changes)}")
        
        if len(updates_needed) > 5:
            print(f"   ... and {len(updates_needed) - 5} more records")
        
        # Ask for confirmation
        print(f"\n⚠️  This will update {len(updates_needed)} records in the database.")
        print(f"📝 Make sure you have a backup before proceeding.")
        
        # For safety, let's just show the SQL commands instead of auto-updating
        print(f"\n📄 SQL Commands to Run:")
        print("=" * 50)
        
        for update in updates_needed:
            student_id = update['id']
            set_clauses = []
            
            if 'register_number' in update:
                set_clauses.append(f"register_number = '{update['register_number']}'")
            if 'full_name' in update:
                set_clauses.append(f"full_name = '{update['full_name']}'")
            
            if set_clauses:
                sql = f"UPDATE transport_students SET {', '.join(set_clauses)} WHERE id = '{student_id}';"
                print(sql)
        
        print("=" * 50)
        print(f"💡 Copy these SQL commands and run them in your Supabase SQL editor")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")

def show_manual_fix_instructions():
    """Show instructions for manual fixing"""
    print(f"\n📖 Manual Fix Instructions:")
    print("=" * 50)
    print(f"1. Go to your Supabase dashboard")
    print(f"2. Open the SQL editor")
    print(f"3. Copy and run the SQL commands shown above")
    print(f"4. Or manually edit the records in the table editor")
    print(f"5. Verify all records have register_number and full_name")
    print("=" * 50)

if __name__ == "__main__":
    fix_missing_data()
    show_manual_fix_instructions()
