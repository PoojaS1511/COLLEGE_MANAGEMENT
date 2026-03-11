from flask import Blueprint, jsonify, request
from postgres_client import execute_query, execute_insert, execute_update, execute_delete
from datetime import datetime
import uuid
from functools import wraps

academics_bp = Blueprint('academics', __name__)

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
    query = "SELECT c.*, d.id as dept_id, d.name as dept_name, d.code as dept_code, d.head_of_department FROM courses c LEFT JOIN departments d ON c.department_id = d.id"
    params = []
    
    # Add filters if provided
    conditions = []
    if request.args.get('department_id'):
        conditions.append("c.department_id = %s")
        params.append(request.args.get('department_id'))
    if request.args.get('search'):
        search_term = request.args.get('search')
        conditions.append("(c.name ILIKE %s OR c.code ILIKE %s)")
        params.extend([f"%{search_term}%", f"%{search_term}%"])
    
    if conditions:
        query += " WHERE " + " AND ".join(conditions)
    
    result = execute_query(query, params, fetch_all=True)

    # Filter out courses with null department_id (orphaned old courses)
    filtered_data = [course for course in result if course.get('department_id') is not None]

    return jsonify({"success": True, "data": filtered_data})

@academics_bp.route('/courses/<course_id>', methods=['GET'])
@handle_errors
def get_course(course_id):
    """Get a single course by ID"""
    query = """
        SELECT c.*, d.id as dept_id, d.name as dept_name, d.code as dept_code, d.head_of_department 
        FROM courses c 
        LEFT JOIN departments d ON c.department_id = d.id 
        WHERE c.id = %s
    """
    result = execute_query(query, [course_id], fetch_all=False)
    
    if not result:
        return jsonify({"success": False, "error": "Course not found"}), 404
    
    return jsonify({"success": True, "data": result})

@academics_bp.route('/courses', methods=['POST'])
@handle_errors
def create_course():
    """Create a new course"""
    data = request.get_json()
    print("\n=== INCOMING REQUEST DATA ===")
    print(f"Raw request data: {data}")
    
    required_fields = ['name', 'code', 'department_id']

    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({"success": False, "error": f"Missing required field: {field}"}), 400

    # Check if department exists
    dept_result = execute_query("SELECT id FROM departments WHERE id = %s", [data['department_id']])
    if not dept_result:
        return jsonify({"success": False, "error": "Invalid department_id"}), 400

    # Check if course code already exists
    existing_course = execute_query("SELECT id FROM courses WHERE code = %s", [data['code']])
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
        dept_result = execute_query("SELECT id FROM departments WHERE id = %s", [data['department_id']])
        if not dept_result:
            return jsonify({"success": False, "error": "Invalid department_id"}), 400

    # Check if course code already exists (excluding current course)
    if 'code' in data:
        existing_course = execute_query("SELECT id FROM courses WHERE code = %s AND id != %s", [data['code'], course_id])
        if existing_course.data:
            return jsonify({"success": False, "error": "Course code already exists"}), 400

    data['updated_at'] = datetime.now().isoformat()

    result = execute_update('courses', data, "WHERE id = %s", [course_id])
    if not result:
        return jsonify({"success": False, "error": "Course not found"}), 404

    return jsonify({"success": True, "data": result[0]})

@academics_bp.route('/courses/<course_id>', methods=['DELETE'])
@handle_errors
def delete_course(course_id):
    """Delete a course"""
    # First check if there are any subjects associated with this course
    subjects = execute_query("SELECT id FROM subjects WHERE course_id = %s", [course_id])
    if subjects:
        return jsonify({
            "success": False,
            "error": "Cannot delete course with associated subjects"
        }), 400

    # Check if there are any students enrolled in this course
    students = execute_query("SELECT id FROM students WHERE course_id = %s", [course_id])
    if students:
        return jsonify({
            "success": False,
            "error": "Cannot delete course with enrolled students"
        }), 400

    result = execute_delete('courses', "WHERE id = %s", [course_id])
    if not result:
        return jsonify({"success": False, "error": "Course not found"}), 404

    return jsonify({"success": True, "message": "Course deleted successfully"})

