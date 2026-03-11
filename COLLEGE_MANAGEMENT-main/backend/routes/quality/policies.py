from flask import Blueprint, jsonify, request
from functools import wraps
import random
from supabase_client import get_supabase

# Create blueprint
quality_policies_bp = Blueprint('quality_policies', __name__)

@quality_policies_bp.route('/policies', methods=['GET', 'OPTIONS'])
def get_policies():
    """Get quality policies from Supabase"""
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

        # Build query
        query = supabase.table('quality_policy').select('*', count='exact')

        # Apply filters
        if search:
            query = query.or_(f"policy_name.ilike.%{search}%,responsible_department.ilike.%{search}%")
        if category_filter:
            # Table doesn't have category, ignoring for now or mapping if possible
            pass
        if status_filter:
            query = query.eq('compliance_status', status_filter)

        # Execute query with pagination
        result = query.range(offset, offset + limit - 1).execute()
        total_count = result.count if hasattr(result, 'count') else 0

        # Map database fields to frontend expected fields
        policies = []
        for policy in (result.data or []):
            mapped_policy = {
                'id': policy.get('policy_id'),
                'title': policy.get('policy_name', ''),
                'description': f"Policy for {policy.get('responsible_department', 'the department')}",
                'category': 'General',
                'department': policy.get('responsible_department', ''),
                'compliance_status': policy.get('compliance_status', 'pending_review'),
                'compliance_score': 85.0, # Default if not in table
                'next_review_date': policy.get('next_due_date', ''),
                'responsible_person': 'HOD' # Default if not in table
            }
            policies.append(mapped_policy)

        total_pages = (total_count + limit - 1) // limit if total_count > 0 else 1

        return jsonify({
            'success': True,
            'data': policies,
            'pagination': {
                'currentPage': page,
                'totalPages': total_pages,
                'totalItems': total_count,
                'limit': limit
            }
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@quality_policies_bp.route('/policies/analytics', methods=['GET', 'OPTIONS'])
def get_policies_analytics():
    """Get policy analytics"""
    try:
        supabase = get_supabase()

        # Get all policies for analytics
        result = supabase.table('quality_policy').select('*').execute()
        data = result.data or []

        if not data:
            analytics = {
                'compliance_trends': [
                    {'month': 'Jan', 'rate': 80},
                    {'month': 'Feb', 'rate': 82},
                    {'month': 'Mar', 'rate': 85},
                    {'month': 'Apr', 'rate': 87},
                    {'month': 'May', 'rate': 90},
                    {'month': 'Jun', 'rate': 92}
                ],
                'upcoming_deadlines': [],
                'policy_compliance': []
            }
        else:
            from datetime import datetime
            
            # Compliance trends (mock for now)
            compliance_trends = [
                {'month': 'Jan', 'rate': 80},
                {'month': 'Feb', 'rate': 82},
                {'month': 'Mar', 'rate': 85},
                {'month': 'Apr', 'rate': 87},
                {'month': 'May', 'rate': 90},
                {'month': 'Jun', 'rate': 92}
            ]

            # Upcoming deadlines
            upcoming_deadlines = []
            today = datetime.now().date()

            for policy in data:
                try:
                    if policy.get('next_due_date'):
                        due_date = datetime.strptime(policy['next_due_date'], '%Y-%m-%d').date()
                        days_left = (due_date - today).days
                        if 0 <= days_left <= 60:
                            upcoming_deadlines.append({
                                'policy': policy['policy_name'],
                                'days_left': max(0, days_left)
                            })
                except (ValueError, KeyError):
                    continue

            upcoming_deadlines.sort(key=lambda x: x['days_left'])

            # Policy compliance status
            policy_compliance = []
            for policy in data[:10]:
                policy_compliance.append({
                    'policy': policy['policy_name'],
                    'status': policy['compliance_status']
                })

            analytics = {
                'compliance_trends': compliance_trends,
                'upcoming_deadlines': upcoming_deadlines[:5],
                'policy_compliance': policy_compliance
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
