"""
Career Roadmap Routes
Handles career assistant functionality including roadmap generation and AI mentor chat
"""
from flask import Blueprint, request, jsonify, current_app
from flask_cors import cross_origin
from postgres_client import execute_query, execute_insert, execute_update, execute_delete
import logging
from datetime import datetime
import json
import os

# Try to import Gemini AI
try:
    import google.generativeai as genai
    genai_available = True
except ImportError:
    genai = None
    genai_available = False

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Create blueprint
career_roadmap_bp = Blueprint('career_roadmap', __name__)

# Configure Gemini AI
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY') or "AIzaSyCHUFZItopFXXiupZ7KQJb4APnWA5I_UXs"
if genai_available:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        # Use gemini-1.5-flash instead of gemini-pro
        model = genai.GenerativeModel('gemini-1.5-flash')
        logger.info(f"Gemini AI configured successfully with gemini-1.5-flash (API key: {GEMINI_API_KEY[:20]}...)")
    except Exception as e:
        logger.error(f"Failed to configure Gemini AI: {e}")
        genai_available = False
        model = None
else:
    model = None
    logger.warning("Gemini AI not available - google.generativeai not installed")

def generate_roadmap_with_ai(career_interest: str, weeks: int = 10) -> list:
    """
    Generate a career roadmap using Gemini AI
    """
    if not genai_available or not model:
        # Fallback to predefined roadmap
        return generate_fallback_roadmap(career_interest, weeks)
    
    try:
        prompt = f"""
        Generate a comprehensive {weeks}-week career roadmap for someone interested in {career_interest}.
        Return the response as a JSON array of steps, where each step has:
        - title: string
        - description: string
        - duration_weeks: integer
        - skills_needed: array of strings
        - resources: array of resource objects with title and url
        - week_number: integer (1 to {weeks})
        
        Make it practical and actionable. Focus on real-world skills and projects.
        """
        
        response = model.generate_content(prompt)
        
        try:
            # Try to parse as JSON
            roadmap_data = json.loads(response.text)
            return roadmap_data if isinstance(roadmap_data, list) else generate_fallback_roadmap(career_interest, weeks)
        except json.JSONDecodeError:
            logger.error("Failed to parse AI response as JSON")
            return generate_fallback_roadmap(career_interest, weeks)
            
    except Exception as e:
        logger.error(f"AI roadmap generation failed: {e}")
        return generate_fallback_roadmap(career_interest, weeks)

def generate_fallback_roadmap(career_interest: str, weeks: int) -> list:
    """
    Generate a fallback roadmap when AI is not available
    """
    fallback_roadmaps = {
        "software development": [
            {
                "title": "Learn Programming Fundamentals",
                "description": "Master basic programming concepts and choose a language",
                "duration_weeks": 2,
                "skills_needed": ["Problem Solving", "Logic", "Basic Syntax"],
                "resources": [
                    {"title": "Python Tutorial", "url": "https://docs.python.org/3/tutorial/"},
                    {"title": "JavaScript Guide", "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript"}
                ],
                "week_number": 1
            },
            {
                "title": "Build Your First Projects",
                "description": "Create small projects to practice your skills",
                "duration_weeks": 3,
                "skills_needed": ["Project Planning", "Debugging", "Version Control"],
                "resources": [
                    {"title": "GitHub Guide", "url": "https://guides.github.com/"},
                    {"title": "Project Ideas", "url": "https://github.com/topics/sample-projects"}
                ],
                "week_number": 3
            }
        ],
        "data science": [
            {
                "title": "Mathematics and Statistics",
                "description": "Strengthen your mathematical foundation",
                "duration_weeks": 3,
                "skills_needed": ["Statistics", "Linear Algebra", "Probability"],
                "resources": [
                    {"title": "Khan Academy Math", "url": "https://www.khanacademy.org/math"},
                    {"title": "Statistics Course", "url": "https://www.coursera.org/learn/statistics"}
                ],
                "week_number": 1
            }
        ],
        "web development": [
            {
                "title": "HTML, CSS, and JavaScript",
                "description": "Learn the core technologies of web development",
                "duration_weeks": 4,
                "skills_needed": ["HTML5", "CSS3", "JavaScript ES6"],
                "resources": [
                    {"title": "MDN Web Docs", "url": "https://developer.mozilla.org/"},
                    {"title": "CSS Tricks", "url": "https://css-tricks.com/"}
                ],
                "week_number": 1
            }
        ]
    }
    
    # Return roadmap for the career interest or a generic one
    career_lower = career_interest.lower()
    for key, roadmap in fallback_roadmaps.items():
        if key in career_lower:
            return roadmap[:weeks] if len(roadmap) > weeks else roadmap
    
    # Generic roadmap if no specific match
    return [
        {
            "title": "Research Your Field",
            "description": f"Learn about {career_interest} industry trends and requirements",
            "duration_weeks": 2,
            "skills_needed": ["Research", "Industry Knowledge"],
            "resources": [
                {"title": "Industry Research", "url": "https://www.bls.gov/ooh/"},
                {"title": "Professional Networks", "url": "https://www.linkedin.com/"}
            ],
            "week_number": 1
        }
    ]

