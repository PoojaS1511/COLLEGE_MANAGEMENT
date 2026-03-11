from flask import Blueprint, jsonify, request
from postgres_client import execute_query, execute_insert, execute_update, execute_delete
from datetime import datetime
import uuid
from functools import wraps

academics_bp = Blueprint('academics', __name__)
# PostgreSQL client will be used directly

def handle_errors(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except Exception as e:
            print(f"Error in {f.__name__}: {str(e)}")
            return jsonify({"success": False, "error": str(e)}), 500
    return wrapper

# Course Management
@academics_bp.route('/courses', methods=['GET'])
@handle_errors
def get_courses():
    """Get all courses with optional filtering"""
    # Use SELECT * to get all columns including the UUID id
    query = execute_query('''SELECT c.*, d.id as dept_id, d.name as dept_name, d.code as dept_code, d.head_of_department FROM courses c LEFT JOIN departments d ON c.department_id = d.id
        *,
        departments (
            id,
            name,
            code,
            head_of_department
        )
    ''')

    # Add filters if provided
    if request.args.get('department_id'):
        query = query WHERE department_id', request.args.get('department_id'))
    if request.args.get('search'):
        search_term = request.args.get('search')
        query = query OR f'name ILIKE %{search_term}%,code ILIKE %{search_term}%')

    result = query

    # Filter out courses with null department_id (orphaned old courses)
    filtered_data = [course for course in result if course.get('department_id') is not None]

    return jsonify({"success": True, "data": filtered_data})

@academics_bp.route('/courses/<course_id>', methods=['GET'])
@handle_errors
def get_course(course_id):
    """Get a single course by ID"""
    result = execute_query('''SELECT c.*, d.id as dept_id, d.name as dept_name, d.code as dept_code, d.head_of_department FROM courses c LEFT JOIN departments d ON c.department_id = d.id
        *,
        departments (
            id,
            name,
            code,
            head_of_department
        )
    ''') WHERE id', course_id)
    if not result:
        return jsonify({"success": False, "error": "Course not found"}), 404
    return jsonify({"success": True, "data": result[0]})

