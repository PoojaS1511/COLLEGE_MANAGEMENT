"""
Script to fix subject-course relationships by populating course_id in subjects table.
Since the data doesn't have existing links, we'll need to manually assign subjects to courses.
"""
from supabase_client import get_supabase

supabase = get_supabase()

print("=== Fixing Subject-Course Relationships ===\n")

# Get all courses
courses_result = supabase.table('courses').select('*').execute()
courses = courses_result.data
print(f"Found {len(courses)} courses\n")

# Get all subjects
subjects_result = supabase.table('subjects').select('*').execute()
subjects = subjects_result.data
print(f"Found {len(subjects)} subjects\n")

if not courses:
    print("ERROR: No courses found in database!")
    exit(1)

if not subjects:
    print("ERROR: No subjects found in database!")
    exit(1)

# Display courses for reference
print("Available courses:")
for i, course in enumerate(courses, 1):
    print(f"{i}. {course['name']} (ID: {course['id']}, Dept: {course.get('department_id', 'N/A')})")

print("\n" + "="*60)
print("ASSIGNMENT STRATEGY:")
print("We'll distribute subjects evenly across courses based on semester")
print("="*60 + "\n")

# Group subjects by semester
subjects_by_semester = {}
for subject in subjects:
    semester = subject.get('semester', 1)
    if semester not in subjects_by_semester:
        subjects_by_semester[semester] = []
    subjects_by_semester[semester].append(subject)

# Assign subjects to courses (round-robin by semester)
updates = []
for semester, semester_subjects in subjects_by_semester.items():
    print(f"\nSemester {semester}: {len(semester_subjects)} subjects")
    
    for idx, subject in enumerate(semester_subjects):
        # Assign to course in round-robin fashion
        course_idx = idx % len(courses)
        course = courses[course_idx]
        
        updates.append({
            'subject_id': subject['id'],
            'subject_name': subject['name'],
            'course_id': course['id'],
            'course_name': course['name'],
            'department_id': course.get('department_id')
        })
        
        print(f"  - {subject['name']} → {course['name']}")

print(f"\n\nTotal updates to perform: {len(updates)}")
print("\nDo you want to proceed with these updates? (yes/no): ", end='')

response = input().strip().lower()

if response == 'yes':
    print("\nApplying updates...")
    success_count = 0
    error_count = 0
    
    for update in updates:
        try:
            result = supabase.table('subjects').update({
                'course_id': update['course_id'],
                'department_id': update['department_id']
            }).eq('id', update['subject_id']).execute()
            
            if result.data:
                success_count += 1
                print(f"✓ Updated: {update['subject_name']}")
            else:
                error_count += 1
                print(f"✗ Failed: {update['subject_name']}")
        except Exception as e:
            error_count += 1
            print(f"✗ Error updating {update['subject_name']}: {str(e)}")
    
    print(f"\n{'='*60}")
    print(f"Update complete!")
    print(f"Success: {success_count}")
    print(f"Errors: {error_count}")
    print(f"{'='*60}")
else:
    print("\nUpdate cancelled.")
