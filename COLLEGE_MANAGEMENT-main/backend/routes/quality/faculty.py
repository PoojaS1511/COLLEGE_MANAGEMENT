from flask import Blueprint, jsonify, request
from functools import wraps
from supabase_client import get_supabase

# Create blueprint
quality_faculty_bp = Blueprint('quality_faculty', __name__)

@quality_faculty_bp.route('/faculty', methods=['GET', 'OPTIONS'])
def get_faculty():
    """Get faculty list with pagination from Supabase"""
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        search = request.args.get('search', '')
        department = request.args.get('department', '')

        supabase = get_supabase()

        # Build query
        query = supabase.table('quality_facultyperformance').select('*', count='exact')

        # Apply filters
        if search:
            # Search in faculty_name (case insensitive)
            query = query.ilike('faculty_name', f'%{search}%')
        if department:
            query = query.eq('department', department)

        # Get results
        offset = (page - 1) * limit
        result = query.range(offset, offset + limit - 1).execute()
        total_items = result.count if hasattr(result, 'count') else 0

        # Transform data to match frontend expectations
        faculty = []
        for record in result.data:
            faculty.append({
                'id': record.get('faculty_id'),
                'employee_id': f"EMP{record.get('faculty_id')}",
                'name': record.get('faculty_name'),
                'email': f"{record.get('faculty_name', '').lower().replace(' ', '.')}@college.edu",
                'department': record.get('department'),
                'designation': 'Professor', # Not in quality_facultyperformance
                'performance_rating': float(record.get('performance_rating', 0)),
                'research_output': record.get('research_papers', 0),
                'student_feedback_score': float(record.get('feedback_score', 0)),
                'teaching_hours': 20,
                'publications': record.get('research_papers', 0),
                'projects': 0,
                'status': 'active'
            })

        total_pages = (total_items + limit - 1) // limit if total_items > 0 else 1

        return jsonify({
            'success': True,
            'data': faculty,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total_items,
                'totalPages': total_pages
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@quality_faculty_bp.route('/faculty/analytics', methods=['GET', 'OPTIONS'])
def get_faculty_analytics():
    """Get faculty analytics"""
    try:
        supabase = get_supabase()
        result = supabase.table('quality_facultyperformance').select('*').execute()
        data = result.data or []
        
        total_faculty = len(data)
        active_faculty = total_faculty 
        
        dept_dist = {}
        desig_dist = {'Professor': total_faculty} # Mock since not in table
        perf_dist = {'excellent': 0, 'good': 0, 'average': 0, 'needs_improvement': 0}
        total_perf = 0
        
        for record in data:
            dept = record.get('department')
            if dept:
                dept_dist[dept] = dept_dist.get(dept, 0) + 1
                
            rating = float(record.get('performance_rating', 0))
            total_perf += rating
            if rating >= 90: perf_dist['excellent'] += 1
            elif rating >= 75: perf_dist['good'] += 1
            elif rating >= 60: perf_dist['average'] += 1
            else: perf_dist['needs_improvement'] += 1
            
        avg_perf = total_perf / total_faculty if total_faculty > 0 else 0
        
        analytics = {
            'total_faculty': total_faculty,
            'active_faculty': active_faculty,
            'faculty_by_department': dept_dist,
            'faculty_by_designation': desig_dist,
            'performance_distribution': perf_dist,
            'average_performance': round(avg_perf, 1),
            'performance_trends': [
                {'month': 'Jan', 'score': 85},
                {'month': 'Feb', 'score': 87},
                {'month': 'Mar', 'score': 88},
                {'month': 'Apr', 'score': 86},
                {'month': 'May', 'score': 90},
                {'month': 'Jun', 'score': 92}
            ],
            'research_output': [
                {'month': 'Jan', 'count': 8},
                {'month': 'Feb', 'count': 12},
                {'month': 'Mar', 'count': 15},
                {'month': 'Apr', 'count': 10},
                {'month': 'May', 'count': 18},
                {'month': 'Jun', 'count': 14}
            ]
        }
        
        return jsonify({
            'success': True,
            'data': analytics
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@quality_faculty_bp.route('/faculty', methods=['POST', 'OPTIONS'])
def create_faculty():
    """Create a new faculty member and save to Supabase"""
    try:
        data = request.get_json()
        supabase = get_supabase()

        # Map frontend fields to DB columns for quality_facultyperformance
        insert_data = {
            'faculty_name': data.get('name'),
            'department': data.get('department'),
            'performance_rating': float(data.get('performance_rating', 0)),
            'research_papers': int(data.get('research_output', 0)),
            'feedback_score': float(data.get('student_feedback_score', 0))
        }

        result = supabase.table('quality_facultyperformance').insert(insert_data).execute()

        return jsonify({
            'success': True,
            'data': result.data[0] if result.data else insert_data,
            'message': 'Faculty member created successfully'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@quality_faculty_bp.route('/faculty/<string:faculty_id>', methods=['PUT', 'OPTIONS'])
def update_faculty(faculty_id):
    """Update a faculty member in Supabase"""
    try:
        data = request.get_json()
        supabase = get_supabase()

        update_data = {}
        if 'name' in data:
            update_data['faculty_name'] = data.get('name')
        if 'department' in data:
            update_data['department'] = data.get('department')
        if 'performance_rating' in data:
            update_data['performance_rating'] = float(data.get('performance_rating', 0))
        if 'research_output' in data:
            update_data['research_papers'] = int(data.get('research_output', 0))
        if 'student_feedback_score' in data:
            update_data['feedback_score'] = float(data.get('student_feedback_score', 0))

        if not update_data:
            return jsonify({'success': False, 'error': 'No valid fields to update'}), 400

        result = supabase.table('quality_facultyperformance').update(update_data).eq('faculty_id', faculty_id).execute()

        return jsonify({
            'success': True,
            'data': result.data[0] if result.data else {'id': faculty_id, **update_data},
            'message': 'Faculty member updated successfully'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@quality_faculty_bp.route('/faculty/<string:faculty_id>', methods=['DELETE', 'OPTIONS'])
def delete_faculty(faculty_id):
    """Delete a faculty member from Supabase"""
    try:
        supabase = get_supabase()

        result = supabase.table('quality_facultyperformance').delete().eq('faculty_id', faculty_id).execute()

        return jsonify({
            'success': True,
            'message': 'Faculty member deleted successfully'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
