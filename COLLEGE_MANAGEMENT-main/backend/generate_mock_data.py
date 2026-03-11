import os
import sys
from datetime import datetime, timedelta
import random
import uuid
from supabase import create_client, Client

# Supabase configuration
SUPABASE_URL = "https://cdozcvfnamrqbaqsrhnp.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkb3pjdmZuYW1ycWJhcXNyaG5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNDIwNDEsImV4cCI6MjA1ODcxODA0MX0.CprHN0BfyN5PlQp9yfQoiZkyjnO18Rm7MAD3ObzafJ8"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Sample data
FIRST_NAMES = [
    'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan',
    'Ananya', 'Diya', 'Priya', 'Kavya', 'Anika', 'Riya', 'Shreya', 'Isha', 'Tanya', 'Meera',
    'Rajesh', 'Suresh', 'Ramesh', 'Mahesh', 'Dinesh', 'Ganesh', 'Naresh', 'Hitesh', 'Mukesh', 'Ritesh',
    'Sunita', 'Geeta', 'Seeta', 'Rita', 'Nita', 'Lata', 'Mamta', 'Kavita', 'Sangita', 'Vinita'
]

LAST_NAMES = [
    'Sharma', 'Verma', 'Gupta', 'Singh', 'Kumar', 'Patel', 'Shah', 'Jain', 'Agarwal', 'Bansal',
    'Reddy', 'Rao', 'Nair', 'Iyer', 'Menon', 'Pillai', 'Krishnan', 'Raman', 'Subramanian', 'Venkatesh',
    'Khan', 'Ahmed', 'Ali', 'Hassan', 'Hussein', 'Rahman', 'Malik', 'Sheikh', 'Ansari', 'Qureshi'
]

CITIES = [
    'Chennai', 'Coimbatore', 'Madurai', 'Trichy', 'Salem', 'Tirunelveli', 'Erode', 'Vellore', 
    'Thanjavur', 'Dindigul', 'Karur', 'Namakkal', 'Cuddalore', 'Kanchipuram', 'Tirupur'
]

BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
RELIGIONS = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist']
CASTES = ['General', 'OBC', 'SC', 'ST']

def generate_phone():
    """Generate random Indian phone number"""
    return f"{random.choice([6, 7, 8, 9])}{random.randint(100000000, 999999999)}"

def generate_email(name):
    """Generate email from name"""
    return f"{name.lower().replace(' ', '.')}@email.com"

def generate_address(city):
    """Generate random address"""
    street_num = random.randint(1, 999)
    street_names = ['Main Street', 'Park Avenue', 'Gandhi Road', 'Nehru Street', 'Anna Nagar', 'T Nagar']
    return f"{street_num} {random.choice(street_names)}, {city}"

def create_mock_students(num_students=50):
    """Create mock student data"""
    print(f"Creating {num_students} mock students...")
    
    # Get courses
    courses_response = supabase.table('courses').select('id, code').execute()
    courses = courses_response.data
    
    if not courses:
        print("No courses found. Please run the database schema first.")
        return
    
    students = []
    
    for i in range(num_students):
        first_name = random.choice(FIRST_NAMES)
        last_name = random.choice(LAST_NAMES)
        full_name = f"{first_name} {last_name}"
        
        # Generate register number
        year = random.choice([2021, 2022, 2023, 2024])
        course = random.choice(courses)
        reg_num = f"{year}{course['code'][:3]}{str(i+1).zfill(3)}"
        
        city = random.choice(CITIES)
        
        student_data = {
            'register_number': reg_num,
            'course_id': course['id'],
            'current_semester': str(random.randint(1, 8)),
            'shift': random.choice(['day', 'evening']),
            'admission_year': year,
            'date_of_birth': (datetime.now() - timedelta(days=random.randint(6570, 8030))).date().isoformat(),
            'gender': random.choice(['Male', 'Female']),
            'blood_group': random.choice(BLOOD_GROUPS),
            'aadhar_number': str(random.randint(100000000000, 999999999999)),
            'religion': random.choice(RELIGIONS),
            'caste': random.choice(CASTES),
            'father_name': f"{random.choice(FIRST_NAMES)} {last_name}",
            'father_phone': generate_phone(),
            'mother_name': f"{random.choice(FIRST_NAMES)} {last_name}",
            'mother_phone': generate_phone(),
            'annual_income': random.choice(['1_to_2_lakh', '2_to_3_lakh', '3_to_5_lakh', '5_to_8_lakh']),
            'permanent_address': generate_address(city),
            'communication_address': generate_address(city),
            'city': city,
            'state': 'Tamil Nadu',
            'pincode': str(random.randint(600001, 699999)),
            'tenth_board': random.choice(['CBSE', 'State Board (Tamil Nadu)', 'ICSE']),
            'tenth_year': year - 2,
            'tenth_marks': round(random.uniform(75, 95), 2),
            'twelfth_board': random.choice(['CBSE', 'State Board (Tamil Nadu)', 'ICSE']),
            'twelfth_year': year,
            'twelfth_marks': round(random.uniform(70, 95), 2),
            'group_studied': 'Physics, Chemistry, Mathematics (PCM)',
            'medium_of_instruction': random.choice(['English', 'Tamil']),
            'quota_type': random.choice(['government', 'management', 'sports']),
            'first_graduate': random.choice([True, False]),
            'hostel_required': random.choice([True, False]),
            'transport_required': random.choice([True, False]),
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }
        
        students.append(student_data)
    
    # Insert in batches
    batch_size = 10
    for i in range(0, len(students), batch_size):
        batch = students[i:i + batch_size]
        try:
            supabase.table('students').insert(batch).execute()
            print(f"Inserted batch {i//batch_size + 1}/{(len(students) + batch_size - 1)//batch_size}")
        except Exception as e:
            print(f"Error inserting batch: {e}")