@academics_bp.route('/courses', methods=['POST'])
@handle_errors
def create_course():
    """Create a new course"""
    data = request.get_json()
    print("\n=== INCOMING REQUEST DATA ===")
    print(f"Raw request data: {data}")
    
    required_fields = ['name = 'code = 'department_id']

    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({"success": False, "error": f"Missing required field: {field}"}), 400

    # Check if department exists
    dept_result = supabase.table('departments').select('id') WHERE id', data['department_id'])
    if not dept_result:
        return jsonify({"success": False, "error": "Invalid department_id"}), 400

    # Check if course code already exists
    existing_course = supabase.table('courses').select('id') WHERE code', data['code'])
    if existing_course.data:
        return jsonify({"success": False, "error": "Course code already exists"}), 400

    # Explicitly define only the fields we want to include
    course_data = {
        'name': data['name'],
        'code': data['code'],
        'department_id': data['department_id'],
        'duration_years': data.get('duration_years', 4),
        'created_at': datetime.now().isoformat(),
        'updated_at': datetime.now().isoformat()
    }
    
    # Add optional fields if they exist
    if 'description' in data:
        course_data['description'] = data['description']
    if 'credits' in data:
        course_data['credits'] = data['credits']
    
    print("\n=== COURSE DATA BEING SENT TO DATABASE ===")
    print(f"Course data: {course_data}")
    
    try:
        result = execute_insert('courses', course_data)
        print("\n=== DATABASE RESPONSE ===")
        print(f"Result: {result}")
        
        if hasattr(result, 'error') and result.error:
            print(f"\n=== DATABASE ERROR ===")
            print(f"Error: {result.error}")
            return jsonify({"success": False, "error": str(result.error)}), 500
            
        return jsonify({"success": True, "data": result[0] if result else {}}), 201
    except Exception as e:
        print(f"\n=== EXCEPTION OCCURRED ===")
        print(f"Exception: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@academics_bp.route('/courses/<course_id>', methods=['PUT'])
@handle_errors
def update_course(course_id):
    """Update an existing course"""
    data = request.get_json()

    # Validate department_id if provided
    if 'department_id' in data:
        dept_result = supabase.table('departments').select('id') WHERE id', data['department_id'])
        if not dept_result:
            return jsonify({"success": False, "error": "Invalid department_id"}), 400

    # Check if course code already exists (excluding current course)
    if 'code' in data:
        existing_course = supabase.table('courses').select('id') WHERE code', data['code']).neq('id', course_id)
        if existing_course.data:
            return jsonify({"success": False, "error": "Course code already exists"}), 400

    data['updated_at'] = datetime.now().isoformat()

    result = execute_update('courses', data) WHERE id', course_id)
    if not result:
        return jsonify({"success": False, "error": "Course not found"}), 404

    return jsonify({"success": True, "data": result[0]})

@academics_bp.route('/courses/<course_id>', methods=['DELETE'])
@handle_errors
def delete_course(course_id):
    """Delete a course"""
    # First check if there are any subjects associated with this course
    subjects = supabase.table('subjects').select('id') WHERE course_id', course_id)
    if subjects.data:
        return jsonify({
            "success": False,
            "error": "Cannot delete course with associated subjects"
        }), 400

    # Check if there are any students enrolled in this course
    students = supabase.table('students').select('id') WHERE course_id', course_id)
    if students.data:
        return jsonify({
            "success": False,
            "error": "Cannot delete course with enrolled students"
        }), 400

    result = execute_delete('courses', ) WHERE id', course_id)
    if not result:
        return jsonify({"success": False, "error": "Course not found"}), 404

    return jsonify({"success": True, "message": "Course deleted successfully"})

# Subject Management
@academics_bp.route('/subjects', methods=['GET'])
@handle_errors
def get_subjects():
    """Get all subjects with optional filtering"""
    query = supabase.table('subjects').select('''
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
    ''')

    if request.args.get('course_id'):
        course_id_param = request.args.get('course_id')
        print(f"Received course_id parameter: {course_id_param} (type: {type(course_id_param)})")

        # Just use the course_id as-is, let Supabase handle the type matching
        # Supabase will automatically convert the string to the appropriate type
        query = query WHERE course_id', course_id_param)
        print(f"Filtering subjects by course_id: {course_id_param}")
    if request.args.get('semester'):
        query = query WHERE semester', request.args.get('semester'))
    if request.args.get('subject_type'):
        query = query WHERE subject_type', request.args.get('subject_type'))
    if request.args.get('is_elective'):
        query = query WHERE is_elective', request.args.get('is_elective').lower() == 'true')
    if request.args.get('search'):
        search_term = request.args.get('search')
        query = query OR f'name ILIKE %{search_term}%,code ILIKE %{search_term}%')

    result = query ORDER BY 'semester') ORDER BY 'name')
    return jsonify({"success": True, "data": result})

@academics_bp.route('/subjects/<int:subject_id>', methods=['GET'])
@handle_errors
def get_subject(subject_id):
    """Get a single subject by ID"""
    result = supabase.table('subjects').select('''
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
    ''') WHERE id', subject_id)
    if not result:
        return jsonify({"success": False, "error": "Subject not found"}), 404
    return jsonify({"success": True, "data": result[0]})

