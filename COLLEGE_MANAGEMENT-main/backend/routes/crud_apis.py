from flask import Blueprint, request, jsonify
from postgres_client import execute_query, execute_insert, execute_update, execute_delete
from datetime import datetime

crud_bp = Blueprint('crud', __name__)

# =====================================================
# COURSES CRUD
# =====================================================
@crud_bp.route('/courses', methods=['GET', 'POST'])
def manage_courses():
    """Get all courses or create new course"""
    try:
        if request.method == 'GET':
            query = """
                SELECT c.*, d.name as department_name, d.code as department_code
                FROM courses c
                LEFT JOIN departments d ON c.department_id = d.id
                ORDER BY c.name
            """
            result = execute_query(query, fetch_all=True)
            return jsonify({'success': True, 'data': result}), 200
            
        elif request.method == 'POST':
            data = request.get_json()
            data['created_at'] = datetime.utcnow().isoformat()
            data['updated_at'] = datetime.utcnow().isoformat()
            
            result = execute_insert('courses', data)
            return jsonify({'success': True, 'message': 'Course created', 'data': result}), 201
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@crud_bp.route('/courses/<int:course_id>', methods=['GET', 'PUT', 'DELETE'])
def manage_course(course_id):
    """Get, update, or delete a specific course"""
    try:
        if request.method == 'GET':
            query = """
                SELECT c.*, d.name as department_name, d.code as department_code
                FROM courses c
                LEFT JOIN departments d ON c.department_id = d.id
                WHERE c.id = %s
            """
            result = execute_query(query, [course_id], fetch_all=False)
            if result:
                return jsonify({'success': True, 'data': result}), 200
            return jsonify({'error': 'Course not found'}), 404
        
        elif request.method == 'PUT':
            data = request.get_json()
            data['updated_at'] = datetime.utcnow().isoformat()
            result = execute_update('courses', course_id, data)
            if result:
                return jsonify({'success': True, 'message': 'Course updated', 'data': result}), 200
            return jsonify({'error': 'Course not found'}), 404
        
        elif request.method == 'DELETE':
            result = execute_delete('courses', course_id)
            if result:
                return jsonify({'success': True, 'message': 'Course deleted'}), 200
            return jsonify({'error': 'Course not found'}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# =====================================================
# EVENTS CRUD
# =====================================================
@crud_bp.route('/events', methods=['GET', 'POST'])
def manage_events():
    """Get all events or create new event"""
    try:
        if request.method == 'GET':
            query = "SELECT * FROM events ORDER BY date DESC"
            result = execute_query(query, fetch_all=True)
            return jsonify({'success': True, 'data': result}), 200
            
        elif request.method == 'POST':
            data = request.get_json()
            data['created_at'] = datetime.utcnow().isoformat()
            data['updated_at'] = datetime.utcnow().isoformat()
            
            result = execute_insert('events', data)
            return jsonify({'success': True, 'message': 'Event created', 'data': result}), 201
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@crud_bp.route('/events/<int:event_id>', methods=['GET', 'PUT', 'DELETE'])
def manage_event(event_id):
    """Get, update, or delete a specific event"""
    try:
        if request.method == 'GET':
            result = execute_query("SELECT * FROM events WHERE id = %s", [event_id], fetch_all=False)
            if result:
                return jsonify({'success': True, 'data': result}), 200
            return jsonify({'error': 'Event not found'}), 404
        
        elif request.method == 'PUT':
            data = request.get_json()
            data['updated_at'] = datetime.utcnow().isoformat()
            result = execute_update('events', event_id, data)
            if result:
                return jsonify({'success': True, 'message': 'Event updated', 'data': result}), 200
            return jsonify({'error': 'Event not found'}), 404
        
        elif request.method == 'DELETE':
            result = execute_delete('events', event_id)
            if result:
                return jsonify({'success': True, 'message': 'Event deleted'}), 200
            return jsonify({'error': 'Event not found'}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# =====================================================
# EXAMS CRUD
# =====================================================
@crud_bp.route('/exams', methods=['GET', 'POST'])
def manage_exams():
    """Get all exams or create new exam"""
    try:
        if request.method == 'GET':
            query = """
                SELECT e.*, s.name as subject_name, s.code as subject_code
                FROM exams e
                LEFT JOIN subjects s ON e.subject_id = s.id
                ORDER BY e.date ASC
            """
            result = execute_query(query, fetch_all=True)
            return jsonify({'success': True, 'data': result}), 200
            
        elif request.method == 'POST':
            data = request.get_json()
            data['created_at'] = datetime.utcnow().isoformat()
            data['updated_at'] = datetime.utcnow().isoformat()
            
            result = execute_insert('exams', data)
            return jsonify({'success': True, 'message': 'Exam created', 'data': result}), 201
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@crud_bp.route('/exams/<int:exam_id>', methods=['GET', 'PUT', 'DELETE'])
def manage_exam(exam_id):
    """Get, update, or delete a specific exam"""
    try:
        if request.method == 'GET':
            query = """
                SELECT e.*, s.name as subject_name, s.code as subject_code
                FROM exams e
                LEFT JOIN subjects s ON e.subject_id = s.id
                WHERE e.id = %s
            """
            result = execute_query(query, [exam_id], fetch_all=False)
            if result:
                return jsonify({'success': True, 'data': result}), 200
            return jsonify({'error': 'Exam not found'}), 404
        
        elif request.method == 'PUT':
            data = request.get_json()
            data['updated_at'] = datetime.utcnow().isoformat()
            result = execute_update('exams', exam_id, data)
            if result:
                return jsonify({'success': True, 'message': 'Exam updated', 'data': result}), 200
            return jsonify({'error': 'Exam not found'}), 404
        
        elif request.method == 'DELETE':
            result = execute_delete('exams', exam_id)
            if result:
                return jsonify({'success': True, 'message': 'Exam deleted'}), 200
            return jsonify({'error': 'Exam not found'}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# =====================================================
# HOSTELS CRUD
# =====================================================
@crud_bp.route('/hostels', methods=['GET', 'POST'])
def manage_hostels():
    """Get all hostels or create new hostel"""
    try:
        if request.method == 'GET':
            query = "SELECT * FROM hostels ORDER BY name"
            result = execute_query(query, fetch_all=True)
            return jsonify({'success': True, 'data': result}), 200
            
        elif request.method == 'POST':
            data = request.get_json()
            data['created_at'] = datetime.utcnow().isoformat()
            data['updated_at'] = datetime.utcnow().isoformat()
            
            result = execute_insert('hostels', data)
            return jsonify({'success': True, 'message': 'Hostel created', 'data': result}), 201
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@crud_bp.route('/hostels/<int:hostel_id>', methods=['GET', 'PUT', 'DELETE'])
def manage_hostel(hostel_id):
    """Get, update, or delete a specific hostel"""
    try:
        if request.method == 'GET':
            result = execute_query("SELECT * FROM hostels WHERE id = %s", [hostel_id], fetch_all=False)
            if result:
                return jsonify({'success': True, 'data': result}), 200
            return jsonify({'error': 'Hostel not found'}), 404
        
        elif request.method == 'PUT':
            data = request.get_json()
            data['updated_at'] = datetime.utcnow().isoformat()
            result = execute_update('hostels', hostel_id, data)
            if result:
                return jsonify({'success': True, 'message': 'Hostel updated', 'data': result}), 200
            return jsonify({'error': 'Hostel not found'}), 404
        
        elif request.method == 'DELETE':
            result = execute_delete('hostels', hostel_id)
            if result:
                return jsonify({'success': True, 'message': 'Hostel deleted'}), 200
            return jsonify({'error': 'Hostel not found'}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# =====================================================
# INTERNSHIPS CRUD
# =====================================================
@crud_bp.route('/internships', methods=['GET', 'POST'])
def manage_internships():
    """Get all internships or create new internship"""
    try:
        if request.method == 'GET':
            query = "SELECT * FROM internships ORDER BY created_at DESC"
            result = execute_query(query, fetch_all=True)
            return jsonify({'success': True, 'data': result}), 200
            
        elif request.method == 'POST':
            data = request.get_json()
            data['created_at'] = datetime.utcnow().isoformat()
            data['updated_at'] = datetime.utcnow().isoformat()
            
            result = execute_insert('internships', data)
            return jsonify({'success': True, 'message': 'Internship created', 'data': result}), 201
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@crud_bp.route('/internships/<int:internship_id>', methods=['GET', 'PUT', 'DELETE'])
def manage_internship(internship_id):
    """Get, update, or delete a specific internship"""
    try:
        if request.method == 'GET':
            result = execute_query("SELECT * FROM internships WHERE id = %s", [internship_id], fetch_all=False)
            if result:
                return jsonify({'success': True, 'data': result}), 200
            return jsonify({'error': 'Internship not found'}), 404
        
        elif request.method == 'PUT':
            data = request.get_json()
            data['updated_at'] = datetime.utcnow().isoformat()
            result = execute_update('internships', internship_id, data)
            if result:
                return jsonify({'success': True, 'message': 'Internship updated', 'data': result}), 200
            return jsonify({'error': 'Internship not found'}), 404
        
        elif request.method == 'DELETE':
            result = execute_delete('internships', internship_id)
            if result:
                return jsonify({'success': True, 'message': 'Internship deleted'}), 200
            return jsonify({'error': 'Internship not found'}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# =====================================================
# NOTIFICATIONS CRUD
# =====================================================
@crud_bp.route('/notifications', methods=['GET', 'POST'])
def manage_notifications():
    """Get all notifications or create new notification"""
    try:
        if request.method == 'GET':
            query = "SELECT * FROM notifications ORDER BY created_at DESC"
            result = execute_query(query, fetch_all=True)
            return jsonify({'success': True, 'data': result}), 200
            
        elif request.method == 'POST':
            data = request.get_json()
            data['created_at'] = datetime.utcnow().isoformat()
            data['updated_at'] = datetime.utcnow().isoformat()
            
            result = execute_insert('notifications', data)
            return jsonify({'success': True, 'message': 'Notification created', 'data': result}), 201
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@crud_bp.route('/notifications/<int:notification_id>', methods=['GET', 'PUT', 'DELETE'])
def manage_notification(notification_id):
    """Get, update, or delete a specific notification"""
    try:
        if request.method == 'GET':
            result = execute_query("SELECT * FROM notifications WHERE id = %s", [notification_id], fetch_all=False)
            if result:
                return jsonify({'success': True, 'data': result}), 200
            return jsonify({'error': 'Notification not found'}), 404
        
        elif request.method == 'PUT':
            data = request.get_json()
            data['updated_at'] = datetime.utcnow().isoformat()
            result = execute_update('notifications', notification_id, data)
            if result:
                return jsonify({'success': True, 'message': 'Notification updated', 'data': result}), 200
            return jsonify({'error': 'Notification not found'}), 404
        
        elif request.method == 'DELETE':
            result = execute_delete('notifications', notification_id)
            if result:
                return jsonify({'success': True, 'message': 'Notification deleted'}), 200
            return jsonify({'error': 'Notification not found'}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# =====================================================
# SUBJECTS CRUD
# =====================================================
@crud_bp.route('/subjects', methods=['GET', 'POST'])
def manage_subjects():
    """Get all subjects or create new subject"""
    try:
        if request.method == 'GET':
            query = """
                SELECT s.*, c.name as course_name, c.code as course_code
                FROM subjects s
                LEFT JOIN courses c ON s.course_id = c.id
                ORDER BY s.name
            """
            result = execute_query(query, fetch_all=True)
            return jsonify({'success': True, 'data': result}), 200
            
        elif request.method == 'POST':
            data = request.get_json()
            data['created_at'] = datetime.utcnow().isoformat()
            data['updated_at'] = datetime.utcnow().isoformat()
            
            result = execute_insert('subjects', data)
            return jsonify({'success': True, 'message': 'Subject created', 'data': result}), 201
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@crud_bp.route('/subjects/<int:subject_id>', methods=['GET', 'PUT', 'DELETE'])
def manage_subject(subject_id):
    """Get, update, or delete a specific subject"""
    try:
        if request.method == 'GET':
            query = """
                SELECT s.*, c.name as course_name, c.code as course_code
                FROM subjects s
                LEFT JOIN courses c ON s.course_id = c.id
                WHERE s.id = %s
            """
            result = execute_query(query, [subject_id], fetch_all=False)
            if result:
                return jsonify({'success': True, 'data': result}), 200
            return jsonify({'error': 'Subject not found'}), 404
        
        elif request.method == 'PUT':
            data = request.get_json()
            data['updated_at'] = datetime.utcnow().isoformat()
            result = execute_update('subjects', subject_id, data)
            if result:
                return jsonify({'success': True, 'message': 'Subject updated', 'data': result}), 200
            return jsonify({'error': 'Subject not found'}), 404
        
        elif request.method == 'DELETE':
            result = execute_delete('subjects', subject_id)
            if result:
                return jsonify({'success': True, 'message': 'Subject deleted'}), 200
            return jsonify({'error': 'Subject not found'}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# =====================================================
# TIMETABLE CRUD
# =====================================================
@crud_bp.route('/timetable', methods=['GET', 'POST'])
def manage_timetable():
    """Get all timetable entries or create new timetable entry"""
    try:
        if request.method == 'GET':
            query = """
                SELECT tt.*, s.name as subject_name, s.code as subject_code,
                       r.name as room_name, r.building
                FROM timetable tt
                LEFT JOIN subjects s ON tt.subject_id = s.id
                LEFT JOIN rooms r ON tt.room_id = r.id
                ORDER BY tt.day_of_week, tt.start_time
            """
            result = execute_query(query, fetch_all=True)
            return jsonify({'success': True, 'data': result}), 200
            
        elif request.method == 'POST':
            data = request.get_json()
            data['created_at'] = datetime.utcnow().isoformat()
            data['updated_at'] = datetime.utcnow().isoformat()
            
            result = execute_insert('timetable', data)
            return jsonify({'success': True, 'message': 'Timetable entry created', 'data': result}), 201
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@crud_bp.route('/timetable/<int:timetable_id>', methods=['GET', 'PUT', 'DELETE'])
def manage_timetable_entry(timetable_id):
    """Get, update, or delete a specific timetable entry"""
    try:
        if request.method == 'GET':
            query = """
                SELECT tt.*, s.name as subject_name, s.code as subject_code,
                       r.name as room_name, r.building
                FROM timetable tt
                LEFT JOIN subjects s ON tt.subject_id = s.id
                LEFT JOIN rooms r ON tt.room_id = r.id
                WHERE tt.id = %s
            """
            result = execute_query(query, [timetable_id], fetch_all=False)
            if result:
                return jsonify({'success': True, 'data': result}), 200
            return jsonify({'error': 'Timetable entry not found'}), 404
        
        elif request.method == 'PUT':
            data = request.get_json()
            data['updated_at'] = datetime.utcnow().isoformat()
            result = execute_update('timetable', timetable_id, data)
            if result:
                return jsonify({'success': True, 'message': 'Timetable entry updated', 'data': result}), 200
            return jsonify({'error': 'Timetable entry not found'}), 404
        
        elif request.method == 'DELETE':
            result = execute_delete('timetable', timetable_id)
            if result:
                return jsonify({'success': True, 'message': 'Timetable entry deleted'}), 200
            return jsonify({'error': 'Timetable entry not found'}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500