# Subject Management
@academics_bp.route('/subjects', methods=['GET'])
@handle_errors
def get_subjects():
    """Get all subjects with optional filtering"""
    query = """
        SELECT s.*, c.name as course_name, c.code as course_code
        FROM subjects s
        LEFT JOIN courses c ON s.course_id = c.id
    """
    params = []
    
    # Add filters if provided
    conditions = []
    if request.args.get('course_id'):
        conditions.append("s.course_id = %s")
        params.append(request.args.get('course_id'))
    if request.args.get('semester'):
        conditions.append("s.semester = %s")
        params.append(request.args.get('semester'))
    if request.args.get('subject_type'):
        conditions.append("s.subject_type = %s")
        params.append(request.args.get('subject_type'))
    if request.args.get('is_elective'):
        conditions.append("s.is_elective = %s")
        params.append(request.args.get('is_elective').lower() == 'true')
    if request.args.get('search'):
        search_term = request.args.get('search')
        conditions.append("(s.name ILIKE %s OR s.code ILIKE %s)")
        params.extend([f"%{search_term}%", f"%{search_term}%"])
    
    if conditions:
        query += " WHERE " + " AND ".join(conditions)
    
    query += " ORDER BY s.semester, s.name"
    
    result = execute_query(query, params, fetch_all=True)
    return jsonify({"success": True, "data": result})

@academics_bp.route('/subjects/<int:subject_id>', methods=['GET'])
@handle_errors
def get_subject(subject_id):
    """Get a single subject by ID"""
    result = execute_query("""
        SELECT s.*, c.name as course_name, c.code as course_code
        FROM subjects s
        LEFT JOIN courses c ON s.course_id = c.id
        WHERE s.id = %s
    """, [subject_id])
    if not result:
        return jsonify({"success": False, "error": "Subject not found"}), 404
    return jsonify({"success": True, "data": result[0]})

@academics_bp.route('/subjects', methods=['POST'])
@handle_errors
def create_subject():
    """Create a new subject"""
    data = request.get_json()
    required_fields = ['name', 'code', 'course_id', 'semester', 'credits']

    for field in required_fields:
        if field not in data or data[field] is None:
            return jsonify({"success": False, "error": f"Missing required field: {field}"}), 400

    # Check if course exists
    course = execute_query("SELECT id FROM courses WHERE id = %s", [data['course_id']])
    if not course:
        return jsonify({"success": False, "error": "Invalid course_id"}), 400

    # Check if subject code already exists
    existing_subject = execute_query("SELECT id FROM subjects WHERE code = %s", [data['code']])
    if existing_subject:
        return jsonify({"success": False, "error": "Subject code already exists"}), 400

    subject_data = {
        'name': data['name'],
        'code': data['code'],
        'course_id': data['course_id'],
        'semester': data['semester'],
        'credits': data['credits'],
        'subject_type': data.get('subject_type', 'theory'),
        'is_elective': data.get('is_elective', False),
        'created_at': datetime.now().isoformat()
    }

    result = execute_insert('subjects', subject_data)
    return jsonify({"success": True, "data": result[0] if result else {}}), 201

@academics_bp.route('/subjects/<int:subject_id>', methods=['PUT'])
@handle_errors
def update_subject(subject_id):
    """Update an existing subject"""
    data = request.get_json()

    if 'course_id' in data:
        # Check if course exists
        course = execute_query("SELECT id FROM courses WHERE id = %s", [data['course_id']])
        if not course:
            return jsonify({"success": False, "error": "Invalid course_id"}), 400

    # Check if subject code already exists (excluding current subject)
    if 'code' in data:
        existing_subject = execute_query("SELECT id FROM subjects WHERE code = %s AND id != %s", [data['code'], subject_id])
        if existing_subject:
            return jsonify({"success": False, "error": "Subject code already exists"}), 400

    result = execute_update('subjects', data, "WHERE id = %s", [subject_id])
    if not result:
        return jsonify({"success": False, "error": "Subject not found"}), 404

    return jsonify({"success": True, "data": result[0]})

