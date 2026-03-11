from flask import Blueprint, jsonify, request
from functools import wraps
import random
from supabase_client import get_supabase

# Create blueprint
quality_grievances_bp = Blueprint('quality_grievances', __name__)

@quality_grievances_bp.route('/grievances', methods=['GET', 'OPTIONS'])
def get_grievances():
    """Get quality grievances from Supabase"""
    try:
        supabase = get_supabase()

        # Get pagination parameters
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        offset = (page - 1) * limit

        # Get filter parameters
        search = request.args.get('search', '')
        category_filter = request.args.get('category', '')
        status_filter = request.args.get('status', '')
        priority_filter = request.args.get('priority', '')

        # Build query
        query = supabase.table('quality_grivance').select('*', count='exact')

        # Apply filters
        if search:
            query = query.or_(f"description.ilike.%{search}%")
        if category_filter:
            query = query.eq('grievance_type', category_filter)
        if status_filter:
            query = query.eq('status', status_filter)

        # Execute query
        try:
            # Get total count for pagination
            total_result = supabase.table('quality_grivance').select('grievance_id', count='exact').execute()
            total_count = total_result.count if hasattr(total_result, 'count') else 0

            # Apply pagination
            query = query.range(offset, offset + limit - 1)

            # Execute query
            result = query.execute()
            data = result.data or []
        except Exception as e:
            print(f"Grievances table error: {e}")
            total_count = 0
            data = []

        # Map database fields to frontend expected fields
        grievances = []
        for grievance in data:
            mapped_grievance = {
                'id': grievance.get('grievance_id'),
                'title': grievance.get('description', '')[:50] + '...' if len(grievance.get('description', '')) > 50 else grievance.get('description', ''),
                'description': grievance.get('description', ''),
                'category': grievance.get('grievance_type', ''),
                'priority': 'medium',  # Default since not in schema
                'status': grievance.get('status', 'Open'),
                'user_type': grievance.get('user_type', 'student'),
                'submitted_date': grievance.get('resolution_date', '').split('T')[0] if grievance.get('resolution_date') else '',
                'ai_classification': grievance.get('grievance_type', '')  # Use grievance_type as classification
            }
            grievances.append(mapped_grievance)

        total_pages = (total_count + limit - 1) // limit if total_count > 0 else 1

        return jsonify({
            'success': True,
            'data': grievances,
            'pagination': {
                'currentPage': page,
                'totalPages': total_pages,
                'totalItems': total_count
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
        supabase = get_supabase()
        data = []
        try:
            result = supabase.table('grievances').select('*').execute()
            data = result.data or []
        except Exception:
            pass
        
        cat_dist = {}
        status_dist = {}
        cat_res_times = {} # category -> list of resolution times
        
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
        
        # If no data, provide some defaults to avoid empty charts
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
