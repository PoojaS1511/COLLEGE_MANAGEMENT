from supabase_client import get_supabase

def main():
    try:
        supabase = get_supabase()
        print("Connected to Supabase")
        
        # Try to use a common RPC if it exists, or just query common prefixes
        # Since we can't easily list all tables without a custom RPC or direct Postgres access,
        # let's try more variations
        
        prefixes = ['quality_', 'hr_', 'student_', 'exam_', 'academics_', 'admin_', 'transport_']
        common_words = ['grievance', 'grievances', 'issue', 'issues', 'complaint', 'complaints', 'feedback']
        
        found = []
        for p in ['', 'quality_']:
            for w in common_words:
                name = f"{p}{w}"
                try:
                    res = supabase.table(name).select("*", count='exact').limit(1).execute()
                    print(f"Table '{name}' exists with {res.count} records!")
                    found.append(name)
                except:
                    pass
        
        if not found:
            print("No grievance-related tables found with common names.")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
