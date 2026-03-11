from supabase_client import get_supabase

supabase = get_supabase()

print("=== Testing Database Schema ===\n")

# Get courses
print("1. Fetching courses...")
courses_result = supabase.table('courses').select('*').limit(3).execute()
if courses_result.data:
    print(f"Found {len(courses_result.data)} courses")
    for course in courses_result.data:
        print(f"  Course: {course.get('name')} - ID fields:")
        for key in course.keys():
            if 'id' in key.lower():
                print(f"    {key}: {course[key]} (type: {type(course[key]).__name__})")
else:
    print("No courses found")

print("\n2. Fetching subjects...")
subjects_result = supabase.table('subjects').select('*').limit(5).execute()
if subjects_result.data:
    print(f"Found {len(subjects_result.data)} subjects")
    for subject in subjects_result.data:
        print(f"  Subject: {subject.get('name')}")
        print(f"    course_id: {subject.get('course_id')} (type: {type(subject.get('course_id')).__name__})")
else:
    print("No subjects found")

print("\n3. Testing subjects query with course_id filter...")
if courses_result.data:
    test_course_id = courses_result.data[0].get('id')
    print(f"Using course_id: {test_course_id}")
    
    try:
        filtered_subjects = supabase.table('subjects').select('*').eq('course_id', test_course_id).execute()
        print(f"Success! Found {len(filtered_subjects.data)} subjects for this course")
    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
