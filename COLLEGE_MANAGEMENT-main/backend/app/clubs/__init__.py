from flask import Blueprint, jsonify, request, current_app
from functools import wraps
import json

clubs_bp = Blueprint('clubs', __name__)

def get_supabase():
    """Helper function to get the Supabase client from the Flask app context"""
    if not hasattr(current_app, 'supabase'):
        from .. import supabase as sb
        if sb is None:
            raise RuntimeError('Supabase client not initialized')
        return sb
    return current_app.supabase

def handle_supabase_errors(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({
                'success': False,
                'message': f'Database error: {str(e)}'
            }), 500
    return wrapper

@clubs_bp.route('', methods=['GET'])
@handle_supabase_errors
def get_clubs():
    response = supabase.table('clubs')\
        .select('*')\
        .execute()
    
    return jsonify({
        'success': True,
        'data': response.data
    })

@clubs_bp.route('/<int:club_id>', methods=['GET'])
@handle_supabase_errors
def get_club(club_id):
    response = supabase.table('clubs')\
        .select('*')\
        .eq('id', club_id)\
        .single()\
        .execute()
    
    if not response.data:
        return jsonify({
            'success': False,
            'message': 'Club not found'
        }), 404
    
    return jsonify({
        'success': True,
        'data': response.data
    })

@clubs_bp.route('', methods=['POST'])
@handle_supabase_errors
def create_club():
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['name', 'description', 'faculty_advisor']
    for field in required_fields:
        if field not in data:
            return jsonify({
                'success': False,
                'message': f'Missing required field: {field}'
            }), 400
    
    # Insert new club
    response = supabase.table('clubs')\
        .insert({
            'name': data['name'],
            'description': data['description'],
            'faculty_advisor': data['faculty_advisor'],
            'meeting_schedule': data.get('meeting_schedule'),
            'logo_url': data.get('logo_url'),
            'status': data.get('status', 'active')
        })\
        .execute()
    
    return jsonify({
        'success': True,
        'message': 'Club created successfully',
        'data': response.data[0] if response.data else None
    }), 201

@clubs_bp.route('/<int:club_id>', methods=['PUT'])
@handle_supabase_errors
def update_club(club_id):
    data = request.get_json()
    
    # Check if club exists
    existing = supabase.table('clubs')\
        .select('id')\
        .eq('id', club_id)\
        .single()\
        .execute()
    
    if not existing.data:
        return jsonify({
            'success': False,
            'message': 'Club not found'
        }), 404
    
    # Update club
    update_data = {}
    allowed_fields = ['name', 'description', 'faculty_advisor', 'meeting_schedule', 'logo_url', 'status']
    
    for field in allowed_fields:
        if field in data:
            update_data[field] = data[field]
    
    if not update_data:
        return jsonify({
            'success': False,
            'message': 'No valid fields provided for update'
        }), 400
    
    response = supabase.table('clubs')\
        .update(update_data)\
        .eq('id', club_id)\
        .execute()
    
    return jsonify({
        'success': True,
        'message': 'Club updated successfully',
        'data': response.data[0] if response.data else None
    })

@clubs_bp.route('/<int:club_id>', methods=['DELETE'])
@handle_supabase_errors
def delete_club(club_id):
    # Check if club exists
    existing = supabase.table('clubs')\
        .select('id')\
        .eq('id', club_id)\
        .single()\
        .execute()
    
    if not existing.data:
        return jsonify({
            'success': False,
            'message': 'Club not found'
        }), 404
    
    # Soft delete (update status to 'inactive')
    supabase.table('clubs')\
        .update({'status': 'inactive'})\
        .eq('id', club_id)\
        .execute()
    
    return jsonify({
        'success': True,
        'message': 'Club deleted successfully'
    })

# Club Members Routes
@clubs_bp.route('/<int:club_id>/members', methods=['GET'])
@handle_supabase_errors
def get_club_members(club_id):
    response = supabase.table('club_members')\
        .select('*, profiles(*)')\
        .eq('club_id', club_id)\
        .execute()
    
    return jsonify({
        'success': True,
        'data': response.data
    })

@clubs_bp.route('/<int:club_id>/members', methods=['POST'])
@handle_supabase_errors
def add_club_member(club_id):
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['user_id', 'role']
    for field in required_fields:
        if field not in data:
            return jsonify({
                'success': False,
                'message': f'Missing required field: {field}'
            }), 400
    
    # Check if user is already a member
    existing = supabase.table('club_members')\
        .select('id')\
        .eq('club_id', club_id)\
        .eq('user_id', data['user_id'])\
        .execute()
    
    if existing.data:
        return jsonify({
            'success': False,
            'message': 'User is already a member of this club'
        }), 400
    
    # Add member to club
    response = supabase.table('club_members')\
        .insert({
            'club_id': club_id,
            'user_id': data['user_id'],
            'role': data['role'],
            'join_date': 'now()',
            'status': 'active'
        })\
        .execute()
    
    return jsonify({
        'success': True,
        'message': 'Member added successfully',
        'data': response.data[0] if response.data else None
    }), 201

@clubs_bp.route('/<int:club_id>/members/<int:member_id>', methods=['DELETE'])
@handle_supabase_errors
def remove_club_member(club_id, member_id):
    # Remove member from club
    response = supabase.table('club_members')\
        .delete()\
        .eq('club_id', club_id)\
        .eq('user_id', member_id)\
        .execute()
    
    if not response.data:
        return jsonify({
            'success': False,
            'message': 'Member not found in this club'
        }), 404
    
    return jsonify({
        'success': True,
        'message': 'Member removed successfully'
    })

# Club Events Routes
@clubs_bp.route('/<int:club_id>/events', methods=['GET'])
@handle_supabase_errors
def get_club_events(club_id):
    response = supabase.table('club_events')\
        .select('*')\
        .eq('club_id', club_id)\
        .order('event_date', desc=True)\
        .execute()
    
    return jsonify({
        'success': True,
        'data': response.data
    })

@clubs_bp.route('/<int:club_id>/events', methods=['POST'])
@handle_supabase_errors
def create_club_event(club_id):
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['title', 'description', 'event_date', 'location']
    for field in required_fields:
        if field not in data:
            return jsonify({
                'success': False,
                'message': f'Missing required field: {field}'
            }), 400
    
    # Create new event
    response = supabase.table('club_events')\
        .insert({
            'club_id': club_id,
            'title': data['title'],
            'description': data['description'],
            'event_date': data['event_date'],
            'location': data['location'],
            'image_url': data.get('image_url'),
            'status': data.get('status', 'upcoming')
        })\
        .execute()
    
    return jsonify({
        'success': True,
        'message': 'Event created successfully',
        'data': response.data[0] if response.data else None
    }), 201

# Club Gallery Routes
@clubs_bp.route('/<int:club_id>/gallery', methods=['GET'])
@handle_supabase_errors
def get_club_gallery(club_id):
    response = supabase.table('club_gallery')\
        .select('*')\
        .eq('club_id', club_id)\
        .order('uploaded_at', desc=True)\
        .execute()
    
    return jsonify({
        'success': True,
        'data': response.data
    })

# Club Awards Routes
@clubs_bp.route('/<int:club_id>/awards', methods=['GET'])
@handle_supabase_errors
def get_club_awards(club_id):
    response = supabase.table('club_awards')\
        .select('*, profiles(first_name, last_name)')\
        .eq('club_id', club_id)\
        .order('awarded_date', desc=True)\
        .execute()
    
    return jsonify({
        'success': True,
        'data': response.data
    })

@clubs_bp.route('/<int:club_id>/awards', methods=['POST'])
@handle_supabase_errors
def create_club_award(club_id):
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['title', 'recipient_id', 'awarded_date']
    for field in required_fields:
        if field not in data:
            return jsonify({
                'success': False,
                'message': f'Missing required field: {field}'
            }), 400
    
    # Create new award
    response = supabase.table('club_awards')\
        .insert({
            'club_id': club_id,
            'title': data['title'],
            'description': data.get('description'),
            'recipient_id': data['recipient_id'],
            'awarded_date': data['awarded_date'],
            'category': data.get('category', 'achievement'),
            'prize': data.get('prize')
        })\
        .execute()
    
    return jsonify({
        'success': True,
        'message': 'Award created successfully',
        'data': response.data[0] if response.data else None
    }), 201
