from flask import Blueprint, jsonify, request
from functools import wraps
import random
from postgres_client import execute_query, execute_insert, execute_update, execute_delete

# Create blueprint
quality_policies_bp = Blueprint('quality_policies', __name__)

@quality_policies_bp.route('/policies', methods=['GET', 'OPTIONS'])
def get_policies():
    """Get quality policies from PostgreSQL"""
    try:
        # Get pagination parameters
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        offset = (page - 1) * limit

        # Get filter parameters
        search = request.args.get('search', '')
        category_filter = request.args.get('category', '')
        status_filter = request.args.get('status', '')

        # Build query with filters
        query = "SELECT * FROM quality_policy WHERE 1=1"
        params = []
        
        if search:
            query += " AND (policy_name ILIKE %s OR responsible_department ILIKE %s)"
            search_pattern = f"%{search}%"
            params.extend([search_pattern, search_pattern])
        if status_filter:
            query += " AND compliance_status = %s"
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
        
        result = execute_query(query, params, fetch_all=True)
        policies_data = result or []

        # Map database fields to frontend expected fields
        policies = []
        for policy in policies_data:
            mapped_policy = {
                'id': policy.get('policy_id'),
                'title': policy.get('policy_name', ''),
                'description': f"Policy for {policy.get('responsible_department', 'the department')}",
                'category': 'General',
                'department': policy.get('responsible_department', ''),
                'compliance_status': policy.get('compliance_status', 'pending_review'),
                'compliance_score': 85.0,
                'next_review_date': policy.get('next_due_date', ''),
                'responsible_person': 'HOD'
            }
            policies.append(mapped_policy)

        total_pages = (total + limit - 1) // limit if total > 0 else 1

        return jsonify({
            'success': True,
            'data': policies,
            'pagination': {
                'currentPage': page,
                'totalPages': total_pages,
                'totalItems': total,
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
        # Get all policies for analytics
        result = execute_query("SELECT * FROM quality_policy", fetch_all=True)
        data = result or []

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
            
            # Compliance trends
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

