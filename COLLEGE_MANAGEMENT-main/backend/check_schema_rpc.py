from supabase_client import get_supabase
import json

def get_columns(table_name):
    supabase = get_supabase()
    sql = f"""
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = '{table_name}' 
    AND table_schema = 'public'
    ORDER BY ordinal_position;
    """
    try:
        response = supabase.rpc('execute_sql', {'query': sql}).execute()
        # The response.data might be a string or a list of dicts
        return response.data
    except Exception as e:
        return f"Error: {e}"

def check_all():
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
    
    for table in tables:
        print(f"\nTable: {table}")
        cols = get_columns(table)
        if isinstance(cols, list):
            if not cols:
                print("  Table does not exist or has no columns in 'public' schema.")
            for col in cols:
                print(f"  - {col['column_name']} ({col['data_type']})")
        else:
            print(f"  {cols}")

if __name__ == "__main__":
    check_all()