@academics_bp.route('/subjects/<int:subject_id>', methods=['DELETE'])
@handle_errors
def delete_subject(subject_id):
    """Delete a subject"""
    # Check if there are any exams for this subject
    exams = execute_query("SELECT id FROM exams WHERE subject_id = %s", [subject_id])
    if exams:
        return jsonify({
            "success": False,
            "error": "Cannot delete subject with associated exams"
        }), 400

    # Check if there are any subject assignments
    assignments = execute_query("SELECT id FROM subject_assignments WHERE subject_id = %s", [subject_id])
    if assignments:
        return jsonify({
            "success": False,
            "error": "Cannot delete subject with faculty assignments"
        }), 400

    result = execute_delete('subjects', "WHERE id = %s", [subject_id])
    if not result:
        return jsonify({"success": False, "error": "Subject not found"}), 404

    return jsonify({"success": True, "message": "Subject deleted successfully"})

# Faculty Management
@academics_bp.route('/faculty', methods=['GET'])
@handle_errors
def get_faculty():
    """Get all faculty members with optional filtering"""
    query = """
        SELECT f.*, d.name as dept_name, d.code as dept_code, d.head_of_department
        FROM faculty f
        LEFT JOIN departments d ON f.department_id = d.id
    """
    params = []
    
    # Add filters if provided
    conditions = []
    if request.args.get('department_id'):
        conditions.append("f.department_id = %s")
        params.append(request.args.get('department_id'))
    if request.args.get('designation'):
        conditions.append("f.designation = %s")
        params.append(request.args.get('designation'))
    if request.args.get('status'):
        conditions.append("f.status = %s")
        params.append(request.args.get('status'))
    if request.args.get('search'):
        search_term = request.args.get('search')
        conditions.append("(f.full_name ILIKE %s OR f.employee_id ILIKE %s OR f.email ILIKE %s)")
        params.extend([f"%{search_term}%", f"%{search_term}%", f"%{search_term}%"])
    
    if conditions:
        query += " WHERE " + " AND ".join(conditions)
    
    query += " ORDER BY f.full_name"
    
    result = execute_query(query, params, fetch_all=True)
    return jsonify({"success": True, "data": result})

@academics_bp.route('/faculty/<int:faculty_id>', methods=['GET'])
@handle_errors
def get_single_faculty(faculty_id):
    """Get a single faculty member by ID"""
    result = execute_query("""
        SELECT f.*, d.name as dept_name, d.code as dept_code, d.head_of_department
        FROM faculty f
        LEFT JOIN departments d ON f.department_id = d.id
        WHERE f.id = %s
    """, [faculty_id])
    if not result:
        return jsonify({"success": False, "error": "Faculty member not found"}), 404
    return jsonify({"success": True, "data": result[0]})

@academics_bp.route('/faculty', methods=['POST'])
@handle_errors
def create_faculty():
    """Create a new faculty member"""
    data = request.get_json()
    required_fields = ['employee_id', 'full_name', 'email', 'department_id', 'designation']

    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({"success": False, "error": f"Missing required field: {field}"}), 400

    # Check if department exists
    dept_result = execute_query("SELECT id FROM departments WHERE id = %s", [data['department_id']])
    if not dept_result:
        return jsonify({"success": False, "error": "Invalid department_id"}), 400

    # Check if employee_id already exists
    existing_emp = execute_query("SELECT id FROM faculty WHERE employee_id = %s", [data['employee_id']])
    if existing_emp:
        return jsonify({"success": False, "error": "Employee ID already exists"}), 400

    # Check if email already exists
    existing_email = execute_query("SELECT id FROM faculty WHERE email = %s", [data['email']])
    if existing_email:
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
        'status': data.get('status', 'active'),
        'created_at': datetime.now().isoformat(),
        'updated_at': datetime.now().isoformat()
    }

    result = execute_insert('faculty', faculty_data)
    return jsonify({"success": True, "data": result[0] if result else {}}), 201

