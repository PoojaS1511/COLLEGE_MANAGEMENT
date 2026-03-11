from supabase_client import get_supabase
import json

def test_tables():
    supabase = get_supabase()
    tables = [
        'transport_students', 
        'transport_faculty', 
        'transport_buses', 
        'transport_drivers', 
        'transport_routes',
        'transport_attendance',
        'transport_live_locations',
        'transport_activities',
        'transport_fee'
    ]
    
    print("Checking tables and columns...")
    for table in tables:
        try:
            # Try to get columns using a dummy insert that will likely fail or just by querying
            # But we can use the 'execute_sql' trick to get columns more reliably if we can find the right SQL
            sql = f"SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '{table}' AND table_schema = 'public'"
            try:
                res = supabase.rpc('execute_sql', {'query': sql}).execute()
                # If it's the custom function that returns {'status': 'success'}, this won't work.
            except:
                pass

            # Fallback: select * and check keys
            response = supabase.table(table).select('*').limit(1).execute()
            if response.data:
                print(f"[SUCCESS] Table '{table}' exists. Count: {len(response.data)}")
                print(f"  Columns: {list(response.data[0].keys())}")
            else:
                print(f"[SUCCESS] Table '{table}' exists but is empty.")
                # Try to insert a dummy record to see columns, then delete it
                # This is risky but let's try for one table to see if it works
        except Exception as e:
            if 'relation' in str(e) and 'does not exist' in str(e):
                print(f"[FAILED ] Table '{table}' does not exist.")
            else:
                print(f"[ERROR  ] Table '{table}': {e}")

if __name__ == "__main__":
    test_tables()
