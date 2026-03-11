from auth_service import auth_service
from postgres_client import execute_insert

# Create a test user in both users and students tables
try:
    # Create auth user
    user = auth_service.create_user('student@example.com', 'password123', 'student', {'name': 'Test Student'})
    print(f'Auth user created: {user["id"]}')
    
    # Create corresponding student record
    student_data = {
        'name': 'Test Student',
        'email': 'student@example.com',
        'phone': '1234567890',
        'register_number': 'REG2026001',
        'date_of_birth': '2000-01-01',
        'gender': 'male',
        'status': 'active'
    }
    
    student = execute_insert('students', student_data)
    print(f'Student record created: {student["id"]}')
    
    print('✅ Test user created successfully!')
    print('Email: student@example.com')
    print('Password: password123')
    
except Exception as e:
    print(f'Error: {e}')
