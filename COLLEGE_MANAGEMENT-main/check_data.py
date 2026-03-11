from backend.supabase_client import get_supabase
try:
    supabase = get_supabase()
    result = supabase.table('quality_facultyperformance').select('*').limit(5).execute()
    print(result.data)
except Exception as e:
    print(f"Error: {e}")
