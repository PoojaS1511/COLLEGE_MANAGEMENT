from flask import Blueprint, request, jsonify
from postgres_client import execute_query, execute_insert, execute_update, execute_delete
from datetime import datetime

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/admission', methods=['GET'])
def get_admission_analytics():
    """Get admission analytics"""
    try:
        # Get monthly admission trends
        monthly_query = """
            SELECT 
                DATE_TRUNC('month', created_at) as month,
                COUNT(*) as applications,
                COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
                COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected
            FROM admissions
            WHERE created_at >= NOW() - INTERVAL '12 months'
            GROUP BY DATE_TRUNC('month', created_at)
            ORDER BY month
        """
        
        monthly_trends = execute_query(monthly_query, fetch_all=True)
        
        # Get course-wise admission distribution
        course_query = """
            SELECT 
                c.name as course_name,
                COUNT(a.id) as total_applications,
                COUNT(CASE WHEN a.status = 'approved' THEN 1 END) as approved_applications,
                ROUND((COUNT(CASE WHEN a.status = 'approved' THEN 1 END) * 100.0 / COUNT(a.id)), 2) as approval_rate
            FROM admissions a
            LEFT JOIN courses c ON a.course_id = c.id
            GROUP BY c.id, c.name
            ORDER BY total_applications DESC
        """
        
        by_course = execute_query(course_query, fetch_all=True)
        
        # Get status distribution
        status_query = """
            SELECT 
                status,
                COUNT(*) as count,
                ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM admissions)), 2) as percentage
            FROM admissions
            GROUP BY status
            ORDER BY count DESC
        """
        
        status_distribution = execute_query(status_query, fetch_all=True)
        
        return jsonify({
            'success': True,
            'data': {
                'monthly_trends': monthly_trends,
                'by_course': by_course,
                'status_distribution': status_distribution
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analytics_bp.route('/performance', methods=['GET'])
def get_performance_analytics():
    """Get performance analytics"""
    try:
        # Get overall performance statistics
        stats_query = """
            SELECT 
                COUNT(DISTINCT s.id) as total_students,
                COUNT(DISTINCT e.id) as total_exams,
                COUNT(m.id) as total_marks_entries,
                COUNT(CASE WHEN m.marks_obtained >= e.passing_marks THEN 1 END) as passed_exams,
                ROUND(AVG(m.marks_obtained), 2) as average_marks,
                ROUND((COUNT(CASE WHEN m.marks_obtained >= e.passing_marks THEN 1 END) * 100.0 / COUNT(m.id)), 2) as pass_percentage
            FROM students s
            LEFT JOIN marks m ON s.id = m.student_id
            LEFT JOIN exams e ON m.exam_id = e.id
        """
        
        overall_stats = execute_query(stats_query, fetch_all=False)
        
        # Get course-wise performance
        course_query = """
            SELECT 
                c.name as course_name,
                COUNT(DISTINCT s.id) as student_count,
                COUNT(m.id) as total_marks,
                COUNT(CASE WHEN m.marks_obtained >= e.passing_marks THEN 1 END) as passed_marks,
                ROUND(AVG(m.marks_obtained), 2) as average_marks,
                ROUND((COUNT(CASE WHEN m.marks_obtained >= e.passing_marks THEN 1 END) * 100.0 / COUNT(m.id)), 2) as pass_percentage
            FROM courses c
            LEFT JOIN students s ON c.id = s.course_id
            LEFT JOIN marks m ON s.id = m.student_id
            LEFT JOIN exams e ON m.exam_id = e.id
            GROUP BY c.id, c.name
            ORDER BY pass_percentage DESC
        """
        
        by_course = execute_query(course_query, fetch_all=True)
        
        # Get grade distribution
        grade_query = """
            SELECT 
                m.grade,
                COUNT(*) as student_count,
                ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM marks)), 2) as percentage
            FROM marks m
            WHERE m.grade IS NOT NULL
            GROUP BY m.grade
            ORDER BY student_count DESC
        """
        
        grade_distribution = execute_query(grade_query, fetch_all=True)
        
        return jsonify({
            'success': True,
            'data': {
                'overall_stats': overall_stats,
                'by_course': by_course,
                'grade_distribution': grade_distribution
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analytics_bp.route('/utilization', methods=['GET'])
def get_utilization_analytics():
    """Get resource utilization analytics"""
    try:
        # Get classroom utilization
        classroom_query = """
            SELECT 
                r.name as room_name,
                r.capacity,
                COUNT(tt.id) as scheduled_classes,
                ROUND((COUNT(tt.id) * 100.0 / (SELECT COUNT(*) FROM timetable WHERE date BETWEEN CURRENT_DATE - INTERVAL '7 days' AND CURRENT_DATE)), 2) as utilization_rate
            FROM rooms r
            LEFT JOIN timetable tt ON r.id = tt.room_id 
                AND tt.date BETWEEN CURRENT_DATE - INTERVAL '7 days' AND CURRENT_DATE
            WHERE r.room_type = 'classroom'
            GROUP BY r.id, r.name, r.capacity
            ORDER BY utilization_rate DESC
        """
        
        classroom_utilization = execute_query(classroom_query, fetch_all=True)
        
        # Get hostel occupancy
        hostel_query = """
            SELECT 
                h.name as hostel_name,
                h.capacity,
                COUNT(ha.id) as occupied_rooms,
                COUNT(s.id) as total_students,
                ROUND((COUNT(s.id) * 100.0 / h.capacity), 2) as occupancy_rate
            FROM hostels h
            LEFT JOIN hostel_allocations ha ON h.id = ha.hostel_id
            LEFT JOIN students s ON ha.student_id = s.id
            GROUP BY h.id, h.name, h.capacity
            ORDER BY occupancy_rate DESC
        """
        
        hostel_occupancy = execute_query(hostel_query, fetch_all=True)
        
        # Get faculty workload
        faculty_query = """
            SELECT 
                f.name as faculty_name,
                f.designation,
                COUNT(DISTINCT tt.id) as scheduled_classes,
                COUNT(DISTINCT sa.subject_id) as assigned_subjects
            FROM faculty f
            LEFT JOIN timetable tt ON f.id = tt.faculty_id
            LEFT JOIN subject_assignments sa ON f.id = sa.faculty_id
            GROUP BY f.id, f.name, f.designation
            ORDER BY scheduled_classes DESC
        """
        
        faculty_workload = execute_query(faculty_query, fetch_all=True)
        
        return jsonify({
            'success': True,
            'data': {
                'classroom_utilization': classroom_utilization,
                'hostel_occupancy': hostel_occupancy,
                'faculty_workload': faculty_workload
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
