from functools import wraps
from flask import Blueprint, request, jsonify, current_app, render_template, make_response, send_file, url_for, g
import os
import logging
import io
import traceback
import pandas as pd  # type: ignore
from datetime import datetime, timedelta
from typing import Optional
from fpdf import FPDF
from xhtml2pdf import pisa
from typing import Dict, List, Optional, Any, Union, Callable, TypeVar, cast
from jinja2 import TemplateNotFound
from auth_decorators import token_required, student_required
from postgres_client import execute_query, execute_insert, execute_update, execute_delete

# Initialize the blueprint
student_dashboard_bp = Blueprint('student_dashboard', __name__)

# CORS configuration
ALLOWED_ORIGINS = [
    'http://localhost:3000', 
    'http://localhost:3001', 
    'http://127.0.0.1:3000', 
    'http://127.0.0.1:3001'
]

# Create a type variable to preserve function types
F = TypeVar('F', bound=Callable[..., Any])

def handle_errors(f):
    """Custom error handler decorator"""
    @wraps(f)
    def wrapper(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except Exception as e:
            logging.error(f"Error in {f.__name__}: {str(e)}")
            return jsonify({
                "success": False,
                "error": str(e)
            }), 500
    return wrapper

# Test endpoint (no auth required)
@student_dashboard_bp.route('/test', methods=['GET'])
def test_route():
    """
    Public test endpoint for the student dashboard.
    This endpoint is excluded from authentication for testing purposes.
    In production, this endpoint should be removed or properly secured.
    """
    return jsonify({
        "success": True,
        "message": "Student dashboard test endpoint is working!",
        "status": "active",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "note": "This is a public test endpoint. In production, ensure proper authentication is in place."
    }), 200

# Main student dashboard endpoint
@student_dashboard_bp.route('/<student_id>', methods=['GET'])
@handle_errors
def get_student_dashboard_route(student_id):
    """Get comprehensive student dashboard data"""
    try:
        # Get student basic information
        student_query = """
            SELECT s.*, c.name as course_name, c.code as course_code,
                   d.name as department_name, d.code as department_code
            FROM students s
            LEFT JOIN courses c ON s.course_id = c.id
            LEFT JOIN departments d ON c.department_id = d.id
            WHERE s.id = %s
        """
        
        student = execute_query(student_query, [student_id], fetch_all=False)
        
        if not student:
            return jsonify({
                'success': False,
                'error': 'Student not found'
            }), 404
        
        # Get academic information
        academic_query = """
            SELECT sub.name as subject_name, sub.code as subject_code, sub.credits,
                   sub.semester, sub.type as subject_type
            FROM subjects sub
            WHERE sub.course_id = %s
            ORDER BY sub.semester, sub.name
        """
        
        subjects = execute_query(academic_query, [student['course_id']], fetch_all=True)
        
        # Get attendance summary
        attendance_query = """
            SELECT 
                COUNT(*) as total_classes,
                COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_classes,
                ROUND((COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / COUNT(*)), 2) as attendance_percentage
            FROM attendance a
            WHERE a.student_id = %s
        """
        
        attendance_summary = execute_query(attendance_query, [student_id], fetch_all=False)
        
        # Get marks summary
        marks_query = """
            SELECT 
                COUNT(*) as total_exams,
                COUNT(CASE WHEN m.marks_obtained >= e.passing_marks THEN 1 END) as passed_exams,
                ROUND(AVG(m.marks_obtained), 2) as average_marks,
                MAX(m.marks_obtained) as highest_marks,
                MIN(m.marks_obtained) as lowest_marks,
                ROUND((COUNT(CASE WHEN m.marks_obtained >= e.passing_marks THEN 1 END) * 100.0 / COUNT(*)), 2) as pass_percentage
            FROM marks m
            LEFT JOIN exams e ON m.exam_id = e.id
            WHERE m.student_id = %s
        """
        
        marks_summary = execute_query(marks_query, [student_id], fetch_all=False)
        
        # Get fees summary
        fees_query = """
            SELECT 
                fs.total_amount,
                COALESCECE(SUM(fp.amount_paid), 0) as amount_paid,
                (fs.total_amount - COALESCE(SUM(fp.amount_paid), 0)) as balance_due,
                CASE 
                    WHEN COALESCE(SUM(fp.amount_paid), 0) >= fs.total_amount THEN 'fully_paid'
                    WHEN COALESCE(SUM(fp.amount_paid), 0) > 0 THEN 'partially_paid'
                    ELSE 'not_paid'
                END as payment_status
            FROM fee_structures fs
            LEFT JOIN students s ON s.course_id = fs.course_id AND fs.academic_year = %s
            LEFT JOIN fee_payments fp ON s.id = fp.student_id AND fp.fee_structure_id = fs.id
            WHERE s.id = %s AND fs.is_active = true
            GROUP BY fs.id, fs.total_amount
        """
        
        current_year = datetime.now().year
        fees_summary = execute_query(fees_query, [current_year, student_id], fetch_all=False)
        
        # Get recent notifications
        notifications_query = """
            SELECT n.title, n.message, n.created_at, n.priority
            FROM user_notifications un
            LEFT JOIN notifications n ON un.notification_id = n.id
            WHERE un.user_id = %s
            ORDER BY un.created_at DESC
            LIMIT 5
        """
        
        notifications = execute_query(notifications_query, [student['id']], fetch_all=True)
        
        # Get upcoming exams
        exams_query = """
            SELECT e.name, e.date, e.start_time, e.duration, e.venue,
                   sub.name as subject_name, sub.code as subject_code
            FROM exams e
            LEFT JOIN subjects sub ON e.subject_id = sub.id
            LEFT JOIN student_subjects ss ON sub.id = ss.subject_id
            WHERE ss.student_id = %s AND e.date >= CURRENT_DATE
            ORDER BY e.date ASC
            LIMIT 5
        """
        
        upcoming_exams = execute_query(exams_query, [student_id], fetch_all=True)
        
        # Get timetable for today
        today = datetime.now().strftime('%Y-%m-%d')
        timetable_query = """
            SELECT tt.*, sub.name as subject_name, sub.code as subject_code,
                   r.name as room_name, r.building
            FROM timetable tt
            LEFT JOIN subjects sub ON tt.subject_id = sub.id
            LEFT JOIN rooms r ON tt.room_id = r.id
            LEFT JOIN student_subjects ss ON sub.id = ss.subject_id
            WHERE ss.student_id = %s AND tt.date = %s
            ORDER BY tt.start_time
        """
        
        timetable_today = execute_query(timetable_query, [student_id, today], fetch_all=True)
        
        dashboard_data = {
            'student': student,
            'subjects': subjects,
            'attendance_summary': attendance_summary or {
                'total_classes': 0,
                'present_classes': 0,
                'attendance_percentage': 0
            },
            'marks_summary': marks_summary or {
                'total_exams': 0,
                'passed_exams': 0,
                'average_marks': 0,
                'highest_marks': 0,
                'lowest_marks': 0,
                'pass_percentage': 0
            },
            'fees_summary': fees_summary or {
                'total_amount': 0,
                'amount_paid': 0,
                'balance_due': 0,
                'payment_status': 'not_paid'
            },
            'notifications': notifications,
            'upcoming_exams': upcoming_exams,
            'timetable_today': timetable_today
        }
        
        return jsonify({
            'success': True,
            'data': dashboard_data
        })
        
    except Exception as e:
        logging.error(f"Error in get_student_dashboard_route: {str(e)}")
        logging.error(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@student_dashboard_bp.route('/<student_id>/exams', methods=['GET'])
@handle_errors
def get_student_exams_route(student_id):
    """Get student's exam information"""
    try:
        # Get student's subjects
        subjects_query = """
            SELECT sub.id, sub.name, sub.code, sub.credits, sub.semester
            FROM subjects sub
            LEFT JOIN student_subjects ss ON sub.id = ss.subject_id
            WHERE ss.student_id = %s
            ORDER BY sub.semester, sub.name
        """
        
        subjects = execute_query(subjects_query, [student_id], fetch_all=True)
        
        # Get exams for each subject
        exams_data = []
        for subject in subjects:
            exam_query = """
                SELECT e.*, m.marks_obtained, m.max_marks, m.grade
                FROM exams e
                LEFT JOIN marks m ON e.id = m.exam_id AND m.student_id = %s
                WHERE e.subject_id = %s
                ORDER BY e.date DESC
            """
            
            subject_exams = execute_query(exam_query, [student_id, subject['id']], fetch_all=True)
            
            exams_data.append({
                'subject': subject,
                'exams': subject_exams
            })
        
        return jsonify({
            'success': True,
            'data': exams_data
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@student_dashboard_bp.route('/<student_id>/subjects', methods=['GET'])
@handle_errors
def get_student_subjects_route(student_id):
    """Get student's subject information"""
    try:
        query = """
            SELECT 
                sub.id, sub.name, sub.code, sub.credits, sub.semester, sub.type,
                sub.description, sub.faculty_id,
                f.name as faculty_name, f.designation,
                COUNT(e.id) as exam_count,
                COUNT(m.id) as marks_count,
                ROUND(AVG(m.marks_obtained), 2) as average_marks
            FROM subjects sub
            LEFT JOIN student_subjects ss ON sub.id = ss.subject_id
            LEFT JOIN faculty f ON sub.faculty_id = f.id
            LEFT JOIN exams e ON sub.id = e.subject_id
            LEFT JOIN marks m ON e.id = m.exam_id AND m.student_id = %s
            WHERE ss.student_id = %s
            GROUP BY sub.id, sub.name, sub.code, sub.credits, sub.semester, sub.type,
                     sub.description, sub.faculty_id, f.name, f.designation
            ORDER BY sub.semester, sub.name
        """
        
        subjects = execute_query(query, [student_id], fetch_all=True)
        
        return jsonify({
            'success': True,
            'data': subjects
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@student_dashboard_bp.route('/fee-payments', methods=['POST'])
@handle_errors
def create_fee_payment_route():
    """Create a fee payment record"""
    try:
        data = request.get_json()
        
        required_fields = ['student_id', 'fee_structure_id', 'amount_paid', 'payment_method']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Get fee structure details
        fee_structure_query = "SELECT * FROM fee_structures WHERE id = %s"
        fee_structure = execute_query(fee_structure_query, [data['fee_structure_id']], fetch_all=False)
        
        if not fee_structure:
            return jsonify({
                'success': False,
                'error': 'Fee structure not found'
            }), 404
        
        # Create payment record
        payment_data = {
            'id': str(uuid.uuid4()),
            'fee_structure_id': data['fee_structure_id'],
            'student_id': data['student_id'],
            'amount_paid': data['amount_paid'],
            'payment_method': data['payment_method'],
            'transaction_id': data.get('transaction_id'),
            'payment_date': datetime.utcnow().isoformat(),
            'status': data.get('status', 'completed'),
            'remarks': data.get('remarks', ''),
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        payment = execute_insert('fee_payments', payment_data)
        
        return jsonify({
            'success': True,
            'message': 'Payment recorded successfully',
            'data': payment
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@student_dashboard_bp.route('/fee-payments', methods=['GET'])
@handle_errors
def get_fee_payments_route():
    """Get fee payment records"""
    try:
        student_id = request.args.get('student_id')
        if not student_id:
            return jsonify({
                'success': False,
                'error': 'Student ID is required'
            }), 400
        
        query = """
            SELECT fp.*, fs.name as fee_structure_name, fs.academic_year,
                   s.name as student_name, s.register_number,
                   c.name as course_name, c.code as course_code
            FROM fee_payments fp
            LEFT JOIN fee_structures fs ON fp.fee_structure_id = fs.id
            LEFT JOIN students s ON fp.student_id = s.id
            LEFT JOIN courses c ON s.course_id = c.id
            WHERE fp.student_id = %s
            ORDER BY fp.payment_date DESC
        """
        
        payments = execute_query(query, [student_id], fetch_all=True)
        
        return jsonify({
            'success': True,
            'data': payments
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@student_dashboard_bp.route('/fee-structures', methods=['POST'])
@handle_errors
def create_fee_structure_route():
    """Create a fee structure"""
    try:
        data = request.get_json()
        
        required_fields = ['name', 'academic_year', 'total_amount']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        fee_structure_data = {
            'id': str(uuid.uuid4()),
            'name': data['name'],
            'description': data.get('description', ''),
            'academic_year': data['academic_year'],
            'course_id': data.get('course_id'),
            'semester': data.get('semester'),
            'total_amount': data['total_amount'],
            'breakdown': data.get('breakdown', {}),
            'due_date': data.get('due_date'),
            'late_fee': data.get('late_fee', 0),
            'late_fee_percentage': data.get('late_fee_percentage', 0),
            'installment_allowed': data.get('installment_allowed', False),
            'max_installments': data.get('max_installments', 1),
            'is_active': data.get('is_active', True),
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        fee_structure = execute_insert('fee_structures', fee_structure_data)
        
        return jsonify({
            'success': True,
            'message': 'Fee structure created successfully',
            'data': fee_structure
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@student_dashboard_bp.route('/fee-structures', methods=['GET'])
@handle_errors
def get_fee_structures_route():
    """Get fee structures"""
    try:
        query = """
            SELECT fs.*, c.name as course_name, c.code as course_code
            FROM fee_structures fs
            LEFT JOIN courses c ON fs.course_id = c.id
            WHERE fs.is_active = true
            ORDER BY fs.academic_year DESC, fs.name
        """
        
        fee_structures = execute_query(query, fetch_all=True)
        
        return jsonify({
            'success': True,
            'data': fee_structures
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@student_dashboard_bp.route('/fee-summary', methods=['GET'])
@handle_errors
def get_fee_summary_route():
    """Get fee summary for a student"""
    try:
        student_id = request.args.get('student_id')
        academic_year = request.args.get('academic_year', datetime.now().year)
        
        if not student_id:
            return jsonify({
                'success': False,
                'error': 'Student ID is required'
            }), 400
        
        # Get all fee structures for the student
        structures_query = """
            SELECT fs.*, c.name as course_name, c.code as course_code
            FROM fee_structures fs
            LEFT JOIN students s ON s.course_id = fs.course_id
            LEFT JOIN courses c ON c.id = fs.course_id
            WHERE s.id = %s AND fs.academic_year = %s AND fs.is_active = true
        """
        
        structures = execute_query(structures_query, [student_id, academic_year], fetch_all=True)
        
        fee_summary = []
        total_fees = 0
        total_paid = 0
        total_balance = 0
        
        for structure in structures:
            # Get payments for this fee structure
            payments_query = """
                SELECT fp.amount_paid
                FROM fee_payments fp
                WHERE fp.student_id = %s AND fp.fee_structure_id = %s
                ORDER BY fp.payment_date DESC
            """
            
            payments = execute_query(payments_query, [student_id, structure['id']], fetch_all=True)
            
            total_paid_for_structure = sum(p['amount_paid'] for p in payments) if payments else 0
            balance_due = structure['total_amount'] - total_paid_for_structure
            
            fee_item = {
                'fee_structure': structure,
                'payments': payments,
                'total_paid': total_paid_for_structure,
                'balance_due': balance_due,
                'payment_status': 'fully_paid' if balance_due <= 0 else 'partially_paid' if total_paid_for_structure > 0 else 'not_paid'
            }
            
            fee_summary.append(fee_item)
            total_fees += structure['total_amount']
            total_paid += total_paid_for_structure
            total_balance += balance_due
        
        return jsonify({
            'success': True,
            'data': {
                'student_id': student_id,
                'academic_year': academic_year,
                'fee_summary': fee_summary,
                'total_fees': total_fees,
                'total_paid': total_paid,
                'total_balance': total_balance
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@student_dashboard_bp.route('/hall-ticket', methods=['GET'])
@handle_errors
def get_hall_ticket_route():
    """Get student hall ticket information"""
    try:
        student_id = request.args.get('student_id')
        exam_id = request.args.get('exam_id')
        
        if not student_id or not exam_id:
            return jsonify({
                'success': False,
                'error': 'Student ID and Exam ID are required'
            }), 400
        
        # Get student details
        student_query = """
            SELECT s.*, c.name as course_name, c.code as course_code
            FROM students s
            LEFT JOIN courses c ON s.course_id = c.id
            WHERE s.id = %s
        """
        
        student = execute_query(student_query, [student_id], fetch_all=False)
        
        if not student:
            return jsonify({
                'success': False,
                'error': 'Student not found'
            }), 404
        
        # Get exam details
        exam_query = """
            SELECT e.*, sub.name as subject_name, sub.code as subject_code
            FROM exams e
            LEFT JOIN subjects sub ON e.subject_id = sub.id
            WHERE e.id = %s
        """
        
        exam = execute_query(exam_query, [exam_id], fetch_all=False)
        
        if not exam:
            return jsonify({
                'success': False,
                'error': 'Exam not found'
            }), 404
        
        # Generate hall ticket
        hall_ticket = {
            'hall_ticket_number': f"HT{datetime.now().year}{student_id:04d}{exam_id:03d}",
            'student': student,
            'exam': exam,
            'exam_center': 'Cube Arts and Engineering College',
            'instructions': [
                'Bring this hall ticket to the examination hall',
                'Carry a valid photo ID proof',
                'Report to the exam hall 30 minutes before the exam',
                'Mobile phones are not allowed in the exam hall',
                'Use only blue/black pen for writing'
            ],
            'generated_at': datetime.now().isoformat()
        }
        
        return jsonify({
            'success': True,
            'data': hall_ticket
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
