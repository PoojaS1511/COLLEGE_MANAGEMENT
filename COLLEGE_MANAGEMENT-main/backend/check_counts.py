from supabase_client import get_supabase
supabase = get_supabase()
tables = ['programs', 'courses', 'departments']
for t in tables:
    try:
        res = supabase.table(t).select('*', count='exact').limit(0).execute()
        print(f"{t}: {res.count}")
    except:
        print(f"{t} does not exist")
