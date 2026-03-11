from supabase_client import get_supabase
import json

def main():
    try:
        supabase = get_supabase()
        print("Connected to Supabase")
        
        tables = [
            'quality_accreditation',
            'quality_policy',
            'grievances',
            'quality_audits',
            'quality_facultyperformance',
            'quality_grievances',
            'quality_faculty'
        ]
        
        for table in tables:
            print(f"\nChecking table: {table}")
            try:
                result = supabase.table(table).select("*", count='exact').limit(1).execute()
                if hasattr(result, 'data'):
                    print(f"Table '{table}' exists")
                    if hasattr(result, 'count'):
                        print(f"Total records: {result.count}")
                    if result.data:
                        print(f"Sample keys: {list(result.data[0].keys())}")
                    else:
                        print("Table is empty")
                else:
                    print(f"Table '{table}' result has no data attribute")
            except Exception as e:
                if 'does not exist' in str(e):
                    print(f"Table '{table}' does not exist")
                else:
                    print(f"Error checking table '{table}': {e}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
