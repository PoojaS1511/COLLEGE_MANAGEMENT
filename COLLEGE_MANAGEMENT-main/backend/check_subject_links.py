from supabase_client import get_supabase

supabase = get_supabase()

print("=== Checking Subject Relationships ===\n")

# Get a sample subject
subjects_result = supabase.table('subjects').select('*').limit(3).execute()
if subjects_result.data:
    print(f"Sample subjects:")
    for subject in subjects_result.data:
        print(f"\nSubject: {subject.get('name')}")
        print(f"  ID: {subject.get('id')}")
        print(f"  course_id: {subject.get('course_id')}")
        print(f"  department_id: {subject.get('department_id')}")
        print(f"  semester: {subject.get('semester')}")

# Check courses and their department relationships
print("\n\n=== Checking Courses ===")
courses_result = supabase.table('courses').select('*').limit(3).execute()
if courses_result.data:
    for course in courses_result.data:
        print(f"\nCourse: {course.get('name')}")
        print(f"  ID (uuid): {course.get('id')}")
        print(f"  department_id: {course.get('department_id')}")
        
        # Try to find subjects for this course by department
        dept_id = course.get('department_id')
        if dept_id:
            dept_subjects = supabase.table('subjects').select('*').eq('department_id', dept_id).limit(3).execute()
            print(f"  Subjects in same department: {len(dept_subjects.data)}")
            for subj in dept_subjects.data:
                print(f"    - {subj.get('name')}")