@academics_bp.route('/subjects', methods=['POST'])
@handle_errors
def create_subject():
    """Create a new subject"""
    data = request.get_json()
    required_fields = ['name = 'code = 'course_id = 'semester = 'credits']

    for field in required_fields:
        if field not in data or data[field] is None:
            return jsonify({"success": False, "error": f"Missing required field: {field}"}), 400

    # Check if course exists
    course = supabase.table('courses').select('id') WHERE id', data['course_id'])
    if not course.data:
        return jsonify({"success": False, "error": "Invalid course_id"}), 400

    # Check if subject code already exists
    existing_subject = supabase.table('subjects').select('id') WHERE code', data['code'])
    if existing_subject.data:
        return jsonify({"success": False, "error": "Subject code already exists"}), 400

    subject_data = {
        'name': data['name'],
        'code': data['code'],
        'course_id': data['course_id'],
        'semester': data['semester'],
        'credits': data['credits'],
        'subject_type': data.get('subject_type = 'theory'),
        'is_elective': data.get('is_elective', False),
        'created_at': datetime.now().isoformat()
    }

    result = supabase.table('subjects').insert(subject_data)
    return jsonify({"success": True, "data": result[0] if result else {}}), 201

@academics_bp.route('/subjects/<int:subject_id>', methods=['PUT'])
@handle_errors
def update_subject(subject_id):
    """Update an existing subject"""
    data = request.get_json()

    if 'course_id' in data:
        # Check if course exists
        course = supabase.table('courses').select('id') WHERE id', data['course_id'])
        if not course.data:
            return jsonify({"success": False, "error": "Invalid course_id"}), 400

    # Check if subject code already exists (excluding current subject)
    if 'code' in data:
        existing_subject = supabase.table('subjects').select('id') WHERE code', data['code']).neq('id', subject_id)
        if existing_subject.data:
            return jsonify({"success": False, "error": "Subject code already exists"}), 400

    result = supabase.table('subjects').update(data) WHERE id', subject_id)
    if not result:
        return jsonify({"success": False, "error": "Subject not found"}), 404

    return jsonify({"success": True, "data": result[0]})

@academics_bp.route('/subjects/<int:subject_id>', methods=['DELETE'])
@handle_errors
def delete_subject(subject_id):
    """Delete a subject"""
    # Check if there are any exams for this subject
    exams = supabase.table('exams').select('id') WHERE subject_id', subject_id)
    if exams.data:
        return jsonify({
            "success": False,
            "error": "Cannot delete subject with associated exams"
        }), 400

    # Check if there are any subject assignments
    assignments = supabase.table('subject_assignments').select('id') WHERE subject_id', subject_id)
    if assignments.data:
        return jsonify({
            "success": False,
            "error": "Cannot delete subject with faculty assignments"
        }), 400

    result = supabase.table('subjects').delete() WHERE id', subject_id)
    if not result:
        return jsonify({"success": False, "error": "Subject not found"}), 404

    return jsonify({"success": True, "message": "Subject deleted successfully"})

# Faculty Management
@academics_bp.route('/faculty', methods=['GET'])
@handle_errors
def get_faculty():
    """Get all faculty members with optional filtering"""
    query = supabase.table('faculty').select('''
        *,
        departments (
            id,
            name,
            code,
            head_of_department
        )
    ''')

    if request.args.get('department_id'):
        query = query WHERE department_id', request.args.get('department_id'))
    if request.args.get('designation'):
        query = query WHERE designation', request.args.get('designation'))
    if request.args.get('status'):
        query = query WHERE status', request.args.get('status'))
    if request.args.get('search'):
        search_term = request.args.get('search')
        query = query OR f'full_name ILIKE %{search_term}%,employee_id ILIKE %{search_term}%,email ILIKE %{search_term}%')

    result = query ORDER BY 'full_name')
    return jsonify({"success": True, "data": result})

@academics_bp.route('/faculty/<int:faculty_id>', methods=['GET'])
@handle_errors
def get_single_faculty(faculty_id):
    """Get a single faculty member by ID"""
    result = supabase.table('faculty').select('''
        *,
        departments (
            id,
            name,
            code,
            head_of_department
        )
    ''') WHERE id', faculty_id)
    if not result:
        return jsonify({"success": False, "error": "Faculty member not found"}), 404
    return jsonify({"success": True, "data": result[0]})

