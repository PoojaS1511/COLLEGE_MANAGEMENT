from flask import Blueprint, request, jsonify
from postgres_client import execute_query, execute_insert, execute_update, execute_delete
from datetime import datetime

clubs_bp = Blueprint('clubs', __name__)

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
