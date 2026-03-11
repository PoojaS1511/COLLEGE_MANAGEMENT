from flask import Blueprint, request, jsonify
from postgres_client import execute_query, execute_insert, execute_update, execute_delete
from datetime import datetime, timedelta
from functools import wraps

attendance_bp = Blueprint('attendance', __name__)

def handle_errors(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except Exception as e:
            print(f"Error in {f.__name__}: {str(e)}")
            return jsonify({"success": False, "error": str(e)}), 500
    return wrapper

# Attendance Management
@attendance_bp.route('/attendance', methods=['GET'])
@handle_errors
def get_attendance():
    """Get attendance records with optional filtering"""
    query = """
        SELECT a.*, s.register_number, s.name as student_name,
               c.name as course_name, c.code as course_code,
               sub.name as subject_name, sub.code as subject_code,
               f.name as faculty_name, f.employee_id
        FROM attendance a
        LEFT JOIN students s ON a.student_id = s.id
        LEFT JOIN courses c ON s.course_id = c.id
        LEFT JOIN subjects sub ON a.subject_id = sub.id
        LEFT JOIN faculty f ON a.faculty_id = f.id
    """
    params = []
    conditions = []
    
    # Add filters if provided
    if request.args.get('student_id'):
        conditions.append("a.student_id = %s")
        params.append(request.args.get('student_id'))
    
    if request.args.get('subject_id'):
        conditions.append("a.subject_id = %s")
        params.append(request.args.get('subject_id'))
    
    if request.args.get('faculty_id'):
        conditions.append("a.faculty_id = %s")
        params.append(request.args.get('faculty_id'))
    
    if request.args.get('date'):
        conditions.append("a.date = %s")
        params.append(request.args.get('date'))
    
    if request.args.get('status'):
        conditions.append("a.status = %s")
        params.append(request.args.get('status'))
    
    if request.args.get('date_from'):
        conditions.append("a.date >= %s")
        params.append(request.args.get('date_from'))
    
    if request.args.get('date_to'):
        conditions.append("a.date <= %s")
        params.append(request.args.get('date_to'))
    
    if conditions:
        query += " WHERE " + " AND ".join(conditions)
    
    query += " ORDER BY a.date DESC, s.name"
    
    result = execute_query(query, params, fetch_all=True)
    
    return jsonify({"success": True, "data": result})

@attendance_bp.route('/attendance', methods=['POST'])
@handle_errors
def mark_attendance():
    """Mark attendance for students"""
    try:
        data = request.get_json()
        
        required_fields = ['subject_id', 'faculty_id', 'date', 'attendance_records']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    "success": False,
                    "error": f"Missing required field: {field}"
                }), 400
        
        subject_id = data['subject_id']
        faculty_id = data['faculty_id']
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
                "success": False,
                "error": "Faculty not assigned to this subject"
            }), 403
        
        # Check if attendance is already marked for this date and subject
        existing_query = """
            SELECT COUNT(*) as count FROM attendance 
            WHERE subject_id = %s AND faculty_id = %s AND date = %s
        """
        existing = execute_query(existing_query, [subject_id, faculty_id, attendance_date], fetch_all=False)
        
        if existing and existing['count'] > 0:
            return jsonify({
                "success": False,
                "error": "Attendance already marked for this date and subject"
            }), 400
        
        # Insert attendance records
        inserted_records = []
        for record in attendance_records:
            attendance_data = {
                'student_id': record['student_id'],
                'subject_id': subject_id,
                'faculty_id': faculty_id,
                'date': attendance_date,
                'status': record['status'],
                'remarks': record.get('remarks', ''),
                'created_at': datetime.utcnow().isoformat()
            }
            
            result = execute_insert('attendance', attendance_data)
            if result:
                inserted_records.append(result)
        
        return jsonify({
            "success": True,
            "message": f"Attendance marked for {len(inserted_records)} students",
            "data": inserted_records
        }), 201
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@attendance_bp.route('/attendance/<int:attendance_id>', methods=['PUT'])
@handle_errors
def update_attendance(attendance_id):
    """Update an attendance record"""
    try:
        data = request.get_json()
        
        data['updated_at'] = datetime.utcnow().isoformat()
        
        result = execute_update('attendance', attendance_id, data)
        
        if not result:
            return jsonify({
                "success": False,
                "error": "Attendance record not found"
            }), 404
        
        return jsonify({
            "success": True,
            "message": "Attendance updated successfully",
            "data": result
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@attendance_bp.route('/attendance/<int:attendance_id>', methods=['DELETE'])
@handle_errors
def delete_attendance(attendance_id):
    """Delete an attendance record"""
    try:
        result = execute_delete('attendance', attendance_id)
        
        if not result:
            return jsonify({
                "success": False,
                "error": "Attendance record not found"
            }), 404
        
        return jsonify({
            "success": True,
            "message": "Attendance record deleted successfully"
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@attendance_bp.route('/attendance/defaulters', methods=['GET'])
@handle_errors
def get_attendance_defaulters():
    """Get attendance defaulters based on threshold"""
    try:
        threshold = float(request.args.get('threshold', 75.0))  # Default 75%
        academic_year = request.args.get('academic_year', datetime.now().year)
        semester = request.args.get('semester')
        
        query = """
            SELECT 
                s.id, s.name, s.register_number, s.email, s.phone,
                c.name as course_name, c.code as course_code, s.current_semester,
                COUNT(*) as total_classes,
                COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_classes,
                COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_classes,
                ROUND((COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / COUNT(*)), 2) as attendance_percentage
            FROM attendance a
            LEFT JOIN students s ON a.student_id = s.id
            LEFT JOIN courses c ON s.course_id = c.id
            LEFT JOIN subjects sub ON a.subject_id = sub.id
            WHERE sub.academic_year = %s
        """
        params = [academic_year]
        
        if semester:
            query += " AND sub.semester = %s"
            params.append(semester)
        
        query += """
            GROUP BY s.id, s.name, s.register_number, s.email, s.phone, 
                     c.id, c.name, c.code, s.current_semester
            HAVING (COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / COUNT(*)) < %s
            ORDER BY attendance_percentage ASC
        """
        params.append(threshold)
        
        result = execute_query(query, params, fetch_all=True)
        
        return jsonify({
            "success": True,
            "data": result,
            "threshold": threshold,
            "academic_year": academic_year,
            "semester": semester
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@attendance_bp.route('/attendance/analytics/faculty/<int:faculty_id>', methods=['GET'])
@handle_errors
def get_faculty_attendance_analytics(faculty_id):
    """Get attendance analytics for a specific faculty"""
    try:
        academic_year = request.args.get('academic_year', datetime.now().year)
        semester = request.args.get('semester')
        
        # Get overall statistics
        stats_query = """
            SELECT 
                COUNT(DISTINCT a.id) as total_marked,
                COUNT(DISTINCT a.student_id) as unique_students,
                COUNT(DISTINCT a.subject_id) as subjects_taught,
                COUNT(DISTINCT a.date) as days_taught,
                COUNT(CASE WHEN a.status = 'present' THEN 1 END) as total_present,
                COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as total_absent,
                ROUND((COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / COUNT(*)), 2) as overall_percentage
            FROM attendance a
            LEFT JOIN subjects sub ON a.subject_id = sub.id
            WHERE a.faculty_id = %s AND sub.academic_year = %s
        """
        params = [faculty_id, academic_year]
        
        if semester:
            stats_query += " AND sub.semester = %s"
            params.append(semester)
        
        stats = execute_query(stats_query, params, fetch_all=False)
        
        # Get subject-wise analytics
        subject_query = """
            SELECT 
                sub.id, sub.name, sub.code,
                COUNT(*) as total_classes,
                COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_classes,
                COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_classes,
                COUNT(DISTINCT a.student_id) as unique_students,
                ROUND((COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / COUNT(*)), 2) as attendance_percentage
            FROM attendance a
            LEFT JOIN subjects sub ON a.subject_id = sub.id
            WHERE a.faculty_id = %s AND sub.academic_year = %s
        """
        subject_params = [faculty_id, academic_year]
        
        if semester:
            subject_query += " AND sub.semester = %s"
            subject_params.append(semester)
        
        subject_query += """
            GROUP BY sub.id, sub.name, sub.code
            ORDER BY attendance_percentage DESC
        """
        
        by_subject = execute_query(subject_query, subject_params, fetch_all=True)
        
        # Get monthly trends
        monthly_query = """
            SELECT 
                DATE_TRUNC('month', a.date) as month,
                COUNT(*) as total_classes,
                COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_classes,
                COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_classes,
                ROUND((COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / COUNT(*)), 2) as attendance_percentage
            FROM attendance a
            LEFT JOIN subjects sub ON a.subject_id = sub.id
            WHERE a.faculty_id = %s AND sub.academic_year = %s
        """
        monthly_params = [faculty_id, academic_year]
        
        if semester:
            monthly_query += " AND sub.semester = %s"
            monthly_params.append(semester)
        
        monthly_query += """
            GROUP BY DATE_TRUNC('month', a.date)
            ORDER BY month
        """
        
        monthly_trends = execute_query(monthly_query, monthly_params, fetch_all=True)
        
        analytics_data = {
            'faculty_id': faculty_id,
            'academic_year': academic_year,
            'semester': semester,
            'statistics': stats,
            'by_subject': by_subject,
            'monthly_trends': monthly_trends
        }
        
        return jsonify({
            "success": True,
            "data": analytics_data
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@attendance_bp.route('/attendance/analytics/student/<int:student_id>', methods=['GET'])
@handle_errors
def get_student_attendance_analytics(student_id):
    """Get attendance analytics for a specific student"""
    try:
        academic_year = request.args.get('academic_year', datetime.now().year)
        semester = request.args.get('semester')
        
        # Get overall statistics
        stats_query = """
            SELECT 
                COUNT(*) as total_classes,
                COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_classes,
                COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_classes,
                COUNT(DISTINCT a.subject_id) as subjects_taken,
                COUNT(DISTINCT a.date) as days_present,
                ROUND((COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / COUNT(*)), 2) as overall_percentage
            FROM attendance a
            LEFT JOIN subjects sub ON a.subject_id = sub.id
            WHERE a.student_id = %s AND sub.academic_year = %s
        """
        params = [student_id, academic_year]
        
        if semester:
            stats_query += " AND sub.semester = %s"
            params.append(semester)
        
        stats = execute_query(stats_query, params, fetch_all=False)
        
        # Get subject-wise analytics
        subject_query = """
            SELECT 
                sub.id, sub.name, sub.code, sub.credits,
                COUNT(*) as total_classes,
                COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_classes,
                COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_classes,
                ROUND((COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / COUNT(*)), 2) as attendance_percentage
            FROM attendance a
            LEFT JOIN subjects sub ON a.subject_id = sub.id
            WHERE a.student_id = %s AND sub.academic_year = %s
        """
        subject_params = [student_id, academic_year]
        
        if semester:
            subject_query += " AND sub.semester = %s"
            subject_params.append(semester)
        
        subject_query += """
            GROUP BY sub.id, sub.name, sub.code, sub.credits
            ORDER BY attendance_percentage DESC
        """
        
        by_subject = execute_query(subject_query, subject_params, fetch_all=True)
        
        # Get monthly trends
        monthly_query = """
            SELECT 
                DATE_TRUNC('month', a.date) as month,
                COUNT(*) as total_classes,
                COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_classes,
                COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_classes,
                ROUND((COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / COUNT(*)), 2) as attendance_percentage
            FROM attendance a
            LEFT JOIN subjects sub ON a.subject_id = sub.id
            WHERE a.student_id = %s AND sub.academic_year = %s
        """
        monthly_params = [student_id, academic_year]
        
        if semester:
            monthly_query += " AND sub.semester = %s"
            monthly_params.append(semester)
        
        monthly_query += """
            GROUP BY DATE_TRUNC('month', a.date)
            ORDER BY month
        """
        
        monthly_trends = execute_query(monthly_query, monthly_params, fetch_all=True)
        
        # Get attendance pattern
        pattern_query = """
            SELECT 
                EXTRACT(DOW FROM a.date) as day_of_week,
                COUNT(*) as total_classes,
                COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_classes,
                COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_classes,
                ROUND((COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / COUNT(*)), 2) as attendance_percentage
            FROM attendance a
            LEFT JOIN subjects sub ON a.subject_id = sub.id
            WHERE a.student_id = %s AND sub.academic_year = %s
        """
        pattern_params = [student_id, academic_year]
        
        if semester:
            pattern_query += " AND sub.semester = %s"
            pattern_params.append(semester)
        
        pattern_query += """
            GROUP BY EXTRACT(DOW FROM a.date)
            ORDER BY day_of_week
        """
        
        attendance_pattern = execute_query(pattern_query, pattern_params, fetch_all=True)
        
        analytics_data = {
            'student_id': student_id,
            'academic_year': academic_year,
            'semester': semester,
            'statistics': stats,
            'by_subject': by_subject,
            'monthly_trends': monthly_trends,
            'attendance_pattern': attendance_pattern
        }
        
        return jsonify({
            "success": True,
            "data": analytics_data
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@attendance_bp.route('/attendance/analytics/subject/<int:subject_id>', methods=['GET'])
@handle_errors
def get_subject_attendance_analytics(subject_id):
    """Get attendance analytics for a specific subject"""
    try:
        academic_year = request.args.get('academic_year', datetime.now().year)
        semester = request.args.get('semester')
        
        # Verify subject exists for the academic year
        subject_query = """
            SELECT id, name, code, credits FROM subjects 
            WHERE id = %s AND academic_year = %s
        """
        if semester:
            subject_query += " AND semester = %s"
            subject = execute_query(subject_query, [subject_id, academic_year, semester], fetch_all=False)
        else:
            subject = execute_query(subject_query, [subject_id, academic_year], fetch_all=False)
        
        if not subject:
            return jsonify({
                "success": False,
                "error": "Subject not found for the specified academic year"
            }), 404
        
        # Get overall statistics
        stats_query = """
            SELECT 
                COUNT(*) as total_classes,
                COUNT(DISTINCT a.student_id) as total_students,
                COUNT(CASE WHEN a.status = 'present' THEN 1 END) as total_present,
                COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as total_absent,
                COUNT(DISTINCT a.date) as days_conducted,
                COUNT(DISTINCT a.faculty_id) as faculty_count,
                ROUND((COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / COUNT(*)), 2) as overall_percentage
            FROM attendance a
            WHERE a.subject_id = %s AND EXTRACT(YEAR FROM a.date) = %s
        """
        params = [subject_id, academic_year]
        
        if semester:
            stats_query += " AND EXISTS (SELECT 1 FROM subjects sub WHERE sub.id = %s AND sub.semester = %s)"
            params.extend([subject_id, semester])
        
        stats = execute_query(stats_query, params, fetch_all=False)
        
        # Get student-wise attendance
        student_query = """
            SELECT 
                s.id, s.name, s.register_number,
                COUNT(*) as total_classes,
                COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_classes,
                COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_classes,
                ROUND((COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / COUNT(*)), 2) as attendance_percentage
            FROM attendance a
            LEFT JOIN students s ON a.student_id = s.id
            WHERE a.subject_id = %s AND EXTRACT(YEAR FROM a.date) = %s
        """
        student_params = [subject_id, academic_year]
        
        if semester:
            student_query += " AND EXISTS (SELECT 1 FROM subjects sub WHERE sub.id = %s AND sub.semester = %s)"
            student_params.extend([subject_id, semester])
        
        student_query += """
            GROUP BY s.id, s.name, s.register_number
            ORDER BY attendance_percentage ASC
        """
        
        by_student = execute_query(student_query, student_params, fetch_all=True)
        
        # Get monthly trends
        monthly_query = """
            SELECT 
                DATE_TRUNC('month', a.date) as month,
                COUNT(*) as total_classes,
                COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_classes,
                COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_classes,
                COUNT(DISTINCT a.student_id) as unique_students,
                ROUND((COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / COUNT(*)), 2) as attendance_percentage
            FROM attendance a
            WHERE a.subject_id = %s AND EXTRACT(YEAR FROM a.date) = %s
        """
        monthly_params = [subject_id, academic_year]
        
        if semester:
            monthly_query += " AND EXISTS (SELECT 1 FROM subjects sub WHERE sub.id = %s AND sub.semester = %s)"
            monthly_params.extend([subject_id, semester])
        
        monthly_query += """
            GROUP BY DATE_TRUNC('month', a.date)
            ORDER BY month
        """
        
        monthly_trends = execute_query(monthly_query, monthly_params, fetch_all=True)
        
        # Get attendance distribution
        distribution_query = """
            SELECT 
                CASE 
                    WHEN attendance_percentage >= 90 THEN 'excellent'
                    WHEN attendance_percentage >= 75 THEN 'good'
                    WHEN attendance_percentage >= 60 THEN 'average'
                    ELSE 'poor'
                END as attendance_category,
                COUNT(*) as student_count
            FROM (
                SELECT 
                    s.id,
                    ROUND((COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / COUNT(*)), 2) as attendance_percentage
                FROM attendance a
                LEFT JOIN students s ON a.student_id = s.id
                WHERE a.subject_id = %s AND EXTRACT(YEAR FROM a.date) = %s
        """
        distribution_params = [subject_id, academic_year]
        
        if semester:
            distribution_query += " AND EXISTS (SELECT 1 FROM subjects sub WHERE sub.id = %s AND sub.semester = %s)"
            distribution_params.extend([subject_id, semester])
        
        distribution_query += """
                GROUP BY s.id
            ) student_attendance
            GROUP BY attendance_category
            ORDER BY student_count DESC
        """
        
        attendance_distribution = execute_query(distribution_query, distribution_params, fetch_all=True)
        
        analytics_data = {
            'subject': subject,
            'academic_year': academic_year,
            'semester': semester,
            'statistics': stats,
            'by_student': by_student,
            'monthly_trends': monthly_trends,
            'attendance_distribution': attendance_distribution
        }
        
        return jsonify({
            "success": True,
            "data": analytics_data
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500
