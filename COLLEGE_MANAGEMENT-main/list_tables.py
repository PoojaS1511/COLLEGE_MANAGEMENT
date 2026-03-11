from backend.supabase_client import get_supabase
try:
    supabase = get_supabase()
    # Supabase doesn't directly support querying information_schema via the client in some versions/configs
    # but we can try common table names or use a different approach if it fails.
    # Actually, let's just try to list some common quality names.
    tables_to_check = [
        'quality_facultyperformance',
        'quality_audits',
        'quality_policy',
        'quality_accreditation',
        'quality_grievances',
        'grievances',
        'faculty',
        'audits',
        'policies'
    ]
    for table in tables_to_check:
        try:
            res = supabase.table(table).select('count', count='exact').limit(0).execute()
            print(f"Table '{table}' exists. Count: {res.count}")
        except Exception as e:
            print(f"Table '{table}' does NOT exist or error: {e.message if hasattr(e, 'message') else e}")
except Exception as e:
    print(f"Error: {e}")
