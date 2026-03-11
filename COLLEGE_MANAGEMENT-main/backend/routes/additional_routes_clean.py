from flask import Blueprint, request, jsonify
from postgres_client import execute_query, execute_insert, execute_update, execute_delete
from datetime import datetime
import uuid

# Initialize blueprints
crud_bp = Blueprint('crud', __name__)
admissions_bp = Blueprint('admissions', __name__)
analytics_bp = Blueprint('analytics', __name__)
resume_bp = Blueprint('resume', __name__)
internships_bp = Blueprint('internships', __name__)
clubs_bp = Blueprint('clubs', __name__)

# =====================================================
# CRUD OPERATIONS
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

# =====================================================
# ADMISSIONS SYSTEM
# =====================================================

@admissions_bp.route('/stats', methods=['GET'])
def get_admission_stats():
    """Get admission statistics"""
    try:
        query = """
            SELECT 
                COUNT(*) as total_applications,
                COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_applications,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_applications,
                COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_applications,
                COUNT(CASE WHEN status = 'under_review' THEN 1 END) as under_review_applications
            FROM admissions
        """
        
        stats = execute_query(query, fetch_all=False)
        
        # Get course-wise statistics
        course_query = """
            SELECT 
                c.name as course_name,
                COUNT(a.id) as application_count,
                COUNT(CASE WHEN a.status = 'approved' THEN 1 END) as approved_count
            FROM admissions a
            LEFT JOIN courses c ON a.course_id = c.id
            GROUP BY c.id, c.name
            ORDER BY application_count DESC
        """
        
        by_course = execute_query(course_query, fetch_all=True)
        
        return jsonify({
            'success': True,
            'data': {
                'statistics': stats,
                'by_course': by_course
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admissions_bp.route('/applications', methods=['GET'])
def get_applications():
    """Get all applications with optional filtering"""
    try:
        query = """
            SELECT a.*, c.name as course_name, c.code as course_code
            FROM admissions a
            LEFT JOIN courses c ON a.course_id = c.id
            WHERE 1=1
        """
        params = []
        conditions = []
        
        if request.args.get('status'):
            conditions.append("a.status = %s")
            params.append(request.args.get('status'))
        
        if request.args.get('course_id'):
            conditions.append("a.course_id = %s")
            params.append(request.args.get('course_id'))
        
        if conditions:
            query += " AND " + " AND ".join(conditions)
        
        query += " ORDER BY a.created_at DESC"
        
        result = execute_query(query, params, fetch_all=True)
        
        return jsonify({
            'success': True,
            'data': result
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admissions_bp.route('/applications/<int:application_id>', methods=['GET'])
def get_application(application_id):
    """Get a single application by ID"""
    try:
        query = """
            SELECT a.*, c.name as course_name, c.code as course_code
            FROM admissions a
            LEFT JOIN courses c ON a.course_id = c.id
            WHERE a.id = %s
        """
        
        result = execute_query(query, [application_id], fetch_all=False)
        
        if not result:
            return jsonify({'success': False, 'error': 'Application not found'}), 404
        
        return jsonify({
            'success': True,
            'data': result
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admissions_bp.route('/courses', methods=['GET'])
def get_courses():
    """Get available courses for admission"""
    try:
        query = """
            SELECT c.*, 
                   COUNT(a.id) as current_applications,
                   COUNT(CASE WHEN a.status = 'approved' THEN 1 END) as approved_applications
            FROM courses c
            LEFT JOIN admissions a ON c.id = a.course_id
            GROUP BY c.id, c.name, c.code, c.description, c.duration_years, c.department_id, c.created_at, c.updated_at
            ORDER BY c.name
        """
        
        result = execute_query(query, fetch_all=True)
        
        return jsonify({
            'success': True,
            'data': result
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admissions_bp.route('/applications/pending-count', methods=['GET'])
def get_pending_applications_count():
    """Get count of pending applications"""
    try:
        query = "SELECT COUNT(*) as count FROM admissions WHERE status = 'pending'"
        result = execute_query(query, fetch_all=False)
        
        return jsonify({
            'success': True,
            'data': {'pending_count': result['count'] if result else 0}
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admissions_bp.route('/applications/recent', methods=['GET'])
def get_recent_applications():
    """Get recent applications"""
    try:
        limit = int(request.args.get('limit', 10))
        
        query = """
            SELECT a.*, c.name as course_name, c.code as course_code
            FROM admissions a
            LEFT JOIN courses c ON a.course_id = c.id
            ORDER BY a.created_at DESC
            LIMIT %s
        """
        
        result = execute_query(query, [limit], fetch_all=True)
        
        return jsonify({
            'success': True,
            'data': result
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admissions_bp.route('/submit', methods=['POST'])
def submit_application():
    """Submit a new admission application"""
    try:
        data = request.get_json()
        
        required_fields = ['name', 'email', 'phone', 'course_id']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        application_data = {
            'name': data['name'],
            'email': data['email'],
            'phone': data['phone'],
            'course_id': data['course_id'],
            'date_of_birth': data.get('date_of_birth'),
            'gender': data.get('gender'),
            'address': data.get('address'),
            'previous_education': data.get('previous_education'),
            'marks_obtained': data.get('marks_obtained'),
            'percentage': data.get('percentage'),
            'parent_name': data.get('parent_name'),
            'parent_phone': data.get('parent_phone'),
            'status': 'pending',
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        result = execute_insert('admissions', application_data)
        
        return jsonify({
            'success': True,
            'message': 'Application submitted successfully',
            'data': result
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admissions_bp.route('/applications/<int:application_id>/status', methods=['PUT'])
def update_application_status(application_id):
    """Update application status"""
    try:
        data = request.get_json()
        
        if 'status' not in data:
            return jsonify({
                'success': False,
                'error': 'Status field is required'
            }), 400
        
        valid_statuses = ['pending', 'under_review', 'approved', 'rejected']
        if data['status'] not in valid_statuses:
            return jsonify({
                'success': False,
                'error': f'Invalid status. Must be one of: {valid_statuses}'
            }), 400
        
        data['updated_at'] = datetime.utcnow().isoformat()
        
        result = execute_update('admissions', application_id, data)
        
        if not result:
            return jsonify({'success': False, 'error': 'Application not found'}), 404
        
        return jsonify({
            'success': True,
            'message': 'Application status updated successfully',
            'data': result
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admissions_bp.route('/applications/bulk-approve', methods=['POST'])
def bulk_approve_applications():
    """Bulk approve applications"""
    try:
        data = request.get_json()
        
        if 'application_ids' not in data:
            return jsonify({
                'success': False,
                'error': 'Application IDs are required'
            }), 400
        
        application_ids = data['application_ids']
        if not isinstance(application_ids, list):
            return jsonify({
                'success': False,
                'error': 'Application IDs must be an array'
            }), 400
        
        approved_count = 0
        for app_id in application_ids:
            result = execute_update('admissions', app_id, {
                'status': 'approved',
                'updated_at': datetime.utcnow().isoformat()
            })
            if result:
                approved_count += 1
        
        return jsonify({
            'success': True,
            'message': f'Approved {approved_count} applications',
            'data': {'approved_count': approved_count}
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admissions_bp.route('/applications/bulk-reject', methods=['POST'])
def bulk_reject_applications():
    """Bulk reject applications"""
    try:
        data = request.get_json()
        
        if 'application_ids' not in data:
            return jsonify({
                'success': False,
                'error': 'Application IDs are required'
            }), 400
        
        application_ids = data['application_ids']
        if not isinstance(application_ids, list):
            return jsonify({
                'success': False,
                'error': 'Application IDs must be an array'
            }), 400
        
        rejected_count = 0
        for app_id in application_ids:
            result = execute_update('admissions', app_id, {
                'status': 'rejected',
                'updated_at': datetime.utcnow().isoformat()
            })
            if result:
                rejected_count += 1
        
        return jsonify({
            'success': True,
            'message': f'Rejected {rejected_count} applications',
            'data': {'rejected_count': rejected_count}
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admissions_bp.route('/upload-document', methods=['POST'])
def upload_document():
    """Upload admission document"""
    try:
        data = request.get_json()
        
        required_fields = ['application_id', 'document_type', 'file_name']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        document_data = {
            'id': str(uuid.uuid4()),
            'application_id': data['application_id'],
            'document_type': data['document_type'],
            'file_name': data['file_name'],
            'file_path': data.get('file_path'),
            'file_size': data.get('file_size'),
            'uploaded_at': datetime.utcnow().isoformat()
        }
        
        result = execute_insert('admission_documents', document_data)
        
        return jsonify({
            'success': True,
            'message': 'Document uploaded successfully',
            'data': result
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# =====================================================
# ANALYTICS DASHBOARDS
# =====================================================

@analytics_bp.route('/admission', methods=['GET'])
def get_admission_analytics():
    """Get admission analytics"""
    try:
        # Get monthly admission trends
        monthly_query = """
            SELECT 
                DATE_TRUNC('month', created_at) as month,
                COUNT(*) as applications,
                COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
                COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected
            FROM admissions
            WHERE created_at >= NOW() - INTERVAL '12 months'
            GROUP BY DATE_TRUNC('month', created_at)
            ORDER BY month
        """
        
        monthly_trends = execute_query(monthly_query, fetch_all=True)
        
        # Get course-wise admission distribution
        course_query = """
            SELECT 
                c.name as course_name,
                COUNT(a.id) as total_applications,
                COUNT(CASE WHEN a.status = 'approved' THEN 1 END) as approved_applications,
                ROUND((COUNT(CASE WHEN a.status = 'approved' THEN 1 END) * 100.0 / COUNT(a.id)), 2) as approval_rate
            FROM admissions a
            LEFT JOIN courses c ON a.course_id = c.id
            GROUP BY c.id, c.name
            ORDER BY total_applications DESC
        """
        
        by_course = execute_query(course_query, fetch_all=True)
        
        # Get status distribution
        status_query = """
            SELECT 
                status,
                COUNT(*) as count,
                ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM admissions)), 2) as percentage
            FROM admissions
            GROUP BY status
            ORDER BY count DESC
        """
        
        status_distribution = execute_query(status_query, fetch_all=True)
        
        return jsonify({
            'success': True,
            'data': {
                'monthly_trends': monthly_trends,
                'by_course': by_course,
                'status_distribution': status_distribution
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analytics_bp.route('/performance', methods=['GET'])
def get_performance_analytics():
    """Get performance analytics"""
    try:
        # Get overall performance statistics
        stats_query = """
            SELECT 
                COUNT(DISTINCT s.id) as total_students,
                COUNT(DISTINCT e.id) as total_exams,
                COUNT(m.id) as total_marks_entries,
                COUNT(CASE WHEN m.marks_obtained >= e.passing_marks THEN 1 END) as passed_exams,
                ROUND(AVG(m.marks_obtained), 2) as average_marks,
                ROUND((COUNT(CASE WHEN m.marks_obtained >= e.passing_marks THEN 1 END) * 100.0 / COUNT(m.id)), 2) as pass_percentage
            FROM students s
            LEFT JOIN marks m ON s.id = m.student_id
            LEFT JOIN exams e ON m.exam_id = e.id
        """
        
        overall_stats = execute_query(stats_query, fetch_all=False)
        
        # Get course-wise performance
        course_query = """
            SELECT 
                c.name as course_name,
                COUNT(DISTINCT s.id) as student_count,
                COUNT(m.id) as total_marks,
                COUNT(CASE WHEN m.marks_obtained >= e.passing_marks THEN 1 END) as passed_marks,
                ROUND(AVG(m.marks_obtained), 2) as average_marks,
                ROUND((COUNT(CASE WHEN m.marks_obtained >= e.passing_marks THEN 1 END) * 100.0 / COUNT(m.id)), 2) as pass_percentage
            FROM courses c
            LEFT JOIN students s ON c.id = s.course_id
            LEFT JOIN marks m ON s.id = m.student_id
            LEFT JOIN exams e ON m.exam_id = e.id
            GROUP BY c.id, c.name
            ORDER BY pass_percentage DESC
        """
        
        by_course = execute_query(course_query, fetch_all=True)
        
        # Get grade distribution
        grade_query = """
            SELECT 
                m.grade,
                COUNT(*) as student_count,
                ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM marks)), 2) as percentage
            FROM marks m
            WHERE m.grade IS NOT NULL
            GROUP BY m.grade
            ORDER BY student_count DESC
        """
        
        grade_distribution = execute_query(grade_query, fetch_all=True)
        
        return jsonify({
            'success': True,
            'data': {
                'overall_stats': overall_stats,
                'by_course': by_course,
                'grade_distribution': grade_distribution
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analytics_bp.route('/utilization', methods=['GET'])
def get_utilization_analytics():
    """Get resource utilization analytics"""
    try:
        # Get classroom utilization
        classroom_query = """
            SELECT 
                r.name as room_name,
                r.capacity,
                COUNT(tt.id) as scheduled_classes,
                ROUND((COUNT(tt.id) * 100.0 / (SELECT COUNT(*) FROM timetable WHERE date BETWEEN CURRENT_DATE - INTERVAL '7 days' AND CURRENT_DATE)), 2) as utilization_rate
            FROM rooms r
            LEFT JOIN timetable tt ON r.id = tt.room_id 
                AND tt.date BETWEEN CURRENT_DATE - INTERVAL '7 days' AND CURRENT_DATE
            WHERE r.room_type = 'classroom'
            GROUP BY r.id, r.name, r.capacity
            ORDER BY utilization_rate DESC
        """
        
        classroom_utilization = execute_query(classroom_query, fetch_all=True)
        
        # Get hostel occupancy
        hostel_query = """
            SELECT 
                h.name as hostel_name,
                h.capacity,
                COUNT(ha.id) as occupied_rooms,
                COUNT(s.id) as total_students,
                ROUND((COUNT(s.id) * 100.0 / h.capacity), 2) as occupancy_rate
            FROM hostels h
            LEFT JOIN hostel_allocations ha ON h.id = ha.hostel_id
            LEFT JOIN students s ON ha.student_id = s.id
            GROUP BY h.id, h.name, h.capacity
            ORDER BY occupancy_rate DESC
        """
        
        hostel_occupancy = execute_query(hostel_query, fetch_all=True)
        
        # Get faculty workload
        faculty_query = """
            SELECT 
                f.name as faculty_name,
                f.designation,
                COUNT(DISTINCT tt.id) as scheduled_classes,
                COUNT(DISTINCT sa.subject_id) as assigned_subjects
            FROM faculty f
            LEFT JOIN timetable tt ON f.id = tt.faculty_id
            LEFT JOIN subject_assignments sa ON f.id = sa.faculty_id
            GROUP BY f.id, f.name, f.designation
            ORDER BY scheduled_classes DESC
        """
        
        faculty_workload = execute_query(faculty_query, fetch_all=True)
        
        return jsonify({
            'success': True,
            'data': {
                'classroom_utilization': classroom_utilization,
                'hostel_occupancy': hostel_occupancy,
                'faculty_workload': faculty_workload
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# =====================================================
# RESUME SERVICES
# =====================================================

@resume_bp.route('/<student_id>', methods=['GET'])
def get_resume(student_id):
    """Get student resume data"""
    try:
        query = """
            SELECT s.*, c.name as course_name, c.code as course_code
            FROM students s
            LEFT JOIN courses c ON s.course_id = c.id
            WHERE s.id = %s
        """
        
        student = execute_query(query, [student_id], fetch_all=False)
        
        if not student:
            return jsonify({'success': False, 'error': 'Student not found'}), 404
        
        # Get academic achievements
        achievements_query = """
            SELECT * FROM student_achievements
            WHERE student_id = %s
            ORDER BY year DESC
        """
        
        achievements = execute_query(achievements_query, [student_id], fetch_all=True)
        
        # Get skills
        skills_query = """
            SELECT * FROM student_skills
            WHERE student_id = %s
        """
        
        skills = execute_query(skills_query, [student_id], fetch_all=True)
        
        # Get projects
        projects_query = """
            SELECT * FROM student_projects
            WHERE student_id = %s
            ORDER BY created_at DESC
        """
        
        projects = execute_query(projects_query, [student_id], fetch_all=True)
        
        return jsonify({
            'success': True,
            'data': {
                'student': student,
                'achievements': achievements,
                'skills': skills,
                'projects': projects
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@resume_bp.route('/student/<int:student_id>/resume/analysis', methods=['GET'])
def get_resume_analysis(student_id):
    """Get resume analysis for a student"""
    try:
        # Get student marks for academic performance
        marks_query = """
            SELECT 
                AVG(m.marks_obtained) as average_marks,
                COUNT(CASE WHEN m.marks_obtained >= e.passing_marks THEN 1 END) as passed_exams,
                COUNT(m.id) as total_exams
            FROM marks m
            LEFT JOIN exams e ON m.exam_id = e.id
            WHERE m.student_id = %s
        """
        
        academic_performance = execute_query(marks_query, [student_id], fetch_all=False)
        
        # Get skills count and categories
        skills_query = """
            SELECT 
                COUNT(*) as total_skills,
                COUNT(CASE WHEN skill_type = 'technical' THEN 1 END) as technical_skills,
                COUNT(CASE WHEN skill_type = 'soft' THEN 1 END) as soft_skills
            FROM student_skills
            WHERE student_id = %s
        """
        
        skills_analysis = execute_query(skills_query, [student_id], fetch_all=False)
        
        # Get projects count
        projects_query = """
            SELECT COUNT(*) as total_projects
            FROM student_projects
            WHERE student_id = %s
        """
        
        projects_count = execute_query(projects_query, [student_id], fetch_all=False)
        
        # Generate recommendations
        recommendations = []
        
        if academic_performance and academic_performance['average_marks']:
            avg_marks = academic_performance['average_marks']
            if avg_marks >= 80:
                recommendations.append("Excellent academic performance - highlight in resume")
            elif avg_marks >= 60:
                recommendations.append("Good academic performance - include in resume")
            else:
                recommendations.append("Focus on improving academic performance")
        
        if skills_analysis and skills_analysis['technical_skills']:
            if skills_analysis['technical_skills'] >= 5:
                recommendations.append("Strong technical skills - create dedicated section")
            else:
                recommendations.append("Consider adding more technical skills")
        
        if projects_count and projects_count['total_projects'] >= 3:
            recommendations.append("Good project portfolio - showcase prominently")
        else:
            recommendations.append("Consider working on more projects")
        
        return jsonify({
            'success': True,
            'data': {
                'academic_performance': academic_performance,
                'skills_analysis': skills_analysis,
                'projects_count': projects_count,
                'recommendations': recommendations
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@resume_bp.route('/resume/resume/analytics/dashboard', methods=['GET'])
def get_resume_analytics_dashboard():
    """Get resume analytics dashboard"""
    try:
        # Get students with resumes
        students_query = """
            SELECT COUNT(*) as total_students_with_resumes
            FROM students s
            WHERE EXISTS (
                SELECT 1 FROM student_skills ss WHERE ss.student_id = s.id
                UNION
                SELECT 1 FROM student_projects sp WHERE sp.student_id = s.id
                UNION
                SELECT 1 FROM student_achievements sa WHERE sa.student_id = s.id
            )
        """
        
        students_with_resumes = execute_query(students_query, fetch_all=False)
        
        # Get skills distribution
        skills_query = """
            SELECT 
                skill_type,
                COUNT(*) as count,
                ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM student_skills)), 2) as percentage
            FROM student_skills
            GROUP BY skill_type
            ORDER BY count DESC
        """
        
        skills_distribution = execute_query(skills_query, fetch_all=True)
        
        # Get average projects per student
        projects_query = """
            SELECT 
                AVG(project_count) as avg_projects,
                MAX(project_count) as max_projects,
                MIN(project_count) as min_projects
            FROM (
                SELECT COUNT(*) as project_count
                FROM student_projects
                GROUP BY student_id
            ) project_stats
        """
        
        projects_stats = execute_query(projects_query, fetch_all=False)
        
        return jsonify({
            'success': True,
            'data': {
                'students_with_resumes': students_with_resumes,
                'skills_distribution': skills_distribution,
                'projects_stats': projects_stats
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@resume_bp.route('/resume/student/<int:student_id>/resume/recommendations', methods=['GET'])
def get_resume_recommendations(student_id):
    """Get personalized resume recommendations"""
    try:
        # Get student's current resume data
        student_query = "SELECT * FROM students WHERE id = %s"
        student = execute_query(student_query, [student_id], fetch_all=False)
        
        if not student:
            return jsonify({'success': False, 'error': 'Student not found'}), 404
        
        recommendations = []
        
        # Academic recommendations
        marks_query = """
            SELECT AVG(m.marks_obtained) as avg_marks
            FROM marks m
            WHERE m.student_id = %s
        """
        marks_result = execute_query(marks_query, [student_id], fetch_all=False)
        
        if marks_result and marks_result['avg_marks']:
            avg_marks = marks_result['avg_marks']
            if avg_marks >= 85:
                recommendations.append({
                    'category': 'Academic',
                    'recommendation': 'Highlight your excellent academic performance prominently',
                    'priority': 'high'
                })
            elif avg_marks >= 70:
                recommendations.append({
                    'category': 'Academic',
                    'recommendation': 'Include your academic performance with key achievements',
                    'priority': 'medium'
                })
        
        # Skills recommendations
        skills_query = "SELECT COUNT(*) as skill_count FROM student_skills WHERE student_id = %s"
        skills_result = execute_query(skills_query, [student_id], fetch_all=False)
        
        if skills_result and skills_result['skill_count']:
            skill_count = skills_result['skill_count']
            if skill_count < 5:
                recommendations.append({
                    'category': 'Skills',
                    'recommendation': 'Consider adding more technical and soft skills to strengthen your profile',
                    'priority': 'high'
                })
            elif skill_count >= 10:
                recommendations.append({
                    'category': 'Skills',
                    'recommendation': 'You have a good skill set - organize them by category and proficiency',
                    'priority': 'medium'
                })
        
        # Projects recommendations
        projects_query = "SELECT COUNT(*) as project_count FROM student_projects WHERE student_id = %s"
        projects_result = execute_query(projects_query, [student_id], fetch_all=False)
        
        if projects_result and projects_result['project_count']:
            project_count = projects_result['project_count']
            if project_count < 2:
                recommendations.append({
                    'category': 'Projects',
                    'recommendation': 'Work on more academic or personal projects to showcase your abilities',
                    'priority': 'high'
                })
        
        # General recommendations
        recommendations.extend([
            {
                'category': 'Format',
                'recommendation': 'Keep your resume concise and focused on the job you are applying for',
                'priority': 'medium'
            },
            {
                'category': 'Content',
                'recommendation': 'Use action verbs and quantify your achievements wherever possible',
                'priority': 'medium'
            }
        ])
        
        return jsonify({
            'success': True,
            'data': {
                'student_id': student_id,
                'recommendations': recommendations
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@resume_bp.route('/resume/upload', methods=['POST'])
def upload_resume():
    """Upload resume file"""
    try:
        data = request.get_json()
        
        required_fields = ['student_id', 'file_name', 'file_path']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        resume_data = {
            'id': str(uuid.uuid4()),
            'student_id': data['student_id'],
            'file_name': data['file_name'],
            'file_path': data['file_path'],
            'file_size': data.get('file_size'),
            'upload_date': datetime.utcnow().isoformat(),
            'status': 'uploaded'
        }
        
        result = execute_insert('resumes', resume_data)
        
        return jsonify({
            'success': True,
            'message': 'Resume uploaded successfully',
            'data': result
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@resume_bp.route('/resume/analysis/<student_id>', methods=['PUT'])
def update_resume_analysis(student_id):
    """Update resume analysis"""
    try:
        data = request.get_json()
        
        analysis_data = {
            'student_id': student_id,
            'analysis_data': data.get('analysis_data', {}),
            'recommendations': data.get('recommendations', []),
            'score': data.get('score'),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        # Check if analysis exists
        existing_query = "SELECT id FROM resume_analysis WHERE student_id = %s"
        existing = execute_query(existing_query, [student_id], fetch_all=False)
        
        if existing:
            result = execute_update('resume_analysis', student_id, analysis_data)
        else:
            analysis_data['id'] = str(uuid.uuid4())
            analysis_data['created_at'] = datetime.utcnow().isoformat()
            result = execute_insert('resume_analysis', analysis_data)
        
        return jsonify({
            'success': True,
            'message': 'Resume analysis updated successfully',
            'data': result
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# =====================================================
# INTERNSHIPS
# =====================================================

@internships_bp.route('/internships', methods=['GET'])
def get_internships():
    """Get all internship opportunities"""
    try:
        query = """
            SELECT i.*, c.name as company_name, c.industry
            FROM internship_opportunities i
            LEFT JOIN companies c ON i.company_id = c.id
            WHERE i.status = 'active'
            ORDER BY i.created_at DESC
        """
        
        result = execute_query(query, fetch_all=True)
        
        return jsonify({
            'success': True,
            'data': result
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@internships_bp.route('/internships', methods=['POST'])
def create_internship():
    """Create new internship opportunity"""
    try:
        data = request.get_json()
        
        required_fields = ['title', 'company_id', 'description', 'duration', 'location']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        internship_data = {
            'title': data['title'],
            'company_id': data['company_id'],
            'description': data['description'],
            'duration': data['duration'],
            'location': data['location'],
            'stipend': data.get('stipend'),
            'requirements': data.get('requirements', ''),
            'skills_required': data.get('skills_required', []),
            'status': data.get('status', 'active'),
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        result = execute_insert('internship_opportunities', internship_data)
        
        return jsonify({
            'success': True,
            'message': 'Internship opportunity created successfully',
            'data': result
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@internships_bp.route('/sync', methods=['POST'])
def sync_internships():
    """Sync internships from external sources"""
    try:
        # This would typically fetch from external APIs
        # For now, we'll return a mock response
        sync_data = {
            'synced_count': 5,
            'source': 'external_api',
            'last_sync': datetime.utcnow().isoformat()
        }
        
        return jsonify({
            'success': True,
            'message': 'Internships synced successfully',
            'data': sync_data
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@internships_bp.route('/refresh', methods=['GET'])
def refresh_internships():
    """Refresh internship data"""
    try:
        # Refresh logic here
        refresh_data = {
            'refreshed_count': 3,
            'last_refresh': datetime.utcnow().isoformat()
        }
        
        return jsonify({
            'success': True,
            'message': 'Internships refreshed successfully',
            'data': refresh_data
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# =====================================================
# CLUBS MANAGEMENT
# =====================================================

@clubs_bp.route('/clubs', methods=['GET', 'POST'])
def handle_clubs():
    """Get all clubs or create new club"""
    try:
        if request.method == 'GET':
            query = """
                SELECT c.*, 
                       COUNT(cm.id) as member_count,
                       COUNT(CASE WHEN cm.role = 'president' THEN 1 END) as has_president
                FROM clubs c
                LEFT JOIN club_memberships cm ON c.id = cm.club_id
                GROUP BY c.id, c.name, c.description, c.created_at, c.updated_at
                ORDER BY c.name
            """
            
            result = execute_query(query, fetch_all=True)
            
            return jsonify({
                'success': True,
                'data': result
            })
        
        elif request.method == 'POST':
            data = request.get_json()
            
            required_fields = ['name', 'description']
            for field in required_fields:
                if field not in data:
                    return jsonify({
                        'success': False,
                        'error': f'Missing required field: {field}'
                    }), 400
            
            club_data = {
                'name': data['name'],
                'description': data['description'],
                'created_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat()
            }
            
            result = execute_insert('clubs', club_data)
            
            return jsonify({
                'success': True,
                'message': 'Club created successfully',
                'data': result
            }), 201
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@clubs_bp.route('/clubs/<club_id>', methods=['GET', 'PUT', 'DELETE'])
def handle_club(club_id):
    """Get, update, or delete a specific club"""
    try:
        if request.method == 'GET':
            query = """
                SELECT c.*, 
                       COUNT(cm.id) as member_count,
                       GROUP_CONCAT(s.name) as members
                FROM clubs c
                LEFT JOIN club_memberships cm ON c.id = cm.club_id
                LEFT JOIN students s ON cm.student_id = s.id
                WHERE c.id = %s
                GROUP BY c.id, c.name, c.description, c.created_at, c.updated_at
            """
            
            result = execute_query(query, [club_id], fetch_all=False)
            
            if not result:
                return jsonify({'success': False, 'error': 'Club not found'}), 404
            
            return jsonify({
                'success': True,
                'data': result
            })
        
        elif request.method == 'PUT':
            data = request.get_json()
            data['updated_at'] = datetime.utcnow().isoformat()
            
            result = execute_update('clubs', club_id, data)
            
            if not result:
                return jsonify({'success': False, 'error': 'Club not found'}), 404
            
            return jsonify({
                'success': True,
                'message': 'Club updated successfully',
                'data': result
            })
        
        elif request.method == 'DELETE':
            result = execute_delete('clubs', club_id)
            
            if not result:
                return jsonify({'success': False, 'error': 'Club not found'}), 404
            
            return jsonify({
                'success': True,
                'message': 'Club deleted successfully'
            })
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@clubs_bp.route('/clubs/<club_id>/members', methods=['GET'])
def get_club_members(club_id):
    """Get club members"""
    try:
        query = """
            SELECT cm.*, s.name as student_name, s.register_number, s.email
            FROM club_memberships cm
            LEFT JOIN students s ON cm.student_id = s.id
            WHERE cm.club_id = %s
            ORDER BY cm.role, s.name
        """
        
        result = execute_query(query, [club_id], fetch_all=True)
        
        return jsonify({
            'success': True,
            'data': result
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@clubs_bp.route('/clubs/<club_id>/members/invite', methods=['POST'])
def invite_club_member(club_id):
    """Invite student to join club"""
    try:
        data = request.get_json()
        
        required_fields = ['student_id', 'role']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        membership_data = {
            'club_id': club_id,
            'student_id': data['student_id'],
            'role': data['role'],
            'joined_at': datetime.utcnow().isoformat(),
            'status': 'active'
        }
        
        result = execute_insert('club_memberships', membership_data)
        
        return jsonify({
            'success': True,
            'message': 'Member invited successfully',
            'data': result
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@clubs_bp.route('/clubs/<club_id>/members/<member_id>', methods=['DELETE'])
def remove_club_member(club_id, member_id):
    """Remove member from club"""
    try:
        result = execute_delete('club_memberships', member_id)
        
        if not result:
            return jsonify({'success': False, 'error': 'Member not found'}), 404
        
        return jsonify({
            'success': True,
            'message': 'Member removed successfully'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@clubs_bp.route('/clubs/<club_id>/members/<member_id>/role', methods=['PUT'])
def update_club_member_role(club_id, member_id):
    """Update club member role"""
    try:
        data = request.get_json()
        
        if 'role' not in data:
            return jsonify({
                'success': False,
                'error': 'Role field is required'
            }), 400
        
        valid_roles = ['president', 'vice_president', 'secretary', 'treasurer', 'member']
        if data['role'] not in valid_roles:
            return jsonify({
                'success': False,
                'error': f'Invalid role. Must be one of: {valid_roles}'
            }), 400
        
        result = execute_update('club_memberships', member_id, {
            'role': data['role'],
            'updated_at': datetime.utcnow().isoformat()
        })
        
        if not result:
            return jsonify({'success': False, 'error': 'Member not found'}), 404
        
        return jsonify({
            'success': True,
            'message': 'Member role updated successfully',
            'data': result
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
