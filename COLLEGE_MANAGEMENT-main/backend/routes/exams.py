from flask import Blueprint, request, jsonify, g
from postgres_client import execute_query, execute_insert, execute_update, execute_delete
from datetime import datetime, time
from functools import wraps
from typing import Dict, List, Optional, Any
import uuid

exams_bp = Blueprint('exams', __name__)

def handle_db_error(e):
    """Handle database errors gracefully"""
    print(f"Database error: {str(e)}")
    return jsonify({"error": "A database error occurred"}), 500

def validate_exam_data(data: Dict[str, Any], is_update: bool = False) -> Optional[Dict[str, str]]:
    """Validate exam data"""
    errors = {}
    
    if not is_update or 'name' in data:
        if not data.get('name'):
            errors['name'] = 'Exam name is required'
    
    if not is_update or 'subject_id' in data:
        if not data.get('subject_id'):
            errors['subject_id'] = 'Subject is required'
    
    if not is_update or 'date' in data:
        try:
            datetime.strptime(data.get('date', ''), '%Y-%m-%d')
        except (ValueError, TypeError):
            errors['date'] = 'Invalid date format. Use YYYY-MM-DD'
    
    for time_field in ['start_time', 'end_time']:
        if not is_update or time_field in data:
            try:
                time.fromisoformat(data.get(time_field, ''))
            except (ValueError, TypeError):
                errors[time_field] = f'Invalid {time_field} format. Use HH:MM:SS'
    
    if not is_update or 'duration' in data:
        try:
            duration = int(data.get('duration', 0))
            if duration <= 0:
                errors['duration'] = 'Duration must be a positive number'
        except (ValueError, TypeError):
            errors['duration'] = 'Duration must be a valid number'
    
    if not is_update or 'max_marks' in data:
        try:
            max_marks = float(data.get('max_marks', 0))
            if max_marks <= 0:
                errors['max_marks'] = 'Max marks must be a positive number'
        except (ValueError, TypeError):
            errors['max_marks'] = 'Max marks must be a valid number'
    
    return errors if errors else None

