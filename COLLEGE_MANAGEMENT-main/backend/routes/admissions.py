from flask import Blueprint, request, jsonify
from postgres_client import execute_query, execute_insert, execute_update, execute_delete
from datetime import datetime
import uuid

admissions_bp = Blueprint('admissions', __name__)

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