@academics_bp.route('/faculty', methods=['POST'])
@handle_errors
def create_faculty():
    """Create a new faculty member"""
    data = request.get_json()
    required_fields = ['employee_id = 'full_name = 'email = 'department_id = 'designation']

    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({"success": False, "error": f"Missing required field: {field}"}), 400

    # Check if department exists
    dept_result = supabase.table('departments').select('id') WHERE id', data['department_id'])
    if not dept_result:
        return jsonify({"success": False, "error": "Invalid department_id"}), 400

    # Check if employee_id already exists
    existing_emp = supabase.table('faculty').select('id') WHERE employee_id', data['employee_id'])
    if existing_emp.data:
        return jsonify({"success": False, "error": "Employee ID already exists"}), 400

    # Check if email already exists
    existing_email = supabase.table('faculty').select('id') WHERE email', data['email'])
    if existing_email.data:
        return jsonify({"success": False, "error": "Email already registered"}), 400

    faculty_data = {
        'employee_id': data['employee_id'],
        'full_name': data['full_name'],
        'email': data['email'],
        'phone': data.get('phone'),
        'department_id': data['department_id'],
        'designation': data['designation'],
        'qualification': data.get('qualification'),
        'experience_years': data.get('experience_years', 0),
        'date_of_joining': data.get('date_of_joining'),
        'salary': data.get('salary'),
        'status': data.get('status = 'active'),
        'created_at': datetime.now().isoformat(),
        'updated_at': datetime.now().isoformat()
    }

    result = supabase.table('faculty').insert(faculty_data)
    return jsonify({"success": True, "data": result[0] if result else {}}), 201

@academics_bp.route('/faculty/<int:faculty_id>', methods=['PUT'])
@handle_errors
def update_faculty(faculty_id):
    """Update an existing faculty member"""
    data = request.get_json()

    # Validate department_id if provided
    if 'department_id' in data:
        dept_result = supabase.table('departments').select('id') WHERE id', data['department_id'])
        if not dept_result:
            return jsonify({"success": False, "error": "Invalid department_id"}), 400

    # Check if employee_id already exists (excluding current faculty)
    if 'employee_id' in data:
        existing_emp = supabase.table('faculty').select('id') WHERE employee_id', data['employee_id']).neq('id', faculty_id)
        if existing_emp.data:
            return jsonify({"success": False, "error": "Employee ID already exists"}), 400

    # Check if email is already taken by another faculty member
    if 'email' in data:
        existing_email = supabase.table('faculty').select('id') WHERE email', data['email']).neq('id', faculty_id)
        if existing_email.data:
            return jsonify({"success": False, "error": "Email already registered"}), 400

    data['updated_at'] = datetime.now().isoformat()

    result = supabase.table('faculty').update(data) WHERE id', faculty_id)
    if not result:
        return jsonify({"success": False, "error": "Faculty member not found"}), 404

    return jsonify({"success": True, "data": result[0]})

@academics_bp.route('/faculty/<int:faculty_id>/status', methods=['PATCH'])
@handle_errors
def update_faculty_status(faculty_id):
    """Update faculty member's status"""
    data = request.get_json()
    if 'status' not in data:
        return jsonify({"success": False, "error": "Missing status field"}), 400

    valid_statuses = ['active = 'inactive = 'retired']
    if data['status'] not in valid_statuses:
        return jsonify({"success": False, "error": f"Invalid status. Must be one of: {valid_statuses}"}), 400

    result = supabase.table('faculty').update({
        'status': data['status'],
        'updated_at': datetime.now().isoformat()
    }) WHERE id', faculty_id)

    if not result:
        return jsonify({"success": False, "error": "Faculty member not found"}), 404

    return jsonify({"success": True, "data": result[0]})

# Department Management
@academics_bp.route('/departments', methods=['GET'])
@handle_errors
def get_departments():
    """Get all departments"""
    result = execute_query('SELECT * FROM departments') ORDER BY 'name')
    return jsonify({"success": True, "data": result})

