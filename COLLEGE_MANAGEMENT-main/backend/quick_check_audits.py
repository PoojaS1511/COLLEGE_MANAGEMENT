from supabase_client import get_supabase
try:
    supabase = get_supabase()
    res = supabase.table('quality_audits').select('*', count='exact').limit(1).execute()
    print(f"Count: {res.count}")
    print(f"Data: {res.data}")
except Exception as e:
    print(f"Error: {e}")