def create_mock_faculty(num_faculty=15):
    """Create mock faculty data"""
    print(f"Creating {num_faculty} mock faculty...")
    
    # Get departments
    departments_response = supabase.table('departments').select('id, code').execute()
    departments = departments_response.data
    
    if not departments:
        print("No departments found.")
        return
    
    designations = ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer']
    qualifications = ['Ph.D', 'M.Tech', 'M.E', 'M.Sc', 'MBA']
    
    faculty = []
    
    for i in range(num_faculty):
        first_name = random.choice(FIRST_NAMES)
        last_name = random.choice(LAST_NAMES)
        full_name = f"Dr. {first_name} {last_name}"
        
        dept = random.choice(departments)
        emp_id = f"FAC2024{dept['code']}{str(i+1).zfill(3)}"
        
        faculty_data = {
            'employee_id': emp_id,
            'department_id': dept['id'],
            'designation': random.choice(designations),
            'qualification': random.choice(qualifications),
            'experience_years': random.randint(2, 25),
            'date_of_joining': (datetime.now() - timedelta(days=random.randint(365, 3650))).date().isoformat(),
            'specialization': 'Computer Science and Engineering',
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }
        
        faculty.append(faculty_data)
    
    try:
        supabase.table('faculty').insert(faculty).execute()
        print(f"Successfully created {num_faculty} faculty members")
    except Exception as e:
        print(f"Error creating faculty: {e}")

def create_mock_attendance():
    """Create mock attendance data"""
    print("Creating mock attendance data...")
    
    # Get students and subject assignments
    students_response = supabase.table('students').select('id').execute()
    students = students_response.data
    
    # For simplicity, create some basic attendance records
    attendance_records = []
    
    for student in students[:20]:  # Limit to first 20 students
        for day in range(30):  # Last 30 days
            date = (datetime.now() - timedelta(days=day)).date().isoformat()
            
            # Random attendance status
            status = random.choices(['present', 'absent'], weights=[0.8, 0.2])[0]
            
            attendance_data = {
                'student_id': student['id'],
                'subject_assignment_id': str(uuid.uuid4()),  # Mock assignment ID
                'date': date,
                'period_number': random.randint(1, 6),
                'status': status,
                'created_at': datetime.now().isoformat()
            }
            
            attendance_records.append(attendance_data)
    
    # Insert in batches
    batch_size = 50
    for i in range(0, len(attendance_records), batch_size):
        batch = attendance_records[i:i + batch_size]
        try:
            supabase.table('attendance').insert(batch).execute()
            print(f"Inserted attendance batch {i//batch_size + 1}")
        except Exception as e:
            print(f"Error inserting attendance: {e}")

def create_mock_marks():
    """Create mock marks data"""
    print("Creating mock marks data...")
    
    # Get students and subjects
    students_response = supabase.table('students').select('id, course_id, current_semester').execute()
    students = students_response.data
    
    subjects_response = supabase.table('subjects').select('id, credits').execute()
    subjects = subjects_response.data
    
    marks_records = []
    
    for student in students[:20]:  # Limit to first 20 students
        for subject in subjects[:5]:  # First 5 subjects
            for exam_type in ['IA1', 'IA2', 'MODEL', 'FINAL']:
                max_marks = 100 if exam_type == 'FINAL' else 50
                marks_obtained = random.randint(int(max_marks * 0.4), max_marks)
                
                marks_data = {
                    'student_id': student['id'],
                    'subject_id': subject['id'],
                    'exam_type': exam_type,
                    'marks_obtained': marks_obtained,
                    'max_marks': max_marks,
                    'academic_year': '2024-25',
                    'semester': student['current_semester'],
                    'created_at': datetime.now().isoformat()
                }
                
                marks_records.append(marks_data)
    
    # Insert in batches
    batch_size = 50
    for i in range(0, len(marks_records), batch_size):
        batch = marks_records[i:i + batch_size]
        try:
            supabase.table('marks').insert(batch).execute()
            print(f"Inserted marks batch {i//batch_size + 1}")
        except Exception as e:
            print(f"Error inserting marks: {e}")

def main():
    """Main function to generate all mock data"""
    print("Starting mock data generation...")
    
    try:
        create_mock_students(50)
        create_mock_faculty(15)
        create_mock_attendance()
        create_mock_marks()
        
        print("\nMock data generation completed successfully!")
        print("Generated:")
        print("- 50 Students")
        print("- 15 Faculty members")
        print("- Attendance records")
        print("- Marks records")
        
    except Exception as e:
        print(f"Error during mock data generation: {e}")

if __name__ == "__main__":
    main()
