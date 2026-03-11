from supabase_client import get_supabase
try:
    supabase = get_supabase()
    res = supabase.table('quality_policy').select('compliance_status').execute()
    statuses = set(p['compliance_status'] for p in res.data)
    print(f"Statuses found: {statuses}")
except Exception as e:
    print(f"Error: {e}")