@academics_bp.route('/faculty/<int:faculty_id>', methods=['PUT'])
@handle_errors
def update_faculty(faculty_id):
    """Update an existing faculty member"""
    data = request.get_json()

    # Validate department_id if provided
    if 'department_id' in data:
        dept_result = execute_query("SELECT id FROM departments WHERE id = %s", [data['department_id']])
        if not dept_result:
            return jsonify({"success": False, "error": "Invalid department_id"}), 400

    # Check if employee_id already exists (excluding current faculty)
    if 'employee_id' in data:
        existing_emp = execute_query("SELECT id FROM faculty WHERE employee_id = %s AND id != %s", [data['employee_id'], faculty_id])
        if existing_emp:
            return jsonify({"success": False, "error": "Employee ID already exists"}), 400

    # Check if email is already taken by another faculty member
    if 'email' in data:
        existing_email = execute_query("SELECT id FROM faculty WHERE email = %s AND id != %s", [data['email'], faculty_id])
        if existing_email:
            return jsonify({"success": False, "error": "Email already registered"}), 400

    data['updated_at'] = datetime.now().isoformat()

    result = execute_update('faculty', data, "WHERE id = %s", [faculty_id])
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

    valid_statuses = ['active', 'inactive', 'retired']
    if data['status'] not in valid_statuses:
        return jsonify({"success": False, "error": f"Invalid status. Must be one of: {valid_statuses}"}), 400

    result = execute_update('faculty', {
        'status': data['status'],
        'updated_at': datetime.now().isoformat()
    }, "WHERE id = %s", [faculty_id])

    if not result:
        return jsonify({"success": False, "error": "Faculty member not found"}), 404

    return jsonify({"success": True, "data": result[0]})

# Department Management
@academics_bp.route('/departments', methods=['GET'])
@handle_errors
def get_departments():
    """Get all departments"""
    result = execute_query('SELECT * FROM departments ORDER BY name', fetch_all=True)
    return jsonify({"success": True, "data": result})

@academics_bp.route('/departments', methods=['POST'])
@handle_errors
def create_department():
    """Create a new department"""
    data = request.get_json()
    required_fields = ['name', 'code']

    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({"success": False, "error": f"Missing required field: {field}"}), 400

    # Check if department code already exists
    existing_dept = execute_query("SELECT id FROM departments WHERE code = %s", [data['code']])
    if existing_dept:
        return jsonify({"success": False, "error": "Department code already exists"}), 400

    dept_data = {
        'name': data['name'],
        'code': data['code'],
        'head_of_department': data.get('head_of_department'),
        'created_at': datetime.now().isoformat(),
        'updated_at': datetime.now().isoformat()
    }

    result = execute_insert('departments', dept_data)
    return jsonify({"success": True, "data": result[0] if result else {}}), 201

@academics_bp.route('/departments/<int:dept_id>', methods=['PUT'])
@handle_errors
def update_department(dept_id):
    """Update an existing department"""
    data = request.get_json()

    # Check if department code already exists (excluding current department)
    if 'code' in data:
        existing_dept = execute_query("SELECT id FROM departments WHERE code = %s AND id != %s", [data['code'], dept_id])
        if existing_dept:
            return jsonify({"success": False, "error": "Department code already exists"}), 400

    data['updated_at'] = datetime.now().isoformat()
    result = execute_update('departments', data, "WHERE id = %s", [dept_id])
    if not result:
        return jsonify({"success": False, "error": "Department not found"}), 404

    return jsonify({"success": True, "data": result[0]})

@academics_bp.route('/departments/<int:dept_id>', methods=['DELETE'])
@handle_errors
def delete_department(dept_id):
    """Delete a department"""
    # Check if there are any courses associated with this department
    courses = execute_query("SELECT id FROM courses WHERE department_id = %s", [dept_id])
    if courses:
        return jsonify({
            "success": False,
            "error": "Cannot delete department with associated courses"
        }), 400

    result = execute_delete('departments', "WHERE id = %s", [dept_id])
    if not result:
        return jsonify({"success": False, "error": "Department not found"}), 404

    return jsonify({"success": True, "message": "Department deleted successfully"})

