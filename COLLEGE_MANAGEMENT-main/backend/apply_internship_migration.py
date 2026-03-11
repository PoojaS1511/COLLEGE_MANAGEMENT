"""
Apply internship schema migration
This script fixes the student_internships foreign key and creates the get_student_internships function
"""
import os
import sys
from supabase_client import get_supabase

def apply_migration():
    """Apply the internship schema migration"""
    try:
        supabase = get_supabase()
        print("Connected to Supabase")
        
        # Read the SQL migration file
        migration_file = os.path.join(os.path.dirname(__file__), '..', 'database', 'migrations', 'fix_internships_schema.sql')
        with open(migration_file, 'r') as f:
            sql_content = f.read()
        
        print("\n" + "="*60)
        print("MIGRATION SQL:")
        print("="*60)
        print(sql_content)
        print("="*60 + "\n")
        
        print("⚠️  IMPORTANT: This script cannot execute SQL directly.")
        print("Please copy the SQL above and execute it in your Supabase SQL Editor:")
        print("1. Go to https://supabase.com/dashboard/project/qkaaoeismqnhjyikgkme/sql")
        print("2. Paste the SQL migration")
        print("3. Click 'Run' to execute")
        print("\nAlternatively, you can execute it using psql or any PostgreSQL client.")
        
        return True
        
    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = apply_migration()
    sys.exit(0 if success else 1)

