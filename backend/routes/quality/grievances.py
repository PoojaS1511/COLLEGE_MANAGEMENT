from flask import Blueprint, jsonify, request
from functools import wraps
import random
from postgres_client import execute_query, execute_insert, execute_update, execute_delete

# Create blueprint
quality_grievances_bp = Blueprint('quality_grievances', __name__)

@quality_grievances_bp.route('/grievances', methods=['GET', 'OPTIONS'])
def get_grievances():
    """Get quality grievances from PostgreSQL"""
    try:
        # Get pagination parameters
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        offset = (page - 1) * limit

        # Get filter parameters
        search = request.args.get('search', '')
        category_filter = request.args.get('category', '')
        status_filter = request.args.get('status', '')
        priority_filter = request.args.get('priority', '')

        # Build query with filters
        query = "SELECT * FROM quality_grivance WHERE 1=1"
        params = []
        
        if search:
            query += " AND description ILIKE %s"
            params.append(f"%{search}%")
        if category_filter:
            query += " AND grievance_type = %s"
            params.append(category_filter)
        if status_filter:
            query += " AND status = %s"
            params.append(status_filter)

        # Get total count
        count_query = query.replace("SELECT *", "SELECT COUNT(*) as count")
        try:
            total_count = execute_query(count_query, params, fetch_all=False)
            total = total_count.get('count', 0) if total_count else 0
        except:
            total = 0

        # Add pagination
        query += f" ORDER BY created_at DESC LIMIT {limit} OFFSET {offset}"
        
        try:
            result = execute_query(query, params, fetch_all=True)
            data = result or []
        except Exception as e:
            print(f"Grievances table error: {e}")
            data = []

        # Map database fields to frontend expected fields
        grievances = []
        for grievance in data:
            mapped_grievance = {
                'id': grievance.get('grievance_id'),
                'title': grievance.get('description', '')[:50] + '...' if len(grievance.get('description', '')) > 50 else grievance.get('description', ''),
                'description': grievance.get('description', ''),
                'category': grievance.get('grievance_type', ''),
                'priority': 'medium',
                'status': grievance.get('status', 'Open'),
                'user_type': grievance.get('user_type', 'student'),
                'submitted_date': grievance.get('resolution_date', '').split('T')[0] if grievance.get('resolution_date') else '',
                'ai_classification': grievance.get('grievance_type', '')
            }
            grievances.append(mapped_grievance)

        total_pages = (total + limit - 1) // limit if total > 0 else 1

        return jsonify({
            'success': True,
            'data': grievances,
            'pagination': {
                'currentPage': page,
                'totalPages': total_pages,
                'totalItems': total
            }
        })

    except Exception as e:
        print(f"Error fetching grievances: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@quality_grievances_bp.route('/grievances/analytics', methods=['GET', 'OPTIONS'])
def get_grievances_analytics():
    """Get grievance analytics"""
    try:
        data = []
        try:
            result = execute_query("SELECT * FROM grievances", fetch_all=True)
            data = result or []
        except Exception:
            pass
        
        cat_dist = {}
        status_dist = {}
        cat_res_times = {}
        
        for g in data:
            cat = g.get('category', 'General')
            cat_dist[cat] = cat_dist.get(cat, 0) + 1
            
            status = g.get('status', 'pending')
            status_dist[status] = status_dist.get(status, 0) + 1
            
            res_time = g.get('resolution_time_hours')
            if res_time is not None:
                if cat not in cat_res_times:
                    cat_res_times[cat] = []
                cat_res_times[cat].append(res_time)
        
        resolution_times = []
        for cat, times in cat_res_times.items():
            resolution_times.append({
                'category': cat,
                'avg_hours': sum(times) / len(times)
            })
            
        category_distribution = [{'category': k, 'count': v} for k, v in cat_dist.items()]
        status_breakdown = [{'status': k, 'count': v} for k, v in status_dist.items()]
        
        # If no data, provide defaults
        if not data:
            resolution_times = [{'category': 'General', 'avg_hours': 0}]
            category_distribution = [{'category': 'General', 'count': 0}]
            status_breakdown = [{'status': 'pending', 'count': 0}]

        analytics = {
            'resolution_times': resolution_times,
            'category_distribution': category_distribution,
            'status_breakdown': status_breakdown
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

