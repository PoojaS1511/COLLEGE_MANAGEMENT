from flask import Blueprint, request, jsonify
from postgres_client import execute_query, execute_insert, execute_update, execute_delete
from datetime import datetime, timedelta
from functools import wraps
import uuid

notifications_bp = Blueprint('notifications', __name__)

def handle_errors(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except Exception as e:
            print(f"Error in {f.__name__}: {str(e)}")
            return jsonify({"success": False, "error": str(e)}), 500
    return wrapper

# Communication Center - Notification Management
@notifications_bp.route('/notifications', methods=['GET'])
@handle_errors
def get_notifications():
    """Get all notifications with optional filtering"""
    query = "SELECT * FROM notifications"
    params = []
    conditions = []
    
    # Add filters if provided
    if request.args.get('notification_type'):
        conditions.append("notification_type = %s")
        params.append(request.args.get('notification_type'))
    if request.args.get('target_audience'):
        conditions.append("target_audience = %s")
        params.append(request.args.get('target_audience'))
    if request.args.get('target_course_id'):
        conditions.append("target_course_id = %s")
        params.append(request.args.get('target_course_id'))
    if request.args.get('target_semester'):
        conditions.append("target_semester = %s")
        params.append(request.args.get('target_semester'))
    if request.args.get('is_active'):
        conditions.append("is_active = %s")
        params.append(request.args.get('is_active').lower() == 'true')
    if request.args.get('search'):
        search_term = request.args.get('search')
        conditions.append("(title ILIKE %s OR message ILIKE %s)")
        params.extend([f"%{search_term}%", f"%{search_term}%"])
    
    if conditions:
        query += " WHERE " + " AND ".join(conditions)
    
    query += " ORDER BY created_at DESC"
    
    result = execute_query(query, params, fetch_all=True)
    return jsonify({"success": True, "data": result})

@notifications_bp.route('/notifications', methods=['POST'])
@handle_errors
def create_notification():
    """Create and send a new notification"""
    data = request.get_json()
    
    required_fields = ['title', 'message', 'sender_id', 'sender_type']
    for field in required_fields:
        if field not in data:
            return jsonify({"success": False, "error": f"Missing required field: {field}"}), 400
    
    notification_data = {
        'id': str(uuid.uuid4()),
        'title': data['title'],
        'message': data['message'],
        'sender_id': data['sender_id'],
        'sender_type': data['sender_type'],
        'notification_type': data.get('notification_type', 'general'),
        'target_audience': data.get('target_audience', 'all'),
        'target_course_id': data.get('target_course_id'),
        'target_semester': data.get('target_semester'),
        'priority': data.get('priority', 'medium'),
        'is_active': True,
        'created_at': datetime.utcnow().isoformat(),
        'updated_at': datetime.utcnow().isoformat()
    }
    
    result = execute_insert('notifications', notification_data)
    
    return jsonify({
        "success": True, 
        "message": "Notification created successfully",
        "data": result
    }), 201

@notifications_bp.route('/notifications/<int:notification_id>', methods=['GET'])
@handle_errors
def get_notification(notification_id):
    """Get a single notification by ID"""
    query = "SELECT * FROM notifications WHERE id = %s"
    result = execute_query(query, [notification_id], fetch_all=False)
    
    if not result:
        return jsonify({"success": False, "error": "Notification not found"}), 404
    
    return jsonify({"success": True, "data": result})

@notifications_bp.route('/notifications/<int:notification_id>', methods=['PUT'])
@handle_errors
def update_notification(notification_id):
    """Update an existing notification"""
    data = request.get_json()
    
    data['updated_at'] = datetime.utcnow().isoformat()
    
    result = execute_update('notifications', notification_id, data)
    
    if not result:
        return jsonify({"success": False, "error": "Notification not found"}), 404
    
    return jsonify({
        "success": True,
        "message": "Notification updated successfully",
        "data": result
    })

@notifications_bp.route('/notifications/<int:notification_id>', methods=['DELETE'])
@handle_errors
def delete_notification(notification_id):
    """Delete a notification"""
    result = execute_delete('notifications', notification_id)
    
    if not result:
        return jsonify({"success": False, "error": "Notification not found"}), 404
    
    return jsonify({
        "success": True,
        "message": "Notification deleted successfully"
    })

@notifications_bp.route('/notifications/templates', methods=['GET'])
@handle_errors
def get_notification_templates():
    """Get notification templates"""
    query = "SELECT * FROM notification_templates ORDER BY name"
    result = execute_query(query, fetch_all=True)
    
    return jsonify({"success": True, "data": result})

@notifications_bp.route('/notifications/analytics', methods=['GET'])
@handle_errors
def get_notification_analytics():
    """Get notification analytics"""
    try:
        # Get notification statistics
        stats_query = """
            SELECT 
                COUNT(*) as total_notifications,
                COUNT(CASE WHEN is_active = true THEN 1 END) as active_notifications,
                COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority,
                COUNT(CASE WHEN priority = 'medium' THEN 1 END) as medium_priority,
                COUNT(CASE WHEN priority = 'low' THEN 1 END) as low_priority,
                COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as last_30_days
            FROM notifications
        """
        stats = execute_query(stats_query, fetch_all=False)
        
        # Get notifications by type
        type_query = """
            SELECT notification_type, COUNT(*) as count
            FROM notifications
            GROUP BY notification_type
            ORDER BY count DESC
        """
        by_type = execute_query(type_query, fetch_all=True)
        
        # Get notifications by audience
        audience_query = """
            SELECT target_audience, COUNT(*) as count
            FROM notifications
            GROUP BY target_audience
            ORDER BY count DESC
        """
        by_audience = execute_query(audience_query, fetch_all=True)
        
        # Get recent notifications
        recent_query = """
            SELECT title, notification_type, target_audience, created_at
            FROM notifications
            ORDER BY created_at DESC
            LIMIT 10
        """
        recent = execute_query(recent_query, fetch_all=True)
        
        analytics_data = {
            'statistics': stats,
            'by_type': by_type,
            'by_audience': by_audience,
            'recent_notifications': recent
        }
        
        return jsonify({"success": True, "data": analytics_data})
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@notifications_bp.route('/notifications/send-to-all', methods=['POST'])
@handle_errors
def send_notification_to_all():
    """Send notification to all users"""
    data = request.get_json()
    
    required_fields = ['title', 'message', 'sender_id', 'sender_type']
    for field in required_fields:
        if field not in data:
            return jsonify({"success": False, "error": f"Missing required field: {field}"}), 400
    
    notification_data = {
        'id': str(uuid.uuid4()),
        'title': data['title'],
        'message': data['message'],
        'sender_id': data['sender_id'],
        'sender_type': data['sender_type'],
        'notification_type': data.get('notification_type', 'broadcast'),
        'target_audience': 'all',
        'priority': data.get('priority', 'medium'),
        'is_active': True,
        'created_at': datetime.utcnow().isoformat(),
        'updated_at': datetime.utcnow().isoformat()
    }
    
    result = execute_insert('notifications', notification_data)
    
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
            'notification_id': notification_data['id'],
            'user_id': user['id'],
            'status': 'sent',
            'sent_at': datetime.utcnow().isoformat(),
            'created_at': datetime.utcnow().isoformat()
        }
        
        execute_insert('user_notifications', user_notification_data)
        sent_count += 1
    
    return jsonify({
        "success": True,
        "message": f"Notification sent to {sent_count} users",
        "data": result
    }), 201

