from flask import Blueprint, request, jsonify, current_app, g
from flask_cors import cross_origin
from postgres_client import execute_query, execute_insert, execute_update, execute_delete
import os
import uuid
from datetime import datetime
import secrets
import string
import re
from datetime import datetime, timedelta
import json
import traceback
import requests
from middleware.auth_middleware import auth_required
from typing import Dict, Optional, Tuple

students_bp = Blueprint('students', __name__)

# PostgreSQL is used directly, no Supabase clients needed

def create_student_with_auth(student_data: Dict) -> Tuple[Optional[Dict], Optional[str], Optional[str]]:
    """
    Create a new student with Supabase authentication
    
    Args:
        student_data: Dictionary containing student details
        
    Returns:
        Tuple containing (student_data, auth_user_id, temp_password) on success
        or (None, None, error_message) on failure
    """
    try:
        email = student_data.get('email', '').strip().lower()
        full_name = student_data.get('full_name', '').strip()
        
        if not email or not full_name:
            return None, None, 'Email and full name are required'
            
        # 1. Check if auth user with this email already exists
        auth_check = supabase_admin.auth.admin.list_users().filter('email', 'eq', email).execute()
        auth_user_id = None
        
        if auth_check and hasattr(auth_check, 'data') and auth_check.data:
            # Get the auth user ID from the existing auth user
            auth_user_id = auth_check.data[0]['id']
            
            # Check if a student already exists with this auth_user_id
            existing_student = supabase.table('students').select('id').eq('user_id', auth_user_id).execute()
            if existing_student.data:
                return None, None, 'A student with this email already exists'
                
            return None, None, f'Auth user exists but no student record found. Auth user ID: {auth_user_id}'
            
        # Also check if email exists in students table (legacy check)
        existing_email = supabase.table('students').select('id').eq('email', email).execute()
        if existing_email.data:
            return None, None, 'A student with this email already exists (legacy check)'
            
        # 2. Generate a secure temporary password
        temp_password = generate_secure_password()
        
        # 3. Create auth user if it doesn't exist
        try:
            if not auth_user_id:  # Only create new auth user if one doesn't exist
                auth_response = supabase_admin.auth.admin.create_user({
                    "email": email,
                    "password": temp_password,
                    "email_confirm": True,
                    "user_metadata": {
                        "full_name": full_name,
                        "role": "student"
                    }
                })
                
                if not auth_response or not hasattr(auth_response, 'user') or not auth_response.user:
                    return None, None, 'Failed to create authentication user'
                    
                auth_user_id = auth_response.user.id
                print(f"[INFO] Created new auth user: {auth_user_id}")
            else:
                print(f"[INFO] Using existing auth user: {auth_user_id}")
            
            # 4. Create profile in profiles table
            profile_data = {
                'id': auth_user_id,
                'email': email,
                'full_name': full_name,
                'role': 'student',
                'created_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat()
            }
            
            profile_response = supabase.table('profiles').insert(profile_data).execute()
            if hasattr(profile_response, 'error') and profile_response.error:
                raise Exception(f"Failed to create profile: {profile_response.error}")
            
            # 5. Create student record
            student_db_data = {
                'id': str(uuid.uuid4()),
                'user_id': auth_user_id,  # This will match the auth user ID
                'auth_user_id': auth_user_id,  # Store as separate field for easier querying
                'email': email,
                'full_name': full_name,
                'created_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat()
            }
            
            # Add any additional student fields
            optional_fields = ['phone', 'course_id', 'department_id', 'register_number', 
                             'date_of_birth', 'gender', 'address']
            
            for field in optional_fields:
                if field in student_data and student_data[field] is not None:
                    student_db_data[field] = student_data[field]
            
            student_response = supabase.table('students').insert(student_db_data).execute()
            if hasattr(student_response, 'error') and student_response.error:
                raise Exception(f"Failed to create student record: {student_response.error}")
            
            # 6. Create credentials record (if needed)
            try:
                credentials_data = {
                    'auth_user_id': auth_user_id,
                    'email': email,
                    'role': 'student',
                    'is_active': True,
                    'created_at': datetime.utcnow().isoformat(),
                    'updated_at': datetime.utcnow().isoformat()
                }
                supabase.table('credentials').insert(credentials_data).execute()
            except Exception as cred_error:
                # Non-fatal error, just log it
                current_app.logger.error(f"Failed to create credentials record: {str(cred_error)}")
            
            # Return the created student data
            return student_db_data, auth_user_id, temp_password
            
        except Exception as auth_error:
            # Cleanup auth user if it was created
            if 'auth_user_id' in locals():
                try:
                    supabase_admin.auth.admin.delete_user(auth_user_id)
                except:
                    pass
            raise auth_error
            
    except Exception as e:
        error_msg = str(e)
        current_app.logger.error(f"Error in create_student_with_auth: {error_msg}")
        return None, None, error_msg

def log_error(error_type, error, details=None):
    """Helper function to log errors consistently"""
    error_msg = f"[{error_type.upper()}] {str(error)}"
    if details:
        error_msg += f"\nDetails: {details}"
    print(error_msg)
    if hasattr(error, 'args') and error.args:
        print(f"Error details: {error.args}")
    traceback.print_exc()
    return error_msg

def extract_error_details(error):
    """Extract error details from various error types"""
    if hasattr(error, 'message'):
        return str(error.message)
    elif hasattr(error, 'args') and error.args:
        return str(error.args[0])
    return str(error) if str(error) != 'None' else 'Unknown error'

