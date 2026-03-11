"""
Migration script for academics routes from Supabase to PostgreSQL
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Read the current academics.py file
with open('routes/academics.py', 'r') as f:
    content = f.read()

# Define the migration replacements
migrations = [
    # Replace imports
    ("from supabase_client import get_supabase", "from postgres_client import execute_query, execute_insert, execute_update, execute_delete"),
    ("supabase = get_supabase()", "# PostgreSQL client will be used directly"),
    
    # Replace common Supabase patterns
    ("supabase.table('courses').select('''", "execute_query('''SELECT c.*, d.id as dept_id, d.name as dept_name, d.code as dept_code, d.head_of_department FROM courses c LEFT JOIN departments d ON c.department_id = d.id"),
    ("supabase.table('courses').select('*')", "execute_query('SELECT * FROM courses')"),
    ("supabase.table('courses').insert(", "execute_insert('courses', "),
    ("supabase.table('courses').update(", "execute_update('courses', "),
    ("supabase.table('courses').delete(", "execute_delete('courses', "),
    ("supabase.table('departments').select('*')", "execute_query('SELECT * FROM departments')"),
    ("supabase.table('subjects').select('*')", "execute_query('SELECT * FROM subjects')"),
    ("supabase.table('faculty').select('*')", "execute_query('SELECT * FROM faculty')"),
    ("supabase.table('exams').select('*')", "execute_query('SELECT * FROM exams')"),
    
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
    
    # Replace UUID handling
    ("str(uuid.uuid4())", "uuid.uuid4()"),
]

# Apply migrations
migrated_content = content
for old, new in migrations:
    migrated_content = migrated_content.replace(old, new)

# Write the migrated file
with open('routes/academics_migrated.py', 'w') as f:
    f.write(migrated_content)

print("✅ Academics routes migration completed!")
print("📁 Created: routes/academics_migrated.py")
print("🔄 Next steps:")
print("   1. Review the migrated file")
print("   2. Test the endpoints")
print("   3. Replace the original file")