@notifications_bp.route('/notifications/send-to-course', methods=['POST'])
@handle_errors
def send_notification_to_course():
    """Send notification to students in a specific course"""
    data = request.get_json()
    
    required_fields = ['title', 'message', 'sender_id', 'sender_type', 'course_id']
    for field in required_fields:
        if field not in data:
            return jsonify({"success": False, "error": f"Missing required field: {field}"}), 400
    
    notification_data = {
        'id': str(uuid.uuid4()),
        'title': data['title'],
        'message': data['message'],
        'sender_id': data['sender_id'],
        'sender_type': data['sender_type'],
        'notification_type': data.get('notification_type', 'course'),
        'target_audience': 'course',
        'target_course_id': data['course_id'],
        'priority': data.get('priority', 'medium'),
        'is_active': True,
        'created_at': datetime.utcnow().isoformat(),
        'updated_at': datetime.utcnow().isoformat()
    }
    
    result = execute_insert('notifications', notification_data)
    
    # Get all students in the course
    students_query = "SELECT id, email, name FROM students WHERE course_id = %s"
    students = execute_query(students_query, [data['course_id']], fetch_all=True)
    
    # Create notification records for each student
    sent_count = 0
    for student in students:
        user_notification_data = {
            'id': str(uuid.uuid4()),
            'notification_id': notification_data['id'],
            'user_id': student['id'],
            'status': 'sent',
            'sent_at': datetime.utcnow().isoformat(),
            'created_at': datetime.utcnow().isoformat()
        }
        
        execute_insert('user_notifications', user_notification_data)
        sent_count += 1
    
    return jsonify({
        "success": True,
        "message": f"Notification sent to {sent_count} students in course",
        "data": result
    }), 201

