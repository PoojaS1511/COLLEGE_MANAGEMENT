from supabase_client import get_supabase

def main():
    try:
        supabase = get_supabase()
        print("Connected to Supabase")
        
        # Query to list all tables in public schema
        # Note: We might not have permissions to query information_schema directly via Supabase client easily
        # but we can try common names
        
        common_names = [
            'grievance',
            'quality_grievance',
            'quality_grievances',
            'grievances',
            'quality_grievance_records'
        ]
        
        for name in common_names:
            try:
                res = supabase.table(name).select("*").limit(1).execute()
                print(f"Table '{name}' exists!")
            except:
                pass

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
