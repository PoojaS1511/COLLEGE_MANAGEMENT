
from supabase_client import get_supabase
import json

def check_fee_count():
    try:
        supabase = get_supabase(admin=True)
        res = supabase.table('transport_fee').select('id', count='exact').limit(1).execute()
        print(f"Total records in transport_fee: {res.count}")
        
        if res.count > 0:
            sample = supabase.table('transport_fee').select('*').limit(1).execute()
            print(f"Sample record: {json.dumps(sample.data, indent=2)}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_fee_count()