@notifications_bp.route('/notifications/send-to-faculty', methods=['POST'])
@handle_errors
def send_notification_to_faculty():
    """Send notification to faculty members"""
    data = request.get_json()
    
    required_fields = ['title', 'message', 'sender_id', 'sender_type']
    for field in required_fields:
        if field not in data:
            return jsonify({"success": False, "error": f"Missing required field: {field}"}), 400
    
    notification_data = {
        'id': str(uuid.uuid4()),
        'title': data['title'],
        'message': data['message'],
        'sender_id': data['sender_id'],
        'sender_type': data['sender_type'],
        'notification_type': data.get('notification_type', 'faculty'),
        'target_audience': 'faculty',
        'priority': data.get('priority', 'medium'),
        'is_active': True,
        'created_at': datetime.utcnow().isoformat(),
        'updated_at': datetime.utcnow().isoformat()
    }
    
    result = execute_insert('notifications', notification_data)
    
    # Get all faculty members
    faculty_query = """
        SELECT f.id, p.email, p.full_name 
        FROM faculty f
        LEFT JOIN profiles p ON f.user_id = p.id
    """
    faculty = execute_query(faculty_query, fetch_all=True)
    
    # Create notification records for each faculty member
    sent_count = 0
    for member in faculty:
        user_notification_data = {
            'id': str(uuid.uuid4()),
            'notification_id': notification_data['id'],
            'user_id': member['id'],
            'status': 'sent',
            'sent_at': datetime.utcnow().isoformat(),
            'created_at': datetime.utcnow().isoformat()
        }
        
        execute_insert('user_notifications', user_notification_data)
        sent_count += 1
    
    return jsonify({
        "success": True,
        "message": f"Notification sent to {sent_count} faculty members",
        "data": result
    }), 201

@notifications_bp.route('/notifications/student/<int:student_id>', methods=['GET'])
@handle_errors
def get_student_notifications(student_id):
    """Get notifications for a specific student"""
    query = """
        SELECT n.*, un.status, un.read_at, un.sent_at
        FROM notifications n
        LEFT JOIN user_notifications un ON n.id = un.notification_id
        WHERE un.user_id = %s OR n.target_audience = 'all'
        ORDER BY n.created_at DESC
    """
    
    result = execute_query(query, [student_id], fetch_all=True)
    
    return jsonify({"success": True, "data": result})

@notifications_bp.route('/notifications/faculty/<int:faculty_id>', methods=['GET'])
@handle_errors
def get_faculty_notifications(faculty_id):
    """Get notifications for a specific faculty member"""
    query = """
        SELECT n.*, un.status, un.read_at, un.sent_at
        FROM notifications n
        LEFT JOIN user_notifications un ON n.id = un.notification_id
        WHERE un.user_id = %s OR n.target_audience = 'all' OR n.target_audience = 'faculty'
        ORDER BY n.created_at DESC
    """
    
    result = execute_query(query, [faculty_id], fetch_all=True)
    
    return jsonify({"success": True, "data": result})

@notifications_bp.route('/notifications/<int:notification_id>/toggle', methods=['PATCH'])
@handle_errors
def toggle_notification_status(notification_id):
    """Toggle notification active status"""
    # Get current notification
    current = execute_query("SELECT is_active FROM notifications WHERE id = %s", [notification_id], fetch_all=False)
    
    if not current:
        return jsonify({"success": False, "error": "Notification not found"}), 404
    
    # Toggle status
    new_status = not current['is_active']
    
    data = {
        'is_active': new_status,
        'updated_at': datetime.utcnow().isoformat()
    }
    
    result = execute_update('notifications', notification_id, data)
    
    status_text = "activated" if new_status else "deactivated"
    
    return jsonify({
        "success": True,
        "message": f"Notification {status_text} successfully",
        "data": result
    })
