from supabase_client import supabase

def check_resumes_table():
    try:
        # Check if resumes table exists and get its structure
        response = supabase.table('resumes').select('*').limit(1).execute()
        print("Resumes table exists and is accessible")
        print("Sample data:", response.data)
    except Exception as e:
        print("Error accessing resumes table:", str(e))
        print("The resumes table might not exist or there might be permission issues")

if __name__ == "__main__":
    check_resumes_table()
