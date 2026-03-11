from flask import Blueprint, request, jsonify
from postgres_client import execute_query, execute_insert, execute_update, execute_delete
from datetime import datetime, timedelta
import uuid
import random
import string
import secrets

admin_bp = Blueprint('admin', __name__)

def generate_user_id():
    """Generate unique user ID in format STU202510001"""
    try:
        current_year = datetime.now().year

        # Get the maximum number for current year
        max_query = "SELECT user_id FROM students WHERE user_id LIKE %s ORDER BY user_id DESC LIMIT 1"
        result = execute_query(max_query, [f'STU{current_year}%'], fetch_all=False)

        if result and result['user_id']:
            last_user_id = result['user_id']
            # Extract the number part (last 5 digits)
            last_number = int(last_user_id[-5:])
            next_number = last_number + 1
        else:
            next_number = 1

        # Generate new user_id
        new_user_id = f'STU{current_year}{str(next_number).zfill(5)}'
        return new_user_id
    except Exception as e:
        # Fallback to random generation if query fails
        return f'STU{datetime.now().year}{str(random.randint(10000, 99999))}'

def generate_random_password(length=8):
    """Generate a random password"""
    characters = string.ascii_letters + string.digits
    password = ''.join(random.choice(characters) for i in range(length))
    return password

