from flask import Blueprint, request, jsonify, g
from supabase_client import get_supabase
from datetime import datetime, time
from functools import wraps
from typing import Dict, List, Optional, Any
import uuid

# Initialize blueprint
exams_bp = Blueprint('exams', __name__)

# Initialize Supabase client
supabase = get_supabase()

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
            errors['duration'] = 'Duration must be a number'
    
    if not is_update or 'exam_type' in data:
        if not data.get('exam_type'):
            errors['exam_type'] = 'Exam type is required'
    
    if not is_update or 'max_marks' in data:
        try:
            max_marks = int(data.get('max_marks', 100))
            if max_marks <= 0:
                errors['max_marks'] = 'Maximum marks must be a positive number'
        except (ValueError, TypeError):
            errors['max_marks'] = 'Maximum marks must be a number'
    
    if not is_update or 'passing_marks' in data:
        try:
            passing_marks = int(data.get('passing_marks', 35))
            if passing_marks < 0:
                errors['passing_marks'] = 'Passing marks cannot be negative'
        except (ValueError, TypeError):
            errors['passing_marks'] = 'Passing marks must be a number'
    
    return errors if errors else None

def handle_errors(f):
    """Decorator to handle errors in route handlers"""
    @wraps(f)
    def wrapper(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except Exception as e:
            return handle_db_error(e)
    return wrapper

@exams_bp.route('/exams', methods=['GET'])
@handle_errors
def get_exams():
    """Get all exams with optional filtering and related subject data"""
    try:
        # Get query parameters
        academic_year = request.args.get('academic_year')
        semester = request.args.get('semester')
        subject_id = request.args.get('subject_id')
        exam_type = request.args.get('exam_type')
        status = request.args.get('status')
        
        # First, get all subjects to include in the response
        subjects_response = supabase.table('subjects').select('*').execute()
        subjects = {str(subj['id']): subj for subj in subjects_response.data} if subjects_response.data else {}
        
        # Build exam query
        query = supabase.table('exams').select('*')
        
        if academic_year:
            query = query.eq('academic_year', academic_year)
        if semester:
            query = query.eq('semester', semester)
        if subject_id:
            query = query.eq('subject_id', subject_id)
        if exam_type:
            query = query.eq('exam_type', exam_type)
        if status:
            query = query.eq('status', status)
            
        # Execute query
        response = query.execute()
        
        # Enrich exam data with subject information
        exams_with_subjects = []
        for exam in response.data:
            exam_data = dict(exam)
            # Convert UUID to string for JSON serialization
            exam_data['id'] = str(exam_data['id'])
            exam_data['subject_id'] = str(exam_data['subject_id'])
            
            # Add subject data
            subject_id = str(exam['subject_id'])
            if subject_id in subjects:
                exam_data['subject'] = {
                    'id': subject_id,
                    'name': subjects[subject_id].get('name', ''),
                    'code': subjects[subject_id].get('code', '')
                }
            else:
                exam_data['subject'] = None
                
            # Format dates and times for frontend
            if 'date' in exam_data and exam_data['date']:
                exam_data['date'] = exam_data['date'].isoformat()
            if 'start_time' in exam_data and exam_data['start_time']:
                exam_data['start_time'] = str(exam_data['start_time'])
            if 'end_time' in exam_data and exam_data['end_time']:
                exam_data['end_time'] = str(exam_data['end_time'])
                
            exams_with_subjects.append(exam_data)
        
        return jsonify({
            'success': True,
            'data': exams_with_subjects,
            'count': len(exams_with_subjects)
        }), 200
        
    except Exception as e:
        print(f"Error in get_exams: {str(e)}")
        return handle_db_error(e)

@exams_bp.route('/exams', methods=['POST'])
@handle_errors
def create_exam():
    """Create a new exam"""
    try:
        data = request.get_json()
        
        # Validate data
        errors = validate_exam_data(data)
        if errors:
            return jsonify({
                'success': False,
                'errors': errors
            }), 400
        
        # Check if subject exists
        subject = supabase.table('subjects').select('*').eq('id', data['subject_id']).execute()
        if not subject.data:
            return jsonify({
                'success': False,
                'error': 'Subject not found'
            }), 400
        
        # Create exam in database
        exam_data = {
            'id': str(uuid.uuid4()),
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat(),
            'created_by': g.user.get('id') if hasattr(g, 'user') else None,
            **data
        }
        
        response = supabase.table('exams').insert(exam_data).execute()
        
        return jsonify({
            'success': True,
            'data': exam_data
        }), 201
        
    except Exception as e:
        return handle_db_error(e)

@exams_bp.route('/exams/<uuid:exam_id>', methods=['GET'])
@handle_errors
def get_exam(exam_id):
    """Get a single exam by ID"""
    try:
        # Get exam by ID
        response = supabase.table('exams').select('*').eq('id', str(exam_id)).execute()
        
        if not response.data:
            return jsonify({
                'success': False,
                'error': 'Exam not found'
            }), 404
            
        return jsonify({
            'success': True,
            'data': response.data[0]
        }), 200
        
    except Exception as e:
        return handle_db_error(e)

@exams_bp.route('/exams/<uuid:exam_id>', methods=['PUT'])
@handle_errors
def update_exam(exam_id):
    """Update an existing exam"""
    try:
        data = request.get_json()
        
        # Check if exam exists
        existing = supabase.table('exams').select('*').eq('id', str(exam_id)).execute()
        if not existing.data:
            return jsonify({
                'success': False,
                'error': 'Exam not found'
            }), 404
        
        # Validate data
        errors = validate_exam_data(data, is_update=True)
        if errors:
            return jsonify({
                'success': False,
                'errors': errors
            }), 400
        
        # Update exam in database
        update_data = {
            'updated_at': datetime.utcnow().isoformat(),
            **data
        }
        
        response = supabase.table('exams').update(update_data).eq('id', str(exam_id)).execute()
        
        return jsonify({
            'success': True,
            'data': response.data[0] if response.data else None
        }), 200
        
    except Exception as e:
        return handle_db_error(e)

@exams_bp.route('/exams/<uuid:exam_id>', methods=['DELETE'])
@handle_errors
def delete_exam(exam_id):
    """Delete an exam"""
    try:
        # Check if exam exists
        existing = supabase.table('exams').select('*').eq('id', str(exam_id)).execute()
        if not existing.data:
            return jsonify({
                'success': False,
                'error': 'Exam not found'
            }), 404
        
        # Check for related records
        # Note: You may need to adjust these checks based on your actual database schema
        related_rooms = supabase.table('exam_rooms').select('id').eq('exam_id', str(exam_id)).execute()
        related_students = supabase.table('exam_students').select('id').eq('exam_id', str(exam_id)).execute()
        
        if related_rooms.data or related_students.data:
            return jsonify({
                'success': False,
                'error': 'Cannot delete exam with related records. Please delete related records first.'
            }), 400
        
        # Delete exam from database
        supabase.table('exams').delete().eq('id', str(exam_id)).execute()
        
        return jsonify({
            'success': True,
            'message': 'Exam deleted successfully'
        }), 200
        
    except Exception as e:
        return handle_db_error(e)

@router.get("/types/", response_model=List[str])
async def get_exam_types():
    """
    Get all exam types
    """
    return ["Midterm", "Final", "Quiz", "Assignment", "Project", "Practical"]
