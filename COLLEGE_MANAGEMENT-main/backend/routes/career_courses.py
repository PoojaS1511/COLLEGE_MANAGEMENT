# backend/routes/career_courses.py
from flask import Blueprint, jsonify, request, current_app
from postgres_client import execute_query, execute_insert, execute_update, execute_delete
from datetime import datetime
import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

bp = Blueprint('career_courses', __name__)

# Table name for career courses
COURSES_TABLE = 'career_courses'

# Sample data for demonstration
SAMPLE_COURSES = [
    {
        "title": "Python for Beginners - Full Course",
        "platform": "youtube",
        "embed_url": "https://www.youtube.com/embed/rfscVS0vtbw",
        "description": "Learn Python from scratch with this comprehensive tutorial.",
        "level": "Beginner",
        "external_url": "https://www.youtube.com/watch?v=rfscVS0vtbw"
    },
    {
        "title": "Web Development Bootcamp",
        "platform": "udemy",
        "embed_url": "https://www.udemy.com/embed/web-development-bootcamp",
        "description": "Full stack web development course covering HTML, CSS, JavaScript, and more.",
        "level": "Beginner",
        "external_url": "https://www.udemy.com/web-development-bootcamp"
    }
]

@bp.route('/api/career/courses', methods=['GET'])
def get_courses():
    """Get all career courses with optional filtering"""
    try:
        # Build query with optional filters
        query = "SELECT * FROM career_courses WHERE 1=1"
        params = []
        
        # Add filters if provided
        if request.args.get('level'):
            query += " AND level = %s"
            params.append(request.args.get('level'))
        
        if request.args.get('platform'):
            query += " AND platform = %s"
            params.append(request.args.get('platform'))
        
        query += " ORDER BY created_at DESC"
        
        # Query courses from PostgreSQL
        courses = execute_query(query, params, fetch_all=True)
        
        # If no courses in database, add sample data
        if not courses:
            for course_data in SAMPLE_COURSES:
                course_data = course_data.copy()
                course_data.update({
                    'created_at': datetime.utcnow().isoformat(),
                    'updated_at': datetime.utcnow().isoformat()
                })
                execute_insert(COURSES_TABLE, course_data)
            
            # Re-query after adding sample data
            courses = execute_query("SELECT * FROM career_courses ORDER BY created_at DESC", fetch_all=True)
        
        return jsonify({
            'success': True,
            'data': courses
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@bp.route('/api/career/courses/<int:course_id>', methods=['GET'])
def get_course(course_id):
    """Get a specific career course"""
    try:
        query = "SELECT * FROM career_courses WHERE id = %s"
        course = execute_query(query, [course_id], fetch_all=False)
        
        if not course:
            return jsonify({
                'success': False,
                'error': 'Course not found'
            }), 404
        
        return jsonify({
            'success': True,
            'data': course
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@bp.route('/api/career/courses', methods=['POST'])
def add_course():
    """Add a new career course"""
    try:
        data = request.get_json()
        
        required_fields = ['title', 'platform', 'description', 'level']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        course_data = {
            'title': data['title'],
            'platform': data['platform'],
            'embed_url': data.get('embed_url', ''),
            'description': data['description'],
            'level': data['level'],
            'external_url': data.get('external_url', ''),
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        result = execute_insert(COURSES_TABLE, course_data)
        
        return jsonify({
            'success': True,
            'message': 'Course added successfully',
            'data': result
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@bp.route('/api/career/courses/<int:course_id>', methods=['PUT'])
def update_course(course_id):
    """Update an existing career course"""
    try:
        data = request.get_json()
        
        update_data = {
            'title': data.get('title'),
            'platform': data.get('platform'),
            'embed_url': data.get('embed_url'),
            'description': data.get('description'),
            'level': data.get('level'),
            'external_url': data.get('external_url'),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        # Remove None values
        update_data = {k: v for k, v in update_data.items() if v is not None}
        
        result = execute_update(COURSES_TABLE, course_id, update_data)
        
        if not result:
            return jsonify({
                'success': False,
                'error': 'Course not found'
            }), 404
        
        return jsonify({
            'success': True,
            'message': 'Course updated successfully',
            'data': result
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@bp.route('/api/career/courses/<int:course_id>', methods=['DELETE'])
def delete_course(course_id):
    """Delete a career course"""
    try:
        result = execute_delete(COURSES_TABLE, course_id)
        
        if not result:
            return jsonify({
                'success': False,
                'error': 'Course not found'
            }), 404
        
        return jsonify({
            'success': True,
            'message': 'Course deleted successfully'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@bp.route('/api/career/courses/filters', methods=['GET'])
def get_filters():
    """Get available filters for career courses"""
    try:
        # Get unique platforms
        platforms_query = "SELECT DISTINCT platform FROM career_courses WHERE platform IS NOT NULL ORDER BY platform"
        platforms = execute_query(platforms_query, fetch_all=True)
        
        # Get unique levels
        levels_query = "SELECT DISTINCT level FROM career_courses WHERE level IS NOT NULL ORDER BY level"
        levels = execute_query(levels_query, fetch_all=True)
        
        return jsonify({
            'success': True,
            'data': {
                'platforms': [p['platform'] for p in platforms],
                'levels': [l['level'] for l in levels]
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