@academics_bp.route('/exams', methods=['GET'])
@handle_errors
def get_exams():
    """Get all exams with optional filtering"""
    query = """
        SELECT e.*, s.name as subject_name, s.code as subject_code
        FROM exams e
        LEFT JOIN subjects s ON e.subject_id = s.id
    """
    params = []
    
    # Add filters if provided
    conditions = []
    if request.args.get('subject_id'):
        conditions.append("e.subject_id = %s")
        params.append(request.args.get('subject_id'))
    if request.args.get('exam_type'):
        conditions.append("e.exam_type = %s")
        params.append(request.args.get('exam_type'))
    if request.args.get('academic_year'):
        conditions.append("e.academic_year = %s")
        params.append(request.args.get('academic_year'))
    if request.args.get('semester'):
        conditions.append("e.semester = %s")
        params.append(request.args.get('semester'))
    
    if conditions:
        query += " WHERE " + " AND ".join(conditions)
    
    query += " ORDER BY e.date DESC"
    
    result = execute_query(query, params, fetch_all=True)
    return jsonify({"success": True, "data": result})

@academics_bp.route('/marks', methods=['GET'])
@handle_errors
def get_marks():
    """Get all marks/results with optional filtering"""
    query = """
        SELECT m.*, st.full_name as student_name, st.register_number,
               e.name as exam_name, e.exam_type, e.max_marks,
               s.name as subject_name, s.code as subject_code
        FROM marks m
        LEFT JOIN students st ON m.student_id = st.id
        LEFT JOIN exams e ON m.exam_id = e.id
        LEFT JOIN subjects s ON m.subject_id = s.id
    """
    params = []
    
    # Add filters if provided
    conditions = []
    if request.args.get('exam_id'):
        conditions.append("m.exam_id = %s")
        params.append(request.args.get('exam_id'))
    if request.args.get('student_id'):
        conditions.append("m.student_id = %s")
        params.append(request.args.get('student_id'))
    if request.args.get('subject_id'):
        conditions.append("m.subject_id = %s")
        params.append(request.args.get('subject_id'))
    if request.args.get('semester'):
        conditions.append("m.semester = %s")
        params.append(request.args.get('semester'))
    
    if conditions:
        query += " WHERE " + " AND ".join(conditions)
    
    query += " ORDER BY m.created_at DESC"
    
    result = execute_query(query, params, fetch_all=True)
    return jsonify({"success": True, "data": result})

@academics_bp.route('/designations', methods=['GET'])
@handle_errors
def get_designations():
    """Get list of all designations"""
    result = execute_query("SELECT DISTINCT designation FROM faculty WHERE designation IS NOT NULL ORDER BY designation", fetch_all=True)
    designations = [row['designation'] for row in result]
    return jsonify({"success": True, "data": designations})

@academics_bp.route('/debug/course-structure', methods=['GET'])
@handle_errors
def debug_course_structure():
    """Debug endpoint to see actual course structure"""
    result = execute_query('SELECT * FROM courses LIMIT 1', fetch_all=False)
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
    courses = execute_query('SELECT * FROM courses LIMIT 3', fetch_all=True)
    subjects = execute_query('SELECT id, name, course_id FROM subjects LIMIT 5', fetch_all=True)

    return jsonify({
        "success": True,
        "courses": courses,
        "subjects": subjects,
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
    required_fields = ['batch_id', 'subject_id', 'faculty_id', 'date', 'type', 'students']
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
                execute_insert('marks', marks_record)
            
            attendance_records.append(record)
        
        # Bulk insert attendance records
        if attendance_records:
            execute_insert('attendance', attendance_records)
        
        return jsonify({
            "success": True,
            "message": f"Successfully recorded attendance and marks for {len(attendance_records)} students"
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to record attendance and marks: {str(e)}"
        }), 500
