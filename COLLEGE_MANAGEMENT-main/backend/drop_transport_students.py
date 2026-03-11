from supabase_client import get_supabase

def drop_entity(name):
    supabase = get_supabase()
    # Try dropping as table then as view
    queries = [
        f"DROP TABLE IF EXISTS {name} CASCADE",
        f"DROP VIEW IF EXISTS {name} CASCADE"
    ]
    for sql in queries:
        try:
            response = supabase.rpc('execute_sql', {'query': sql}).execute()
            print(f"Executed '{sql}': {response.data}")
        except Exception as e:
            print(f"Error executing '{sql}': {e}")

if __name__ == "__main__":
    drop_entity('transport_students')
