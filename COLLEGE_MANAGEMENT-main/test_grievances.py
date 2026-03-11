from backend.supabase_client import get_supabase

def test_grievances_table():
    try:
        supabase = get_supabase()
        print("Connected to Supabase")

        # Try to select from grievances table
        result = supabase.table('grievances').select('*', count='exact').limit(1).execute()

        if result.data:
            print(f"✅ Grievances table exists! Found {result.count} records")
            print(f"Sample record: {result.data[0] if result.data else 'None'}")
        else:
            print("❌ Grievances table exists but is empty")

    except Exception as e:
        print(f"❌ Error accessing grievances table: {e}")

if __name__ == "__main__":
    test_grievances_table()
