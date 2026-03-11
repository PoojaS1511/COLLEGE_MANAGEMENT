from backend.supabase_client import get_supabase
try:
    supabase = get_supabase()
    # Querying the Postgres catalog directly if possible
    # Note: Supabase JS/Python client might not allow this depending on RLS/API settings.
    # But often you can query information_schema if permissions allow.
    try:
        res = supabase.rpc('get_tables').execute() # Some projects have a custom function
        print("RPC get_tables:", res.data)
    except:
        pass

    # Try listing tables by checking many common names
    common_names = [
        'grievance', 'grievances', 'quality_grievance', 'quality_grievances',
        'student_grievance', 'student_grievances', 'faculty_grievance', 'faculty_grievances',
        'complaints', 'tickets', 'issues', 'support', 'helpdesk'
    ]
    found = []
    for name in common_names:
        try:
            supabase.table(name).select('count', count='exact').limit(0).execute()
            found.append(name)
        except:
            pass
    print("Found tables:", found)
except Exception as e:
    print(f"Error: {e}")