# Exam Management
@exams_bp.route('/exams', methods=['POST'])
def create_exam():
    """Create a new exam"""
    try:
        data = request.get_json()
        
        # Validate exam data
        validation_errors = validate_exam_data(data)
        if validation_errors:
            return jsonify({
                'success': False,
                'error': 'Validation failed',
                'details': validation_errors
            }), 400
        
        exam_data = {
            'id': str(uuid.uuid4()),
            'name': data['name'],
            'subject_id': data['subject_id'],
            'exam_type': data.get('exam_type', 'regular'),
            'date': data['date'],
            'start_time': data.get('start_time'),
            'end_time': data.get('end_time'),
            'duration': data.get('duration', 120),
            'max_marks': data.get('max_marks', 100),
            'passing_marks': data.get('passing_marks', 40),
            'academic_year': data.get('academic_year', datetime.now().year),
            'semester': data.get('semester'),
            'instructions': data.get('instructions', ''),
            'venue': data.get('venue', ''),
            'created_by': getattr(g, 'user', {}).get('id'),
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        result = execute_insert('exams', exam_data)
        
        return jsonify({
            'success': True,
            'message': 'Exam created successfully',
            'data': result
        }), 201
        
    except Exception as e:
        return handle_db_error(e)

@exams_bp.route('/exams', methods=['GET'])
def get_exams():
    """Get all exams with optional filtering"""
    try:
        query = """
            SELECT e.*, s.name as subject_name, s.code as subject_code,
                   c.name as course_name, c.code as course_code,
                   p.full_name as created_by_name
            FROM exams e
            LEFT JOIN subjects s ON e.subject_id = s.id
            LEFT JOIN courses c ON s.course_id = c.id
            LEFT JOIN profiles p ON e.created_by = p.id
        """
        params = []
        conditions = []
        
        # Add filters if provided
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
        
        if request.args.get('date_from'):
            conditions.append("e.date >= %s")
            params.append(request.args.get('date_from'))
        
        if request.args.get('date_to'):
            conditions.append("e.date <= %s")
            params.append(request.args.get('date_to'))
        
        if request.args.get('search'):
            search_term = request.args.get('search')
            conditions.append("(e.name ILIKE %s OR e.venue ILIKE %s)")
            params.extend([f"%{search_term}%", f"%{search_term}%"])
        
        if conditions:
            query += " WHERE " + " AND ".join(conditions)
        
        query += " ORDER BY e.date ASC, e.start_time ASC"
        
        result = execute_query(query, params, fetch_all=True)
        
        return jsonify({
            'success': True,
            'data': result
        })
        
    except Exception as e:
        return handle_db_error(e)

@exams_bp.route('/exams/<exam_id>', methods=['GET'])
def get_exam(exam_id):
    """Get a single exam by ID"""
    try:
        query = """
            SELECT e.*, s.name as subject_name, s.code as subject_code,
                   c.name as course_name, c.code as course_code,
                   p.full_name as created_by_name
            FROM exams e
            LEFT JOIN subjects s ON e.subject_id = s.id
            LEFT JOIN courses c ON s.course_id = c.id
            LEFT JOIN profiles p ON e.created_by = p.id
            WHERE e.id = %s
        """
        
        result = execute_query(query, [exam_id], fetch_all=False)
        
        if not result:
            return jsonify({
                'success': False,
                'error': 'Exam not found'
            }), 404
        
        return jsonify({
            'success': True,
            'data': result
        })
        
    except Exception as e:
        return handle_db_error(e)

@exams_bp.route('/exams/<exam_id>', methods=['PUT'])
def update_exam(exam_id):
    """Update an existing exam"""
    try:
        data = request.get_json()
        
        # Validate exam data
        validation_errors = validate_exam_data(data, is_update=True)
        if validation_errors:
            return jsonify({
                'success': False,
                'error': 'Validation failed',
                'details': validation_errors
            }), 400
        
        data['updated_at'] = datetime.utcnow().isoformat()
        data['updated_by'] = getattr(g, 'user', {}).get('id')
        
        result = execute_update('exams', exam_id, data)
        
        if not result:
            return jsonify({
                'success': False,
                'error': 'Exam not found'
            }), 404
        
        return jsonify({
            'success': True,
            'message': 'Exam updated successfully',
            'data': result
        })
        
    except Exception as e:
        return handle_db_error(e)

@exams_bp.route('/exams/<exam_id>', methods=['DELETE'])
def delete_exam(exam_id):
    """Delete an exam"""
    try:
        # Check if there are any marks associated with this exam
        marks_query = "SELECT COUNT(*) as count FROM marks WHERE exam_id = %s"
        marks = execute_query(marks_query, [exam_id], fetch_all=False)
        
        if marks and marks['count'] > 0:
            return jsonify({
                'success': False,
                'error': 'Cannot delete exam with associated marks'
            }), 400
        
        result = execute_delete('exams', exam_id)
        
        if not result:
            return jsonify({
                'success': False,
                'error': 'Exam not found'
            }), 404
        
        return jsonify({
            'success': True,
            'message': 'Exam deleted successfully'
        })
        
    except Exception as e:
        return handle_db_error(e)

# Marks Management
@exams_bp.route('/marks', methods=['POST'])
def create_marks():
    """Create marks for students"""
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
        
        # Verify exam exists
        exam_query = "SELECT * FROM exams WHERE id = %s"
        exam = execute_query(exam_query, [exam_id], fetch_all=False)
        
        if not exam:
            return jsonify({
                'success': False,
                'error': 'Exam not found'
            }), 404
        
        # Insert marks records
        inserted_records = []
        for record in marks_records:
            marks_data = {
                'id': str(uuid.uuid4()),
                'student_id': record['student_id'],
                'exam_id': exam_id,
                'subject_id': exam['subject_id'],
                'marks_obtained': record['marks_obtained'],
                'max_marks': record.get('max_marks', exam['max_marks']),
                'grade': record.get('grade'),
                'remarks': record.get('remarks', ''),
                'created_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat()
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
        return handle_db_error(e)

@exams_bp.route('/marks', methods=['GET'])
def get_marks():
    """Get all marks with optional filtering"""
    try:
        query = """
            SELECT m.*, e.name as exam_name, e.exam_type, e.date as exam_date, e.max_marks as exam_max_marks,
                   s.name as subject_name, s.code as subject_code,
                   st.name as student_name, st.register_number, st.email,
                   c.name as course_name, c.code as course_code,
                   p.full_name as entered_by_name
            FROM marks m
            LEFT JOIN exams e ON m.exam_id = e.id
            LEFT JOIN subjects s ON m.subject_id = s.id
            LEFT JOIN students st ON m.student_id = st.id
            LEFT JOIN courses c ON st.course_id = c.id
            LEFT JOIN profiles p ON m.entered_by = p.id
        """
        params = []
        conditions = []
        
        # Add filters if provided
        if request.args.get('exam_id'):
            conditions.append("m.exam_id = %s")
            params.append(request.args.get('exam_id'))
        
        if request.args.get('student_id'):
            conditions.append("m.student_id = %s")
            params.append(request.args.get('student_id'))
        
        if request.args.get('subject_id'):
            conditions.append("m.subject_id = %s")
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
        
        query += " ORDER BY e.date DESC, st.name"
        
        result = execute_query(query, params, fetch_all=True)
        
        return jsonify({
            'success': True,
            'data': result
        })
        
    except Exception as e:
        return handle_db_error(e)

@exams_bp.route('/marks/<marks_id>', methods=['PUT'])
def update_marks(marks_id):
    """Update marks for a student"""
    try:
        data = request.get_json()
        
        data['updated_at'] = datetime.utcnow().isoformat()
        data['updated_by'] = getattr(g, 'user', {}).get('id')
        
        result = execute_update('marks', marks_id, data)
        
        if not result:
            return jsonify({
                'success': False,
                'error': 'Marks record not found'
            }), 404
        
        return jsonify({
            'success': True,
            'message': 'Marks updated successfully',
            'data': result
        })
        
    except Exception as e:
        return handle_db_error(e)

# Analytics
@exams_bp.route('/analytics/exam/<exam_id>', methods=['GET'])
def get_exam_analytics(exam_id):
    """Get analytics for a specific exam"""
    try:
        # Get exam details
        exam_query = """
            SELECT e.*, s.name as subject_name, s.code as subject_code,
                   c.name as course_name, c.code as course_code
            FROM exams e
            LEFT JOIN subjects s ON e.subject_id = s.id
            LEFT JOIN courses c ON s.course_id = c.id
            WHERE e.id = %s
        """
        
        exam = execute_query(exam_query, [exam_id], fetch_all=False)
        
        if not exam:
            return jsonify({
                'success': False,
                'error': 'Exam not found'
            }), 404
        
        # Get marks statistics
        stats_query = """
            SELECT 
                COUNT(*) as total_students,
                COUNT(CASE WHEN m.marks_obtained >= e.passing_marks THEN 1 END) as passed_students,
                COUNT(CASE WHEN m.marks_obtained < e.passing_marks THEN 1 END) as failed_students,
                ROUND(AVG(m.marks_obtained), 2) as average_marks,
                MAX(m.marks_obtained) as highest_marks,
                MIN(m.marks_obtained) as lowest_marks,
                ROUND((COUNT(CASE WHEN m.marks_obtained >= e.passing_marks THEN 1 END) * 100.0 / COUNT(*)), 2) as pass_percentage
            FROM marks m
            LEFT JOIN exams e ON m.exam_id = e.id
            WHERE m.exam_id = %s
        """
        
        stats = execute_query(stats_query, [exam_id], fetch_all=False)
        
        # Get grade distribution
        grade_query = """
            SELECT 
                m.grade,
                COUNT(*) as student_count,
                ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM marks WHERE exam_id = %s)), 2) as percentage
            FROM marks m
            WHERE m.exam_id = %s AND m.grade IS NOT NULL
            GROUP BY m.grade
            ORDER BY student_count DESC
        """
        
        grade_distribution = execute_query(grade_query, [exam_id, exam_id], fetch_all=True)
        
        # Get performance ranges
        ranges_query = """
            SELECT 
                CASE 
                    WHEN m.marks_obtained >= e.max_marks * 0.9 THEN 'Excellent (90%+)'
                    WHEN m.marks_obtained >= e.max_marks * 0.75 THEN 'Good (75-89%)'
                    WHEN m.marks_obtained >= e.max_marks * 0.6 THEN 'Average (60-74%)'
                    WHEN m.marks_obtained >= e.passing_marks THEN 'Pass (40-59%)'
                    ELSE 'Fail (<40%)'
                END as performance_range,
                COUNT(*) as student_count
            FROM marks m
            LEFT JOIN exams e ON m.exam_id = e.id
            WHERE m.exam_id = %s
            GROUP BY performance_range
            ORDER BY 
                CASE 
                    WHEN m.marks_obtained >= e.max_marks * 0.9 THEN 1
                    WHEN m.marks_obtained >= e.max_marks * 0.75 THEN 2
                    WHEN m.marks_obtained >= e.max_marks * 0.6 THEN 3
                    WHEN m.marks_obtained >= e.passing_marks THEN 4
                    ELSE 5
                END
        """
        
        performance_ranges = execute_query(ranges_query, [exam_id], fetch_all=True)
        
        analytics_data = {
            'exam': exam,
            'statistics': stats,
            'grade_distribution': grade_distribution,
            'performance_ranges': performance_ranges
        }
        
        return jsonify({
            'success': True,
            'data': analytics_data
        })
        
    except Exception as e:
        return handle_db_error(e)

@exams_bp.route('/analytics/subject/<subject_id>', methods=['GET'])
def get_subject_analytics(subject_id):
    """Get analytics for a specific subject across all exams"""
    try:
        academic_year = request.args.get('academic_year', datetime.now().year)
        semester = request.args.get('semester')
        
        # Get subject details
        subject_query = """
            SELECT s.*, c.name as course_name, c.code as course_code
            FROM subjects s
            LEFT JOIN courses c ON s.course_id = c.id
            WHERE s.id = %s
        """
        
        subject = execute_query(subject_query, [subject_id], fetch_all=False)
        
        if not subject:
            return jsonify({
                'success': False,
                'error': 'Subject not found'
            }), 404
        
        # Get overall statistics
        stats_query = """
            SELECT 
                COUNT(DISTINCT e.id) as total_exams,
                COUNT(DISTINCT m.student_id) as total_students,
                COUNT(m.id) as total_marks_entries,
                COUNT(CASE WHEN m.marks_obtained >= e.passing_marks THEN 1 END) as total_passed,
                COUNT(CASE WHEN m.marks_obtained < e.passing_marks THEN 1 END) as total_failed,
                ROUND(AVG(m.marks_obtained), 2) as average_marks,
                MAX(m.marks_obtained) as highest_marks,
                MIN(m.marks_obtained) as lowest_marks,
                ROUND((COUNT(CASE WHEN m.marks_obtained >= e.passing_marks THEN 1 END) * 100.0 / COUNT(*)), 2) as overall_pass_percentage
            FROM marks m
            LEFT JOIN exams e ON m.exam_id = e.id
            WHERE m.subject_id = %s AND e.academic_year = %s
        """
        params = [subject_id, academic_year]
        
        if semester:
            stats_query += " AND e.semester = %s"
            params.append(semester)
        
        stats = execute_query(stats_query, params, fetch_all=False)
        
        # Get exam-wise performance
        exam_query = """
            SELECT 
                e.id, e.name, e.exam_type, e.date, e.max_marks, e.passing_marks,
                COUNT(m.id) as total_students,
                COUNT(CASE WHEN m.marks_obtained >= e.passing_marks THEN 1 END) as passed_students,
                ROUND(AVG(m.marks_obtained), 2) as average_marks,
                ROUND((COUNT(CASE WHEN m.marks_obtained >= e.passing_marks THEN 1 END) * 100.0 / COUNT(*)), 2) as pass_percentage
            FROM exams e
            LEFT JOIN marks m ON e.id = m.exam_id
            WHERE e.subject_id = %s AND e.academic_year = %s
        """
        exam_params = [subject_id, academic_year]
        
        if semester:
            exam_query += " AND e.semester = %s"
            exam_params.append(semester)
        
        exam_query += """
            GROUP BY e.id, e.name, e.exam_type, e.date, e.max_marks, e.passing_marks
            ORDER BY e.date
        """
        
        by_exam = execute_query(exam_query, exam_params, fetch_all=True)
        
        # Get student performance distribution
        distribution_query = """
            SELECT 
                CASE 
                    WHEN AVG(m.marks_obtained) >= 90 THEN 'Excellent (90%+)'
                    WHEN AVG(m.marks_obtained) >= 75 THEN 'Good (75-89%)'
                    WHEN AVG(m.marks_obtained) >= 60 THEN 'Average (60-74%)'
                    WHEN AVG(m.marks_obtained) >= 40 THEN 'Pass (40-59%)'
                    ELSE 'Fail (<40%)'
                END as performance_category,
                COUNT(*) as student_count
            FROM marks m
            LEFT JOIN exams e ON m.exam_id = e.id
            WHERE m.subject_id = %s AND e.academic_year = %s
        """
        dist_params = [subject_id, academic_year]
        
        if semester:
            distribution_query += " AND e.semester = %s"
            dist_params.append(semester)
        
        distribution_query += """
            GROUP BY m.student_id
        """
        
        temp_distribution = execute_query(distribution_query, dist_params, fetch_all=True)
        
        # Aggregate the distribution
        final_distribution = {}
        for record in temp_distribution:
            category = record['performance_category']
            if category not in final_distribution:
                final_distribution[category] = 0
            final_distribution[category] += 1
        
        performance_distribution = [
            {'performance_range': k, 'student_count': v} 
            for k, v in final_distribution.items()
        ]
        
        analytics_data = {
            'subject': subject,
            'academic_year': academic_year,
            'semester': semester,
            'statistics': stats,
            'by_exam': by_exam,
            'performance_distribution': performance_distribution
        }
        
        return jsonify({
            'success': True,
            'data': analytics_data
        })
        
    except Exception as e:
        return handle_db_error(e)
