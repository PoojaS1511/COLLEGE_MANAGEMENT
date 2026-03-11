from flask import Blueprint, request, jsonify, g, current_app
from postgres_client import execute_query, execute_insert, execute_update, execute_delete
from datetime import datetime, timedelta
from functools import wraps
import uuid
import logging
import traceback

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

fees_bp = Blueprint('fees', __name__)

def auth_required(roles=None):
    """Custom auth_required decorator that uses PostgreSQL authentication"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Get the authorization header
            auth_header = request.headers.get('Authorization')
            if not auth_header:
                return jsonify({
                    'success': False,
                    'error': 'Authorization header is missing',
                    'message': 'No token provided'
                }), 401

            # Extract the token (remove 'Bearer ' prefix if present)
            token = auth_header.replace('Bearer ', '') if auth_header.startswith('Bearer ') else auth_header
            
            try:
                # Import auth_service for token verification
                from auth_service import AuthService
                auth_service = AuthService()
                
                # Verify the token with PostgreSQL
                user = auth_service.verify_token(token)
                
                if not user:
                    return jsonify({
                        'success': False,
                        'error': 'Invalid token',
                        'message': 'Failed to authenticate'
                    }), 401
                
                # Set the current user in the Flask global object
                g.user = {
                    'id': user.get('id'),
                    'email': user.get('email'),
                    'role': user.get('role', 'student')
                }
                
                # Check role-based access if roles are specified
                if roles and g.user['role'] not in roles:
                    return jsonify({
                        'success': False,
                        'error': 'Access denied',
                        'message': 'Insufficient permissions'
                    }), 403
                
                return f(*args, **kwargs)
                
            except Exception as e:
                logger.error(f"Authentication error: {str(e)}")
                return jsonify({
                    'success': False,
                    'error': 'Authentication failed',
                    'message': str(e)
                }), 401
                
        return decorated_function
    return decorator

# Fee Structure Management
@fees_bp.route('/fee-structure', methods=['POST'])
@auth_required(roles=['admin', 'faculty'])
def create_fee_structure():
    """Create a new fee structure"""
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
            'created_by': g.user['id'],
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        result = execute_insert('fee_structures', fee_structure_data)
        
        return jsonify({
            'success': True,
            'message': 'Fee structure created successfully',
            'data': result
        }), 201
        
    except Exception as e:
        logger.error(f"Error creating fee structure: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to create fee structure',
            'details': str(e)
        }), 500

@fees_bp.route('/fee-structure', methods=['GET'])
@auth_required()
def get_fee_structures():
    """Get all fee structures with optional filtering"""
    try:
        query = """
            SELECT fs.*, c.name as course_name, c.code as course_code,
                   p.full_name as created_by_name
            FROM fee_structures fs
            LEFT JOIN courses c ON fs.course_id = c.id
            LEFT JOIN profiles p ON fs.created_by = p.id
        """
        params = []
        conditions = []
        
        # Add filters if provided
        if request.args.get('academic_year'):
            conditions.append("fs.academic_year = %s")
            params.append(request.args.get('academic_year'))
        
        if request.args.get('course_id'):
            conditions.append("fs.course_id = %s")
            params.append(request.args.get('course_id'))
        
        if request.args.get('semester'):
            conditions.append("fs.semester = %s")
            params.append(request.args.get('semester'))
        
        if request.args.get('is_active'):
            conditions.append("fs.is_active = %s")
            params.append(request.args.get('is_active').lower() == 'true')
        
        if request.args.get('search'):
            search_term = request.args.get('search')
            conditions.append("(fs.name ILIKE %s OR fs.description ILIKE %s)")
            params.extend([f"%{search_term}%", f"%{search_term}%"])
        
        if conditions:
            query += " WHERE " + " AND ".join(conditions)
        
        query += " ORDER BY fs.created_at DESC"
        
        result = execute_query(query, params, fetch_all=True)
        
        return jsonify({
            'success': True,
            'data': result
        })
        
    except Exception as e:
        logger.error(f"Error fetching fee structures: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch fee structures',
            'details': str(e)
        }), 500

@fees_bp.route('/fee-structure/<fee_structure_id>', methods=['GET'])
@auth_required()
def get_fee_structure_by_id_endpoint(fee_structure_id):
    """Get a single fee structure by ID"""
    try:
        query = """
            SELECT fs.*, c.name as course_name, c.code as course_code,
                   p.full_name as created_by_name
            FROM fee_structures fs
            LEFT JOIN courses c ON fs.course_id = c.id
            LEFT JOIN profiles p ON fs.created_by = p.id
            WHERE fs.id = %s
        """
        
        result = execute_query(query, [fee_structure_id], fetch_all=False)
        
        if not result:
            return jsonify({
                'success': False,
                'error': 'Fee structure not found'
            }), 404
        
        return jsonify({
            'success': True,
            'data': result
        })
        
    except Exception as e:
        logger.error(f"Error fetching fee structure: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch fee structure',
            'details': str(e)
        }), 500

@fees_bp.route('/fee-structure/<fee_structure_id>', methods=['PUT'])
@auth_required(roles=['admin', 'faculty'])
def update_fee_structure(fee_structure_id):
    """Update an existing fee structure"""
    try:
        data = request.get_json()
        
        data['updated_at'] = datetime.utcnow().isoformat()
        data['updated_by'] = g.user['id']
        
        result = execute_update('fee_structures', fee_structure_id, data)
        
        if not result:
            return jsonify({
                'success': False,
                'error': 'Fee structure not found'
            }), 404
        
        return jsonify({
            'success': True,
            'message': 'Fee structure updated successfully',
            'data': result
        })
        
    except Exception as e:
        logger.error(f"Error updating fee structure: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to update fee structure',
            'details': str(e)
        }), 500

@fees_bp.route('/fee-structure/<fee_structure_id>', methods=['DELETE'])
@auth_required(roles=['admin'])
def delete_fee_structure(fee_structure_id):
    """Delete a fee structure"""
    try:
        # Check if there are any payments associated with this fee structure
        payments_query = "SELECT COUNT(*) as count FROM fee_payments WHERE fee_structure_id = %s"
        payments = execute_query(payments_query, [fee_structure_id], fetch_all=False)
        
        if payments and payments['count'] > 0:
            return jsonify({
                'success': False,
                'error': 'Cannot delete fee structure with associated payments'
            }), 400
        
        result = execute_delete('fee_structures', fee_structure_id)
        
        if not result:
            return jsonify({
                'success': False,
                'error': 'Fee structure not found'
            }), 404
        
        return jsonify({
            'success': True,
            'message': 'Fee structure deleted successfully'
        })
        
    except Exception as e:
        logger.error(f"Error deleting fee structure: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to delete fee structure',
            'details': str(e)
        }), 500

# Payment Management
@fees_bp.route('/payments', methods=['POST'])
@auth_required()
def create_payment():
    """Create a new fee payment"""
    try:
        data = request.get_json()
        
        required_fields = ['fee_structure_id', 'student_id', 'amount_paid']
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
        
        payment_data = {
            'id': str(uuid.uuid4()),
            'fee_structure_id': data['fee_structure_id'],
            'student_id': data['student_id'],
            'amount_paid': data['amount_paid'],
            'payment_method': data.get('payment_method', 'online'),
            'transaction_id': data.get('transaction_id'),
            'payment_date': datetime.utcnow().isoformat(),
            'status': data.get('status', 'completed'),
            'remarks': data.get('remarks', ''),
            'created_by': g.user['id'],
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        result = execute_insert('fee_payments', payment_data)
        
        return jsonify({
            'success': True,
            'message': 'Payment recorded successfully',
            'data': result
        }), 201
        
    except Exception as e:
        logger.error(f"Error creating payment: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to create payment',
            'details': str(e)
        }), 500

@fees_bp.route('/payments', methods=['GET'])
@auth_required()
def get_payments():
    """Get all payments with optional filtering"""
    try:
        query = """
            SELECT fp.*, fs.name as fee_structure_name, fs.academic_year,
                   s.name as student_name, s.register_number, s.email,
                   c.name as course_name, c.code as course_code,
                   p.full_name as created_by_name
            FROM fee_payments fp
            LEFT JOIN fee_structures fs ON fp.fee_structure_id = fs.id
            LEFT JOIN students s ON fp.student_id = s.id
            LEFT JOIN courses c ON s.course_id = c.id
            LEFT JOIN profiles p ON fp.created_by = p.id
        """
        params = []
        conditions = []
        
        # Add filters if provided
        if request.args.get('student_id'):
            conditions.append("fp.student_id = %s")
            params.append(request.args.get('student_id'))
        
        if request.args.get('fee_structure_id'):
            conditions.append("fp.fee_structure_id = %s")
            params.append(request.args.get('fee_structure_id'))
        
        if request.args.get('status'):
            conditions.append("fp.status = %s")
            params.append(request.args.get('status'))
        
        if request.args.get('payment_method'):
            conditions.append("fp.payment_method = %s")
            params.append(request.args.get('payment_method'))
        
        if request.args.get('academic_year'):
            conditions.append("fs.academic_year = %s")
            params.append(request.args.get('academic_year'))
        
        if request.args.get('date_from'):
            conditions.append("fp.payment_date >= %s")
            params.append(request.args.get('date_from'))
        
        if request.args.get('date_to'):
            conditions.append("fp.payment_date <= %s")
            params.append(request.args.get('date_to'))
        
        if conditions:
            query += " WHERE " + " AND ".join(conditions)
        
        query += " ORDER BY fp.payment_date DESC"
        
        result = execute_query(query, params, fetch_all=True)
        
        return jsonify({
            'success': True,
            'data': result
        })
        
    except Exception as e:
        logger.error(f"Error fetching payments: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch payments',
            'details': str(e)
        }), 500

@fees_bp.route('/payments/<payment_id>', methods=['GET'])
@auth_required()
def get_payment(payment_id):
    """Get a single payment by ID"""
    try:
        query = """
            SELECT fp.*, fs.name as fee_structure_name, fs.academic_year,
                   s.name as student_name, s.register_number, s.email,
                   c.name as course_name, c.code as course_code,
                   p.full_name as created_by_name
            FROM fee_payments fp
            LEFT JOIN fee_structures fs ON fp.fee_structure_id = fs.id
            LEFT JOIN students s ON fp.student_id = s.id
            LEFT JOIN courses c ON s.course_id = c.id
            LEFT JOIN profiles p ON fp.created_by = p.id
            WHERE fp.id = %s
        """
        
        result = execute_query(query, [payment_id], fetch_all=False)
        
        if not result:
            return jsonify({
                'success': False,
                'error': 'Payment not found'
            }), 404
        
        return jsonify({
            'success': True,
            'data': result
        })
        
    except Exception as e:
        logger.error(f"Error fetching payment: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch payment',
            'details': str(e)
        }), 500

@fees_bp.route('/payments/<payment_id>', methods=['PUT'])
@auth_required(roles=['admin', 'faculty'])
def update_payment(payment_id):
    """Update an existing payment"""
    try:
        data = request.get_json()
        
        data['updated_at'] = datetime.utcnow().isoformat()
        data['updated_by'] = g.user['id']
        
        result = execute_update('fee_payments', payment_id, data)
        
        if not result:
            return jsonify({
                'success': False,
                'error': 'Payment not found'
            }), 404
        
        return jsonify({
            'success': True,
            'message': 'Payment updated successfully',
            'data': result
        })
        
    except Exception as e:
        logger.error(f"Error updating payment: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to update payment',
            'details': str(e)
        }), 500

@fees_bp.route('/payments/<payment_id>/receipt', methods=['GET'])
@auth_required()
def get_payment_receipt(payment_id):
    """Generate payment receipt"""
    try:
        query = """
            SELECT fp.*, fs.name as fee_structure_name, fs.breakdown,
                   s.name as student_name, s.register_number, s.email, s.phone,
                   c.name as course_name, c.code as course_code,
                   p.full_name as created_by_name
            FROM fee_payments fp
            LEFT JOIN fee_structures fs ON fp.fee_structure_id = fs.id
            LEFT JOIN students s ON fp.student_id = s.id
            LEFT JOIN courses c ON s.course_id = c.id
            LEFT JOIN profiles p ON fp.created_by = p.id
            WHERE fp.id = %s
        """
        
        result = execute_query(query, [payment_id], fetch_all=False)
        
        if not result:
            return jsonify({
                'success': False,
                'error': 'Payment not found'
            }), 404
        
        # Generate receipt data
        receipt_data = {
            'receipt_number': f"RCP{datetime.now().strftime('%Y%m%d')}{payment_id[:8].upper()}",
            'payment': result,
            'generated_at': datetime.utcnow().isoformat(),
            'generated_by': g.user['full_name'] if hasattr(g.user, 'full_name') else g.user['email']
        }
        
        return jsonify({
            'success': True,
            'data': receipt_data
        })
        
    except Exception as e:
        logger.error(f"Error generating receipt: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to generate receipt',
            'details': str(e)
        }), 500

# Analytics and Reports
@fees_bp.route('/fee-analytics/collection-report', methods=['GET'])
@auth_required(roles=['admin', 'faculty'])
def get_fee_collection_report():
    """Get fee collection report"""
    try:
        academic_year = request.args.get('academic_year', datetime.now().year)
        
        # Get collection statistics
        stats_query = """
            SELECT 
                COUNT(*) as total_payments,
                SUM(amount_paid) as total_collected,
                AVG(amount_paid) as average_payment,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_payments,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_payments
            FROM fee_payments fp
            LEFT JOIN fee_structures fs ON fp.fee_structure_id = fs.id
            WHERE fs.academic_year = %s
        """
        
        stats = execute_query(stats_query, [academic_year], fetch_all=False)
        
        # Get monthly collection trends
        monthly_query = """
            SELECT 
                DATE_TRUNC('month', payment_date) as month,
                SUM(amount_paid) as monthly_total,
                COUNT(*) as payment_count
            FROM fee_payments fp
            LEFT JOIN fee_structures fs ON fp.fee_structure_id = fs.id
            WHERE fs.academic_year = %s
            GROUP BY DATE_TRUNC('month', payment_date)
            ORDER BY month
        """
        
        monthly = execute_query(monthly_query, [academic_year], fetch_all=True)
        
        # Get course-wise collection
        course_query = """
            SELECT 
                c.name as course_name,
                c.code as course_code,
                SUM(fp.amount_paid) as total_collected,
                COUNT(fp.id) as payment_count
            FROM fee_payments fp
            LEFT JOIN fee_structures fs ON fp.fee_structure_id = fs.id
            LEFT JOIN students s ON fp.student_id = s.id
            LEFT JOIN courses c ON s.course_id = c.id
            WHERE fs.academic_year = %s
            GROUP BY c.id, c.name, c.code
            ORDER BY total_collected DESC
        """
        
        by_course = execute_query(course_query, [academic_year], fetch_all=True)
        
        report_data = {
            'academic_year': academic_year,
            'statistics': stats,
            'monthly_trends': monthly,
            'course_wise': by_course
        }
        
        return jsonify({
            'success': True,
            'data': report_data
        })
        
    except Exception as e:
        logger.error(f"Error generating collection report: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to generate collection report',
            'details': str(e)
        }), 500

@fees_bp.route('/fee-analytics/defaulters', methods=['GET'])
@auth_required(roles=['admin', 'faculty'])
def get_fee_defaulters():
    """Get fee defaulters list"""
    try:
        academic_year = request.args.get('academic_year', datetime.now().year)
        
        query = """
            SELECT 
                s.id, s.name, s.register_number, s.email, s.phone,
                c.name as course_name, c.code as course_code,
                fs.name as fee_structure_name, fs.total_amount,
                COALESCE(SUM(fp.amount_paid), 0) as amount_paid,
                (fs.total_amount - COALESCE(SUM(fp.amount_paid), 0)) as balance_due,
                fs.due_date
            FROM students s
            LEFT JOIN courses c ON s.course_id = c.id
            LEFT JOIN fee_structures fs ON c.id = fs.course_id AND fs.academic_year = %s
            LEFT JOIN fee_payments fp ON s.id = fp.student_id AND fp.fee_structure_id = fs.id
            WHERE fs.is_active = true
            GROUP BY s.id, s.name, s.register_number, s.email, s.phone, 
                     c.id, c.name, c.code, fs.id, fs.name, fs.total_amount, fs.due_date
            HAVING (fs.total_amount - COALESCE(SUM(fp.amount_paid), 0)) > 0
            ORDER BY balance_due DESC
        """
        
        result = execute_query(query, [academic_year], fetch_all=True)
        
        return jsonify({
            'success': True,
            'data': result
        })
        
    except Exception as e:
        logger.error(f"Error fetching defaulters: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch defaulters',
            'details': str(e)
        }), 500

@fees_bp.route('/analytics/course/<int:course_id>/fees', methods=['GET'])
@auth_required(roles=['admin', 'faculty'])
def get_course_fee_analytics(course_id):
    """Get fee analytics for a specific course"""
    try:
        academic_year = request.args.get('academic_year', datetime.now().year)
        
        # Get course fee statistics
        stats_query = """
            SELECT 
                COUNT(DISTINCT s.id) as total_students,
                COUNT(DISTINCT CASE WHEN fp.id IS NOT NULL THEN s.id END) as paid_students,
                SUM(fs.total_amount) as total_fees_required,
                COALESCE(SUM(fp.amount_paid), 0) as total_collected,
                (SUM(fs.total_amount) - COALESCE(SUM(fp.amount_paid), 0)) as balance_due,
                ROUND((COALESCE(SUM(fp.amount_paid), 0) * 100.0 / NULLIF(SUM(fs.total_amount), 0)), 2) as collection_percentage
            FROM students s
            LEFT JOIN courses c ON s.course_id = c.id
            LEFT JOIN fee_structures fs ON c.id = fs.course_id AND fs.academic_year = %s AND fs.is_active = true
            LEFT JOIN fee_payments fp ON s.id = fp.student_id AND fp.fee_structure_id = fs.id
            WHERE c.id = %s
        """
        
        stats = execute_query(stats_query, [academic_year, course_id], fetch_all=False)
        
        # Get payment status distribution
        status_query = """
            SELECT 
                CASE 
                    WHEN COALESCE(SUM(fp.amount_paid), 0) >= fs.total_amount THEN 'fully_paid'
                    WHEN COALESCE(SUM(fp.amount_paid), 0) > 0 THEN 'partially_paid'
                    ELSE 'not_paid'
                END as payment_status,
                COUNT(*) as student_count
            FROM students s
            LEFT JOIN courses c ON s.course_id = c.id
            LEFT JOIN fee_structures fs ON c.id = fs.course_id AND fs.academic_year = %s AND fs.is_active = true
            LEFT JOIN fee_payments fp ON s.id = fp.student_id AND fp.fee_structure_id = fs.id
            WHERE c.id = %s
            GROUP BY 
                CASE 
                    WHEN COALESCE(SUM(fp.amount_paid), 0) >= fs.total_amount THEN 'fully_paid'
                    WHEN COALESCE(SUM(fp.amount_paid), 0) > 0 THEN 'partially_paid'
                    ELSE 'not_paid'
                END
        """
        
        status_distribution = execute_query(status_query, [academic_year, course_id], fetch_all=True)
        
        analytics_data = {
            'course_id': course_id,
            'academic_year': academic_year,
            'statistics': stats,
            'status_distribution': status_distribution
        }
        
        return jsonify({
            'success': True,
            'data': analytics_data
        })
        
    except Exception as e:
        logger.error(f"Error fetching course fee analytics: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch course fee analytics',
            'details': str(e)
        }), 500

@fees_bp.route('/analytics/student/<int:student_id>/fees', methods=['GET'])
@auth_required()
def get_student_fee_analytics(student_id):
    """Get fee analytics for a specific student"""
    try:
        academic_year = request.args.get('academic_year', datetime.now().year)
        
        # Get student fee summary
        summary_query = """
            SELECT 
                s.id, s.name, s.register_number, s.email,
                c.name as course_name, c.code as course_code,
                fs.name as fee_structure_name, fs.total_amount, fs.due_date,
                COALESCE(SUM(fp.amount_paid), 0) as amount_paid,
                (fs.total_amount - COALESCE(SUM(fp.amount_paid), 0)) as balance_due,
                CASE 
                    WHEN COALESCE(SUM(fp.amount_paid), 0) >= fs.total_amount THEN 'fully_paid'
                    WHEN COALESCE(SUM(fp.amount_paid), 0) > 0 THEN 'partially_paid'
                    ELSE 'not_paid'
                END as payment_status
            FROM students s
            LEFT JOIN courses c ON s.course_id = c.id
            LEFT JOIN fee_structures fs ON c.id = fs.course_id AND fs.academic_year = %s AND fs.is_active = true
            LEFT JOIN fee_payments fp ON s.id = fp.student_id AND fp.fee_structure_id = fs.id
            WHERE s.id = %s
            GROUP BY s.id, s.name, s.register_number, s.email, c.id, c.name, c.code, fs.id, fs.name, fs.total_amount, fs.due_date
        """
        
        summary = execute_query(summary_query, [academic_year, student_id], fetch_all=False)
        
        if not summary:
            return jsonify({
                'success': False,
                'error': 'Student fee data not found'
            }), 404
        
        # Get payment history
        history_query = """
            SELECT fp.*, fs.name as fee_structure_name
            FROM fee_payments fp
            LEFT JOIN fee_structures fs ON fp.fee_structure_id = fs.id
            WHERE fp.student_id = %s AND fs.academic_year = %s
            ORDER BY fp.payment_date DESC
        """
        
        payment_history = execute_query(history_query, [student_id, academic_year], fetch_all=True)
        
        analytics_data = {
            'student_id': student_id,
            'academic_year': academic_year,
            'summary': summary,
            'payment_history': payment_history
        }
        
        return jsonify({
            'success': True,
            'data': analytics_data
        })
        
    except Exception as e:
        logger.error(f"Error fetching student fee analytics: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch student fee analytics',
            'details': str(e)
        }), 500

@fees_bp.route('/students/<int:student_id>/fee-summary', methods=['GET'])
@auth_required()
def get_student_fee_summary(student_id):
    """Get comprehensive fee summary for a student"""
    try:
        academic_year = request.args.get('academic_year', datetime.now().year)
        
        # Get all fee structures applicable to the student
        structures_query = """
            SELECT fs.*, c.name as course_name, c.code as course_code
            FROM fee_structures fs
            LEFT JOIN students s ON s.course_id = fs.course_id
            LEFT JOIN courses c ON c.id = fs.course_id
            WHERE s.id = %s AND fs.academic_year = %s AND fs.is_active = true
        """
        
        structures = execute_query(structures_query, [student_id, academic_year], fetch_all=True)
        
        fee_summary = []
        
        for structure in structures:
            # Get payments for this fee structure
            payments_query = """
                SELECT fp.*
                FROM fee_payments fp
                WHERE fp.student_id = %s AND fp.fee_structure_id = %s
                ORDER BY fp.payment_date DESC
            """
            
            payments = execute_query(payments_query, [student_id, structure['id']], fetch_all=True)
            
            total_paid = sum(p['amount_paid'] for p in payments) if payments else 0
            balance_due = structure['total_amount'] - total_paid
            
            fee_item = {
                'fee_structure': structure,
                'payments': payments,
                'total_paid': total_paid,
                'balance_due': balance_due,
                'payment_status': 'fully_paid' if balance_due <= 0 else 'partially_paid' if total_paid > 0 else 'not_paid'
            }
            
            fee_summary.append(fee_item)
        
        return jsonify({
            'success': True,
            'data': {
                'student_id': student_id,
                'academic_year': academic_year,
                'fee_summary': fee_summary,
                'total_fees': sum(item['fee_structure']['total_amount'] for item in fee_summary),
                'total_paid': sum(item['total_paid'] for item in fee_summary),
                'total_balance': sum(item['balance_due'] for item in fee_summary)
            }
        })
        
    except Exception as e:
        logger.error(f"Error fetching student fee summary: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch student fee summary',
            'details': str(e)
        }), 500

@fees_bp.route('/receipts/<receipt_number>', methods=['GET'])
@auth_required()
def get_receipt(receipt_number):
    """Get receipt by receipt number"""
    try:
        # Extract payment ID from receipt number (format: RCPYYYYMMDDXXXXXXXX)
        if receipt_number.startswith('RCP') and len(receipt_number) >= 16:
            # Try to find payment by receipt number pattern
            query = """
                SELECT fp.*, fs.name as fee_structure_name, fs.breakdown,
                       s.name as student_name, s.register_number, s.email, s.phone,
                       c.name as course_name, c.code as course_code,
                       p.full_name as created_by_name
                FROM fee_payments fp
                LEFT JOIN fee_structures fs ON fp.fee_structure_id = fs.id
                LEFT JOIN students s ON fp.student_id = s.id
                LEFT JOIN courses c ON s.course_id = c.id
                LEFT JOIN profiles p ON fp.created_by = p.id
                WHERE fp.id LIKE %s OR fp.transaction_id = %s
            """
            
            search_pattern = f"%{receipt_number[12:]}%"
            result = execute_query(query, [search_pattern, receipt_number], fetch_all=False)
        else:
            # Search by transaction_id
            query = """
                SELECT fp.*, fs.name as fee_structure_name, fs.breakdown,
                       s.name as student_name, s.register_number, s.email, s.phone,
                       c.name as course_name, c.code as course_code,
                       p.full_name as created_by_name
                FROM fee_payments fp
                LEFT JOIN fee_structures fs ON fp.fee_structure_id = fs.id
                LEFT JOIN students s ON fp.student_id = s.id
                LEFT JOIN courses c ON s.course_id = c.id
                LEFT JOIN profiles p ON fp.created_by = p.id
                WHERE fp.transaction_id = %s
            """
            
            result = execute_query(query, [receipt_number], fetch_all=False)
        
        if not result:
            return jsonify({
                'success': False,
                'error': 'Receipt not found'
            }), 404
        
        receipt_data = {
            'receipt_number': receipt_number,
            'payment': result,
            'generated_at': datetime.utcnow().isoformat()
        }
        
        return jsonify({
            'success': True,
            'data': receipt_data
        })
        
    except Exception as e:
        logger.error(f"Error fetching receipt: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch receipt',
            'details': str(e)
        }), 500
