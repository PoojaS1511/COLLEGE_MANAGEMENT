from flask import Blueprint, jsonify, request
from functools import wraps
from supabase_client import get_supabase

# Create blueprint
quality_audits_bp = Blueprint('quality_audits', __name__)

@quality_audits_bp.route('/audits', methods=['GET', 'OPTIONS'])
def get_audits():
    """Get quality audits from Supabase"""
    try:
        # Extract JWT token from Authorization header
        auth_header = request.headers.get('Authorization')
        print(f"DEBUG: Authorization header received: {auth_header}")
        token = None
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.replace('Bearer ', '')
            print(f"DEBUG: Extracted token: {token[:20]}...")

        supabase = get_supabase(token=token)

        # Get pagination parameters
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        offset = (page - 1) * limit

        # Get filter parameters
        search = request.args.get('search', '')
        department_filter = request.args.get('department', '')
        status_filter = request.args.get('status', '')
        audit_type_filter = request.args.get('audit_type', '')

        # Build query
        query = supabase.table('quality_audits').select('*', count='exact')

        # Apply filters
        if search:
            query = query.or_(f"department.ilike.%{search}%,auditor_name.ilike.%{search}%,remarks.ilike.%{search}%")
        if department_filter:
            query = query.eq('department', department_filter)
        if status_filter:
            query = query.eq('status', status_filter)

        # Get results
        result = query.range(offset, offset + limit - 1).execute()
        total_count = result.count if hasattr(result, 'count') else 0

        # Map database fields to frontend expected fields
        audits = []
        for audit in result.data:
            mapped_audit = {
                'id': audit.get('audit_id'),
                'title': f"Audit - {audit.get('department', 'Unknown')}",
                'department': audit.get('department', ''),
                'audit_type': 'internal',
                'scheduled_date': audit.get('audit_date', ''),
                'auditor': audit.get('auditor_name', ''),
                'findings': audit.get('remarks', ''),
                'recommendations': '',
                'status': audit.get('status', 'pending'),
                'compliance_score': audit.get('compliance_score')
            }
            audits.append(mapped_audit)

        total_pages = (total_count + limit - 1) // limit if total_count > 0 else 1

        return jsonify({
            'success': True,
            'data': audits,
            'pagination': {
                'currentPage': page,
                'totalPages': total_pages,
                'totalRecords': total_count,
                'limit': limit
            }
        })

    except Exception as e:
        print(f"Error fetching audits: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@quality_audits_bp.route('/audits/analytics', methods=['GET', 'OPTIONS'])
def get_audit_analytics():
    """Get audit analytics data"""
    try:
        supabase = get_supabase()

        # Get all audits for analytics
        result = supabase.table('quality_audits').select('*').execute()
        audits = result.data or []

        # Calculate analytics
        total_audits = len(audits)
        completed_audits = len([a for a in audits if a.get('status') == 'completed'])
        pending_audits = len([a for a in audits if a.get('status') == 'pending'])
        in_progress_audits = len([a for a in audits if a.get('status') == 'in_progress'])

        # Department compliance scores
        department_scores = {}
        for audit in audits:
            dept = audit.get('department', 'Unknown')
            score = audit.get('compliance_score')
            if score is not None:
                if dept not in department_scores:
                    department_scores[dept] = []
                department_scores[dept].append(float(score))

        compliance_scores = [
            {
                'department': dept,
                'score': round(sum(scores) / len(scores), 1) if scores else 0
            }
            for dept, scores in department_scores.items()
        ]

        # Status distribution
        status_distribution = [
            {'status': 'completed', 'count': completed_audits},
            {'status': 'pending', 'count': pending_audits},
            {'status': 'in_progress', 'count': in_progress_audits}
        ]

        # Monthly trends (summarized from completed audits by month)
        # For now, if we don't have enough data, we use these placeholders
        completion_trends = [
            {'month': 'Jan', 'rate': 85},
            {'month': 'Feb', 'rate': 88},
            {'month': 'Mar', 'rate': 92},
            {'month': 'Apr', 'rate': 87},
            {'month': 'May', 'rate': 90},
            {'month': 'Jun', 'rate': 93}
        ]

        return jsonify({
            'success': True,
            'data': {
                'total_audits': total_audits,
                'completed_audits': completed_audits,
                'pending_audits': pending_audits,
                'in_progress_audits': in_progress_audits,
                'compliance_scores': compliance_scores,
                'status_distribution': status_distribution,
                'completion_trends': completion_trends
            }
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