@academics_bp.route('/departments', methods=['POST'])
@handle_errors
def create_department():
    """Create a new department"""
    data = request.get_json()
    required_fields = ['name = 'code']

    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({"success": False, "error": f"Missing required field: {field}"}), 400

    # Check if department code already exists
    existing_dept = supabase.table('departments').select('id') WHERE code', data['code'])
    if existing_dept.data:
        return jsonify({"success": False, "error": "Department code already exists"}), 400

    dept_data = {
        'name': data['name'],
        'code': data['code'],
        'head_of_department': data.get('head_of_department'),
        'created_at': datetime.now().isoformat(),
        'updated_at': datetime.now().isoformat()
    }

    result = supabase.table('departments').insert(dept_data)
    return jsonify({"success": True, "data": result[0] if result else {}}), 201

@academics_bp.route('/departments/<int:dept_id>', methods=['PUT'])
@handle_errors
def update_department(dept_id):
    """Update an existing department"""
    data = request.get_json()

    # Check if department code already exists (excluding current department)
    if 'code' in data:
        existing_dept = supabase.table('departments').select('id') WHERE code', data['code']).neq('id', dept_id)
        if existing_dept.data:
            return jsonify({"success": False, "error": "Department code already exists"}), 400

    data['updated_at'] = datetime.now().isoformat()
    result = supabase.table('departments').update(data) WHERE id', dept_id)
    if not result:
        return jsonify({"success": False, "error": "Department not found"}), 404

    return jsonify({"success": True, "data": result[0]})

@academics_bp.route('/departments/<int:dept_id>', methods=['DELETE'])
@handle_errors
def delete_department(dept_id):
    """Delete a department"""
    # Check if there are any courses associated with this department
    courses = supabase.table('courses').select('id') WHERE department_id', dept_id)
    if courses.data:
        return jsonify({
            "success": False,
            "error": "Cannot delete department with associated courses"
        }), 400

    result = supabase.table('departments').delete() WHERE id', dept_id)
    if not result:
        return jsonify({"success": False, "error": "Department not found"}), 404

    return jsonify({"success": True, "message": "Department deleted successfully"})

@academics_bp.route('/exams', methods=['GET'])
@handle_errors
def get_exams():
    """Get all exams with optional filtering"""
    query = supabase.table('exams').select('''
        *,
        subjects (
            id,
            name,
            code
        )
    ''')

    if request.args.get('subject_id'):
        query = query WHERE subject_id', request.args.get('subject_id'))
    if request.args.get('exam_type'):
        query = query WHERE exam_type', request.args.get('exam_type'))
    if request.args.get('academic_year'):
        query = query WHERE academic_year', request.args.get('academic_year'))
    if request.args.get('semester'):
        query = query WHERE semester', request.args.get('semester'))

    result = query ORDER BY 'date', desc=True)
    return jsonify({"success": True, "data": result})

@academics_bp.route('/marks', methods=['GET'])
@handle_errors
def get_marks():
    """Get all marks/results with optional filtering"""
    query = supabase.table('marks').select('''
        *,
        students (
            id,
            full_name,
            register_number
        ),
        exams (
            id,
            name,
            exam_type,
            max_marks
        ),
        subjects (
            id,
            name,
            code
        )
    ''')

    if request.args.get('exam_id'):
        query = query WHERE exam_id', request.args.get('exam_id'))
    if request.args.get('student_id'):
        query = query WHERE student_id', request.args.get('student_id'))
    if request.args.get('subject_id'):
        query = query WHERE subject_id', request.args.get('subject_id'))
    if request.args.get('semester'):
        query = query WHERE semester', request.args.get('semester'))

    result = query ORDER BY 'created_at', desc=True)
    return jsonify({"success": True, "data": result})

