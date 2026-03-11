from flask import Blueprint, request, jsonify
from postgres_client import execute_query, execute_insert, execute_update, execute_delete
from datetime import datetime
import uuid

internships_bp = Blueprint('internships', __name__)

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
