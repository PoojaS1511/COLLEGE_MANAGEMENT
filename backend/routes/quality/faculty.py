from flask import Blueprint, jsonify, request
from functools import wraps
from postgres_client import execute_query, execute_insert, execute_update, execute_delete

# Create blueprint
quality_faculty_bp = Blueprint('quality_faculty', __name__)

@quality_faculty_bp.route('/faculty', methods=['GET', 'OPTIONS'])
def get_faculty():
    """Get faculty list with pagination from PostgreSQL"""
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        search = request.args.get('search', '')
        department = request.args.get('department', '')

        # Build query with filters
        query = "SELECT * FROM quality_facultyperformance WHERE 1=1"
        params = []
        
        if search:
            query += " AND faculty_name ILIKE %s"
            params.append(f"%{search}%")
        if department:
            query += " AND department = %s"
            params.append(department)

        # Get total count
        count_query = query.replace("SELECT *", "SELECT COUNT(*) as count")
        try:
            total_count = execute_query(count_query, params, fetch_all=False)
            total_items = total_count.get('count', 0) if total_count else 0
        except:
            total_items = 0

        # Add pagination
        offset = (page - 1) * limit
        query += f" ORDER BY created_at DESC LIMIT {limit} OFFSET {offset}"
        
        result = execute_query(query, params, fetch_all=True)
        data = result or []

        # Transform data to match frontend expectations
        faculty = []
        for record in data:
            faculty.append({
                'id': record.get('faculty_id'),
                'employee_id': f"EMP{record.get('faculty_id')}",
                'name': record.get('faculty_name'),
                'email': f"{record.get('faculty_name', '').lower().replace(' ', '.')}@college.edu",
                'department': record.get('department'),
                'designation': 'Professor',
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
        result = execute_query("SELECT * FROM quality_facultyperformance", fetch_all=True)
        data = result or []
        
        total_faculty = len(data)
        active_faculty = total_faculty 
        
        dept_dist = {}
        desig_dist = {'Professor': total_faculty}
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
    """Create a new faculty member and save to PostgreSQL"""
    try:
        data = request.get_json()

        insert_data = {
            'faculty_name': data.get('name'),
            'department': data.get('department'),
            'performance_rating': float(data.get('performance_rating', 0)),
            'research_papers': int(data.get('research_output', 0)),
            'feedback_score': float(data.get('student_feedback_score', 0))
        }

        result = execute_insert('quality_facultyperformance', insert_data)

        return jsonify({
            'success': True,
            'data': result if result else insert_data,
            'message': 'Faculty member created successfully'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@quality_faculty_bp.route('/faculty/<string:faculty_id>', methods=['PUT', 'OPTIONS'])
def update_faculty(faculty_id):
    """Update a faculty member in PostgreSQL"""
    try:
        data = request.get_json()

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

        result = execute_update('quality_facultyperformance', faculty_id, update_data)

        return jsonify({
            'success': True,
            'data': result if result else {'id': faculty_id, **update_data},
            'message': 'Faculty member updated successfully'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@quality_faculty_bp.route('/faculty/<string:faculty_id>', methods=['DELETE', 'OPTIONS'])
def delete_faculty(faculty_id):
    """Delete a faculty member from PostgreSQL"""
    try:
        success = execute_delete('quality_facultyperformance', faculty_id)

        return jsonify({
            'success': True,
            'message': 'Faculty member deleted successfully'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