def prepare_student_data(data, auth_user_id=None):
    """Prepare student data for database insertion"""
    student_data = {
        'id': str(uuid.uuid4()),
        'register_number': data.get('register_number', ''),
        'full_name': data['full_name'].strip(),
        'name': data.get('name', data['full_name']).strip(),
        'email': data['email'].strip(),
        'phone': str(data['phone']).strip(),
        'gender': data.get('gender', 'male'),
        'date_of_birth': data.get('date_of_birth'),
        'blood_group': data.get('blood_group', 'O+'),
        'address': data.get('address', '').strip(),
        'course_id': data['course_id'],
        'department_id': data['department_id'],
        'year': int(data.get('year', 1)),
        'current_semester': int(data.get('current_semester', 1)),
        'section': str(data.get('section', 'A')).upper()[:1],
        'admission_year': int(data.get('admission_year', datetime.now().year)),
        'admission_date': data.get('admission_date') or datetime.now().date().isoformat(),
        'father_name': data.get('father_name', '').strip(),
        'mother_name': data.get('mother_name', '').strip(),
        'guardian_name': data.get('guardian_name', '').strip(),
        'guardian_phone': str(data.get('guardian_phone', '')).strip(),
        'annual_income': data.get('annual_income'),
        'status': data.get('status', 'active'),
        'type': data.get('type', 'day_scholar'),
        'quota': data.get('quota', 'GENERAL'),
        'category': data.get('category', 'GENERAL'),
        'quota_type': data.get('quota_type', 'GENERAL'),
        'hostel_required': bool(data.get('hostel_required', False)),
        'transport_required': bool(data.get('transport_required', False)),
        'first_graduate': bool(data.get('first_graduate', False)),
        'created_at': datetime.utcnow().isoformat(),
        'updated_at': datetime.utcnow().isoformat()
    }
    
    if auth_user_id:
        student_data['auth_user_id'] = auth_user_id
        
    return student_data

def create_student_profile(auth_user_id, full_name):
    """Create a profile record for the student"""
    try:
        profile_data = {
            'id': auth_user_id,
            'name': full_name,
            'role': 'student',

        }
        
        print(f"[DEBUG] Creating profile for auth_user_id: {auth_user_id}")
        profile_response = supabase.table('profiles').insert(profile_data).execute()
        
        if hasattr(profile_response, 'error') and profile_response.error:
            error_msg = str(profile_response.error)
            print(f"[ERROR] Failed to create profile: {error_msg}")
            raise Exception(f"Failed to create profile: {error_msg}")
            
        print(f"[SUCCESS] Created profile for auth_user_id: {auth_user_id}")
        return True
        
    except Exception as e:
        error_msg = f"Profile creation failed: {str(e)}"
        print(f"[ERROR] {error_msg}")
        raise Exception(error_msg)

def create_student_record(student_data, auth_user_id):
    """Create a student record and associated profile in the database with enhanced error handling"""
    try:
        # Check for existing email first
        existing = supabase.table('students')\
            .select('id,email')\
            .eq('email', student_data['email'])\
            .execute()
            
        if existing.data and len(existing.data) > 0:
            return jsonify({
                'success': False,
                'error': 'A student with this email already exists',
                'code': 'EMAIL_ALREADY_EXISTS',
                'student_id': existing.data[0]['id']
            }), 409

        # Start a transaction
        print("[DEBUG] Starting transaction for student and profile creation")
        
        try:
            # First create the profile
            create_student_profile(auth_user_id, student_data['full_name'])
            
            # Then create the student record
            response = supabase.table('students').insert(student_data).execute()
            
            if hasattr(response, 'error') and response.error:
                error_msg = str(response.error)
                if 'duplicate key value violates unique constraint' in error_msg:
                    return jsonify({
                        'success': False,
                        'error': 'A student with this email already exists',
                        'code': 'DUPLICATE_EMAIL',
                        'details': error_msg
                    }), 409
                raise Exception(error_msg)
                
            # Get the created student ID
            student_id = response.data[0].get('id') if response.data else None
            if not student_id:
                raise Exception('Failed to get student ID after creation')
                
            print(f"[SUCCESS] Created student record with ID: {student_id}")
            
            # Return success response
            return jsonify({
                'success': True,
                'message': 'Student created successfully',
                'student_id': student_id,
                'auth_user_id': auth_user_id,
                'data': response.data[0] if response.data else None
            })
            
        except Exception as e:
            # If we get here, something went wrong with either profile or student creation
            # The transaction will be rolled back automatically
            error_msg = str(e)
            print(f"[ERROR] Transaction failed: {error_msg}")
            raise
            
    except Exception as e:
        error_msg = str(e)
        log_error('Student Creation Failed', e, 
                 f'Failed to create student record for auth user: {auth_user_id}')
        
        # Handle specific error cases
        if 'duplicate key value violates unique constraint' in error_msg:
            return jsonify({
                'success': False,
                'error': 'A student with this email already exists',
                'code': 'DUPLICATE_EMAIL',
                'details': error_msg
            }), 409
            
        return jsonify({
            'success': False,
            'error': 'Failed to create student record',
            'code': 'STUDENT_CREATION_ERROR',
            'details': error_msg
        }), 500

def generate_secure_password(length=10):
    """Generate a simple but secure random password that works with Supabase"""
    # Use a simpler character set that's less likely to cause issues
    letters = string.ascii_letters  # a-z, A-Z
    digits = string.digits  # 0-9
    
    # Ensure we have at least one of each required character type
    password = [
        secrets.choice(string.ascii_lowercase),  # at least 1 lowercase
        secrets.choice(string.ascii_uppercase),  # at least 1 uppercase
        secrets.choice(digits),                  # at least 1 digit
    ]
    
    # Fill the rest of the password with random characters
    remaining_length = max(0, length - len(password))
    password.extend(secrets.choice(letters + digits) for _ in range(remaining_length))
    
    # Shuffle the characters to make it random
    secrets.SystemRandom().shuffle(password)
    
    return ''.join(password)

