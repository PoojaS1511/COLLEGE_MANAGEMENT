from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)

# Configure CORS to allow credentials and specific origins
CORS(app, 
     origins=['http://localhost:3001', 'http://127.0.0.1:3001'],
     supports_credentials=True,
     allow_headers=['Content-Type', 'Authorization'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])

# Mock data
MOCK_COURSES = [
    {
        'id': 1,
        'name': 'Bachelor of Technology - Computer Science Engineering',
        'code': 'B.Tech CSE',
        'department_id': 1,
        'duration_years': 4,
        'fee_per_semester': 60000,
        'total_semesters': 8,
        'departments': {'name': 'Computer Science Engineering', 'code': 'CSE'}
    },
    {
        'id': 2,
        'name': 'Bachelor of Technology - Electronics and Communication Engineering',
        'code': 'B.Tech ECE',
        'department_id': 2,
        'duration_years': 4,
        'fee_per_semester': 55000,
        'total_semesters': 8,
        'departments': {'name': 'Electronics and Communication Engineering', 'code': 'ECE'}
    }
]

MOCK_SUBJECTS = [
    {
        'id': 1,
        'name': 'Programming Fundamentals',
        'code': 'CS101',
        'course_id': 1,
        'semester': 1,
        'credits': 4,
        'subject_type': 'theory',
        'is_elective': False,
        'courses': {'name': 'B.Tech CSE', 'code': 'CSE'}
    },
    {
        'id': 2,
        'name': 'Data Structures and Algorithms',
        'code': 'CS301',
        'course_id': 1,
        'semester': 3,
        'credits': 4,
        'subject_type': 'theory',
        'is_elective': False,
        'courses': {'name': 'B.Tech CSE', 'code': 'CSE'}
    }
]

MOCK_STUDENTS = [
    {
        'id': 1,
        'register_number': 'REG2024001',
        'full_name': 'John Doe',
        'email': 'john.doe@email.com',
        'phone': '+91 9876543210',
        'course_id': 1,
        'current_semester': 5,
        'admission_year': 2022,
        'quota_type': 'merit',
        'category': 'general',
        'status': 'active'
    }
]

@app.route('/')
def home():
    return jsonify({"message": "Test Server Running", "status": "ok"})

@app.route('/health')
def health():
    return jsonify({"status": "healthy", "timestamp": datetime.now().isoformat()})

# Courses endpoints
@app.route('/api/courses', methods=['GET'])
def get_courses():
    return jsonify({'success': True, 'data': MOCK_COURSES})

@app.route('/api/admin/courses', methods=['GET'])
def get_admin_courses():
    return jsonify({'success': True, 'data': MOCK_COURSES})

@app.route('/api/admin/courses', methods=['POST'])
def add_course():
    data = request.get_json()
    new_course = {
        'id': len(MOCK_COURSES) + 1,
        **data,
        'departments': {'name': 'Test Department', 'code': 'TEST'}
    }
    MOCK_COURSES.append(new_course)
    return jsonify({'success': True, 'data': new_course})

# Subjects endpoints
@app.route('/api/admin/subjects', methods=['GET'])
def get_subjects():
    return jsonify({'success': True, 'data': MOCK_SUBJECTS})

@app.route('/api/admin/subjects', methods=['POST'])
def add_subject():
    data = request.get_json()
    new_subject = {
        'id': len(MOCK_SUBJECTS) + 1,
        **data,
        'courses': {'name': 'Test Course', 'code': 'TEST'}
    }
    MOCK_SUBJECTS.append(new_subject)
    return jsonify({'success': True, 'data': new_subject})

# Students endpoints
@app.route('/api/students', methods=['GET'])
def get_students():
    return jsonify({'success': True, 'data': MOCK_STUDENTS})

@app.route('/api/students', methods=['POST'])
def add_student():
    data = request.get_json()
    new_student = {
        'id': len(MOCK_STUDENTS) + 1,
        'register_number': f"REG2024{len(MOCK_STUDENTS) + 1:03d}",
        **data,
        'status': 'active'
    }
    MOCK_STUDENTS.append(new_student)
    return jsonify({'success': True, 'data': new_student})

