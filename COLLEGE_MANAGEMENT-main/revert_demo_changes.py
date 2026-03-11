#!/usr/bin/env python3
"""
Revert demo changes and fix with real data from emails
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
    
    # Handle patterns like "firstname.lastname" or "firstname.year"
    if '.' in local_part:
        parts = local_part.split('.')
        if len(parts) >= 2:
            first_name = parts[0].title()
            # Remove numbers from second part
            second_part = re.sub(r'\d+', '', parts[1]).title()
            return f"{first_name} {second_part}".strip()
    
    # Handle patterns like "firstname_year"
    if any(char.isdigit() for char in local_part):
        # Split on first occurrence of digit
        for i, char in enumerate(local_part):
            if char.isdigit():
                name_part = local_part[:i]
                clean_name = re.sub(r'[._-]', ' ', name_part).title()
                return clean_name.strip()
    
    # Simple case - just capitalize
    clean_name = re.sub(r'[._-]', ' ', local_part).title()
    return clean_name if clean_name else None

def generate_register_number_from_email(email):
    """Generate register number from email"""
    if not email:
        return None
    
    # Extract name part
    local_part = email.split('@')[0]
    
    # Try to extract year from email
    year_match = re.search(r'(\d{4})', local_part)
    year = year_match.group(1) if year_match else '2025'
    
    # Extract name for registration
    name_part = re.sub(r'\d+', '', local_part)
    name_part = re.sub(r'[._-]', '', name_part)
    
    # Generate unique register number
    import hashlib
    hash_obj = hashlib.md5(f"{name_part}{year}".encode())
    hash_suffix = hash_obj.hexdigest()[:6].upper()
    
    return f"REG{year}{hash_suffix}"

def revert_and_fix():
    """Revert demo changes and fix with real data"""
    print("🔄 Reverting Demo Changes & Fixing with Real Data...")
    
    try:
        supabase = get_supabase()
        
        # Get all records
        result = supabase.table('transport_students').select('*').execute()
        
        if not result.data:
            print("❌ No data found")
            return
            
        students = result.data
        updates_made = 0
        
        for student in students:
            updates = {}
            
            # Revert demo values
            if student.get('full_name') == 'Demo Student':
                email = student.get('email', '')
                extracted_name = extract_name_from_email(email)
                if extracted_name:
                    updates['full_name'] = extracted_name
                    print(f"📝 Updating name: {email} → {extracted_name}")
            
            if student.get('register_number') == 'DEMO001':
                email = student.get('email', '')
                generated_reg = generate_register_number_from_email(email)
                if generated_reg:
                    updates['register_number'] = generated_reg
                    print(f"📝 Updating register: {email} → {generated_reg}")
            
            # Apply updates if any
            if updates:
                try:
                    update_result = supabase.table('transport_students').update(updates).eq('id', student['id']).execute()
                    if update_result.data:
                        updates_made += 1
                        print(f"✅ Updated record: {student['id'][:8]}...")
                except Exception as e:
                    print(f"❌ Error updating {student['id'][:8]}...: {str(e)}")
        
        print(f"\n📊 Summary:")
        print(f"   ✅ Records updated: {updates_made}")
        print(f"   📝 Total records: {len(students)}")
        
        # Show sample of fixed data
        print(f"\n📋 Sample Fixed Records:")
        result = supabase.table('transport_students').select('*').limit(5).execute()
        if result.data:
            for i, student in enumerate(result.data):
                print(f"   {i+1}. {student.get('full_name', 'N/A')} ({student.get('register_number', 'N/A')})")
        
        return updates_made > 0
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

if __name__ == "__main__":
    revert_and_fix()
