from flask import Blueprint, jsonify, request
from functools import wraps
from supabase_client import get_supabase

# Create blueprint
quality_accreditation_bp = Blueprint('quality_accreditation', __name__)

@quality_accreditation_bp.route('/accreditation/readiness', methods=['GET', 'OPTIONS'])
def get_readiness_score():
    """Get accreditation readiness score from quality_accreditation table"""
    try:
        supabase = get_supabase()

        # Get the latest report
        result = supabase.table('quality_accreditation').select('*').order('report_date', desc=True).limit(1).execute()

        if not result.data:
            return jsonify({
                'success': True,
                'data': {
                    'overall_score': 0,
                    'readiness_level': 'poor',
                    'criteria_scores': {},
                    'department_scores': {}
                }
            })

        report = result.data[0]
        score = float(report.get('score', 0))
        
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
        supabase = get_supabase()
        result = supabase.table('quality_accreditation').select('*').order('report_date', desc=True).execute()
        data = result.data or []
        
        score_trends = []
        for r in reversed(data[:6]): # Last 6 reports
            score_trends.append({
                'date': r.get('report_date', ''),
                'score': float(r.get('score', 0))
            })
            
        dept_readiness = []
        for r in data[:5]: # Last 5 unique departments maybe
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
    """Get accreditation information from Supabase"""
    try:
        supabase = get_supabase()

        # Get pagination parameters
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        offset = (page - 1) * limit

        # Get filter parameters
        search = request.args.get('search', '')

        # Build query
        query = supabase.table('quality_accreditation').select('*', count='exact')

        # Apply filters
        if search:
            query = query.or_(f"report_type.ilike.%{search}%,department.ilike.%{search}%")

        # Execute query with pagination
        result = query.range(offset, offset + limit - 1).execute()
        total_count = result.count if hasattr(result, 'count') else 0

        # Map database fields to frontend expected fields
        accreditation = []
        for record in (result.data or []):
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

        total_pages = (total_count + limit - 1) // limit if total_count > 0 else 1

        return jsonify({
            'success': True,
            'data': accreditation,
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

@quality_accreditation_bp.route('/accreditation/reports', methods=['GET', 'OPTIONS'])
def get_accreditation_reports():
    """Get accreditation reports with pagination from quality_accreditation table"""
    try:
        supabase = get_supabase()
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        offset = (page - 1) * limit

        result = supabase.table('quality_accreditation').select('*', count='exact').range(offset, offset + limit - 1).execute()
        total_count = result.count if hasattr(result, 'count') else 0

        reports = []
        for record in (result.data or []):
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
                'id': record['report_id'],
                'accreditation_body': record['report_type'],
                'academic_year': 'Current',
                'overall_score': score,
                'readiness_level': level,
                'generated_date': record['report_date'],
                'status': 'completed',
                'recommendations': record.get('recommendations', [])
            })

        total_pages = (total_count + limit - 1) // limit if total_count > 0 else 1

        return jsonify({
            'success': True,
            'data': reports,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total_count,
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
