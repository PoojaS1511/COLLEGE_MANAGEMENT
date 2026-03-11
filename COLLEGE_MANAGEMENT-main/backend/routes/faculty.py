from flask import Blueprint, request, jsonify
from postgres_client import execute_query, execute_insert, execute_update, execute_delete
import os
from datetime import datetime, timedelta

faculty_bp = Blueprint('faculty', __name__)

@faculty_bp.route('/', methods=['GET'])
def get_faculty():
    """Get all faculty members"""
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        search = request.args.get('search', '')
        department_id = request.args.get('department_id')
        
        # Build query with joins
        query = """
            SELECT f.*, p.full_name, p.email, p.phone,
                   d.name as dept_name, d.code as dept_code
            FROM faculty f
            LEFT JOIN profiles p ON f.user_id = p.id
            LEFT JOIN departments d ON f.department_id = d.id
        """
        params = []
        conditions = []
        
        if search:
            conditions.append("(p.full_name ILIKE %s OR f.employee_id ILIKE %s)")
            params.extend([f"%{search}%", f"%{search}%"])
        
        if department_id:
            conditions.append("f.department_id = %s")
            params.append(department_id)
        
        if conditions:
            query += " WHERE " + " AND ".join(conditions)
        
        query += " ORDER BY f.created_at DESC"
        
        # Get total count
        count_query = "SELECT COUNT(*) as total FROM faculty f"
        if conditions:
            count_query += " WHERE " + " AND ".join(conditions)
        
        total_result = execute_query(count_query, params, fetch_all=False)
        total_count = total_result['total'] if total_result else 0
        
        # Apply pagination
        offset = (page - 1) * limit
        query += " LIMIT %s OFFSET %s"
        params.extend([limit, offset])
        
        result = execute_query(query, params, fetch_all=True)
        
        return jsonify({
            'success': True,
            'data': result,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total_count,
                'pages': (total_count + limit - 1) // limit
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@faculty_bp.route('/<int:faculty_id>/subjects', methods=['GET'])
def get_faculty_subjects(faculty_id):
    """Get subjects assigned to faculty"""
    try:
        academic_year = request.args.get('academic_year', '2024-25')
        semester = request.args.get('semester')
        
        query = """
            SELECT sa.*, s.name as subject_name, s.code as subject_code, s.credits,
                   c.name as course_name, c.code as course_code
            FROM subject_assignments sa
            LEFT JOIN subjects s ON sa.subject_id = s.id
            LEFT JOIN courses c ON s.course_id = c.id
            WHERE sa.faculty_id = %s
        """
        params = [faculty_id]
        
        if academic_year:
            query += " AND sa.academic_year = %s"
            params.append(academic_year)
        
        if semester:
            query += " AND sa.semester = %s"
            params.append(semester)
        
        query += " ORDER BY s.name"
        
        result = execute_query(query, params, fetch_all=True)
        
        return jsonify({
            'success': True,
            'data': result
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@faculty_bp.route('/<int:faculty_id>/students', methods=['GET'])
def get_faculty_students(faculty_id):
    """Get students assigned to faculty"""
    try:
        academic_year = request.args.get('academic_year', '2024-25')
        semester = request.args.get('semester')
        
        query = """
            SELECT DISTINCT s.id, s.name, s.register_number, s.email, s.phone,
                   c.name as course_name, c.code as course_code
            FROM students s
            LEFT JOIN courses c ON s.course_id = c.id
            LEFT JOIN subject_assignments sa ON sa.faculty_id = %s
            LEFT JOIN subjects sub ON sa.subject_id = sub.id
            WHERE s.course_id = sub.course_id
        """
        params = [faculty_id]
        
        if academic_year:
            query += " AND sa.academic_year = %s"
            params.append(academic_year)
        
        if semester:
            query += " AND sa.semester = %s"
            params.append(semester)
        
        query += " ORDER BY s.name"
        
        result = execute_query(query, params, fetch_all=True)
        
        return jsonify({
            'success': True,
            'data': result
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@faculty_bp.route('/<int:faculty_id>/timetable', methods=['GET'])
def get_faculty_timetable(faculty_id):
    """Get faculty timetable"""
    try:
        academic_year = request.args.get('academic_year', '2024-25')
        semester = request.args.get('semester')
        
        query = """
            SELECT tt.*, s.name as subject_name, s.code as subject_code,
                   c.name as course_name, c.code as course_code,
                   r.name as room_name, r.building
            FROM timetable tt
            LEFT JOIN subjects s ON tt.subject_id = s.id
            LEFT JOIN courses c ON s.course_id = c.id
            LEFT JOIN rooms r ON tt.room_id = r.id
            WHERE tt.faculty_id = %s
        """
        params = [faculty_id]
        
        if academic_year:
            query += " AND tt.academic_year = %s"
            params.append(academic_year)
        
        if semester:
            query += " AND tt.semester = %s"
            params.append(semester)
        
        query += " ORDER BY tt.day_of_week, tt.start_time"
        
        result = execute_query(query, params, fetch_all=True)
        
        return jsonify({
            'success': True,
            'data': result
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@faculty_bp.route('/<int:faculty_id>/performance-report', methods=['GET'])
def get_performance_report(faculty_id):
    """Get faculty performance report"""
    try:
        academic_year = request.args.get('academic_year', '2024-25')
        semester = request.args.get('semester')
        
        # Get subjects assigned to faculty
        subjects_query = """
            SELECT DISTINCT s.id, s.name, s.code
            FROM subject_assignments sa
            LEFT JOIN subjects s ON sa.subject_id = s.id
            WHERE sa.faculty_id = %s
        """
        params = [faculty_id]
        
        if academic_year:
            subjects_query += " AND sa.academic_year = %s"
            params.append(academic_year)
        
        if semester:
            subjects_query += " AND sa.semester = %s"
            params.append(semester)
        
        subjects = execute_query(subjects_query, params, fetch_all=True)
        
        performance_data = []
        
        for subject in subjects:
            # Get student performance for this subject
            performance_query = """
                SELECT AVG(m.marks_obtained) as avg_marks,
                       MAX(m.marks_obtained) as max_marks,
                       MIN(m.marks_obtained) as min_marks,
                       COUNT(m.id) as total_students,
                       COUNT(CASE WHEN m.marks_obtained >= m.max_marks * 0.6 THEN 1 END) as passed_students
                FROM marks m
                LEFT JOIN exams e ON m.exam_id = e.id
                WHERE m.subject_id = %s AND e.academic_year = %s
            """
            perf_params = [subject['id'], academic_year]
            
            if semester:
                performance_query += " AND e.semester = %s"
                perf_params.append(semester)
            
            performance = execute_query(performance_query, perf_params, fetch_all=False)
            
            if performance:
                pass_percentage = (performance['passed_students'] / performance['total_students'] * 100) if performance['total_students'] > 0 else 0
                
                performance_data.append({
                    'subject': {
                        'id': subject['id'],
                        'name': subject['name'],
                        'code': subject['code']
                    },
                    'average_marks': round(performance['avg_marks'], 2) if performance['avg_marks'] else 0,
                    'max_marks_obtained': performance['max_marks'] or 0,
                    'min_marks_obtained': performance['min_marks'] or 0,
                    'total_students': performance['total_students'] or 0,
                    'passed_students': performance['passed_students'] or 0,
                    'pass_percentage': round(pass_percentage, 2)
                })
        
        return jsonify({
            'success': True,
            'data': performance_data
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@faculty_bp.route('/<int:faculty_id>/attendance', methods=['POST'])
def mark_attendance(faculty_id):
    """Mark attendance for students"""
    try:
        data = request.get_json()
        
        required_fields = ['subject_id', 'date', 'attendance_records']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        subject_id = data['subject_id']
        attendance_date = data['date']
        attendance_records = data['attendance_records']
        
        # Verify faculty is assigned to this subject
        assignment_query = """
            SELECT id FROM subject_assignments 
            WHERE faculty_id = %s AND subject_id = %s
        """
        assignment = execute_query(assignment_query, [faculty_id, subject_id], fetch_all=False)
        
        if not assignment:
            return jsonify({
                'success': False,
                'error': 'Faculty not assigned to this subject'
            }), 403
        
        # Insert attendance records
        inserted_records = []
        for record in attendance_records:
            attendance_data = {
                'student_id': record['student_id'],
                'subject_id': subject_id,
                'faculty_id': faculty_id,
                'date': attendance_date,
                'status': record['status'],
                'created_at': datetime.utcnow().isoformat()
            }
            
            result = execute_insert('attendance', attendance_data)
            if result:
                inserted_records.append(result)
        
        return jsonify({
            'success': True,
            'message': f'Attendance marked for {len(inserted_records)} students',
            'data': inserted_records
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@faculty_bp.route('/<int:faculty_id>/marks', methods=['POST'])
def enter_marks(faculty_id):
    """Enter marks for students"""
    try:
        data = request.get_json()
        
        required_fields = ['exam_id', 'marks_records']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        exam_id = data['exam_id']
        marks_records = data['marks_records']
        
        # Verify exam exists and faculty has permission
        exam_query = """
            SELECT e.*, sa.faculty_id 
            FROM exams e
            LEFT JOIN subject_assignments sa ON e.subject_id = sa.subject_id
            WHERE e.id = %s AND sa.faculty_id = %s
        """
        exam = execute_query(exam_query, [exam_id, faculty_id], fetch_all=False)
        
        if not exam:
            return jsonify({
                'success': False,
                'error': 'Exam not found or faculty not authorized'
            }), 403
        
        # Insert marks records
        inserted_records = []
        for record in marks_records:
            marks_data = {
                'student_id': record['student_id'],
                'exam_id': exam_id,
                'subject_id': exam['subject_id'],
                'marks_obtained': record['marks_obtained'],
                'max_marks': record.get('max_marks', exam['max_marks']),
                'grade': record.get('grade'),
                'created_at': datetime.utcnow().isoformat()
            }
            
            result = execute_insert('marks', marks_data)
            if result:
                inserted_records.append(result)
        
        return jsonify({
            'success': True,
            'message': f'Marks entered for {len(inserted_records)} students',
            'data': inserted_records
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@faculty_bp.route('/<int:faculty_id>/notifications', methods=['POST'])
def send_notification(faculty_id):
    """Send notification to students"""
    try:
        data = request.get_json()
        
        required_fields = ['title', 'message', 'recipient_type']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        notification_data = {
            'title': data['title'],
            'message': data['message'],
            'sender_id': faculty_id,
            'sender_type': 'faculty',
            'recipient_type': data['recipient_type'],
            'recipient_ids': data.get('recipient_ids', []),
            'created_at': datetime.utcnow().isoformat()
        }
        
        result = execute_insert('notifications', notification_data)
        
        return jsonify({
            'success': True,
            'message': 'Notification sent successfully',
            'data': result
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
