"""
Upgraded College Management System API Routes
Handles auto-generated student credentials, Supabase authentication, and personalized dashboards
"""

from flask import Blueprint, request, jsonify
from supabase_client import get_supabase
from datetime import datetime
import random
import string
import re

upgraded_bp = Blueprint('upgraded', __name__)
supabase = get_supabase()

# =====================================================
# HELPER FUNCTIONS
# =====================================================

def generate_random_password(length=8):
    """Generate a random password with letters and numbers"""
    characters = string.ascii_letters + string.digits
    password = ''.join(random.choice(characters) for _ in range(length))
    # Ensure at least one uppercase, one lowercase, and one digit
    if not any(c.isupper() for c in password):
        password = password[:-1] + random.choice(string.ascii_uppercase)
    if not any(c.islower() for c in password):
        password = password[:-2] + random.choice(string.ascii_lowercase) + password[-1]
    if not any(c.isdigit() for c in password):
        password = password[:-3] + random.choice(string.digits) + password[-2:]
    return password

def generate_user_id():
    """Generate unique user_id in format STU202510001"""
    try:
        # Get current year
        current_year = datetime.now().year
        
        # Get the maximum number for current year
        result = supabase.table('students').select('user_id').like('user_id', f'STU{current_year}%').order('user_id', desc=True).limit(1).execute()
        
        if result.data and len(result.data) > 0:
            last_user_id = result.data[0]['user_id']
            # Extract the number part (last 5 digits)
            last_number = int(last_user_id[-5:])
            next_number = last_number + 1
        else:
            next_number = 1
        
        # Format: STU + YEAR + 5-digit number
        new_user_id = f"STU{current_year}{str(next_number).zfill(5)}"
        return new_user_id
    except Exception as e:
        print(f"Error generating user_id: {e}")
        # Fallback to timestamp-based ID
        timestamp = int(datetime.now().timestamp())
        return f"STU{current_year}{str(timestamp)[-5:]}"

# =====================================================
# ADMIN ROUTES - ADD STUDENT
# =====================================================

