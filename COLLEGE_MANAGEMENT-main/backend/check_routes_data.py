from supabase_client import get_supabase

supabase = get_supabase()

# Get total count
count_response = supabase.table('transport_routes').select('*', count='exact').execute()
print(f'Total records in transport_routes: {count_response.count}')

# Get sample records
sample_response = supabase.table('transport_routes').select('*').range(0, 2).execute()
print('Sample records:')
for record in sample_response.data:
    print(f'  ID: {record["id"]}, Bus: {record["bus_name"]}, Route: {record["route"]}, Capacity: {record["capacity"]}, Driver: {record["driver_name"]}, Faculty ID: {record["faculty_id"]}')
