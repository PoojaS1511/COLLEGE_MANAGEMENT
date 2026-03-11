"""
Batch Migration Script for All Remaining Routes to PostgreSQL
"""

import os
import re

def migrate_route_file(file_path):
    """Migrate a single route file from Supabase to PostgreSQL"""
    print(f"\n🔄 Migrating {file_path}...")
    
    try:
        with open(file_path, 'r') as f:
            content = f.read()
        
        # Track changes made
        changes_made = []
        
        # Common migrations
        migrations = [
            # Replace imports
            ("from supabase_client import get_supabase", "from postgres_client import execute_query, execute_insert, execute_update, execute_delete"),
            ("supabase = get_supabase()", "# PostgreSQL client will be used directly"),
            
            # Replace common Supabase patterns
            ("supabase.table('courses').select('*')", "execute_query('SELECT * FROM courses')"),
            ("supabase.table('departments').select('*')", "execute_query('SELECT * FROM departments')"),
            ("supabase.table('subjects').select('*')", "execute_query('SELECT * FROM subjects')"),
            ("supabase.table('faculty').select('*')", "execute_query('SELECT * FROM faculty')"),
            ("supabase.table('exams').select('*')", "execute_query('SELECT * FROM exams')"),
            ("supabase.table('students').select('*')", "execute_query('SELECT * FROM students')"),
            ("supabase.table('attendance').select('*')", "execute_query('SELECT * FROM attendance')"),
            ("supabase.table('marks').select('*')", "execute_query('SELECT * FROM marks')"),
            ("supabase.table('fees').select('*')", "execute_query('SELECT * FROM fees')"),
            ("supabase.table('notifications').select('*')", "execute_query('SELECT * FROM notifications')"),
            
            # Replace insert operations
            ("supabase.table('courses').insert(", "execute_insert('courses', "),
            ("supabase.table('departments').insert(", "execute_insert('departments', "),
            ("supabase.table('subjects').insert(", "execute_insert('subjects', "),
            ("supabase.table('faculty').insert(", "execute_insert('faculty', "),
            ("supabase.table('exams').insert(", "execute_insert('exams', "),
            ("supabase.table('students').insert(", "execute_insert('students', "),
            ("supabase.table('attendance').insert(", "execute_insert('attendance', "),
            ("supabase.table('marks').insert(", "execute_insert('marks', "),
            ("supabase.table('fees').insert(", "execute_insert('fees', "),
            ("supabase.table('notifications').insert(", "execute_insert('notifications', "),
            
            # Replace update operations
            ("supabase.table('courses').update(", "execute_update('courses', "),
            ("supabase.table('departments').update(", "execute_update('departments', "),
            ("supabase.table('subjects').update(", "execute_update('subjects', "),
            ("supabase.table('faculty').update(", "execute_update('faculty', "),
            ("supabase.table('exams').update(", "execute_update('exams', "),
            ("supabase.table('students').update(", "execute_update('students', "),
            ("supabase.table('attendance').update(", "execute_update('attendance', "),
            ("supabase.table('marks').update(", "execute_update('marks', "),
            ("supabase.table('fees').update(", "execute_update('fees', "),
            ("supabase.table('notifications').update(", "execute_update('notifications', "),
            
            # Replace delete operations
            ("supabase.table('courses').delete(", "execute_delete('courses', "),
            ("supabase.table('departments').delete(", "execute_delete('departments', "),
            ("supabase.table('subjects').delete(", "execute_delete('subjects', "),
            ("supabase.table('faculty').delete(", "execute_delete('faculty', "),
            ("supabase.table('exams').delete(", "execute_delete('exams', "),
            ("supabase.table('students').delete(", "execute_delete('students', "),
            ("supabase.table('attendance').delete(", "execute_delete('attendance', "),
            ("supabase.table('marks').delete(", "execute_delete('marks', "),
            ("supabase.table('fees').delete(", "execute_delete('fees', "),
            ("supabase.table('notifications').delete(", "execute_delete('notifications', "),
            
            # Replace query execution
            (".execute()", ""),
            ("result.data", "result"),
            ("response.data", "result"),
            
            # Replace filtering methods
            (".eq('", " WHERE "),
            ("', '", " = '"),
            (".or_(", " OR "),
            (".ilike.", " ILIKE "),
            (".order(", " ORDER BY "),
            (".limit(", " LIMIT "),
            (".neq('", " WHERE NOT "),
            
            # Replace UUID handling
            ("str(uuid.uuid4())", "uuid.uuid4()"),
        ]
        
        # Apply migrations
        migrated_content = content
        for old, new in migrations:
            if old in migrated_content:
                migrated_content = migrated_content.replace(old, new)
                changes_made.append(f"Replaced: {old[:50]}...")
        
        # Write migrated file
        with open(file_path, 'w') as f:
            f.write(migrated_content)
        
        print(f"✅ Successfully migrated {file_path}")
        print(f"   Changes made: {len(changes_made)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error migrating {file_path}: {e}")
        return False

def main():
    """Main migration function"""
    print("🚀 BATCH POSTGRESQL MIGRATION")
    print("=" * 50)
    
    # Route files to migrate
    route_files = [
        "routes/academics.py",
        "routes/exams.py", 
        "routes/attendance.py",
        "routes/fees.py",
        "routes/notifications.py",
        "routes/faculty.py",
        "routes/students.js",
        "routes/courses.js",
        "routes/subjects.js",
        "routes/departments.js"
    ]
    
    # Migrate each file
    migrated_count = 0
    failed_count = 0
    
    for route_file in route_files:
        if os.path.exists(route_file):
            if migrate_route_file(route_file):
                migrated_count += 1
            else:
                failed_count += 1
        else:
            print(f"⚠️ File not found: {route_file}")
            failed_count += 1
    
    print(f"\n📊 MIGRATION SUMMARY:")
    print(f"   Total files: {len(route_files)}")
    print(f"   Migrated: {migrated_count}")
    print(f"   Failed: {failed_count}")
    
    if migrated_count > 0:
        print(f"\n✅ Migration completed for {migrated_count} files!")
        print("\n🔄 Next steps:")
        print("   1. Test the migrated endpoints")
        print("   2. Fix any syntax errors")
        print("   3. Update authentication decorators")
        print("   4. Remove Supabase dependencies")
    else:
        print("\n❌ No files were migrated")

if __name__ == "__main__":
    main()
