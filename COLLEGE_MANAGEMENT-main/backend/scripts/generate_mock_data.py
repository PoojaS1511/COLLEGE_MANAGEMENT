import os
import sys
import random
from datetime import datetime, timedelta
from faker import Faker
from supabase import create_client, Client
from dotenv import load_dotenv

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Load environment variables
load_dotenv()

# Initialize Faker
fake = Faker()

# Initialize Supabase
supabase_url = os.getenv('SUPABASE_URL')
supabase_key = os.getenv('SUPABASE_KEY')
supabase: Client = create_client(supabase_url, supabase_key)

# Mock data generators
def generate_courses(count=5):
    courses = []
    departments = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Electrical']
    levels = ['UG', 'PG', 'Diploma']
    
    for _ in range(count):
        course = {
            'id': fake.uuid4(),
            'code': f"{random.choice(['CS', 'EC', 'ME', 'CE', 'EE'])}{random.randint(100, 499)}",
            'name': f"{random.choice(['B.Tech', 'M.Tech', 'B.E', 'M.E', 'Diploma'])} in {fake.word(ext_word_list=departments)}",
            'description': fake.sentence(),
            'duration_years': random.choice([3, 4, 2]),
            'level': random.choice(levels),
            'total_semesters': random.choice([6, 8, 4]),
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        courses.append(course)
    return courses

def generate_subjects(course_ids, count_per_course=4):
    subjects = []
    subject_areas = [
        'Mathematics', 'Physics', 'Chemistry', 'Programming', 'Electronics',
        'Mechanics', 'Structures', 'Circuits', 'Algorithms', 'Database',
        'Networking', 'AI/ML', 'Robotics', 'Thermodynamics', 'Fluid Mechanics'
    ]
    
    for course_id in course_ids:
        for _ in range(count_per_course):
            subject = {
                'id': fake.uuid4(),
                'course_id': course_id,
                'code': f"SUB{fake.unique.random_int(min=1000, max=9999)}",
                'name': f"{random.choice(['Advanced', 'Basic', 'Applied'])} {random.choice(subject_areas)}",
                'description': fake.sentence(),
                'credit_hours': random.choice([3, 4, 2]),
                'semester': random.randint(1, 8),
                'is_lab': random.choice([True, False]),
                'created_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat()
            }
            subjects.append(subject)
    return subjects

def generate_faculty(count=10):
    faculty = []
    departments = ['CSE', 'ECE', 'ME', 'CE', 'EEE']
    designations = ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer']
    
    for _ in range(count):
        faculty_member = {
            'id': fake.uuid4(),
            'employee_id': f"EMP{fake.unique.random_int(min=1000, max=9999)}",
            'first_name': fake.first_name(),
            'last_name': fake.last_name(),
            'email': fake.email(),
            'phone': fake.phone_number(),
            'department': random.choice(departments),
            'designation': random.choice(designations),
            'qualification': f"{random.choice(['Ph.D.', 'M.Tech', 'M.E.'])} in {fake.word(ext_word_list=['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Electrical'])}",
            'date_of_joining': fake.date_between(start_date='-10y', end_date='today').isoformat(),
            'is_active': True,
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        faculty.append(faculty_member)
    return faculty

# Insert data into Supabase
def insert_mock_data():
    try:
        # Generate and insert courses
        print("Generating courses...")
        courses = generate_courses(5)
        course_ids = [course['id'] for course in courses]
        supabase.table('courses').upsert(courses).execute()
        print(f"Inserted {len(courses)} courses")
        
        # Generate and insert subjects
        print("Generating subjects...")
        subjects = generate_subjects(course_ids, 4)  # 4 subjects per course
        supabase.table('subjects').upsert(subjects).execute()
        print(f"Inserted {len(subjects)} subjects")
        
        # Generate and insert faculty
        print("Generating faculty...")
        faculty = generate_faculty(10)
        supabase.table('faculty').upsert(faculty).execute()
        print(f"Inserted {len(faculty)} faculty members")
        
        print("\nMock data generation completed successfully!")
        
    except Exception as e:
        print(f"Error generating mock data: {str(e)}")
        raise

if __name__ == "__main__":
    print("Starting mock data generation...")
    insert_mock_data()