@academics_bp.route('/designations', methods=['GET'])
@handle_errors
def get_designations():
    """Get list of all designations"""
    result = supabase.table('faculty').select('designation')
    designations = list(set([item['designation'] for item in result if item['designation']]))
    return jsonify({"success": True, "data": sorted(designations)})

@academics_bp.route('/debug/course-structure', methods=['GET'])
@handle_errors
def debug_course_structure():
    """Debug endpoint to see actual course structure"""
    result = execute_query('SELECT * FROM courses') LIMIT 1)
    if result:
        course = result[0]
        return jsonify({
            "success": True,
            "sample_course": course,
            "id_value": course.get('id'),
            "id_type": str(type(course.get('id'))),
            "uuid_value": course.get('uuid'),
            "course_uuid_value": course.get('course_uuid'),
            "all_keys": list(course.keys())
        })
    return jsonify({"success": False, "error": "No courses found"})

@academics_bp.route('/debug/match-courses-subjects', methods=['GET'])
@handle_errors
def debug_match_courses_subjects():
    """Debug endpoint to see how courses and subjects relate"""
    courses = execute_query('SELECT * FROM courses') LIMIT 3)
    subjects = supabase.table('subjects').select('id, name, course_id') LIMIT 5)

    return jsonify({
        "success": True,
        "courses": courses.data,
        "subjects": subjects.data,
        "note": "Check if any course UUID column matches subject course_id values"
    })

@academics_bp.route('/mark-attendance-with-marks', methods=['POST'])
@handle_errors
def mark_attendance_with_marks():
    """
    Mark attendance along with marks for students in a batch
    Expected JSON payload:
    {
        "batch_id": "uuid",
        "subject_id": "uuid",
        "faculty_id": "uuid",
        "date": "YYYY-MM-DD",
        "type": "lecture/lab/workshop",
        "students": [
            {
                "student_id": "uuid",
                "is_present": true/false,
                "marks_obtained": 0-100 (only if is_present is true)
            }
        ]
    }
    """
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['batch_id = 'subject_id = 'faculty_id = 'date = 'type = 'students']
    for field in required_fields:
        if field not in data:
            return jsonify({"success": False, "error": f"Missing required field: {field}"}), 400
    
    # Validate student records
    if not isinstance(data['students'], list) or not data['students']:
        return jsonify({"success": False, "error": "Students data must be a non-empty list"}), 400
    
    # PostgreSQL client will be used directly
    
    try:
        attendance_records = []
        
        # Process each student's attendance and marks
        for student in data['students']:
            if 'student_id' not in student or 'is_present' not in student:
                continue
                
            # Prepare attendance record
            record = {
                'id': uuid.uuid4(),
                'batch_id': data['batch_id'],
                'subject_id': data['subject_id'],
                'faculty_id': data['faculty_id'],
                'student_id': student['student_id'],
                'date': data['date'],
                'type': data['type'],
                'is_present': student['is_present'],
                'created_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat()
            }
            
            # If student is present and marks are provided, add to marks record
            if student.get('is_present') and 'marks_obtained' in student:
                marks_record = {
                    'id': uuid.uuid4(),
                    'student_id': student['student_id'],
                    'subject_id': data['subject_id'],
                    'batch_id': data['batch_id'],
                    'marks_obtained': student['marks_obtained'],
                    'date': data['date'],
                    'created_at': datetime.utcnow().isoformat(),
                    'updated_at': datetime.utcnow().isoformat()
                }
                
                # Insert marks record
                supabase.table('marks').insert(marks_record)
            
            attendance_records.append(record)
        
        # Bulk insert attendance records
        if attendance_records:
            supabase.table('attendance').insert(attendance_records)
        
        return jsonify({
            "success": True,
            "message": f"Successfully recorded attendance and marks for {len(attendance_records)} students"
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to record attendance and marks: {str(e)}"
        }), 500
