from flask import Blueprint, jsonify, request
from functools import wraps
from supabase_client import get_supabase

# Create blueprint
quality_analytics_bp = Blueprint('quality_analytics', __name__)

@quality_analytics_bp.route('/analytics/comprehensive', methods=['GET', 'OPTIONS'])
def get_comprehensive_analytics():
    """Get comprehensive quality analytics"""
    try:
        # Extract JWT token from Authorization header
        auth_header = request.headers.get('Authorization')
        token = None
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.replace('Bearer ', '')

        supabase = get_supabase(token=token)
        
        # Fetch data from various tables
        faculty_res = supabase.table('quality_facultyperformance').select('*').execute()
        faculty_data = faculty_res.data or []
        
        accreditation_res = supabase.table('quality_accreditation').select('*').order('report_date', desc=True).limit(1).execute()
        latest_accreditation = accreditation_res.data[0] if accreditation_res.data else {}
        
        students_res = supabase.table('students').select('*', count='exact').execute()
        total_students = students_res.count or 0
        
        total_faculty = len(faculty_data)
        
        # Calculate research metrics
        total_publications = sum([f.get('research_papers', 0) for f in faculty_data])
        total_projects = 0 # No projects field in quality_facultyperformance
        
        analytics = {
            'institutional_metrics': {
                'total_students': total_students,
                'total_faculty': total_faculty,
                'student_faculty_ratio': round(total_students / total_faculty, 1) if total_faculty > 0 else 0,
                'accreditation_score': 'A' if float(latest_accreditation.get('score', 0)) >= 80 else 'B',
                'quality_index': float(latest_accreditation.get('score', 0))
            },
            'academic_performance': {
                'average_cgpa': 8.2, # Mock if no student performance table
                'pass_percentage': 94.5,
                'placement_rate': 87.3,
                'higher_studies_rate': 12.8
            },
            'research_metrics': {
                'total_publications': total_publications,
                'total_projects': total_projects,
                'research_grants': 12,
                'patents_filed': 8
            },
            'infrastructure': {
                'classrooms': 45,
                'labs': 28,
                'library_seating': 200,
                'smart_classrooms': 30
            }
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

@quality_analytics_bp.route('/analytics/insights', methods=['GET', 'OPTIONS'])
def get_ai_insights():
    """Get AI-powered insights"""
    try:
        # Extract JWT token from Authorization header (optional for insights)
        auth_header = request.headers.get('Authorization')
        token = None
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.replace('Bearer ', '')

        insights = {
            'performance_trends': {
                'student_performance': 'improving',
                'faculty_productivity': 'stable',
                'research_output': 'increasing'
            },
            'recommendations': [
                'Focus on improving first-year student engagement',
                'Increase industry collaboration for better placements',
                'Enhance research infrastructure for higher output'
            ],
            'risk_areas': [
                'Declining enrollment in certain programs',
                'Need for faculty development in emerging technologies',
                'Infrastructure upgrade required for smart classrooms'
            ],
            'strengths': [
                'Strong faculty qualifications',
                'Good industry connections',
                'Excellent research culture'
            ]
        }
        
        return jsonify({
            'success': True,
            'data': insights
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
