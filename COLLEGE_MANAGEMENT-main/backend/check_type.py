from supabase_client import get_supabase

def check_entity_type(name):
    supabase = get_supabase()
    sql = f"""
    SELECT table_type 
    FROM information_schema.tables 
    WHERE table_name = '{name}' 
    AND table_schema = 'public'
    """
    try:
        response = supabase.rpc('execute_sql', {'query': sql}).execute()
        print(f"Entity {name} type: {response.data}")
    except Exception as e:
        print(f"Error checking {name}: {e}")

if __name__ == "__main__":
    check_entity_type('transport_students')
