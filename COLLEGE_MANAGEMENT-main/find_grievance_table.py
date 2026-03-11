from backend.supabase_client import get_supabase
try:
    supabase = get_supabase()
    # Try common variations
    variations = ['grievance', 'student_grievance', 'faculty_grievance', 'quality_grievance', 'support_tickets']
    for v in variations:
        try:
            res = supabase.table(v).select('count', count='exact').limit(0).execute()
            print(f"Table '{v}' exists.")
        except:
            pass
except Exception as e:
    print(f"Error: {e}")