@upgraded_bp.route('/admin/add_student', methods=['POST'])
def add_student():
    """
    Admin endpoint to add a new student with auto-generated credentials
    
    Request Body:
    {
        "name": "John Doe",
        "roll_no": "CS2025001",
        "department": "Computer Science",
        "course_id": 1,
        "year": 1,
        "type": "day_scholar" or "hosteller",
        "phone": "+91 9876543210",
        "date_of_birth": "2005-01-15",
        "gender": "male",
        "address": "123 Main St",
        "parent_name": "Robert Doe",
        "parent_phone": "+91 9876543211"
    }
    
    Response:
    {
        "success": true,
        "message": "Student added successfully",
        "data": {
            "user_id": "STU202510001",
            "password": "Abc12345",
            "email": "STU202510001@college.edu",
            "student": {...}
        }
    }
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'roll_no', 'department', 'course_id', 'year', 'type']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Validate type
        if data['type'] not in ['day_scholar', 'hosteller']:
            return jsonify({
                'success': False,
                'error': 'Type must be either "day_scholar" or "hosteller"'
            }), 400
        
        # Generate unique user_id
        user_id = generate_user_id()
        
        # Generate random password
        password = generate_random_password()
        
        # Create email in format: {user_id}@college.edu
        email = f"{user_id}@college.edu"
        
        # Create Supabase Auth user
        try:
            auth_response = supabase.auth.admin.create_user({
                "email": email,
                "password": password,
                "email_confirm": True,
                "user_metadata": {
                    "role": "student",
                    "user_id": user_id,
                    "name": data['name']
                }
            })
            
            auth_user_id = auth_response.user.id if auth_response.user else None
        except Exception as auth_error:
            print(f"Supabase Auth error: {auth_error}")
            # Continue without auth_user_id if auth fails
            auth_user_id = None
        
        # Prepare student data
        student_data = {
            'user_id': user_id,
            'auth_user_id': auth_user_id,
            'name': data['name'],
            'roll_no': data['roll_no'],
            'email': email,
            'password': password,  # Store plain password (in production, hash this)
            'department': data['department'],
            'course_id': data['course_id'],
            'year': data['year'],
            'type': data['type'],
            'phone': data.get('phone'),
            'date_of_birth': data.get('date_of_birth'),
            'gender': data.get('gender'),
            'address': data.get('address'),
            'parent_name': data.get('parent_name'),
            'parent_phone': data.get('parent_phone'),
            'admission_date': datetime.now().date().isoformat(),
            'status': 'active',
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }
        
        # Insert into students table
        insert_response = supabase.table('students').insert(student_data).execute()
        
        if insert_response.data:
            return jsonify({
                'success': True,
                'message': 'Student added successfully',
                'data': {
                    'user_id': user_id,
                    'password': password,
                    'email': email,
                    'student': insert_response.data[0]
                }
            }), 201
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to insert student into database'
            }), 500
            
    except Exception as e:
        print(f"Error adding student: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# =====================================================
# ADMIN ROUTES - MANAGE STUDENTS
# =====================================================

@upgraded_bp.route('/admin/students', methods=['GET'])
def get_all_students():
    """
    Get all students with optional filters
    
    Query Parameters:
    - search: Search by name, roll_no, or user_id
    - course_id: Filter by course
    - year: Filter by year
    - type: Filter by type (day_scholar/hosteller)
    - page: Page number (default: 1)
    - limit: Items per page (default: 20)
    """
    try:
        # Get query parameters
        search = request.args.get('search', '').strip()
        course_id = request.args.get('course_id')
        year = request.args.get('year')
        student_type = request.args.get('type')
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20))
        
        # Build query
        query = supabase.table('students').select('*, courses(course_name, course_code)')
        
        # Apply filters
        if search:
            query = query.or_(f'name.ilike.%{search}%,roll_no.ilike.%{search}%,user_id.ilike.%{search}%')
        
        if course_id:
            query = query.eq('course_id', course_id)
        
        if year:
            query = query.eq('year', year)
        
        if student_type:
            query = query.eq('type', student_type)
        
        # Apply pagination
        offset = (page - 1) * limit
        query = query.range(offset, offset + limit - 1).order('created_at', desc=True)
        
        # Execute query
        response = query.execute()
        
        # Get total count
        count_query = supabase.table('students').select('id', count='exact')
        if search:
            count_query = count_query.or_(f'name.ilike.%{search}%,roll_no.ilike.%{search}%,user_id.ilike.%{search}%')
        if course_id:
            count_query = count_query.eq('course_id', course_id)
        if year:
            count_query = count_query.eq('year', year)
        if student_type:
            count_query = count_query.eq('type', student_type)
        
        count_response = count_query.execute()
        total = count_response.count if count_response.count else 0
        
        return jsonify({
            'success': True,
            'data': response.data,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total,
                'pages': (total + limit - 1) // limit if total > 0 else 0
            }
        }), 200
        
    except Exception as e:
        print(f"Error fetching students: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@upgraded_bp.route('/admin/students/<int:student_id>', methods=['GET'])
def get_student_by_id(student_id):
    """Get specific student details by ID"""
    try:
        response = supabase.table('students').select('*, courses(*)').eq('id', student_id).execute()
        
        if response.data and len(response.data) > 0:
            return jsonify({
                'success': True,
                'data': response.data[0]
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Student not found'
            }), 404
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@upgraded_bp.route('/admin/students/<int:student_id>', methods=['PUT'])
def update_student(student_id):
    """Update student information"""
    try:
        data = request.get_json()

        # Remove fields that shouldn't be updated
        data.pop('id', None)
        data.pop('user_id', None)
        data.pop('auth_user_id', None)
        data.pop('created_at', None)

        # Add updated_at timestamp
        data['updated_at'] = datetime.now().isoformat()

        # Update student
        response = supabase.table('students').update(data).eq('id', student_id).execute()

        if response.data:
            return jsonify({
                'success': True,
                'message': 'Student updated successfully',
                'data': response.data[0]
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Student not found'
            }), 404

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@upgraded_bp.route('/admin/students/<int:student_id>', methods=['DELETE'])
def delete_student(student_id):
    """Delete a student"""
    try:
        # First get the student to get auth_user_id
        student_response = supabase.table('students').select('auth_user_id').eq('id', student_id).execute()

        if not student_response.data:
            return jsonify({
                'success': False,
                'error': 'Student not found'
            }), 404

        auth_user_id = student_response.data[0].get('auth_user_id')

        # Delete from students table (will cascade to related tables)
        delete_response = supabase.table('students').delete().eq('id', student_id).execute()

        # Try to delete from Supabase Auth if auth_user_id exists
        if auth_user_id:
            try:
                supabase.auth.admin.delete_user(auth_user_id)
            except Exception as auth_error:
                print(f"Error deleting auth user: {auth_error}")

        return jsonify({
            'success': True,
            'message': 'Student deleted successfully'
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@upgraded_bp.route('/admin/students/<int:student_id>/reset_password', methods=['POST'])
def reset_student_password(student_id):
    """Reset student password"""
    try:
        # Generate new password
        new_password = generate_random_password()

        # Get student details
        student_response = supabase.table('students').select('auth_user_id, email').eq('id', student_id).execute()

        if not student_response.data:
            return jsonify({
                'success': False,
                'error': 'Student not found'
            }), 404

        student = student_response.data[0]
        auth_user_id = student.get('auth_user_id')

        # Update password in students table
        update_response = supabase.table('students').update({
            'password': new_password,
            'updated_at': datetime.now().isoformat()
        }).eq('id', student_id).execute()

        # Update password in Supabase Auth if auth_user_id exists
        if auth_user_id:
            try:
                supabase.auth.admin.update_user_by_id(
                    auth_user_id,
                    {"password": new_password}
                )
            except Exception as auth_error:
                print(f"Error updating auth password: {auth_error}")

        return jsonify({
            'success': True,
            'message': 'Password reset successfully',
            'data': {
                'new_password': new_password
            }
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# =====================================================
# AUTHENTICATION ROUTES
# =====================================================

@upgraded_bp.route('/login', methods=['POST'])
def login():
    """
    Student/Admin login endpoint

    Request Body:
    {
        "user_id": "STU202510001" or "admin@college.edu",
        "password": "Abc12345"
    }

    Response:
    {
        "success": true,
        "message": "Login successful",
        "data": {
            "role": "student" or "admin",
            "user": {...},
            "redirect": "/student/dashboard" or "/admin/dashboard"
        }
    }
    """
    try:
        data = request.get_json()
        user_id = data.get('user_id', '').strip()
        password = data.get('password', '').strip()

        if not user_id or not password:
            return jsonify({
                'success': False,
                'error': 'User ID and password are required'
            }), 400

        # Check if it's an admin login (email format)
        if '@' in user_id:
            # Admin login
            try:
                auth_response = supabase.auth.sign_in_with_password({
                    "email": user_id,
                    "password": password
                })

                if auth_response.user:
                    user_metadata = auth_response.user.user_metadata or {}
                    role = user_metadata.get('role', 'admin')

                    return jsonify({
                        'success': True,
                        'message': 'Login successful',
                        'data': {
                            'role': role,
                            'user': {
                                'id': auth_response.user.id,
                                'email': auth_response.user.email,
                                'name': user_metadata.get('name', 'Admin')
                            },
                            'redirect': '/admin/dashboard',
                            'token': auth_response.session.access_token if auth_response.session else None
                        }
                    }), 200
                else:
                    return jsonify({
                        'success': False,
                        'error': 'Invalid credentials'
                    }), 401
            except Exception as auth_error:
                print(f"Admin auth error: {auth_error}")
                return jsonify({
                    'success': False,
                    'error': 'Invalid credentials'
                }), 401
        else:
            # Student login using user_id
            student_response = supabase.table('students').select('*').eq('user_id', user_id).execute()

            if not student_response.data or len(student_response.data) == 0:
                return jsonify({
                    'success': False,
                    'error': 'Invalid user ID or password'
                }), 401

            student = student_response.data[0]

            # Check password
            if student['password'] != password:
                return jsonify({
                    'success': False,
                    'error': 'Invalid user ID or password'
                }), 401

            # Check if student is active
            if student.get('status') != 'active':
                return jsonify({
                    'success': False,
                    'error': 'Account is not active. Please contact administration.'
                }), 403

            # Try to authenticate with Supabase Auth
            email = student['email']
            token = None
            try:
                auth_response = supabase.auth.sign_in_with_password({
                    "email": email,
                    "password": password
                })
                if auth_response.session:
                    token = auth_response.session.access_token
            except Exception as auth_error:
                print(f"Student auth error: {auth_error}")
                # Continue without token

            return jsonify({
                'success': True,
                'message': 'Login successful',
                'data': {
                    'role': 'student',
                    'user': {
                        'id': student['id'],
                        'user_id': student['user_id'],
                        'name': student['name'],
                        'email': student['email'],
                        'department': student['department'],
                        'year': student['year'],
                        'type': student['type']
                    },
                    'redirect': '/student/dashboard',
                    'token': token
                }
            }), 200

    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# =====================================================
# STUDENT DASHBOARD ROUTES
# =====================================================

@upgraded_bp.route('/student_dashboard/<user_id>', methods=['GET'])
def get_student_dashboard(user_id):
    """
    Get personalized dashboard data for a student

    Returns:
    {
        "success": true,
        "data": {
            "profile": {...},
            "subjects": [...],
            "exams": [...],
            "timetable": [...],
            "fees": {...},
            "notifications": [...],
            "events": [...],
            "internships": [...],
            "resume": {...},
            "transport": {...} or null,
            "hostel": {...} or null
        }
    }
    """
    try:
        # Get student profile
        student_response = supabase.table('students').select('*, courses(*)').eq('user_id', user_id).execute()

        if not student_response.data or len(student_response.data) == 0:
            return jsonify({
                'success': False,
                'error': 'Student not found'
            }), 404

        student = student_response.data[0]
        # Use student_id as the foreign key for other tables
        student_id = student.get('id') or student.get('student_id')
        course_id = student.get('course_id')
        year = student.get('year', 1)
        student_type = student.get('type', 'day_scholar')

        print(f"[DEBUG] Found student - Student ID: {student_id}, Course ID: {course_id}, Year: {year}, Type: {student_type}")

        # Validate required fields
        if not student_id:
            print(f"[ERROR] Student record missing student_id. Full student data: {student}")
            return jsonify({
                'success': False,
                'error': 'Student record is missing student_id field'
            }), 400

        if not course_id:
            print(f"[WARNING] Student record missing course_id. Will skip course-related queries.")
            subjects = []
            exams = []
            timetable = []
        else:
            # Get subjects for the student's course
            subjects_response = supabase.table('subjects').select('*').eq('course_id', course_id).execute()
            subjects = subjects_response.data if subjects_response.data else []

            # Get exams for the student's course
            exams_response = supabase.table('exams').select('*, subject:subject_id (id, name, code)').eq('course_id', course_id).execute()
            exams = exams_response.data if exams_response.data else []

            # Get timetable for the student's course and year
            timetable_response = supabase.table('timetable').select('*, subject:subject_id (id, name, code)').eq('course_id', course_id).eq('year', year).execute()
            timetable = timetable_response.data if timetable_response.data else []

        # Get marks for the student
        marks_response = supabase.table('marks').select(''',
            *,
            exam:exam_id (id, name, type, date),
            subject:subject_id (id, name, code)
        ''').eq('student_id', student_id).execute()
        marks = marks_response.data if marks_response.data else []

        # Get fees for the student
        fees_response = supabase.table('fees').select('*').eq('student_id', student_id).execute()
        fees_data = fees_response.data if fees_response.data else []

        # Calculate total fees summary
        total_amount = sum(fee.get('total_amount', 0) for fee in fees_data)
        paid_amount = sum(fee.get('paid_amount', 0) for fee in fees_data)
        pending_amount = total_amount - paid_amount

        fees_summary = {
            'total_amount': total_amount,
            'paid_amount': paid_amount,
            'pending_amount': pending_amount,
            'details': fees_data
        }

        # Get notifications (global + course-specific + individual)
        if course_id:
            notifications_response = supabase.table('notifications').select('*').or_(
                f'notification_type.eq.global,and(notification_type.eq.course_specific,course_id.eq.{course_id}),and(notification_type.eq.individual,student_id.eq.{student_id})'
            ).order('created_at', desc=True).limit(20).execute()
            notifications = notifications_response.data if notifications_response.data else []
        else:
            # If no course_id, only get global and individual notifications
            notifications_response = supabase.table('notifications').select('*').or_(
                f'notification_type.eq.global,and(notification_type.eq.individual,student_id.eq.{student_id})'
            ).order('created_at', desc=True).limit(20).execute()
            notifications = notifications_response.data if notifications_response.data else []

        # Get events (all + course-specific)
        if course_id:
            events_response = supabase.table('events').select('*').or_(
                f'target_audience.eq.all,target_audience.eq.students,and(target_audience.eq.specific_course,course_id.eq.{course_id})'
            ).gte('event_date', datetime.now().date().isoformat()).order('event_date').limit(10).execute()
            events = events_response.data if events_response.data else []
        else:
            # If no course_id, only get general events
            events_response = supabase.table('events').select('*').or_(
                'target_audience.eq.all,target_audience.eq.students'
            ).gte('event_date', datetime.now().date().isoformat()).order('event_date').limit(10).execute()
            events = events_response.data if events_response.data else []

        # Get internships for the student
        internships_response = supabase.table('internships').select('*').eq('student_id', student_id).execute()
        internships = internships_response.data if internships_response.data else []

        # Get resume for the student
        resume_response = supabase.table('resumes').select('*').eq('student_id', student_id).execute()
        resume = resume_response.data[0] if resume_response.data and len(resume_response.data) > 0 else None

        # Conditional data based on student type
        transport_data = None
        hostel_data = None

        if student_type == 'day_scholar':
            # Get transport details
            transport_mapping = supabase.table('student_transport').select('*, transport(*)').eq('student_id', student_id).execute()
            if transport_mapping.data and len(transport_mapping.data) > 0:
                transport_data = transport_mapping.data[0].get('transport')

        elif student_type == 'hosteller':
            # Get hostel details
            hostel_mapping = supabase.table('student_hostel').select('*, hostels(*), hostel_rooms(*)').eq('student_id', student_id).execute()
            if hostel_mapping.data and len(hostel_mapping.data) > 0:
                hostel_data = {
                    'hostel': hostel_mapping.data[0].get('hostels'),
                    'room': hostel_mapping.data[0].get('hostel_rooms'),
                    'bed_number': hostel_mapping.data[0].get('bed_number')
                }

        # Compile dashboard data
        dashboard_data = {
            'profile': student,
            'subjects': subjects,
            'exams': exams,
            'marks': marks,
            'timetable': timetable,
            'fees': fees_summary,
            'notifications': notifications,
            'events': events,
            'internships': internships,
            'resume': resume,
            'transport': transport_data,
            'hostel': hostel_data
        }

        return jsonify({
            'success': True,
            'data': dashboard_data
        }), 200

    except Exception as e:
        print(f"Error fetching student dashboard: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# =====================================================
# CRUD ROUTES FOR EACH TABLE
# =====================================================

@upgraded_bp.route('/courses', methods=['GET', 'POST'])
def handle_courses():
    """Get all courses or create a new course"""
    try:
        if request.method == 'GET':
            response = supabase.table('courses').select('*').execute()
            return jsonify({
                'success': True,
                'data': response.data
            }), 200

        elif request.method == 'POST':
            data = request.get_json()
            data['created_at'] = datetime.now().isoformat()
            data['updated_at'] = datetime.now().isoformat()

            response = supabase.table('courses').insert(data).execute()
            return jsonify({
                'success': True,
                'message': 'Course created successfully',
                'data': response.data[0] if response.data else None
            }), 201

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@upgraded_bp.route('/subjects', methods=['GET', 'POST'])
def handle_subjects():
    """Get all subjects or create a new subject"""
    try:
        if request.method == 'GET':
            course_id = request.args.get('course_id')
            query = supabase.table('subjects').select('*, courses(course_name)')

            if course_id:
                query = query.eq('course_id', course_id)

            response = query.execute()
            return jsonify({
                'success': True,
                'data': response.data
            }), 200

        elif request.method == 'POST':
            data = request.get_json()
            data['created_at'] = datetime.now().isoformat()
            data['updated_at'] = datetime.now().isoformat()

            response = supabase.table('subjects').insert(data).execute()
            return jsonify({
                'success': True,
                'message': 'Subject created successfully',
                'data': response.data[0] if response.data else None
            }), 201

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@upgraded_bp.route('/exams', methods=['GET', 'POST'])
def handle_exams():
    """Get all exams or create a new exam"""
    try:
        if request.method == 'GET':
            course_id = request.args.get('course_id')
            query = supabase.table('exams').select('*, courses(course_name), subjects(subject_name)')

            if course_id:
                query = query.eq('course_id', course_id)

            response = query.execute()
            return jsonify({
                'success': True,
                'data': response.data
            }), 200

        elif request.method == 'POST':
            data = request.get_json()
            data['created_at'] = datetime.now().isoformat()
            data['updated_at'] = datetime.now().isoformat()

            response = supabase.table('exams').insert(data).execute()
            return jsonify({
                'success': True,
                'message': 'Exam created successfully',
                'data': response.data[0] if response.data else None
            }), 201

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@upgraded_bp.route('/fees', methods=['GET', 'POST'])
def handle_fees():
    """Get all fees or create a new fee record"""
    try:
        if request.method == 'GET':
            student_id = request.args.get('student_id')
            query = supabase.table('fees').select('*, students(name, user_id)')

            if student_id:
                query = query.eq('student_id', student_id)

            response = query.execute()
            return jsonify({
                'success': True,
                'data': response.data
            }), 200

        elif request.method == 'POST':
            data = request.get_json()
            data['created_at'] = datetime.now().isoformat()
            data['updated_at'] = datetime.now().isoformat()

            response = supabase.table('fees').insert(data).execute()
            return jsonify({
                'success': True,
                'message': 'Fee record created successfully',
                'data': response.data[0] if response.data else None
            }), 201

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@upgraded_bp.route('/notifications', methods=['GET', 'POST'])
def handle_notifications():
    """Get all notifications or create a new notification"""
    try:
        if request.method == 'GET':
            student_id = request.args.get('student_id')
            course_id = request.args.get('course_id')

            query = supabase.table('notifications').select('*')

            if student_id:
                query = query.or_(f'notification_type.eq.global,student_id.eq.{student_id}')
            elif course_id:
                query = query.or_(f'notification_type.eq.global,course_id.eq.{course_id}')

            response = query.order('created_at', desc=True).execute()
            return jsonify({
                'success': True,
                'data': response.data
            }), 200

        elif request.method == 'POST':
            data = request.get_json()
            data['created_at'] = datetime.now().isoformat()

            response = supabase.table('notifications').insert(data).execute()
            return jsonify({
                'success': True,
                'message': 'Notification created successfully',
                'data': response.data[0] if response.data else None
            }), 201

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@upgraded_bp.route('/events', methods=['GET', 'POST'])
def handle_events():
    """Get all events or create a new event"""
    try:
        if request.method == 'GET':
            response = supabase.table('events').select('*').order('event_date').execute()
            return jsonify({
                'success': True,
                'data': response.data
            }), 200

        elif request.method == 'POST':
            data = request.get_json()
            data['created_at'] = datetime.now().isoformat()
            data['updated_at'] = datetime.now().isoformat()

            response = supabase.table('events').insert(data).execute()
            return jsonify({
                'success': True,
                'message': 'Event created successfully',
                'data': response.data[0] if response.data else None
            }), 201

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