# Faculty endpoints
@app.route('/api/admin/faculty', methods=['GET'])
def get_faculty():
    mock_faculty = [
        {
            'id': 1,
            'employee_id': 'FAC001',
            'full_name': 'Dr. Rajesh Kumar',
            'email': 'dr.rajesh@faculty.edu',
            'phone': '+91 9876543220',
            'department_id': 1,
            'designation': 'Professor',
            'qualification': 'Ph.D in Computer Science',
            'experience_years': 15,
            'date_of_joining': '2010-07-01',
            'salary': 120000,
            'status': 'active',
            'departments': {'name': 'Computer Science Engineering', 'code': 'CSE'}
        }
    ]
    return jsonify({'success': True, 'data': mock_faculty})

@app.route('/api/admin/faculty', methods=['POST'])
def add_faculty():
    data = request.get_json()
    new_faculty = {
        'id': 1,
        'employee_id': f"FAC{len([]) + 1:03d}",
        **data,
        'status': 'active',
        'departments': {'name': 'Test Department', 'code': 'TEST'}
    }
    return jsonify({'success': True, 'data': new_faculty})

# Departments endpoint
@app.route('/api/admin/departments', methods=['GET'])
def get_departments():
    mock_departments = [
        {'id': 1, 'name': 'Computer Science Engineering', 'code': 'CSE'},
        {'id': 2, 'name': 'Electronics and Communication Engineering', 'code': 'ECE'},
        {'id': 3, 'name': 'Mechanical Engineering', 'code': 'MECH'}
    ]
    return jsonify({'success': True, 'data': mock_departments})

# Fee structures endpoint
@app.route('/api/admin/fee-structures', methods=['GET'])
def get_fee_structures():
    mock_fees = [
        {
            'id': 1,
            'course_id': 1,
            'academic_year': '2024-25',
            'semester': 1,
            'tuition_fee': 60000,
            'lab_fee': 8000,
            'library_fee': 2000,
            'sports_fee': 1500,
            'development_fee': 3500,
            'exam_fee': 2000,
            'total_fee': 77000,
            'due_date': '2024-08-15',
            'courses': {'name': 'B.Tech CSE', 'code': 'CSE'}
        }
    ]
    return jsonify({'success': True, 'data': mock_fees})

@app.route('/api/admin/fee-structures', methods=['POST'])
def add_fee_structure():
    data = request.get_json()
    new_fee = {
        'id': 1,
        **data,
        'courses': {'name': 'Test Course', 'code': 'TEST'}
    }
    return jsonify({'success': True, 'data': new_fee})

# Notifications endpoint
@app.route('/api/admin/notifications', methods=['GET'])
def get_notifications():
    mock_notifications = [
        {
            'id': 1,
            'title': 'Welcome to New Academic Year 2024-25',
            'message': 'Welcome all students to the new academic year.',
            'target_audience': 'students',
            'priority': 'high',
            'is_active': True,
            'created_at': '2025-01-15T10:00:00',
            'expires_at': '2025-02-15T23:59:59'
        }
    ]
    return jsonify({'success': True, 'data': mock_notifications})

@app.route('/api/admin/notifications', methods=['POST'])
def send_notification():
    data = request.get_json()
    new_notification = {
        'id': 1,
        **data,
        'created_at': datetime.now().isoformat(),
        'is_active': True
    }
    return jsonify({'success': True, 'data': new_notification})

# Attendance endpoint
@app.route('/api/admin/attendance', methods=['GET'])
def get_attendance():
    mock_attendance = [
        {
            'id': 1,
            'date': '2025-01-15',
            'subject_name': 'Computer Networks',
            'course_name': 'B.Tech CSE',
            'total_students': 30,
            'present_count': 28,
            'absent_count': 2,
        }
    ]
    return jsonify({'success': True, 'data': mock_attendance})

# Student statistics endpoint for admin dashboard
@app.route('/api/students/stats', methods=['GET'])
def get_student_stats():
    mock_stats = {
        'total': 1250,
        'male': 750,
        'female': 500,
        'departments': 8,
        'faculty': 85
    }
    return jsonify({'success': True, 'data': mock_stats})

# Transport endpoint
@app.route('/api/transport/dashboard', methods=['GET'])
def get_transport_dashboard():
    mock_transport = {
        'total_buses': 10,
        'active_routes': 8,
        'total_students': 150,
        'total_faculty': 25
    }
    return jsonify({'success': True, 'data': mock_transport})

@app.route('/api/admin/attendance', methods=['POST'])
def mark_attendance():
    data = request.get_json()
    return jsonify({'success': True, 'message': 'Attendance marked successfully'})

if __name__ == '__main__':
    print("🚀 Starting Test Server...")
    print("Server will be available at: http://localhost:5001")
    app.run(debug=True, host='0.0.0.0', port=5001)
