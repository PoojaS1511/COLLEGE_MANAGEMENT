from backend.supabase_client import get_supabase
try:
    supabase = get_supabase()
    res = supabase.table('quality_accreditation').select('*').limit(1).execute()
    print(res.data)
except Exception as e:
    print(f"Error: {e}")
