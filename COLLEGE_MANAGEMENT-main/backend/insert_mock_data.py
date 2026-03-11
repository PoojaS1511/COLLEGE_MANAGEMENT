#!/usr/bin/env python3
"""
Script to insert mock data into Supabase database
"""

import httpx
from supabase import create_client, Client
from datetime import datetime, date
import uuid

# Store original __init__ method
_original_init = httpx.Client.__init__

# Patch httpx.Client.__init__ to ignore proxy argument
def patched_init(self, *args, **kwargs):
    # Remove proxy from kwargs if present
    kwargs.pop('proxy', None)
    return _original_init(self, *args, **kwargs)

# Apply the patch
httpx.Client.__init__ = patched_init

# Supabase configuration
SUPABASE_URL = "https://qkaaoeismqnhjyikgkme.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrYWFvZWlzbXFuaGp5aWtna21lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMDI1NzQsImV4cCI6MjA2OTg3ODU3NH0.o3K8BNVZucbqFWsPzIZJ_H8_ApR3uu9Cvjm5C9HFKX0"

def main():
    try:
        # Initialize Supabase client
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("✅ Connected to Supabase")

        # Insert Departments
        print("📚 Inserting Departments...")
        departments_data = [
            {'id': 1, 'name': 'Computer Science Engineering', 'code': 'CSE', 'head_of_department': 'Dr. Rajesh Kumar'},
            {'id': 2, 'name': 'Electronics and Communication Engineering', 'code': 'ECE', 'head_of_department': 'Dr. Priya Sharma'},
            {'id': 3, 'name': 'Mechanical Engineering', 'code': 'MECH', 'head_of_department': 'Dr. Suresh Reddy'},
            {'id': 4, 'name': 'Civil Engineering', 'code': 'CIVIL', 'head_of_department': 'Dr. Lakshmi Devi'},
            {'id': 5, 'name': 'Information Technology', 'code': 'IT', 'head_of_department': 'Dr. Arun Kumar'}
        ]
        
        for dept in departments_data:
            try:
                result = supabase.table('departments').upsert(dept).execute()
                print(f"  ✅ Inserted department: {dept['name']}")
            except Exception as e:
                print(f"  ❌ Error inserting department {dept['name']}: {e}")

        # Insert Courses
        print("🎓 Inserting Courses...")
        courses_data = [
            {'id': 1, 'name': 'Bachelor of Technology - Computer Science Engineering', 'code': 'B.Tech CSE', 'department_id': 1, 'duration_years': 4, 'fee_per_semester': 60000, 'total_semesters': 8},
            {'id': 2, 'name': 'Bachelor of Technology - Electronics and Communication Engineering', 'code': 'B.Tech ECE', 'department_id': 2, 'duration_years': 4, 'fee_per_semester': 55000, 'total_semesters': 8},
            {'id': 3, 'name': 'Bachelor of Technology - Mechanical Engineering', 'code': 'B.Tech MECH', 'department_id': 3, 'duration_years': 4, 'fee_per_semester': 50000, 'total_semesters': 8},
            {'id': 4, 'name': 'Bachelor of Technology - Civil Engineering', 'code': 'B.Tech CIVIL', 'department_id': 4, 'duration_years': 4, 'fee_per_semester': 48000, 'total_semesters': 8},
            {'id': 5, 'name': 'Bachelor of Technology - Information Technology', 'code': 'B.Tech IT', 'department_id': 5, 'duration_years': 4, 'fee_per_semester': 58000, 'total_semesters': 8}
        ]
        
        for course in courses_data:
            try:
                result = supabase.table('courses').upsert(course).execute()
                print(f"  ✅ Inserted course: {course['name']}")
            except Exception as e:
                print(f"  ❌ Error inserting course {course['name']}: {e}")

        # Insert Users
        print("👥 Inserting Users...")
        users_data = [
            {'id': '550e8400-e29b-41d4-a716-446655440001', 'email': 'admin@college.edu', 'role': 'admin'},
            {'id': '550e8400-e29b-41d4-a716-446655440002', 'email': 'john.doe@student.edu', 'role': 'student'},
            {'id': '550e8400-e29b-41d4-a716-446655440003', 'email': 'jane.smith@student.edu', 'role': 'student'},
            {'id': '550e8400-e29b-41d4-a716-446655440004', 'email': 'mike.johnson@student.edu', 'role': 'student'},
            {'id': '550e8400-e29b-41d4-a716-446655440005', 'email': 'dr.rajesh@faculty.edu', 'role': 'faculty'},
            {'id': '550e8400-e29b-41d4-a716-446655440006', 'email': 'dr.priya@faculty.edu', 'role': 'faculty'}
        ]
        
        for user in users_data:
            try:
                result = supabase.table('users').upsert(user).execute()
                print(f"  ✅ Inserted user: {user['email']}")
            except Exception as e:
                print(f"  ❌ Error inserting user {user['email']}: {e}")

        # Insert Students
        print("🎓 Inserting Students...")
        students_data = [
            {
                'id': 1,
                'user_id': '550e8400-e29b-41d4-a716-446655440002',
                'register_number': 'REG2024001',
                'full_name': 'John Doe',
                'email': 'john.doe@student.edu',
                'phone': '+91 9876543210',
                'date_of_birth': '2003-05-15',
                'gender': 'male',
                'course_id': 1,
                'current_semester': 5,
                'admission_year': 2022,
                'admission_date': '2022-08-15',
                'quota_type': 'merit',
                'category': 'general',
                'father_name': 'Robert Doe',
                'mother_name': 'Mary Doe',
                'permanent_address': '123 Main St, Anna Nagar, Chennai',
                'current_address': '456 College Rd, Hostel Block A, Room 205',
                'city': 'Chennai',
                'state': 'Tamil Nadu',
                'pincode': '600001',
                'tenth_percentage': 95.5,
                'tenth_board': 'CBSE',
                'twelfth_percentage': 92.3,
                'twelfth_board': 'CBSE',
                'entrance_exam_score': 145,
                'entrance_exam_rank': 1250,
                'hostel_required': True,
                'transport_required': False,
                'first_graduate': True,
                'status': 'active'
            },
            {
                'id': 2,
                'user_id': '550e8400-e29b-41d4-a716-446655440003',
                'register_number': 'REG2024002',
                'full_name': 'Jane Smith',
                'email': 'jane.smith@student.edu',
                'phone': '+91 9876543211',
                'date_of_birth': '2004-08-22',
                'gender': 'female',
                'course_id': 2,
                'current_semester': 3,
                'admission_year': 2023,
                'admission_date': '2023-08-15',
                'quota_type': 'sports',
                'category': 'obc',
                'father_name': 'James Smith',
                'mother_name': 'Lisa Smith',
                'permanent_address': '789 Oak Ave, Bangalore, Karnataka',
                'current_address': '321 Hostel Block A',
                'city': 'Bangalore',
                'state': 'Karnataka',
                'pincode': '560001',
                'tenth_percentage': 88.7,
                'tenth_board': 'State Board',
                'twelfth_percentage': 85.4,
                'twelfth_board': 'State Board',
                'entrance_exam_score': 132,
                'entrance_exam_rank': 2100,
                'hostel_required': False,
                'transport_required': True,
                'first_graduate': False,
                'status': 'active'
            },
            {
                'id': 3,
                'user_id': '550e8400-e29b-41d4-a716-446655440004',
                'register_number': 'REG2024003',
                'full_name': 'Mike Johnson',
                'email': 'mike.johnson@student.edu',
                'phone': '+91 9876543212',
                'date_of_birth': '2002-12-10',
                'gender': 'male',
                'course_id': 3,
                'current_semester': 7,
                'admission_year': 2021,
                'admission_date': '2021-08-15',
                'quota_type': 'management',
                'category': 'sc',
                'father_name': 'David Johnson',
                'mother_name': 'Sarah Johnson',
                'permanent_address': '456 Pine St, Hyderabad, Telangana',
                'current_address': '789 Hostel Block B',
                'city': 'Hyderabad',
                'state': 'Telangana',
                'pincode': '500001',
                'tenth_percentage': 82.3,
                'tenth_board': 'CBSE',
                'twelfth_percentage': 78.9,
                'twelfth_board': 'CBSE',
                'entrance_exam_score': 118,
                'entrance_exam_rank': 3500,
                'hostel_required': True,
                'transport_required': True,
                'first_graduate': True,
                'status': 'active'
            }
        ]
        
        for student in students_data:
            try:
                result = supabase.table('students').upsert(student).execute()
                print(f"  ✅ Inserted student: {student['full_name']}")
            except Exception as e:
                print(f"  ❌ Error inserting student {student['full_name']}: {e}")

        print("\n🎉 Mock data insertion completed!")
        print("✅ Database is now populated with sample data")

    except Exception as e:
        print(f"❌ Error connecting to Supabase: {e}")

if __name__ == "__main__":
    main()
