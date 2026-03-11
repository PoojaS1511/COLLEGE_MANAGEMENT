from supabase_client import get_supabase

def main():
    supabase = get_supabase()
    # There's no way to list all tables easily without an RPC.
    # Let's try to check some more possible names.
    possibilities = [
        'grievances', 'quality_grievances', 'student_grievances', 
        'complaints', 'quality_complaints', 'feedback', 'quality_feedback',
        'quality_audits', 'quality_policy', 'quality_accreditation', 'quality_facultyperformance'
    ]
    
    for name in possibilities:
        try:
            res = supabase.table(name).select('*', count='exact').limit(1).execute()
            print(f"Table '{name}' exists with {res.count} records.")
        except Exception as e:
            if 'does not exist' not in str(e):
                print(f"Table '{name}' error: {e}")
            else:
                pass # print(f"Table '{name}' does not exist.")

if __name__ == "__main__":
    main()
