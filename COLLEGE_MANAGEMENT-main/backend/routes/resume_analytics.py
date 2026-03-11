from flask import Blueprint, request, jsonify
from postgres_client import execute_query, execute_insert, execute_update, execute_delete
from datetime import datetime
import uuid

resume_analytics_bp = Blueprint('resume_analytics', __name__)

@resume_analytics_bp.route('/<student_id>', methods=['GET'])
def get_resume(student_id):
    """Get student resume data"""
    try:
        query = """
            SELECT s.*, c.name as course_name, c.code as course_code
            FROM students s
            LEFT JOIN courses c ON s.course_id = c.id
            WHERE s.id = %s
        """
        
        student = execute_query(query, [student_id], fetch_all=False)
        
        if not student:
            return jsonify({'success': False, 'error': 'Student not found'}), 404
        
        # Get academic achievements
        achievements_query = """
            SELECT * FROM student_achievements
            WHERE student_id = %s
            ORDER BY year DESC
        """
        
        achievements = execute_query(achievements_query, [student_id], fetch_all=True)
        
        # Get skills
        skills_query = """
            SELECT * FROM student_skills
            WHERE student_id = %s
        """
        
        skills = execute_query(skills_query, [student_id], fetch_all=True)
        
        # Get projects
        projects_query = """
            SELECT * FROM student_projects
            WHERE student_id = %s
            ORDER BY created_at DESC
        """
        
        projects = execute_query(projects_query, [student_id], fetch_all=True)
        
        return jsonify({
            'success': True,
            'data': {
                'student': student,
                'achievements': achievements,
                'skills': skills,
                'projects': projects
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@resume_analytics_bp.route('/student/<int:student_id>/resume/analysis', methods=['GET'])
def get_resume_analysis(student_id):
    """Get resume analysis for a student"""
    try:
        # Get student marks for academic performance
        marks_query = """
            SELECT 
                AVG(m.marks_obtained) as average_marks,
                COUNT(CASE WHEN m.marks_obtained >= e.passing_marks THEN 1 END) as passed_exams,
                COUNT(m.id) as total_exams
            FROM marks m
            LEFT JOIN exams e ON m.exam_id = e.id
            WHERE m.student_id = %s
        """
        
        academic_performance = execute_query(marks_query, [student_id], fetch_all=False)
        
        # Get skills count and categories
        skills_query = """
            SELECT 
                COUNT(*) as total_skills,
                COUNT(CASE WHEN skill_type = 'technical' THEN 1 END) as technical_skills,
                COUNT(CASE WHEN skill_type = 'soft' THEN 1 END) as soft_skills
            FROM student_skills
            WHERE student_id = %s
        """
        
        skills_analysis = execute_query(skills_query, [student_id], fetch_all=False)
        
        # Get projects count
        projects_query = """
            SELECT COUNT(*) as total_projects
            FROM student_projects
            WHERE student_id = %s
        """
        
        projects_count = execute_query(projects_query, [student_id], fetch_all=False)
        
        # Generate recommendations
        recommendations = []
        
        if academic_performance and academic_performance['average_marks']:
            avg_marks = academic_performance['average_marks']
            if avg_marks >= 80:
                recommendations.append("Excellent academic performance - highlight in resume")
            elif avg_marks >= 60:
                recommendations.append("Good academic performance - include in resume")
            else:
                recommendations.append("Focus on improving academic performance")
        
        if skills_analysis and skills_analysis['technical_skills']:
            if skills_analysis['technical_skills'] >= 5:
                recommendations.append("Strong technical skills - create dedicated section")
            else:
                recommendations.append("Consider adding more technical skills")
        
        if projects_count and projects_count['total_projects'] >= 3:
            recommendations.append("Good project portfolio - showcase prominently")
        else:
            recommendations.append("Consider working on more projects")
        
        return jsonify({
            'success': True,
            'data': {
                'academic_performance': academic_performance,
                'skills_analysis': skills_analysis,
                'projects_count': projects_count,
                'recommendations': recommendations
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@resume_analytics_bp.route('/resume/resume/analytics/dashboard', methods=['GET'])
def get_resume_analytics_dashboard():
    """Get resume analytics dashboard"""
    try:
        # Get students with resumes
        students_query = """
            SELECT COUNT(*) as total_students_with_resumes
            FROM students s
            WHERE EXISTS (
                SELECT 1 FROM student_skills ss WHERE ss.student_id = s.id
                UNION
                SELECT 1 FROM student_projects sp WHERE sp.student_id = s.id
                UNION
                SELECT 1 FROM student_achievements sa WHERE sa.student_id = s.id
            )
        """
        
        students_with_resumes = execute_query(students_query, fetch_all=False)
        
        # Get skills distribution
        skills_query = """
            SELECT 
                skill_type,
                COUNT(*) as count,
                ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM student_skills)), 2) as percentage
            FROM student_skills
            GROUP BY skill_type
            ORDER BY count DESC
        """
        
        skills_distribution = execute_query(skills_query, fetch_all=True)
        
        # Get average projects per student
        projects_query = """
            SELECT 
                AVG(project_count) as avg_projects,
                MAX(project_count) as max_projects,
                MIN(project_count) as min_projects
            FROM (
                SELECT COUNT(*) as project_count
                FROM student_projects
                GROUP BY student_id
            ) project_stats
        """
        
        projects_stats = execute_query(projects_query, fetch_all=False)
        
        return jsonify({
            'success': True,
            'data': {
                'students_with_resumes': students_with_resumes,
                'skills_distribution': skills_distribution,
                'projects_stats': projects_stats
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@resume_analytics_bp.route('/resume/student/<int:student_id>/resume/recommendations', methods=['GET'])
def get_resume_recommendations(student_id):
    """Get personalized resume recommendations"""
    try:
        # Get student's current resume data
        student_query = "SELECT * FROM students WHERE id = %s"
        student = execute_query(student_query, [student_id], fetch_all=False)
        
        if not student:
            return jsonify({'success': False, 'error': 'Student not found'}), 404
        
        recommendations = []
        
        # Academic recommendations
        marks_query = """
            SELECT AVG(m.marks_obtained) as avg_marks
            FROM marks m
            WHERE m.student_id = %s
        """
        marks_result = execute_query(marks_query, [student_id], fetch_all=False)
        
        if marks_result and marks_result['avg_marks']:
            avg_marks = marks_result['avg_marks']
            if avg_marks >= 85:
                recommendations.append({
                    'category': 'Academic',
                    'recommendation': 'Highlight your excellent academic performance prominently',
                    'priority': 'high'
                })
            elif avg_marks >= 70:
                recommendations.append({
                    'category': 'Academic',
                    'recommendation': 'Include your academic performance with key achievements',
                    'priority': 'medium'
                })
        
        # Skills recommendations
        skills_query = "SELECT COUNT(*) as skill_count FROM student_skills WHERE student_id = %s"
        skills_result = execute_query(skills_query, [student_id], fetch_all=False)
        
        if skills_result and skills_result['skill_count']:
            skill_count = skills_result['skill_count']
            if skill_count < 5:
                recommendations.append({
                    'category': 'Skills',
                    'recommendation': 'Consider adding more technical and soft skills to strengthen your profile',
                    'priority': 'high'
                })
            elif skill_count >= 10:
                recommendations.append({
                    'category': 'Skills',
                    'recommendation': 'You have a good skill set - organize them by category and proficiency',
                    'priority': 'medium'
                })
        
        # Projects recommendations
        projects_query = "SELECT COUNT(*) as project_count FROM student_projects WHERE student_id = %s"
        projects_result = execute_query(projects_query, [student_id], fetch_all=False)
        
        if projects_result and projects_result['project_count']:
            project_count = projects_result['project_count']
            if project_count < 2:
                recommendations.append({
                    'category': 'Projects',
                    'recommendation': 'Work on more academic or personal projects to showcase your abilities',
                    'priority': 'high'
                })
        
        # General recommendations
        recommendations.extend([
            {
                'category': 'Format',
                'recommendation': 'Keep your resume concise and focused on the job you are applying for',
                'priority': 'medium'
            },
            {
                'category': 'Content',
                'recommendation': 'Use action verbs and quantify your achievements wherever possible',
                'priority': 'medium'
            }
        ])
        
        return jsonify({
            'success': True,
            'data': {
                'student_id': student_id,
                'recommendations': recommendations
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@resume_analytics_bp.route('/resume/upload', methods=['POST'])
def upload_resume():
    """Upload resume file"""
    try:
        data = request.get_json()
        
        required_fields = ['student_id', 'file_name', 'file_path']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        resume_data = {
            'id': str(uuid.uuid4()),
            'student_id': data['student_id'],
            'file_name': data['file_name'],
            'file_path': data['file_path'],
            'file_size': data.get('file_size'),
            'upload_date': datetime.utcnow().isoformat(),
            'status': 'uploaded'
        }
        
        result = execute_insert('resumes', resume_data)
        
        return jsonify({
            'success': True,
            'message': 'Resume uploaded successfully',
            'data': result
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@resume_analytics_bp.route('/resume/analysis/<student_id>', methods=['PUT'])
def update_resume_analysis(student_id):
    """Update resume analysis"""
    try:
        data = request.get_json()
        
        analysis_data = {
            'student_id': student_id,
            'analysis_data': data.get('analysis_data', {}),
            'recommendations': data.get('recommendations', []),
            'score': data.get('score'),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        # Check if analysis exists
        existing_query = "SELECT id FROM resume_analysis WHERE student_id = %s"
        existing = execute_query(existing_query, [student_id], fetch_all=False)
        
        if existing:
            result = execute_update('resume_analysis', student_id, analysis_data)
        else:
            analysis_data['id'] = str(uuid.uuid4())
            analysis_data['created_at'] = datetime.utcnow().isoformat()
            result = execute_insert('resume_analysis', analysis_data)
        
        return jsonify({
            'success': True,
            'message': 'Resume analysis updated successfully',
            'data': result
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
