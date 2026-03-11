from flask import Blueprint, jsonify, request
from functools import wraps
from postgres_client import execute_query, execute_insert, execute_update, execute_delete

# Create blueprint
quality_accreditation_bp = Blueprint('quality_accreditation', __name__)

@quality_accreditation_bp.route('/accreditation/readiness', methods=['GET', 'OPTIONS'])
def get_readiness_score():
    """Get accreditation readiness score from quality_accreditation table"""
    try:
        # Get the latest report from PostgreSQL
        result = execute_query(
            "SELECT * FROM quality_accreditation ORDER BY report_date DESC LIMIT 1",
            fetch_all=False
        )

        if not result:
            return jsonify({
                'success': True,
                'data': {
                    'overall_score': 0,
                    'readiness_level': 'poor',
                    'criteria_scores': {},
                    'department_scores': {}
                }
            })

        score = float(result.get('score', 0))
        
        # Determine readiness level based on score
        if score >= 90:
            level = 'excellent'
        elif score >= 80:
            level = 'good'
        elif score >= 70:
            level = 'average'
        else:
            level = 'poor'

        # Mock criteria scores for the radar chart
        criteria_scores = {
            'Teaching & Learning': score * 0.9,
            'Research & Innovation': score * 0.8,
            'Infrastructure': score * 0.95,
            'Governance': score * 0.85,
            'Student Support': score * 0.9,
            'Extension Activities': score * 0.75
        }

        # Mock department scores for the bar chart
        department_scores = {
            'Computer Science': score * 0.95,
            'Mechanical Engineering': score * 0.9,
            'Electrical Engineering': score * 0.85,
            'Civil Engineering': score * 0.8,
            'Business Administration': score * 0.88
        }

        readiness_score = {
            'overall_score': score,
            'readiness_level': level,
            'criteria_scores': criteria_scores,
            'department_scores': department_scores
        }

        return jsonify({
            'success': True,
            'data': readiness_score
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@quality_accreditation_bp.route('/accreditation/analytics', methods=['GET', 'OPTIONS'])
def get_accreditation_analytics():
    """Get accreditation analytics"""
    try:
        result = execute_query(
            "SELECT * FROM quality_accreditation ORDER BY report_date DESC",
            fetch_all=True
        )
        data = result or []
        
        score_trends = []
        for r in reversed(data[:6]):
            score_trends.append({
                'date': r.get('report_date', ''),
                'score': float(r.get('score', 0))
            })
            
        dept_readiness = []
        for r in data[:5]:
            dept_readiness.append({
                'department': r.get('department', 'General'),
                'readiness_score': float(r.get('score', 0))
            })
        
        level_counts = {'excellent': 0, 'good': 0, 'average': 0, 'poor': 0}
        for r in data:
            score = float(r.get('score', 0))
            if score >= 90:
                level = 'excellent'
            elif score >= 80:
                level = 'good'
            elif score >= 70:
                level = 'average'
            else:
                level = 'poor'
            level_counts[level] += 1
                
        readiness_distribution = [{'level': k, 'count': v} for k, v in level_counts.items()]

        analytics = {
            'score_trends': score_trends,
            'department_readiness': dept_readiness,
            'readiness_distribution': readiness_distribution
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

@quality_accreditation_bp.route('/accreditation', methods=['GET', 'OPTIONS'])
def get_accreditation():
    """Get accreditation information from PostgreSQL"""
    try:
        # Get pagination parameters
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        offset = (page - 1) * limit

        # Get filter parameters
        search = request.args.get('search', '')

        # Build query with filters
        query = "SELECT * FROM quality_accreditation WHERE 1=1"
        params = []
        
        if search:
            query += " AND (report_type ILIKE %s OR department ILIKE %s)"
            search_pattern = f"%{search}%"
            params.extend([search_pattern, search_pattern])

        # Get total count
        count_query = query.replace("SELECT *", "SELECT COUNT(*) as count")
        try:
            total_count = execute_query(count_query, params, fetch_all=False)
            total = total_count.get('count', 0) if total_count else 0
        except:
            total = 0

        # Add pagination and ordering
        query += f" ORDER BY report_date DESC LIMIT {limit} OFFSET {offset}"
        
        result = execute_query(query, params, fetch_all=True)
        data = result or []

        # Map database fields to frontend expected fields
        accreditation = []
        for record in data:
            score = float(record.get('score', 0))
            mapped_record = {
                'id': record.get('report_id'),
                'body': record.get('report_type', 'NAAC'),
                'program': record.get('department', 'Institutional'),
                'status': 'completed',
                'valid_until': '', 
                'grade': 'A+' if score >= 90 else
                        'A' if score >= 80 else
                        'B+' if score >= 70 else 'B'
            }
            accreditation.append(mapped_record)

        total_pages = (total + limit - 1) // limit if total > 0 else 1

        return jsonify({
            'success': True,
            'data': accreditation,
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

@quality_accreditation_bp.route('/accreditation/reports', methods=['GET', 'OPTIONS'])
def get_accreditation_reports():
    """Get accreditation reports with pagination from quality_accreditation table"""
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        offset = (page - 1) * limit

        # Get total count
        count_query = "SELECT COUNT(*) as count FROM quality_accreditation"
        total_count = execute_query(count_query, fetch_all=False)
        total = total_count.get('count', 0) if total_count else 0

        # Get data with pagination
        query = f"SELECT * FROM quality_accreditation ORDER BY report_date DESC LIMIT {limit} OFFSET {offset}"
        result = execute_query(query, fetch_all=True)
        data = result or []

        reports = []
        for record in data:
            score = float(record.get('score', 0))
            if score >= 90:
                level = 'excellent'
            elif score >= 80:
                level = 'good'
            elif score >= 70:
                level = 'average'
            else:
                level = 'poor'
                
            reports.append({
                'id': record.get('report_id'),
                'accreditation_body': record.get('report_type'),
                'academic_year': 'Current',
                'overall_score': score,
                'readiness_level': level,
                'generated_date': record.get('report_date'),
                'status': 'completed',
                'recommendations': record.get('recommendations', [])
            })

        total_pages = (total + limit - 1) // limit if total > 0 else 1

        return jsonify({
            'success': True,
            'data': reports,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total,
                'totalPages': total_pages
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@quality_accreditation_bp.route('/accreditation/reports', methods=['POST', 'OPTIONS'])
def generate_accreditation_report():
    """Generate accreditation report"""
    try:
        data = request.get_json()
        
        # Mock report generation
        new_report = {
            'id': 999,
            'accreditation_body': data.get('accreditation_body', 'NAAC'),
            'academic_year': data.get('academic_year', '2024'),
            'overall_score': 85,
            'readiness_level': 'good',
            'generated_date': '2024-01-07',
            'status': 'draft'
        }
        
        return jsonify({
            'success': True,
            'data': new_report,
            'message': 'Accreditation report generated successfully'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

