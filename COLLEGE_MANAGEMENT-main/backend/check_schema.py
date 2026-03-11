
from supabase_client import get_supabase

def check_schema():
    supabase = get_supabase(admin=True)
    stu = supabase.table('transport_students').select('*').limit(1).execute().data[0]
    print(f"Student columns: {list(stu.keys())}")
    print(f"Student ID value: {stu['id']} (type: {type(stu['id'])})")
    print(f"Student student_id value: {stu['student_id']} (type: {type(stu['student_id'])})")

if __name__ == "__main__":
    check_schema()
