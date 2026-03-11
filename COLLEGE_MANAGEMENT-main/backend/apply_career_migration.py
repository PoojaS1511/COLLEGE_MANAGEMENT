"""
Apply Career Assistant Tables Migration
"""
from supabase_client import get_supabase
import os

def apply_migration():
    """Apply the career assistant tables migration"""
    print("Applying Career Assistant Tables Migration...")
    
    # Read the SQL file
    sql_file_path = os.path.join(os.path.dirname(__file__), '..', 'database', 'migrations', 'create_career_assistant_tables.sql')
    
    with open(sql_file_path, 'r') as f:
        sql_content = f.read()
    
    print(f"Read SQL file: {sql_file_path}")
    print(f"SQL content length: {len(sql_content)} characters")
    
    # Get Supabase client
    supabase = get_supabase()
    
    # Execute the SQL
    try:
        # Note: Supabase Python client doesn't have a direct SQL execution method
        # We need to use the REST API or execute via RPC
        print("\n⚠️  Note: You need to apply this SQL manually in Supabase SQL Editor")
        print("\nSQL to execute:")
        print("=" * 80)
        print(sql_content)
        print("=" * 80)
        
        print("\nSteps to apply:")
        print("1. Go to your Supabase dashboard")
        print("2. Navigate to SQL Editor")
        print("3. Copy and paste the SQL above")
        print("4. Click 'Run' to execute")
        
        # Try to check if tables exist
        print("\n\nChecking if tables already exist...")
        
        try:
            result = supabase.table('career_interests').select('id').limit(1).execute()
            print("✅ career_interests table exists")
        except Exception as e:
            print(f"❌ career_interests table does not exist: {e}")
        
        try:
            result = supabase.table('career_roadmaps').select('id').limit(1).execute()
            print("✅ career_roadmaps table exists")
        except Exception as e:
            print(f"❌ career_roadmaps table does not exist: {e}")
        
        try:
            result = supabase.table('roadmap_steps').select('id').limit(1).execute()
            print("✅ roadmap_steps table exists")
        except Exception as e:
            print(f"❌ roadmap_steps table does not exist: {e}")
        
        try:
            result = supabase.table('mentor_sessions').select('id').limit(1).execute()
            print("✅ mentor_sessions table exists")
        except Exception as e:
            print(f"❌ mentor_sessions table does not exist: {e}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    apply_migration()

