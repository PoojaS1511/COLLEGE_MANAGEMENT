from supabase_client import get_supabase
import json

supabase = get_supabase()

def check_table(table_name):
    print(f"\n--- Checking table: {table_name} ---")
    try:
        response = supabase.table(table_name).select('*').limit(1).execute()
        if response.data:
            print(f"Table '{table_name}' exists and has data.")
            print("Columns:", list(response.data[0].keys()))
            print("Sample record:", response.data[0])
        else:
            print(f"Table '{table_name}' exists but is empty.")
            # Try to get column names by inserting and failing, or some other way
            # Since we can't easily get schema via API without data, let's try to insert an empty dict
            try:
                supabase.table(table_name).insert({}).execute()
            except Exception as e:
                print(f"Insert error (might reveal columns): {str(e)}")
    except Exception as e:
        print(f"Error accessing table '{table_name}': {str(e)}")

tables = [
    'transport_students', 
    'transport_faculty', 
    'transport_buses', 
    'transport_drivers', 
    'transport_routes', 
    'transport_attendance',
    'transport_fees',
    'transport_live_locations',
    'transport_activities'
]

for table in tables:
    check_table(table)