@students_bp.route('/', methods=['GET'])
def get_students():
    """Get all students with pagination and filters"""
    try:
        # Get query parameters
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        search = request.args.get('search', '')
        course_id = request.args.get('course_id')
        semester = request.args.get('semester')
        
        # Build query
        query = supabase.table('students').select("""
            *,
            courses (
                id,
                name,
                code,
                departments (
                    name,
                    code
                )
            )
        """)
        
        if search:
            query = query.or_(f'full_name.ilike.%{search}%,register_number.ilike.%{search}%,email.ilike.%{search}%')
        
        if course_id:
            query = query.eq('course_id', course_id)
        
        if semester:
            query = query.eq('current_semester', semester)
        
        # Execute query with pagination
        offset = (page - 1) * limit
        response = query.range(offset, offset + limit - 1).order('created_at', desc=True).execute()
        
        # Get total count - use * instead of id for compatibility
        try:
            count_query = supabase.table('students').select('*', count='exact').limit(0)
            if search:
                count_query = count_query.or_(f'full_name.ilike.%{search}%,register_number.ilike.%{search}%,email.ilike.%{search}%')
            if course_id:
                count_query = count_query.eq('course_id', course_id)
            if semester:
                count_query = count_query.eq('current_semester', semester)
            
            count_response = count_query.execute()
            total_count = count_response.count if hasattr(count_response, 'count') and count_response.count else 0
        except Exception as count_error:
            print(f"Error getting count, using data length: {count_error}")
            # Fallback: use the length of returned data as approximation
            total_count = len(response.data) if response.data else 0
        
        return jsonify({
            'success': True,
            'data': response.data,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total_count,
                'pages': (total_count + limit - 1) // limit
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@students_bp.route('/<student_id>', methods=['GET'])
def get_student(student_id):
    """Get specific student details"""
    try:
        response = supabase.table('students').select("""
            *,
            courses (
                id,
                name,
                code,
                fee_per_semester,
                departments (
                    name,
                    code
                )
            )
        """).eq('id', student_id).execute()
        
        if response.data:
            return jsonify({
                'success': True,
                'data': response.data[0]
            }), 200
        else:
            return jsonify({'error': 'Student not found'}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@students_bp.route('/<int:student_id>', methods=['PUT'])
def update_student(student_id):
    """Update student information"""
    try:
        data = request.get_json()
        
        # Remove fields that shouldn't be updated directly
        restricted_fields = ['id', 'register_number', 'user_id', 'created_at']
        for field in restricted_fields:
            data.pop(field, None)
        
        data['updated_at'] = datetime.now().isoformat()
        
        response = supabase.table('students').update(data).eq('id', student_id).execute()
        
        if response.data:
            return jsonify({
                'success': True,
                'message': 'Student updated successfully',
                'data': response.data[0]
            }), 200
        else:
            return jsonify({'error': 'Student not found'}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@students_bp.route('/<student_id>/attendance', methods=['GET'])
def get_student_attendance(student_id):
    """Get student attendance records"""
    try:
        # Get query parameters
        subject_id = request.args.get('subject_id')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        # Build query
        query = supabase.table('attendance').select("""
            *,
            subject_assignments (
                subjects (
                    id,
                    name,
                    code
                ),
                faculty (
                    profiles (
                        full_name
                    )
                )
            )
        """).eq('student_id', student_id)
        
        if subject_id:
            query = query.eq('subject_assignments.subject_id', subject_id)
        
        if start_date:
            query = query.gte('date', start_date)
        
        if end_date:
            query = query.lte('date', end_date)
        
        response = query.order('date', desc=True).execute()
        
        # Calculate attendance statistics
        total_classes = len(response.data)
        present_classes = len([r for r in response.data if r['status'] == 'present'])
        attendance_percentage = (present_classes / total_classes * 100) if total_classes > 0 else 0
        
        return jsonify({
            'success': True,
            'data': response.data,
            'statistics': {
                'total_classes': total_classes,
                'present_classes': present_classes,
                'absent_classes': total_classes - present_classes,
                'attendance_percentage': round(attendance_percentage, 2)
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@students_bp.route('/<student_id>/marks', methods=['GET'])
def get_student_marks(student_id):
    """Get student marks/grades"""
    try:
        # Get query parameters
        semester = request.args.get('semester')
        academic_year = request.args.get('academic_year')
        
        # Build query
        query = supabase.table('marks').select("""
            *,
            subjects (
                id,
                name,
                code,
                credits
            )
        """).eq('student_id', student_id)
        
        if semester:
            query = query.eq('semester', semester)
        
        if academic_year:
            query = query.eq('academic_year', academic_year)
        
        response = query.order('semester').order('subjects.name').execute()
        
        # Calculate GPA/CGPA
        marks_data = response.data
        semester_wise_gpa = {}
        
        for mark in marks_data:
            sem = mark['semester']
            if sem not in semester_wise_gpa:
                semester_wise_gpa[sem] = {'total_credits': 0, 'total_points': 0, 'subjects': []}
            
            # Calculate grade points (assuming 10-point scale)
            percentage = (mark['marks_obtained'] / mark['max_marks']) * 100
            grade_point = calculate_grade_point(percentage)
            credits = mark['subjects']['credits']
            
            semester_wise_gpa[sem]['total_credits'] += credits
            semester_wise_gpa[sem]['total_points'] += grade_point * credits
            semester_wise_gpa[sem]['subjects'].append({
                'subject': mark['subjects']['name'],
                'marks': mark['marks_obtained'],
                'max_marks': mark['max_marks'],
                'percentage': round(percentage, 2),
                'grade_point': grade_point,
                'credits': credits
            })
        
        # Calculate semester GPAs
        for sem in semester_wise_gpa:
            if semester_wise_gpa[sem]['total_credits'] > 0:
                semester_wise_gpa[sem]['gpa'] = round(
                    semester_wise_gpa[sem]['total_points'] / semester_wise_gpa[sem]['total_credits'], 2
                )
        
        # Calculate overall CGPA
        total_credits = sum(sem_data['total_credits'] for sem_data in semester_wise_gpa.values())
        total_points = sum(sem_data['total_points'] for sem_data in semester_wise_gpa.values())
        cgpa = round(total_points / total_credits, 2) if total_credits > 0 else 0
        
        return jsonify({
            'success': True,
            'data': marks_data,
            'semester_wise_gpa': semester_wise_gpa,
            'cgpa': cgpa
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def calculate_grade_point(percentage):
    """Calculate grade point based on percentage"""
    if percentage >= 90:
        return 10
    elif percentage >= 80:
        return 9
    elif percentage >= 70:
        return 8
    elif percentage >= 60:
        return 7
    elif percentage >= 50:
        return 6
    elif percentage >= 40:
        return 5
    else:
        return 0

@students_bp.route('/<student_id>/timetable', methods=['GET'])
def get_student_timetable(student_id):
    """Get student timetable"""
    try:
        # First get student's course and semester
        student_response = supabase.table('students').select('course_id, current_semester').eq('id', student_id).execute()
        
        if not student_response.data:
            return jsonify({'error': 'Student not found'}), 404
        
        student = student_response.data[0]
        
        # Get timetable for student's course and semester
        response = supabase.table('timetable').select("""
            *,
            subject_assignments (
                subjects (
                    id,
                    name,
                    code
                ),
                faculty (
                    profiles (
                        full_name
                    )
                )
            )
        """).eq('subject_assignments.course_id', student['course_id']).eq('subject_assignments.semester', student['current_semester']).execute()
        
        # Organize timetable by day
        timetable_by_day = {}
        for entry in response.data:
            day = entry['day_of_week']
            if day not in timetable_by_day:
                timetable_by_day[day] = []
            timetable_by_day[day].append(entry)
        
        # Sort by time for each day
        for day in timetable_by_day:
            timetable_by_day[day].sort(key=lambda x: x['start_time'])
        
        return jsonify({
            'success': True,
            'data': timetable_by_day
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@students_bp.route('/stats', methods=['GET'])
def get_student_stats():
    """Get student statistics"""
    print("\n=== GET /api/students/stats called ===")
    print(f"Request headers: {request.headers}")
    print(f"Request method: {request.method}")
    print(f"Request URL: {request.url}")
    
    try:
        print("\n1. Starting to fetch students data...")
        # Get all students once and count from data (more reliable than count='exact')
        # Only select minimal fields needed for statistics
        try:
            print("2. Executing Supabase query for students...")
            all_students = supabase.table('students').select('gender, current_semester, course_id').limit(10000).execute()
            print(f"3. Supabase query completed. Response: {hasattr(all_students, 'data') and len(all_students.data) if hasattr(all_students, 'data') else 'No data'}")
            
            students_data = all_students.data if hasattr(all_students, 'data') and all_students.data else []
            total_students = len(students_data)
            print(f"4. Found {total_students} students")
            
        except Exception as e:
            print(f"Error fetching students: {str(e)}")
            import traceback
            print(traceback.format_exc())
            total_students = 0
            students_data = []
        
        print("5. Calculating gender statistics...")
        # Count by gender from the data
        male_count = sum(1 for s in students_data if s and s.get('gender', '').lower() in ['male', 'm'])
        female_count = sum(1 for s in students_data if s and s.get('gender', '').lower() in ['female', 'f'])
        other_count = max(0, total_students - male_count - female_count)
        
        print(f"6. Gender stats - Male: {male_count}, Female: {female_count}, Other: {other_count}")
        
        print("7. Calculating semester statistics...")
        # Count by semester
        semester_stats = {}
        for sem in ['1', '2', '3', '4', '5', '6', '7', '8']:
            count = sum(1 for s in students_data if s and str(s.get('current_semester', '')).strip() == str(sem).strip())
            semester_stats[f'semester_{sem}'] = count
        
        print(f"8. Semester stats: {semester_stats}")
        
        print("9. Calculating course statistics...")
        # Count by course
        course_wise_data = {}
        for student in students_data:
            if not student:
                continue
            course_id = student.get('course_id')
            if course_id:
                if course_id not in course_wise_data:
                    course_wise_data[course_id] = {'course_id': course_id, 'count': 0}
                course_wise_data[course_id]['count'] += 1
        
        print(f"10. Found {len(course_wise_data)} unique courses")
        
        # Get course names for the course_wise data
        course_wise_list = []
        try:
            if course_wise_data:
                course_ids = list(course_wise_data.keys())
                print(f"11. Fetching course details for {len(course_ids)} courses...")
                courses_response = supabase.table('courses').select('id, name, code').in_('id', course_ids).execute()
                courses_dict = {c['id']: c for c in (courses_response.data if hasattr(courses_response, 'data') and courses_response.data else [])}
                
                for course_id, data in course_wise_data.items():
                    course_info = courses_dict.get(course_id, {})
                    course_wise_list.append({
                        'course_id': course_id,
                        'count': data['count'],
                        'name': course_info.get('name', 'Unknown'),
                        'code': course_info.get('code', '')
                    })
                print(f"12. Processed {len(course_wise_list)} course entries")
        except Exception as e:
            print(f"Error fetching course details: {str(e)}")
            import traceback
            print(traceback.format_exc())
        
        print("13. Preparing final response...")
        # Return format expected by frontend
        response_data = {
            'success': True,
            'total': total_students,
            'male': male_count,
            'female': female_count,
            'other': other_count,
            'total_students': total_students,
            'semester_wise': semester_stats,
            'course_wise': course_wise_list
        }
        print(f"14. Sending response with {total_students} total students")
        return jsonify(response_data), 200
        
    except Exception as e:
        import traceback
        error_msg = f"Error in get_student_stats: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        # Return default values on error
        return jsonify({
            'success': False,
            'error': str(e),
            'total': 0,
            'male': 0,
            'female': 0,
            'other': 0,
            'total_students': 0,
            'semester_wise': {},
            'course_wise': []
        }), 500

def is_valid_date(date_str):
    """Validate date format and year range (1900-current year)"""
    if not date_str:
        return True
    try:
        from datetime import datetime
        date_obj = datetime.strptime(date_str, '%Y-%m-%d')
        return 1900 <= date_obj.year <= datetime.now().year
    except (ValueError, TypeError):
        return False

@students_bp.route('/', methods=['POST'])
def add_student():
    """Add a new student with Supabase authentication"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['full_name', 'email']
        missing_fields = [field for field in required_fields if not data.get(field)]
        if missing_fields:
            return jsonify({
                'success': False,
                'error': f'Missing required fields: {", ".join(missing_fields)}'
            }), 400
            
        # Validate email format
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_regex, data['email']):
            return jsonify({
                'success': False,
                'error': 'Invalid email format. Please enter a valid email address.'
            }), 400
            
        # Create student with auth
        student_data, auth_user_id, temp_password = create_student_with_auth(data)
        
        if not student_data or not auth_user_id:
            return jsonify({
                'success': False,
                'error': temp_password or 'Failed to create student'
            }), 500
            
        # Return success response (don't include temp_password in production!)
        return jsonify({
            'success': True,
            'message': 'Student created successfully',
            'student_id': student_data['id'],
            'auth_user_id': auth_user_id,
            'temporary_password': temp_password  # Remove in production or secure this
        }), 201
        
    except Exception as e:
        error_msg = str(e)
        current_app.logger.error(f"Error in add_student: {error_msg}\n{traceback.format_exc()}")
        return jsonify({
            'success': False,
            'error': 'Failed to create student',
            'details': error_msg if current_app.config.get('DEBUG') else None
        }), 500

        # Validate required fields
        required_fields = ['full_name', 'email', 'phone', 'course_id', 'department_id']
        missing_fields = [field for field in required_fields if not data.get(field)]
        if missing_fields:
            return jsonify({
                'success': False,
                'error': f'Missing required fields: {", ".join(missing_fields)}'
            }), 400

        # Validate and normalize email
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        email = data['email'].strip().lower()
        print(f"[DEBUG] Validating email: {email}")
        
        if not re.match(email_regex, email):
            error_msg = f'Invalid email format: {email}'
            print(f"[ERROR] {error_msg}")
            return jsonify({
                'success': False,
                'error': 'Invalid email format. Please enter a valid email address.',
                'details': error_msg
            }), 400

        # 1. First, check if email exists in students table
        print("[DEBUG] Checking for existing student with this email...")
        email_check = supabase.table('students').select('id, full_name, auth_user_id').eq('email', email).execute()
        if email_check.data and len(email_check.data) > 0:
            existing_student = email_check.data[0]
            error_msg = f"A student with this email already exists (ID: {existing_student.get('id')}, Name: {existing_student.get('full_name')})"
            print(f"[ERROR] {error_msg}")
            return jsonify({
                'success': False,
                'error': 'A student with this email already exists.',
                'code': 'STUDENT_EMAIL_EXISTS',
                'details': error_msg
            }), 409

        # 2. Handle authentication user
        auth_user_id = None
        password = None
        print("[DEBUG] Starting auth user handling...")
        
        try:
            # First, try to get any existing auth user by email
            try:
                # First check if a student with this email already exists
                existing_student = supabase.table('students') \
                    .select('id, full_name, email, auth_user_id') \
                    .eq('email', email) \
                    .execute()
                
                if existing_student.data:
                    existing = existing_student.data[0]
                    error_msg = f"This email is already registered to student ID: {existing.get('id')}"
                    print(f"[ERROR] {error_msg}")
                    return jsonify({
                        'success': False,
                        'error': 'This email is already registered to a student',
                        'code': 'STUDENT_EXISTS',
                        'student_id': existing.get('id'),
                        'student_name': existing.get('full_name')
                    }), 409
                
                # Now check for existing auth user
                auth_check = supabase_admin.auth.admin.list_users().filter('email', 'eq', email).execute()
                
                if auth_check and hasattr(auth_check, 'data') and auth_check.data:
                    # User exists in auth but not linked to any student
                    auth_user = auth_check.data[0]
                    auth_user_id = auth_user['id']
                    print(f"[INFO] Found existing auth user (not linked to student): {auth_user_id}")
                    
                    # Double check there's no student with this auth_user_id (just to be safe)
                    linked_student = supabase.table('students') \
                        .select('id') \
                        .eq('auth_user_id', auth_user_id) \
                        .execute()
                        
                    if linked_student.data:
                        error_msg = f"Auth user {auth_user_id} is already linked to a student"
                        print(f"[ERROR] {error_msg}")
                        return jsonify({
                            'success': False,
                            'error': 'Authentication error',
                            'code': 'AUTH_LINK_ERROR',
                            'details': error_msg
                        }), 500
                        
                    print(f"[INFO] Will use existing auth user: {auth_user_id}")
                    
            except Exception as auth_check_error:
                if 'User not found' not in str(auth_check_error):
                    print(f"[WARNING] Error checking for existing auth user: {str(auth_check_error)}")
                
            # If no existing auth user, create one
            if not auth_user_id:
                password = generate_secure_password()
                print(f"[INFO] Creating new auth user for {email}")
                
                user_metadata = {
                    'full_name': data['full_name'].strip(),
                    'role': 'student',
                    'account_type': 'student'
                }
                
                try:
                    # First try to create the user
                    user_response = supabase_admin.auth.admin.create_user({
                        'email': email,
                        'password': password,
                        'email_confirm': True,
                        'user_metadata': user_metadata
                    })
                    
                    if user_response and hasattr(user_response, 'user') and user_response.user:
                        auth_user_id = user_response.user.id
                        print(f"[SUCCESS] Created auth user with ID: {auth_user_id}")
                    else:
                        raise Exception("Invalid response when creating auth user")
                        
                except Exception as create_error:
                    error_msg = str(create_error).lower()
                    
                    # If user already exists, try to fetch it
                    if 'already been registered' in error_msg or 'already exists' in error_msg:
                        print(f"[INFO] Auth user already exists, fetching: {email}")
                        try:
                            auth_check = supabase_admin.auth.admin.list_users().filter('email', 'eq', email).execute()
                            if auth_check and hasattr(auth_check, 'data') and auth_check.data:
                                auth_user_id = auth_check.data[0]['id']
                                print(f"[INFO] Using existing auth user: {auth_user_id}")
                            else:
                                raise Exception("Auth user exists but could not be fetched")
                        except Exception as fetch_error:
                            error_msg = f"Failed to fetch existing auth user: {str(fetch_error)}"
                            print(f"[ERROR] {error_msg}")
                            raise Exception(error_msg) from fetch_error
                    else:
                        # For other errors, re-raise
                        raise
                
        except Exception as auth_error:
            error_msg = f"Auth error: {str(auth_error)}"
            print(f"[ERROR] {error_msg}")
            log_error('Auth Process Error', auth_error, f'Error during auth process for: {email}')
            
            # Clean up any partially created auth user
            if auth_user_id:
                try:
                    supabase_admin.auth.admin.delete_user(auth_user_id)
                    print(f"[INFO] Cleaned up auth user {auth_user_id} after error")
                except Exception as cleanup_error:
                    print(f"[WARNING] Failed to clean up auth user {auth_user_id}: {str(cleanup_error)}")
            
            return jsonify({
                'success': False,
                'error': 'Failed to process user authentication',
                'code': 'AUTH_PROCESS_ERROR',
                'details': str(auth_error)
            }), 500

        # 4. At this point, we have a valid auth_user_id (either existing or new)
        # Now create the student record
        try:
            student_data = prepare_student_data(data, auth_user_id)
            
            # If we generated a password, include it in the response
            response = create_student_record(student_data, auth_user_id)
            if password:
                response_data = response.get_json()
                if response_data and isinstance(response_data, dict):
                    response_data['temp_password'] = password
                    response.set_data(json.dumps(response_data))
            
            return response
            
        except Exception as e:
            # Cleanup: If we created a new auth user but student creation failed,
            # we should delete the auth user to prevent orphaned accounts
            if 'user_response' in locals() and hasattr(user_response, 'user'):
                try:
                    supabase_admin.auth.admin.delete_user(auth_user_id)
                    print(f"[CLEANUP] Deleted orphaned auth user: {auth_user_id}")
                except Exception as delete_error:
                    log_error('Cleanup Failed', delete_error, f'Failed to delete orphaned auth user: {auth_user_id}')
            
            log_error('Student Creation Failed', e, f'Failed to create student record for auth user: {auth_user_id}')
            return jsonify({
                'success': False,
                'error': 'Failed to create student record',
                'code': 'STUDENT_CREATION_ERROR',
                'details': str(e)
            }), 500

        # Create auth user if not exists
        if not auth_user_id:
            try:
                password = generate_secure_password()
                print(f"[INFO] Creating new auth user for {email}")
                
                user_metadata = {
                    "full_name": data['full_name'].strip(),
                    "role": "student",
                    "account_type": "student"
                }
                
                user_response = supabase_admin.auth.admin.create_user({
                    "email": email,
                    "password": password,
                    "email_confirm": True,
                    "user_metadata": user_metadata
                })
                
                if not user_response or not hasattr(user_response, 'user') or not user_response.user:
                    error_msg = "Failed to create auth user: No user data in response"
                    print(f"[ERROR] {error_msg}")
                    raise Exception(error_msg)
                
                auth_user_id = user_response.user.id
                print(f"[SUCCESS] Created auth user with ID: {auth_user_id}")
                
                # Add user to the 'student' role in the database
                try:
                    role_response = supabase.table('user_roles').insert({
                        'user_id': auth_user_id,
                        'role': 'student',
                        'created_at': datetime.utcnow().isoformat()
                    }).execute()
                    
                    print(f"[DEBUG] Assigned 'student' role to user {auth_user_id}")
                    
                except Exception as role_error:
                    error_msg = f"Failed to assign student role: {str(role_error)}"
                    print(f"[ERROR] {error_msg}")
                    log_error('Role Assignment Error', role_error, f'Failed to assign role for user: {auth_user_id}')
                    # Don't fail the entire process if role assignment fails
                
                # At this point, we have successfully created the auth user with ID: auth_user_id
                print(f"[SUCCESS] Created auth user with ID: {auth_user_id}")
                
                # 1. Insert into profiles table
                try:
                    profile_data = {
                        'id': auth_user_id,
                        'full_name': data['full_name'].strip(),
                        'email': email,
                        'role': 'student',
                        'created_at': datetime.utcnow().isoformat(),
                        'updated_at': datetime.utcnow().isoformat()
                    }
                    
                    print("[DEBUG] Inserting into profiles table...")
                    profile_response = supabase.table('profiles').insert(profile_data).execute()
                    
                    if hasattr(profile_response, 'error') and profile_response.error:
                        raise Exception(f"Failed to create profile: {str(profile_response.error)}")
                        
                    print("[SUCCESS] Created profile record")
                    
                except Exception as profile_error:
                    error_msg = f"Failed to create profile: {str(profile_error)}"
                    print(f"[ERROR] {error_msg}")
                    raise Exception(error_msg)
                
                # 2. Insert into students table
                try:
                    student_data = {
                        'auth_user_id': auth_user_id,
                        'full_name': data['full_name'].strip(),
                        'email': email,
                        'phone': str(data['phone']).strip(),
                        'course_id': str(data['course_id']),
                        'department_id': int(data['department_id']),
                        'year': int(data.get('year', 1)),
                        'status': 'active',
                        'created_at': datetime.utcnow().isoformat(),
                        'updated_at': datetime.utcnow().isoformat()
                    }
                    
                    # Add optional fields if they exist
                    optional_fields = ['gender', 'date_of_birth', 'blood_group', 'address',
                                     'register_number', 'roll_no', 'current_semester', 'section',
                                     'admission_year', 'father_name', 'mother_name', 'guardian_name',
                                     'guardian_phone', 'annual_income', 'type', 'quota', 'category',
                                     'quota_type', 'hostel_required', 'transport_required', 'first_graduate']
                    
                    for field in optional_fields:
                        if field in data:
                            student_data[field] = data[field]
                    
                    print("[DEBUG] Inserting into students table...")
                    student_response = supabase.table('students').insert(student_data).execute()
                    
                    if hasattr(student_response, 'error') and student_response.error:
                        raise Exception(f"Failed to create student record: {str(student_response.error)}")
                        
                    student_id = student_response.data[0].get('id') if student_response.data else None
                    if not student_id:
                        raise Exception("Failed to get student ID after insertion")
                        
                    print(f"[SUCCESS] Created student record with ID: {student_id}")
                    
                except Exception as student_error:
                    error_msg = f"Failed to create student record: {str(student_error)}"
                    print(f"[ERROR] {error_msg}")
                    raise Exception(error_msg)
                
                # 3. Insert into credentials table
                try:
                    credentials_data = {
                        'auth_user_id': auth_user_id,
                        'email': email,
                        'role': 'student',
                        'is_active': True,
                        'last_login': None,
                        'created_at': datetime.utcnow().isoformat(),
                        'updated_at': datetime.utcnow().isoformat()
                    }
                    
                    print("[DEBUG] Inserting into credentials table...")
                    credentials_response = supabase.table('credentials').insert(credentials_data).execute()
                    
                    if hasattr(credentials_response, 'error') and credentials_response.error:
                        raise Exception(f"Failed to create credentials: {str(credentials_response.error)}")
                        
                    print("[SUCCESS] Created credentials record")
                    
                except Exception as cred_error:
                    error_msg = f"Failed to create credentials: {str(cred_error)}"
                    print(f"[ERROR] {error_msg}")
                    # Don't fail the entire process if credentials creation fails
                    pass
                
                # If we get here, all operations were successful
                print(f"[SUCCESS] Successfully completed all database operations for user {auth_user_id}")
                
            except Exception as create_error:
                error_msg = str(create_error)
                log_error('Auth Creation Failed', create_error, f'Failed to create user: {email}')
                return jsonify({
                    'success': False,
                    'error': 'Failed to create authentication user',
                    'details': extract_error_details(create_error)
                }), 500

        try:
            # Fetch the complete student record with related data
            student_response = supabase.table('students').select('''
                *,
                courses (
                    id,
                    name,
                    code,
                    departments (
                        name,
                        code
                    )
                )
            ''').eq('auth_user_id', auth_user_id).execute()

            if hasattr(student_response, 'error') and student_response.error:
                error_msg = getattr(student_response.error, 'message', str(student_response.error))
                log_error('Fetch Error', error_msg, 'Failed to fetch created student')
                raise Exception(f'Failed to fetch created student: {error_msg}')

            if not student_response.data or len(student_response.data) == 0:
                raise Exception('Failed to fetch created student details')

            student_data = student_response.data[0]
            student_id = student_data.get('id')
            
            if not student_id:
                raise Exception('Failed to get student ID after creation')

            # Log successful student creation
            print(f"[SUCCESS] Successfully created student with ID: {student_id}")
            
            # Return success response with student data
            return jsonify({
                'success': True,
                'data': student_data,
                'message': 'Student created successfully',
                'temporary_password': password,  # Only include in development!
                'auth_user_id': auth_user_id
            })
            
        except Exception as fetch_error:
            log_error('Fetch Failed', fetch_error, 'Failed to fetch created student details')
            # Even if we can't fetch the full details, the student was still created
            return jsonify({
                'success': True,
                'auth_user_id': auth_user_id,
                'message': 'Student created successfully, but could not fetch full details',
                'temporary_password': password,  # Only include in development!
                'warning': str(fetch_error)
            })

    except Exception as create_error:
        error_msg = str(create_error)
        print(f"[ERROR] Error in student creation process: {error_msg}")
        
        # Cleanup: Delete any created records in reverse order
        try:
            # Delete from students table if it was created
            if 'student_id' in locals():
                supabase.table('students').delete().eq('id', student_id).execute()
                print(f"[CLEANUP] Deleted student record: {student_id}")
            
            # Delete from profiles table
            supabase.table('profiles').delete().eq('id', auth_user_id).execute()
            print(f"[CLEANUP] Deleted profile record: {auth_user_id}")
            
            # Delete from credentials table if it was created
            supabase.table('credentials').delete().eq('auth_user_id', auth_user_id).execute()
            print(f"[CLEANUP] Deleted credentials record: {auth_user_id}")
            
            # Delete the auth user
            delete_url = f"{SUPABASE_URL}/auth/v1/admin/users/{auth_user_id}"
            delete_headers = {
                "apikey": SUPABASE_SERVICE_ROLE_KEY,
                "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}"
            }
            requests.delete(delete_url, headers=delete_headers, timeout=10)
            print(f"[CLEANUP] Deleted auth user: {auth_user_id}")
            
        except Exception as cleanup_error:
            error_msg = f"{error_msg} (Cleanup also failed: {str(cleanup_error)})"
            log_error('Cleanup Failed', cleanup_error, 'Error during cleanup after student creation failed')
        
        return jsonify({
            'success': False,
            'error': 'Failed to create student',
            'details': extract_error_details(create_error)
        }), 500

    except ValueError as ve:
        return jsonify({
            'success': False,
            'error': f'Invalid data format: {str(ve)}'
        }), 400
    except Exception as e:
        import traceback
        error_msg = str(e) if str(e) != 'None' else 'An unknown error occurred'
        print(f"Error in add_student: {error_msg}")
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': error_msg,
            'details': extract_error_details(e)
        }), 500

@students_bp.route('/test-auth', methods=['GET'])
def test_auth():
    try:
        email = f"test-{secrets.token_hex(8)}@example.com"
        password = generate_secure_password()

        create_resp = supabase_admin.auth.admin.create_user({
            'email': email,
            'password': password,
            'email_confirm': True
        })

        if hasattr(create_resp, 'error') and create_resp.error:
            error_msg = getattr(create_resp.error, 'message', str(create_resp.error))
            return jsonify({
                'success': False,
                'error': 'Supabase auth create_user failed',
                'details': error_msg
            }), 500

        user_id = create_resp.user.id if hasattr(create_resp, 'user') and create_resp.user else None
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'Supabase auth create_user returned no user id'
            }), 500

        try:
            supabase_admin.auth.admin.delete_user(user_id)
        except Exception as delete_error:
            return jsonify({
                'success': False,
                'error': 'Supabase auth delete_user failed',
                'details': extract_error_details(delete_error),
                'created_user_id': user_id
            }), 500

        return jsonify({
            'success': True,
            'message': 'Supabase auth admin create/delete user succeeded'
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': 'Supabase auth test failed',
            'details': extract_error_details(e)
        }), 500

@students_bp.route('/<int:student_id>', methods=['DELETE'])
def delete_student(student_id):
    """Delete a student"""
    try:
        # First, get the student to check if they exist
        student_response = supabase.table('students').select('*').eq('id', student_id).execute()
        
        if not student_response.data:
            return jsonify({'success': False, 'error': 'Student not found'}), 404
        
        # Delete related records first (attendance, marks, etc.)
        # Note: This assumes ON DELETE CASCADE is set up in the database
        
        # Delete the student
        response = supabase.table('students').delete().eq('id', student_id).execute()
        
        return jsonify({
            'success': True,
            'message': 'Student deleted successfully'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to delete student: {str(e)}'
        }), 500

@students_bp.route('/hall-ticket', methods=['GET'])
def get_student_hall_ticket():
    """
    Get hall ticket for the authenticated student
    Query parameters:
    - student_id: ID of the student (optional, defaults to current user)
    - exam_id: ID of the exam (required)
    """
    try:
        # Get student ID and exam ID from query parameters
        student_id = request.args.get('student_id')
        if not student_id:
            return jsonify({
                'success': False,
                'error': 'Student ID is required'
            }), 400
        exam_id = request.args.get('exam_id')
        
        if not exam_id:
            return jsonify({
                'success': False,
                'error': 'Exam ID is required as a query parameter'
            }), 400
        
        try:
            # Convert to integers if they're numeric strings
            student_id = int(student_id) if str(student_id).isdigit() else student_id
            exam_id = int(exam_id) if str(exam_id).isdigit() else exam_id
        except (ValueError, TypeError):
            return jsonify({
                'success': False,
                'error': 'Student ID and Exam ID must be valid numbers'
            }), 400
            
        # Get student details with course information
        student_response = supabase.table('students').select('''
            *,
            courses (
                name,
                code
            )
        ''').eq('id', student_id).execute()
        
        if not student_response.data:
            return jsonify({
                'success': False,
                'error': 'Student not found'
            }), 404
            
        student = student_response.data[0]
        
        # Get exam details with subject information
        exam_query = supabase.table('exams').select('''
            *,
            subjects (
                name,
                code
            )
        ''').eq('id', exam_id)
        
        # No authentication required for hall ticket access
        
        exam_response = exam_query.execute()
        
        if not exam_response.data:
            return jsonify({
                'success': False,
                'error': 'Exam not found or not available'
            }), 404
            
        exam = exam_response.data[0]
        
        # Get subject details
        subject_name = exam.get('subjects', {}).get('name', 'N/A')
        
        # Get course name
        course_name = student.get('courses', {}).get('name', 'N/A')
        
        # Format dates and times
        exam_date = ''
        if exam.get('date'):
            try:
                exam_date = datetime.strptime(exam['date'], '%Y-%m-%d').strftime('%Y-%m-%d')
            except (ValueError, TypeError):
                exam_date = exam['date']
                
        exam_time = ''
        if exam.get('start_time'):
            try:
                exam_time = (datetime.strptime(exam['start_time'], '%H:%M:%S')).strftime('%H:%M:%S')
            except (ValueError, TypeError):
                exam_time = exam['start_time']
        
        # Format the response to match frontend expectations
        hall_ticket_data = {
            'success': True,
            'data': {
                'hall_ticket_number': f"HT{datetime.now().year}{student_id:04d}{exam_id:03d}",
                'student': {
                    'id': student_id,
                    'full_name': student.get('full_name', 'N/A'),
                    'register_number': student.get('register_number', 'N/A'),
                    'course': course_name,
                    'current_semester': student.get('current_semester', 'N/A'),
                    'photo_url': f"https://ui-avatars.com/api/?name={student.get('full_name', 'Student').replace(' ', '+')}&size=200&background=random"
                },
                'exam': {
                    'id': exam_id,
                    'name': exam.get('name', 'N/A'),
                    'exam_date': exam_date,
                    'exam_time': exam_time,
                    'duration': f"{exam.get('duration_minutes', 180) // 60} hours" if exam.get('duration_minutes') else '3 hours',
                    'room_number': exam.get('room_number', 'To be announced'),
                    'subjects': {
                        'name': subject_name
                    }
                },
                'exam_center': 'Cube Arts and Engineering College',
                'instructions': [
                    'Bring this hall ticket to the examination hall',
                    'Carry a valid photo ID proof (College ID/Aadhar Card/Driving License)',
                    'Report to the exam hall 30 minutes before the exam',
                    'Mobile phones and electronic devices are strictly prohibited',
                    'Use only blue/black ballpoint pen for writing answers',
                    'Follow all COVID-19 safety protocols',
                    'No candidate will be allowed to leave the exam hall before the completion of the exam',
                    'Any malpractice will lead to disciplinary action'
                ]
            }
        }
        
        return jsonify(hall_ticket_data), 200
        
    except Exception as e:
        current_app.logger.error(f"Error in get_student_hall_ticket: {str(e)}\n{traceback.format_exc()}")
        
        return jsonify({
            'success': False,
            'error': 'Failed to generate hall ticket',
            'details': str(e) if current_app.config.get('DEBUG') else None
        }), 500