@career_roadmap_bp.route('/roadmap/generate', methods=['POST'])
@cross_origin()
def generate_roadmap():
    """Generate a personalized career roadmap"""
    try:
        data = request.get_json()
        
        if not data or 'career_interest' not in data:
            return jsonify({
                'success': False,
                'error': 'Career interest is required'
            }), 400
        
        career_interest = data['career_interest']
        weeks = data.get('weeks', 10)
        
        # Generate roadmap
        roadmap_steps = generate_roadmap_with_ai(career_interest, weeks)
        
        # Create roadmap record in database
        roadmap_data = {
            'student_id': data.get('student_id'),
            'career_interest': career_interest,
            'total_weeks': weeks,
            'status': 'active',
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        roadmap = execute_insert('career_roadmaps', roadmap_data)
        
        # Add steps to database
        for i, step in enumerate(roadmap_steps):
            step_data = {
                'roadmap_id': roadmap['id'],
                'title': step['title'],
                'description': step['description'],
                'duration_weeks': step['duration_weeks'],
                'skills_needed': json.dumps(step['skills_needed']),
                'resources': json.dumps(step['resources']),
                'week_number': step['week_number'],
                'status': 'pending',
                'created_at': datetime.utcnow().isoformat()
            }
            execute_insert('roadmap_steps', step_data)
        
        return jsonify({
            'success': True,
            'message': 'Roadmap generated successfully',
            'data': {
                'roadmap': roadmap,
                'steps': roadmap_steps
            }
        })
        
    except Exception as e:
        logger.error(f"Roadmap generation error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@career_roadmap_bp.route('/roadmap/<student_id>', methods=['GET'])
def get_student_roadmaps(student_id):
    """Get all roadmaps for a student"""
    try:
        query = """
            SELECT r.*, 
                   COUNT(rs.id) as completed_steps,
                   COUNT(CASE WHEN rs.status = 'completed' THEN 1 END) as completed_count
            FROM career_roadmaps r
            LEFT JOIN roadmap_steps rs ON r.id = rs.roadmap_id
            WHERE r.student_id = %s
            GROUP BY r.id
            ORDER BY r.created_at DESC
        """
        
        roadmaps = execute_query(query, [student_id], fetch_all=True)
        
        return jsonify({
            'success': True,
            'data': roadmaps
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@career_roadmap_bp.route('/roadmap/steps/<roadmap_id>', methods=['GET'])
def get_roadmap_steps(roadmap_id):
    """Get all steps for a specific roadmap"""
    try:
        query = """
            SELECT * FROM roadmap_steps 
            WHERE roadmap_id = %s 
            ORDER BY week_number ASC
        """
        
        steps = execute_query(query, [roadmap_id], fetch_all=True)
        
        # Parse JSON fields
        for step in steps:
            if step['skills_needed']:
                step['skills_needed'] = json.loads(step['skills_needed'])
            if step['resources']:
                step['resources'] = json.loads(step['resources'])
        
        return jsonify({
            'success': True,
            'data': steps
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@career_roadmap_bp.route('/roadmap/steps/update-status', methods=['PATCH'])
def update_step_status():
    """Update the status of a roadmap step"""
    try:
        data = request.get_json()
        
        required_fields = ['step_id', 'status']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        valid_statuses = ['pending', 'in_progress', 'completed', 'skipped']
        if data['status'] not in valid_statuses:
            return jsonify({
                'success': False,
                'error': f'Invalid status. Must be one of: {valid_statuses}'
            }), 400
        
        update_data = {
            'status': data['status'],
            'updated_at': datetime.utcnow().isoformat()
        }
        
        if data['status'] == 'completed':
            update_data['completed_at'] = datetime.utcnow().isoformat()
        
        result = execute_update('roadmap_steps', data['step_id'], update_data)
        
        if not result:
            return jsonify({
                'success': False,
                'error': 'Step not found'
            }), 404
        
        return jsonify({
            'success': True,
            'message': 'Step status updated successfully',
            'data': result
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@career_roadmap_bp.route('/roadmap/mentor/chat', methods=['POST'])
@cross_origin()
def mentor_chat():
    """AI mentor chat functionality"""
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({
                'success': False,
                'error': 'Message is required'
            }), 400
        
        message = data['message']
        student_id = data.get('student_id')
        roadmap_id = data.get('roadmap_id')
        
        if not genai_available or not model:
            return jsonify({
                'success': False,
                'error': 'AI mentor service not available'
            }), 503
        
        # Get context about student's roadmap
        context = ""
        if roadmap_id:
            context_query = "SELECT * FROM career_roadmaps WHERE id = %s"
            roadmap = execute_query(context_query, [roadmap_id], fetch_all=False)
            if roadmap:
                context = f"Student is working on: {roadmap['career_interest']} roadmap. "
        
        prompt = f"{context}Student asks: {message}. Provide helpful, encouraging career guidance."
        
        response = model.generate_content(prompt)
        
        # Save chat message
        chat_data = {
            'student_id': student_id,
            'roadmap_id': roadmap_id,
            'message': message,
            'response': response.text,
            'created_at': datetime.utcnow().isoformat()
        }
        
        execute_insert('mentor_chats', chat_data)
        
        return jsonify({
            'success': True,
            'data': {
                'message': message,
                'response': response.text,
                'timestamp': datetime.utcnow().isoformat()
            }
        })
        
    except Exception as e:
        logger.error(f"Mentor chat error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@career_roadmap_bp.route('/roadmap/mentor/history/<student_id>', methods=['GET'])
def get_mentor_history(student_id):
    """Get mentor chat history for a student"""
    try:
        query = """
            SELECT * FROM mentor_chats 
            WHERE student_id = %s 
            ORDER BY created_at DESC 
            LIMIT 50
        """
        
        chats = execute_query(query, [student_id], fetch_all=True)
        
        return jsonify({
            'success': True,
            'data': chats
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