@admin_bp.route('/dashboard', methods=['GET'])
def get_dashboard_stats():
    """Get admin dashboard statistics"""
    try:
        # Student statistics
        total_students = execute_query("SELECT COUNT(*) as total FROM students", fetch_all=False)
        
        # Gender statistics
        male_students = execute_query("SELECT COUNT(*) as total FROM students WHERE gender = 'male'", fetch_all=False)
        female_students = execute_query("SELECT COUNT(*) as total FROM students WHERE gender = 'female'", fetch_all=False)
        
        # Course statistics
        course_stats = execute_query("""
            SELECT c.name as course_name, COUNT(s.id) as student_count
            FROM courses c
            LEFT JOIN students s ON c.id = s.course_id
            GROUP BY c.id, c.name
            ORDER BY student_count DESC
        """, fetch_all=True)
        
        # Recent admissions
        recent_admissions = execute_query("""
            SELECT s.name, s.register_number, s.email, c.name as course_name, s.created_at
            FROM students s
            LEFT JOIN courses c ON s.course_id = c.id
            ORDER BY s.created_at DESC
            LIMIT 5
        """, fetch_all=True)
        
        # Attendance statistics
        attendance_stats = execute_query("""
            SELECT 
                COUNT(*) as total_classes,
                COUNT(CASE WHEN status = 'present' THEN 1 END) as present_classes,
                ROUND((COUNT(CASE WHEN status = 'present' THEN 1 END) * 100.0 / COUNT(*)), 2) as attendance_percentage
            FROM attendance
        """, fetch_all=False)
        
        dashboard_data = {
            'total_students': total_students['total'] if total_students else 0,
            'male_students': male_students['total'] if male_students else 0,
            'female_students': female_students['total'] if female_students else 0,
            'course_statistics': course_stats,
            'recent_admissions': recent_admissions,
            'attendance_stats': attendance_stats
        }
        
        return jsonify({
            'success': True,
            'data': dashboard_data
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@admin_bp.route('/add_student', methods=['POST'])
def add_student():
    """Add a new student"""
    try:
        data = request.get_json()
        
        required_fields = ['name', 'email', 'phone', 'course_id']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Check if email already exists
        existing_email = execute_query("SELECT id FROM students WHERE email = %s", [data['email']], fetch_all=False)
        if existing_email:
            return jsonify({
                'success': False,
                'error': 'Email already registered'
            }), 400
        
        # Generate register number
        current_year = datetime.now().year % 100
        random_digits = ''.join(random.choices('0123456789', k=5))
        register_number = f'REG{current_year}{random_digits}'
        
        # Ensure unique register number
        while True:
            existing_reg = execute_query("SELECT id FROM students WHERE register_number = %s", [register_number], fetch_all=False)
            if not existing_reg:
                break
            random_digits = ''.join(random.choices('0123456789', k=5))
            register_number = f'REG{current_year}{random_digits}'
        
        # Generate user ID
        user_id = generate_user_id()
        
        # Generate password
        password = secrets.token_urlsafe(12)
        
        student_data = {
            'user_id': user_id,
            'name': data['name'],
            'email': data['email'],
            'phone': data['phone'],
            'register_number': register_number,
            'course_id': data['course_id'],
            'date_of_birth': data.get('date_of_birth'),
            'gender': data.get('gender'),
            'address': data.get('address'),
            'blood_group': data.get('blood_group'),
            'parent_name': data.get('parent_name'),
            'parent_phone': data.get('parent_phone'),
            'quota_type': data.get('quota_type', 'merit'),
            'category': data.get('category', 'general'),
            'hostel_required': data.get('hostel_required', False),
            'transport_required': data.get('transport_required', False),
            'status': 'pending',
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        # Insert student
        student = execute_insert('students', student_data)
        
        if not student:
            return jsonify({
                'success': False,
                'error': 'Failed to create student'
            }), 500
        
        # Create user account
        try:
            from auth_service import AuthService
            auth_service = AuthService()
            
            auth_user = auth_service.create_user(
                data['email'], 
                password, 
                'student', 
                {'name': data['name'], 'user_id': user_id}
            )
            
            # Update student with user_id and active status
            execute_update('students', student['id'], {
                'user_id': auth_user['id'],
                'status': 'active',
                'updated_at': datetime.utcnow().isoformat()
            })
            
        except Exception as auth_error:
            print(f"Auth user creation failed: {auth_error}")
            # Continue even if auth user creation fails
        
        return jsonify({
            'success': True,
            'message': 'Student added successfully',
            'data': {
                'student': student,
                'temporary_password': password
            }
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@admin_bp.route('/students/create', methods=['POST'])
def create_student():
    """Create a new student with full details"""
    try:
        data = request.get_json()
        
        required_fields = ['name', 'email', 'phone', 'course_id', 'department_id']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Validate email format
        import re
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, data['email']):
            return jsonify({
                'success': False,
                'error': 'Invalid email format'
            }), 400
        
        # Check if email already exists
        existing_email = execute_query("SELECT id FROM students WHERE email = %s", [data['email']], fetch_all=False)
        if existing_email:
            return jsonify({
                'success': False,
                'error': 'Email already registered'
            }), 400
        
        # Generate register number
        current_year = datetime.now().year % 100
        random_digits = ''.join(random.choices('0123456789', k=5))
        register_number = f'REG{current_year}{random_digits}'
        
        # Ensure unique register number
        while True:
            existing_reg = execute_query("SELECT id FROM students WHERE register_number = %s", [register_number], fetch_all=False)
            if not existing_reg:
                break
            random_digits = ''.join(random.choices('0123456789', k=5))
            register_number = f'REG{current_year}{random_digits}'
        
        # Generate user ID
        user_id = generate_user_id()
        
        # Generate secure password
        password = secrets.token_urlsafe(12)
        
        student_data = {
            'user_id': user_id,
            'name': data['name'],
            'email': data['email'],
            'phone': data['phone'],
            'register_number': register_number,
            'course_id': data['course_id'],
            'department_id': data['department_id'],
            'date_of_birth': data.get('date_of_birth'),
            'gender': data.get('gender'),
            'address': data.get('address', ''),
            'blood_group': data.get('blood_group'),
            'parent_name': data.get('parent_name'),
            'parent_phone': data.get('parent_phone'),
            'quota_type': data.get('quota_type', 'merit'),
            'category': data.get('category', 'general'),
            'hostel_required': data.get('hostel_required', False),
            'transport_required': data.get('transport_required', False),
            'status': 'pending',
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        # Insert student
        student = execute_insert('students', student_data)
        
        if not student:
            return jsonify({
                'success': False,
                'error': 'Failed to create student'
            }), 500
        
        # Create user account
        try:
            from auth_service import AuthService
            auth_service = AuthService()
            
            auth_user = auth_service.create_user(
                data['email'], 
                password, 
                'student', 
                {'name': data['name'], 'user_id': user_id}
            )
            
            # Update student with user_id and active status
            execute_update('students', student['id'], {
                'user_id': auth_user['id'],
                'status': 'active',
                'updated_at': datetime.utcnow().isoformat()
            })
            
        except Exception as auth_error:
            print(f"Auth user creation failed: {auth_error}")
        
        return jsonify({
            'success': True,
            'message': 'Student created successfully',
            'data': {
                'student': student,
                'temporary_password': password
            }
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@admin_bp.route('/faculty/create', methods=['POST'])
def create_faculty():
    """Create a new faculty member"""
    try:
        data = request.get_json()
        
        required_fields = ['name', 'email', 'employee_id', 'department_id', 'designation']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Check if email already exists
        existing_email = execute_query("SELECT id FROM faculty WHERE email = %s", [data['email']], fetch_all=False)
        if existing_email:
            return jsonify({
                'success': False,
                'error': 'Email already registered'
            }), 400
        
        # Check if employee ID already exists
        existing_emp = execute_query("SELECT id FROM faculty WHERE employee_id = %s", [data['employee_id']], fetch_all=False)
        if existing_emp:
            return jsonify({
                'success': False,
                'error': 'Employee ID already exists'
            }), 400
        
        faculty_data = {
            'name': data['name'],
            'email': data['email'],
            'phone': data.get('phone'),
            'employee_id': data['employee_id'],
            'department_id': data['department_id'],
            'designation': data['designation'],
            'qualification': data.get('qualification'),
            'specialization': data.get('specialization'),
            'experience_years': data.get('experience_years', 0),
            'date_of_joining': data.get('date_of_joining'),
            'salary': data.get('salary'),
            'status': data.get('status', 'active'),
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        # Insert faculty
        faculty = execute_insert('faculty', faculty_data)
        
        if not faculty:
            return jsonify({
                'success': False,
                'error': 'Failed to create faculty'
            }), 500
        
        return jsonify({
            'success': True,
            'message': 'Faculty member created successfully',
            'data': faculty
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@admin_bp.route('/courses', methods=['GET', 'POST'])
def manage_courses():
    """Manage courses (GET for list, POST for create)"""
    if request.method == 'GET':
        try:
            query = """
                SELECT c.*, d.name as department_name, d.code as department_code
                FROM courses c
                LEFT JOIN departments d ON c.department_id = d.id
                ORDER BY c.name
            """
            
            courses = execute_query(query, fetch_all=True)
            
            return jsonify({
                'success': True,
                'data': courses
            })
            
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500
    
    elif request.method == 'POST':
        try:
            data = request.get_json()
            
            required_fields = ['name', 'code', 'department_id']
            for field in required_fields:
                if field not in data:
                    return jsonify({
                        'success': False,
                        'error': f'Missing required field: {field}'
                    }), 400
            
            # Check if course code already exists
            existing = execute_query("SELECT id FROM courses WHERE code = %s", [data['code']], fetch_all=False)
            if existing:
                return jsonify({
                    'success': False,
                    'error': 'Course code already exists'
                }), 400
            
            course_data = {
                'name': data['name'],
                'code': data['code'],
                'department_id': data['department_id'],
                'duration_years': data.get('duration_years', 4),
                'description': data.get('description', ''),
                'created_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat()
            }
            
            course = execute_insert('courses', course_data)
            
            return jsonify({
                'success': True,
                'message': 'Course created successfully',
                'data': course
            }), 201
            
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500

@admin_bp.route('/departments', methods=['GET', 'POST'])
def manage_departments():
    """Manage departments (GET for list, POST for create)"""
    if request.method == 'GET':
        try:
            query = """
                SELECT d.*, 
                       COUNT(c.id) as course_count,
                       COUNT(f.id) as faculty_count
                FROM departments d
                LEFT JOIN courses c ON d.id = c.department_id
                LEFT JOIN faculty f ON d.id = f.department_id
                GROUP BY d.id, d.name, d.code, d.head_of_department, d.description, d.created_at, d.updated_at
                ORDER BY d.name
            """
            
            departments = execute_query(query, fetch_all=True)
            
            return jsonify({
                'success': True,
                'data': departments
            })
            
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500
    
    elif request.method == 'POST':
        try:
            data = request.get_json()
            
            required_fields = ['name', 'code']
            for field in required_fields:
                if field not in data:
                    return jsonify({
                        'success': False,
                        'error': f'Missing required field: {field}'
                    }), 400
            
            # Check if department code already exists
            existing = execute_query("SELECT id FROM departments WHERE code = %s", [data['code']], fetch_all=False)
            if existing:
                return jsonify({
                    'success': False,
                    'error': 'Department code already exists'
                }), 400
            
            department_data = {
                'name': data['name'],
                'code': data['code'],
                'head_of_department': data.get('head_of_department'),
                'description': data.get('description', ''),
                'created_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat()
            }
            
            department = execute_insert('departments', department_data)
            
            return jsonify({
                'success': True,
                'message': 'Department created successfully',
                'data': department
            }), 201
            
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500

@admin_bp.route('/hostel/allocations', methods=['GET', 'POST'])
def manage_hostel_allocations():
    """Manage hostel allocations (GET for list, POST for create)"""
    if request.method == 'GET':
        try:
            query = """
                SELECT ha.*, s.name as student_name, s.register_number,
                       h.name as hostel_name, h.room_number, h.capacity,
                       r.name as room_name, r.floor_number, r.block
                FROM hostel_allocations ha
                LEFT JOIN students s ON ha.student_id = s.id
                LEFT JOIN hostels h ON ha.hostel_id = h.id
                LEFT JOIN rooms r ON ha.room_id = r.id
                ORDER BY ha.allocation_date DESC
            """
            
            allocations = execute_query(query, fetch_all=True)
            
            return jsonify({
                'success': True,
                'data': allocations
            })
            
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500
    
    elif request.method == 'POST':
        try:
            data = request.get_json()
            
            required_fields = ['student_id', 'hostel_id', 'room_id']
            for field in required_fields:
                if field not in data:
                    return jsonify({
                        'success': False,
                        'error': f'Missing required field: {field}'
                    }), 400
            
            allocation_data = {
                'student_id': data['student_id'],
                'hostel_id': data['hostel_id'],
                'room_id': data['room_id'],
                'allocation_date': data.get('allocation_date', datetime.utcnow().isoformat()),
                'status': data.get('status', 'allocated'),
                'created_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat()
            }
            
            allocation = execute_insert('hostel_allocations', allocation_data)
            
            return jsonify({
                'success': True,
                'message': 'Hostel allocation created successfully',
                'data': allocation
            }), 201
            
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500

@admin_bp.route('/students/<int:student_id>', methods=['GET', 'PUT', 'DELETE'])
def manage_student(student_id):
    """Manage individual student (GET, PUT, DELETE)"""
    if request.method == 'GET':
        try:
            query = """
                SELECT s.*, c.name as course_name, c.code as course_code,
                       d.name as department_name, d.code as department_code
                FROM students s
                LEFT JOIN courses c ON s.course_id = c.id
                LEFT JOIN departments d ON c.department_id = d.id
                WHERE s.id = %s
            """
            
            student = execute_query(query, [student_id], fetch_all=False)
            
            if not student:
                return jsonify({
                    'success': False,
                    'error': 'Student not found'
                }), 404
            
            return jsonify({
                'success': True,
                'data': student
            })
            
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500
    
    elif request.method == 'PUT':
        try:
            data = request.get_json()
            
            data['updated_at'] = datetime.utcnow().isoformat()
            
            result = execute_update('students', student_id, data)
            
            if not result:
                return jsonify({
                    'success': False,
                    'error': 'Student not found'
                }), 404
            
            return jsonify({
                'success': True,
                'message': 'Student updated successfully',
                'data': result
            })
            
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500
    
    elif request.method == 'DELETE':
        try:
            result = execute_delete('students', student_id)
            
            if not result:
                return jsonify({
                    'success': False,
                    'error': 'Student not found'
                }), 404
            
            return jsonify({
                'success': True,
                'message': 'Student deleted successfully'
            })
            
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500

@admin_bp.route('/students/<int:student_id>/reset_password', methods=['POST'])
def reset_student_password(student_id):
    """Reset student password"""
    try:
        # Get student details
        student = execute_query("SELECT * FROM students WHERE id = %s", [student_id], fetch_all=False)
        
        if not student:
            return jsonify({
                'success': False,
                'error': 'Student not found'
            }), 404
        
        # Generate new password
        new_password = secrets.token_urlsafe(12)
        
        # Update user password
        try:
            from auth_service import AuthService
            auth_service = AuthService()
            
            # Update user password
            auth_service.update_password(student['user_id'], new_password)
            
        except Exception as auth_error:
            return jsonify({
                'success': False,
                'error': f'Failed to update password: {str(auth_error)}'
            }), 500
        
        return jsonify({
            'success': True,
            'message': 'Password reset successfully',
            'data': {
                'new_password': new_password
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@admin_bp.route('/notifications/broadcast', methods=['POST'])
def broadcast_notification():
    """Send broadcast notification to all users"""
    try:
        data = request.get_json()
        
        required_fields = ['title', 'message', 'sender_id', 'sender_type']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        notification_data = {
            'id': str(uuid.uuid4()),
            'title': data['title'],
            'message': data['message'],
            'sender_id': data['sender_id'],
            'sender_type': data['sender_type'],
            'notification_type': 'broadcast',
            'target_audience': 'all',
            'priority': data.get('priority', 'high'),
            'is_active': True,
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        # Create notification
        notification = execute_insert('notifications', notification_data)
        
        # Get all users to send notification
        users_query = """
            SELECT id, email, full_name FROM profiles 
            WHERE role IN ('student', 'faculty', 'admin')
        """
        users = execute_query(users_query, fetch_all=True)
        
        # Create notification records for each user
        sent_count = 0
        for user in users:
            user_notification_data = {
                'id': str(uuid.uuid4()),
                'notification_id': notification['id'],
                'user_id': user['id'],
                'status': 'sent',
                'sent_at': datetime.utcnow().isoformat(),
                'created_at': datetime.utcnow().isoformat()
            }
            
            execute_insert('user_notifications', user_notification_data)
            sent_count += 1
        
        return jsonify({
            'success': True,
            'message': f'Broadcast sent to {sent_count} users',
            'data': notification
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@admin_bp.route('/cleanup_orphaned_auth_users', methods=['POST', 'GET'])
def cleanup_orphaned_auth_users():
    """Clean up orphaned auth users"""
    try:
        # Get all auth users
        from auth_service import AuthService
        auth_service = AuthService()
        
        # Get all students
        students = execute_query("SELECT user_id FROM students WHERE user_id IS NOT NULL", fetch_all=True)
        valid_user_ids = {student['user_id'] for student in students}
        
        # Get all users from auth system
        all_users = auth_service.get_all_users()
        
        orphaned_users = []
        cleaned_count = 0
        
        for user in all_users:
            user_id = user.get('id')
            if user_id not in valid_user_ids:
                orphaned_users.append(user)
                try:
                    # Delete orphaned user
                    auth_service.delete_user(user_id)
                    cleaned_count += 1
                except Exception as cleanup_error:
                    print(f"Failed to cleanup user {user_id}: {cleanup_error}")
        
        return jsonify({
            'success': True,
            'message': f'Cleaned up {cleaned_count} orphaned users',
            'data': {
                'orphaned_users_found': len(orphaned_users),
                'cleaned_count': cleaned_count,
                'orphaned_users': orphaned_users[:10]  # Show first 10 for debugging
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@admin_bp.route('/reports/academic', methods=['GET'])
def get_academic_report():
    """Generate academic performance report"""
    try:
        academic_year = request.args.get('academic_year', datetime.now().year)
        semester = request.args.get('semester')
        
        # Get overall statistics
        stats_query = """
            SELECT 
                COUNT(DISTINCT s.id) as total_students,
                COUNT(DISTINCT c.id) as total_courses,
                COUNT(DISTINCT sub.id) as total_subjects,
                COUNT(DISTINCT e.id) as total_exams,
                COUNT(m.id) as total_marks_entries,
                COUNT(CASE WHEN m.marks_obtained >= e.passing_marks THEN 1 END) as passed_exams,
                ROUND(AVG(m.marks_obtained), 2) as average_marks
            FROM students s
            LEFT JOIN courses c ON s.course_id = c.id
            LEFT JOIN subjects sub ON c.id = sub.course_id
            LEFT JOIN exams e ON sub.id = e.subject_id AND e.academic_year = %s
            LEFT JOIN marks m ON e.id = m.exam_id
        """
        params = [academic_year]
        
        if semester:
            stats_query += " WHERE sub.semester = %s"
            params.append(semester)
        
        stats = execute_query(stats_query, params, fetch_all=False)
        
        # Get course-wise performance
        course_query = """
            SELECT 
                c.name as course_name, c.code as course_code,
                COUNT(DISTINCT s.id) as student_count,
                COUNT(m.id) as total_marks,
                COUNT(CASE WHEN m.marks_obtained >= e.passing_marks THEN 1 END) as passed_marks,
                ROUND(AVG(m.marks_obtained), 2) as average_marks
            FROM courses c
            LEFT JOIN students s ON c.id = s.course_id
            LEFT JOIN subjects sub ON c.id = sub.course_id
            LEFT JOIN exams e ON sub.id = e.subject_id AND e.academic_year = %s
            LEFT JOIN marks m ON e.id = m.exam_id
        """
        course_params = [academic_year]
        
        if semester:
            course_query += " WHERE sub.semester = %s"
            course_params.append(semester)
        
        course_query += """
            GROUP BY c.id, c.name, c.code
            ORDER BY average_marks DESC
        """
        
        by_course = execute_query(course_query, course_params, fetch_all=True)
        
        # Get grade distribution
        grade_query = """
            SELECT 
                m.grade,
                COUNT(*) as student_count,
                ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM marks m2
                    LEFT JOIN exams e2 ON m2.exam_id = e2.id
                    WHERE e2.academic_year = %s
        """
        grade_params = [academic_year]
        
        if semester:
            grade_query += " AND e2.semester = %s"
            grade_params.append(semester)
        
        grade_query += """
                )), 2) as percentage
            FROM marks m
            LEFT JOIN exams e ON m.exam_id = e.id
            WHERE e.academic_year = %s
        """
        grade_params.extend([academic_year])
        
        if semester:
            grade_query += " AND e.semester = %s"
            grade_params.append(semester)
        
        grade_query += """
            GROUP BY m.grade
            ORDER BY student_count DESC
        """
        
        grade_distribution = execute_query(grade_query, grade_params, fetch_all=True)
        
        report_data = {
            'academic_year': academic_year,
            'semester': semester,
            'statistics': stats,
            'course_performance': by_course,
            'grade_distribution': grade_distribution
        }
        
        return jsonify({
            'success': True,
            'data': report_data
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
