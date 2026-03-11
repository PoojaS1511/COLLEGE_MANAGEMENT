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

finance_bp = Blueprint('finance', __name__)

# Performance optimizations for large datasets (2000+ records)
DEFAULT_PAGE_SIZE = 100  # Increased for better performance with large datasets
MAX_PAGE_SIZE = 500   # Maximum records per request

def auth_required(roles=None):
    """Custom auth_required decorator that uses PostgreSQL authentication"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Get authorization header
            auth_header = request.headers.get('Authorization')
            if not auth_header:
                return jsonify({
                    'success': False,
                    'error': 'Authorization header is missing',
                    'message': 'No token provided'
                }), 401

            # Extract token (remove 'Bearer ' prefix if present)
            token = auth_header.replace('Bearer ', '') if auth_header.startswith('Bearer ') else auth_header
            
            try:
                # Verify token from PostgreSQL users table
                query = "SELECT id, email, role, user_metadata FROM users WHERE auth_token = %s"
                user = execute_query(query, [token], fetch_all=False)
                
                if not user:
                    return jsonify({
                        'success': False,
                        'error': 'Invalid token',
                        'message': 'Failed to authenticate'
                    }), 401
                
                # Set current user in Flask global object
                g.user = {
                    'id': user.get('id'),
                    'email': user.get('email'),
                    'role': user.get('role', 'student')
                }
                
                # Check role-based access if roles are specified
                if roles and g.user['role'] not in roles:
                    return jsonify({
                        'success': False,
                        'error': 'Insufficient permissions',
                        'message': f'Access denied. Required roles: {roles}'
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

def handle_database_error(func):
    """Decorator to handle database errors"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            logger.error(f"Database error in {func.__name__}: {str(e)}")
            logger.error(traceback.format_exc())
            return jsonify({
                'success': False,
                'error': 'Database operation failed',
                'message': str(e)
            }), 500
    return wrapper

# ==================== DASHBOARD ENDPOINTS ====================

@finance_bp.route('/dashboard/metrics', methods=['GET'])
@auth_required(roles=['admin', 'faculty', 'staff'])
@handle_database_error
def get_dashboard_metrics():
    """Get dashboard KPI metrics"""
    try:
        # Get total revenue from finance_studentfees table
        fees_query = "SELECT COALESCE(SUM(total_fee), 0) as total_revenue, COALESCE(SUM(pending_amount), 0) as total_pending FROM finance_studentfees"
        fees_result = execute_query(fees_query, fetch_all=False)
        
        total_revenue = fees_result.get('total_revenue', 0) if fees_result else 0
        total_pending = fees_result.get('total_pending', 0) if fees_result else 0
        
        # Get total expenses from finance_expense table
        expenses_query = "SELECT COALESCE(SUM(amount), 0) as total_expenses FROM finance_expense"
        expenses_result = execute_query(expenses_query, fetch_all=False)
        total_expenses = expenses_result.get('total_expenses', 0) if expenses_result else 0
        
        # Get budget data from finance_budgetallocation table
        budget_query = "SELECT COALESCE(SUM(allocated_amount), 0) as total_allocated, COALESCE(SUM(used_amount), 0) as total_used FROM finance_budgetallocation"
        budget_result = execute_query(budget_query, fetch_all=False)
        total_allocated = budget_result.get('total_allocated', 0) if budget_result else 0
        total_used = budget_result.get('total_used', 0) if budget_result else 0
        
        net_balance = total_revenue - total_expenses
        
        return jsonify({
            'success': True,
            'data': {
                'totalRevenue': total_revenue,
                'totalExpenses': total_expenses,
                'netBalance': net_balance,
                'pendingDues': total_pending,
                'totalAllocatedBudget': total_allocated,
                'totalUsedBudget': total_used,
                'totalRemainingBudget': total_allocated - total_used
            }
        })
        
    except Exception as e:
        logger.error(f"Error getting dashboard metrics: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch dashboard metrics',
            'message': str(e)
        }), 500

# ==================== STUDENT FEES ENDPOINTS ====================

@finance_bp.route('/student-fees', methods=['GET'])
@auth_required(roles=['admin', 'faculty', 'staff'])
@handle_database_error
def get_student_fees():
    """Get all student fees with optional filtering"""
    try:
        # Get query parameters
        department = request.args.get('department')
        year = request.args.get('year')
        search = request.args.get('search')
        page = int(request.args.get('page', 1))
        limit = min(int(request.args.get('limit', DEFAULT_PAGE_SIZE)), MAX_PAGE_SIZE)
        
        # Build query with filters
        query = "SELECT * FROM finance_studentfees WHERE 1=1"
        params = []
        
        if department:
            query += " AND department = %s"
            params.append(department)
        if year:
            query += " AND year = %s"
            params.append(year)
        if search:
            query += " AND (student_name ILIKE %s OR student_id ILIKE %s)"
            search_pattern = f"%{search}%"
            params.extend([search_pattern, search_pattern])
        
        # Get total count
        count_query = query.replace("SELECT *", "SELECT COUNT(*)")
        try:
            total_count = execute_query(count_query, params, fetch_all=False)
            total = total_count.get('count', 0) if total_count else 0
        except:
            total = 0
        
        # Add pagination
        query += f" ORDER BY created_at DESC LIMIT {limit} OFFSET {(page - 1) * limit}"
        
        result = execute_query(query, params, fetch_all=True)
        
        # Get summary data
        summary_query = "SELECT COALESCE(SUM(total_fee), 0) as total_fees, COALESCE(SUM(paid_amount), 0) as total_paid, COALESCE(SUM(pending_amount), 0) as total_pending FROM finance_studentfees"
        summary = execute_query(summary_query, fetch_all=False)
        
        return jsonify({
            'success': True,
            'data': result if result else [],
            'summary': {
                'totalFees': summary.get('total_fees', 0) if summary else 0,
                'totalPaid': summary.get('total_paid', 0) if summary else 0,
                'totalPending': summary.get('total_pending', 0) if summary else 0
            }
        })
        
    except Exception as e:
        logger.error(f"Error getting student fees: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch student fees',
            'message': str(e)
        }), 500

@finance_bp.route('/student-fees', methods=['POST'])
@auth_required(roles=['admin', 'staff'])
@handle_database_error
def create_student_fee():
    """Create a new student fee record"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['student_id', 'student_name', 'department', 'year', 'total_fee']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Calculate pending amount
        paid_amount = data.get('paid_amount', 0)
        total_fee = data.get('total_fee', 0)
        pending_amount = total_fee - paid_amount
        
        # Create fee record
        fee_data = {
            'id': str(uuid.uuid4()),
            'student_id': data['student_id'],
            'student_name': data['student_name'],
            'department': data['department'],
            'year': data['year'],
            'total_fee': total_fee,
            'paid_amount': paid_amount,
            'pending_amount': pending_amount,
            'payment_date': data.get('payment_date'),
            'payment_status': data.get('payment_status', 'pending'),
            'created_at': datetime.now().isoformat(),
            'created_by': g.user.get('id', 'system')
        }
        
        result = execute_insert('finance_studentfees', fee_data)
        
        if result:
            return jsonify({
                'success': True,
                'data': result,
                'message': 'Student fee record created successfully'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to create student fee record'
            }), 500
            
    except Exception as e:
        logger.error(f"Error creating student fee: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to create student fee record',
            'message': str(e)
        }), 500

@finance_bp.route('/student-fees/<fee_id>', methods=['PUT'])
@auth_required(roles=['admin', 'staff'])
@handle_database_error
def update_student_fee(fee_id):
    """Update an existing student fee record"""
    try:
        data = request.get_json()
        
        # Calculate pending amount if fee amounts are being updated
        if 'total_fee' in data or 'paid_amount' in data:
            current_query = "SELECT total_fee, paid_amount FROM finance_studentfees WHERE id = %s"
            current = execute_query(current_query, [fee_id], fetch_all=False)
            
            if current:
                total_fee = data.get('total_fee', current.get('total_fee', 0))
                paid_amount = data.get('paid_amount', current.get('paid_amount', 0))
                data['pending_amount'] = total_fee - paid_amount
        
        # Add updated timestamp
        data['updated_at'] = datetime.now().isoformat()
        data['updated_by'] = g.user.get('id', 'system')
        
        result = execute_update('finance_studentfees', fee_id, data)
        
        if result:
            return jsonify({
                'success': True,
                'data': result,
                'message': 'Student fee record updated successfully'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Fee record not found'
            }), 404
            
    except Exception as e:
        logger.error(f"Error updating student fee: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to update student fee record',
            'message': str(e)
        }), 500

@finance_bp.route('/student-fees/<fee_id>', methods=['DELETE'])
@auth_required(roles=['admin', 'staff'])
@handle_database_error
def delete_student_fee(fee_id):
    """Delete a student fee record"""
    try:
        success = execute_delete('finance_studentfees', fee_id)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Student fee record deleted successfully'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Fee record not found'
            }), 404
            
    except Exception as e:
        logger.error(f"Error deleting student fee: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to delete student fee record',
            'message': str(e)
        }), 500

# ==================== STAFF PAYROLL ENDPOINTS ====================

@finance_bp.route('/api/finance/staff-payroll', methods=['GET'])
@auth_required(roles=['admin', 'faculty', 'staff'])
@handle_database_error
def get_staff_payroll():
    """Get all staff payroll with optional filtering"""
    try:
        # Get query parameters
        department = request.args.get('department')
        search = request.args.get('search')
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 50))
        
        # Build query with filters
        query = "SELECT * FROM finance_staffpayroll WHERE 1=1"
        params = []
        
        if department:
            query += " AND department = %s"
            params.append(department)
        if search:
            query += " AND (staff_name ILIKE %s OR staff_id ILIKE %s)"
            search_pattern = f"%{search}%"
            params.extend([search_pattern, search_pattern])
        
        # Get total count
        count_query = query.replace("SELECT *", "SELECT COUNT(*)")
        try:
            total_count = execute_query(count_query, params, fetch_all=False)
            total = total_count.get('count', 0) if total_count else 0
        except:
            total = 0
        
        # Add pagination
        query += f" ORDER BY created_at DESC LIMIT {limit} OFFSET {(page - 1) * limit}"
        
        result = execute_query(query, params, fetch_all=True)
        
        # Get summary data
        summary_query = "SELECT COALESCE(SUM(net_salary), 0) as total_payroll, COUNT(*) as staff_count FROM finance_staffpayroll"
        summary = execute_query(summary_query, fetch_all=False)
        
        total_payroll = summary.get('total_payroll', 0) if summary else 0
        staff_count = summary.get('staff_count', 0) if summary else 0
        
        return jsonify({
            'success': True,
            'data': result if result else [],
            'summary': {
                'totalMonthlyPayroll': total_payroll,
                'totalStaffCount': staff_count,
                'averageSalary': total_payroll / staff_count if staff_count > 0 else 0
            }
        })
        
    except Exception as e:
        logger.error(f"Error getting staff payroll: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch staff payroll',
            'message': str(e)
        }), 500

@finance_bp.route('/api/finance/staff-payroll', methods=['POST'])
@auth_required(roles=['admin', 'staff'])
@handle_database_error
def create_staff_payroll():
    """Create a new staff payroll record"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['staff_id', 'staff_name', 'department', 'role', 'base_salary']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Calculate net salary
        base_salary = data.get('base_salary', 0)
        allowance = data.get('allowance', 0)
        deduction = data.get('deduction', 0)
        net_salary = base_salary + allowance - deduction
        
        # Create payroll record
        payroll_data = {
            'id': str(uuid.uuid4()),
            'staff_id': data['staff_id'],
            'staff_name': data['staff_name'],
            'department': data['department'],
            'role': data['role'],
            'base_salary': base_salary,
            'allowance': allowance,
            'deduction': deduction,
            'net_salary': net_salary,
            'payment_date': data.get('payment_date'),
            'payment_status': data.get('payment_status', 'pending'),
            'created_at': datetime.now().isoformat(),
            'created_by': g.user.get('id', 'system')
        }
        
        result = execute_insert('finance_staffpayroll', payroll_data)
        
        if result:
            return jsonify({
                'success': True,
                'data': result,
                'message': 'Staff payroll record created successfully'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to create staff payroll record'
            }), 500
            
    except Exception as e:
        logger.error(f"Error creating staff payroll: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to create staff payroll record',
            'message': str(e)
        }), 500

@finance_bp.route('/api/finance/staff-payroll/<payroll_id>', methods=['PUT'])
@auth_required(roles=['admin', 'staff'])
@handle_database_error
def update_staff_payroll(payroll_id):
    """Update an existing staff payroll record"""
    try:
        data = request.get_json()
        
        # Calculate net salary if salary amounts are being updated
        if 'base_salary' in data or 'allowance' in data or 'deduction' in data:
            current_query = "SELECT base_salary, allowance, deduction FROM finance_staffpayroll WHERE id = %s"
            current = execute_query(current_query, [payroll_id], fetch_all=False)
            
            if current:
                base_salary = data.get('base_salary', current.get('base_salary', 0))
                allowance = data.get('allowance', current.get('allowance', 0))
                deduction = data.get('deduction', current.get('deduction', 0))
                data['net_salary'] = base_salary + allowance - deduction
        
        # Add updated timestamp
        data['updated_at'] = datetime.now().isoformat()
        data['updated_by'] = g.user.get('id', 'system')
        
        result = execute_update('finance_staffpayroll', payroll_id, data)
        
        if result:
            return jsonify({
                'success': True,
                'data': result,
                'message': 'Staff payroll record updated successfully'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Payroll record not found'
            }), 404
            
    except Exception as e:
        logger.error(f"Error updating staff payroll: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to update staff payroll record',
            'message': str(e)
        }), 500

@finance_bp.route('/api/finance/staff-payroll/<payroll_id>', methods=['DELETE'])
@auth_required(roles=['admin', 'staff'])
@handle_database_error
def delete_staff_payroll(payroll_id):
    """Delete a staff payroll record"""
    try:
        success = execute_delete('finance_staffpayroll', payroll_id)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Staff payroll record deleted successfully'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Payroll record not found'
            }), 404
            
    except Exception as e:
        logger.error(f"Error deleting staff payroll: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to delete staff payroll record',
            'message': str(e)
        }), 500

# ==================== EXPENSES ENDPOINTS ====================

@finance_bp.route('/api/finance/expenses', methods=['GET'])
@auth_required(roles=['admin', 'faculty', 'staff'])
@handle_database_error
def get_expenses():
    """Get all expenses with optional filtering"""
    try:
        # Get query parameters
        department = request.args.get('department')
        category = request.args.get('category')
        search = request.args.get('search')
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 50))
        
        # Build query with filters
        query = "SELECT * FROM finance_expense WHERE 1=1"
        params = []
        
        if department:
            query += " AND department = %s"
            params.append(department)
        if category:
            query += " AND category = %s"
            params.append(category)
        if search:
            query += " AND (vendor ILIKE %s OR expense_id ILIKE %s)"
            search_pattern = f"%{search}%"
            params.extend([search_pattern, search_pattern])
        
        # Get total count
        count_query = query.replace("SELECT *", "SELECT COUNT(*)")
        try:
            total_count = execute_query(count_query, params, fetch_all=False)
            total = total_count.get('count', 0) if total_count else 0
        except:
            total = 0
        
        # Add pagination
        query += f" ORDER BY created_at DESC LIMIT {limit} OFFSET {(page - 1) * limit}"
        
        result = execute_query(query, params, fetch_all=True)
        
        # Get summary data
        summary_query = "SELECT COALESCE(SUM(amount), 0) as total_expenses FROM finance_expense"
        summary = execute_query(summary_query, fetch_all=False)
        
        total_expenses = summary.get('total_expenses', 0) if summary else 0
        
        return jsonify({
            'success': True,
            'data': result if result else [],
            'summary': {
                'totalExpenses': total_expenses,
                'paidExpenses': 0,
                'pendingExpenses': 0
            }
        })
        
    except Exception as e:
        logger.error(f"Error getting expenses: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch expenses',
            'message': str(e)
        }), 500

@finance_bp.route('/api/finance/expenses', methods=['POST'])
@auth_required(roles=['admin', 'staff'])
@handle_database_error
def create_expense():
    """Create a new expense record"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['expense_id', 'department', 'category', 'amount', 'vendor']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Create expense record
        expense_data = {
            'id': str(uuid.uuid4()),
            'expense_id': data['expense_id'],
            'department': data['department'],
            'category': data['category'],
            'amount': data['amount'],
            'vendor': data['vendor'],
            'date': data.get('date'),
            'payment_status': data.get('payment_status', 'pending'),
            'description': data.get('description', ''),
            'created_at': datetime.now().isoformat(),
            'created_by': g.user.get('id', 'system')
        }
        
        result = execute_insert('finance_expense', expense_data)
        
        if result:
            return jsonify({
                'success': True,
                'data': result,
                'message': 'Expense record created successfully'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to create expense record'
            }), 500
            
    except Exception as e:
        logger.error(f"Error creating expense: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to create expense record',
            'message': str(e)
        }), 500

@finance_bp.route('/api/finance/expenses/<expense_id>', methods=['PUT'])
@auth_required(roles=['admin', 'staff'])
@handle_database_error
def update_expense(expense_id):
    """Update an existing expense record"""
    try:
        data = request.get_json()
        
        # Add updated timestamp
        data['updated_at'] = datetime.now().isoformat()
        data['updated_by'] = g.user.get('id', 'system')
        
        result = execute_update('finance_expense', expense_id, data)
        
        if result:
            return jsonify({
                'success': True,
                'data': result,
                'message': 'Expense record updated successfully'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Expense record not found'
            }), 404
            
    except Exception as e:
        logger.error(f"Error updating expense: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to update expense record',
            'message': str(e)
        }), 500

@finance_bp.route('/api/finance/expenses/<expense_id>', methods=['DELETE'])
@auth_required(roles=['admin', 'staff'])
@handle_database_error
def delete_expense(expense_id):
    """Delete an expense record"""
    try:
        success = execute_delete('finance_expense', expense_id)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Expense record deleted successfully'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Expense record not found'
            }), 404
            
    except Exception as e:
        logger.error(f"Error deleting expense: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to delete expense record',
            'message': str(e)
        }), 500

# ==================== BUDGET ENDPOINTS ====================

@finance_bp.route('/api/finance/budget', methods=['GET'])
@auth_required(roles=['admin', 'faculty', 'staff'])
@handle_database_error
def get_budget():
    """Get all budget allocations with optional filtering"""
    try:
        # Get query parameters
        department = request.args.get('department')
        financial_year = request.args.get('financial_year')
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 50))
        
        # Build query with filters
        query = "SELECT * FROM finance_budgetallocation WHERE 1=1"
        params = []
        
        if department:
            query += " AND department = %s"
            params.append(department)
        if financial_year:
            query += " AND financial_year = %s"
            params.append(financial_year)
        
        # Get total count
        count_query = query.replace("SELECT *", "SELECT COUNT(*)")
        try:
            total_count = execute_query(count_query, params, fetch_all=False)
            total = total_count.get('count', 0) if total_count else 0
        except:
            total = 0
        
        # Add pagination
        query += f" ORDER BY created_at DESC LIMIT {limit} OFFSET {(page - 1) * limit}"
        
        result = execute_query(query, params, fetch_all=True)
        
        # Get summary data
        summary_query = "SELECT COALESCE(SUM(allocated_amount), 0) as total_allocated, COALESCE(SUM(used_amount), 0) as total_used, COALESCE(SUM(remaining_amount), 0) as total_remaining FROM finance_budgetallocation"
        summary = execute_query(summary_query, fetch_all=False)
        
        return jsonify({
            'success': True,
            'data': result if result else [],
            'summary': {
                'totalAllocatedBudget': summary.get('total_allocated', 0) if summary else 0,
                'totalUsedBudget': summary.get('total_used', 0) if summary else 0,
                'totalRemainingBudget': summary.get('total_remaining', 0) if summary else 0
            }
        })
        
    except Exception as e:
        logger.error(f"Error getting budget: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch budget allocations',
            'message': str(e)
        }), 500

@finance_bp.route('/api/finance/budget', methods=['POST'])
@auth_required(roles=['admin', 'staff'])
@handle_database_error
def create_budget():
    """Create a new budget allocation"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['budget_id', 'department', 'financial_year', 'allocated_amount']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Calculate remaining amount
        allocated_amount = data.get('allocated_amount', 0)
        used_amount = data.get('used_amount', 0)
        remaining_amount = allocated_amount - used_amount
        
        # Create budget record
        budget_data = {
            'id': str(uuid.uuid4()),
            'budget_id': data['budget_id'],
            'department': data['department'],
            'financial_year': data['financial_year'],
            'allocated_amount': allocated_amount,
            'used_amount': used_amount,
            'remaining_amount': remaining_amount,
            'status': data.get('status', 'active'),
            'created_at': datetime.now().isoformat(),
            'created_by': g.user.get('id', 'system')
        }
        
        result = execute_insert('finance_budgetallocation', budget_data)
        
        if result:
            return jsonify({
                'success': True,
                'data': result,
                'message': 'Budget allocation created successfully'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to create budget allocation'
            }), 500
            
    except Exception as e:
        logger.error(f"Error creating budget: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to create budget allocation',
            'message': str(e)
        }), 500

@finance_bp.route('/api/finance/budget/<budget_id>', methods=['PUT'])
@auth_required(roles=['admin', 'staff'])
@handle_database_error
def update_budget(budget_id):
    """Update an existing budget allocation"""
    try:
        data = request.get_json()
        
        # Calculate remaining amount if amounts are being updated
        if 'allocated_amount' in data or 'used_amount' in data:
            current_query = "SELECT allocated_amount, used_amount FROM finance_budgetallocation WHERE id = %s"
            current = execute_query(current_query, [budget_id], fetch_all=False)
            
            if current:
                allocated_amount = data.get('allocated_amount', current.get('allocated_amount', 0))
                used_amount = data.get('used_amount', current.get('used_amount', 0))
                data['remaining_amount'] = allocated_amount - used_amount
                
                # Update status based on utilization
                utilization = (used_amount / allocated_amount) * 100 if allocated_amount > 0 else 0
                if utilization >= 100:
                    data['status'] = 'exceeded'
                elif utilization >= 90:
                    data['status'] = 'warning'
                else:
                    data['status'] = 'active'
        
        # Add updated timestamp
        data['updated_at'] = datetime.now().isoformat()
        data['updated_by'] = g.user.get('id', 'system')
        
        result = execute_update('finance_budgetallocation', budget_id, data)
        
        if result:
            return jsonify({
                'success': True,
                'data': result,
                'message': 'Budget allocation updated successfully'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Budget record not found'
            }), 404
            
    except Exception as e:
        logger.error(f"Error updating budget: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to update budget allocation',
            'message': str(e)
        }), 500

@finance_bp.route('/api/finance/budget/<budget_id>', methods=['DELETE'])
@auth_required(roles=['admin', 'staff'])
@handle_database_error
def delete_budget(budget_id):
    """Delete a budget allocation"""
    try:
        success = execute_delete('finance_budgetallocation', budget_id)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Budget allocation deleted successfully'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Budget record not found'
            }), 404
            
    except Exception as e:
        logger.error(f"Error deleting budget: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to delete budget allocation',
            'message': str(e)
        }), 500

# ==================== MAINTENANCE ENDPOINTS ====================

@finance_bp.route('/api/finance/maintenance', methods=['GET'])
@auth_required(roles=['admin', 'faculty', 'staff'])
@handle_database_error
def get_maintenance():
    """Get all maintenance requests with optional filtering"""
    try:
        # Get query parameters
        department = request.args.get('department')
        status = request.args.get('status')
        search = request.args.get('search')
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 50))
        
        # Build query with filters
        query = "SELECT * FROM finance_operationmaintenance WHERE 1=1"
        params = []
        
        if department:
            query += " AND department = %s"
            params.append(department)
        if status:
            query += " AND status = %s"
            params.append(status)
        if search:
            query += " AND (asset ILIKE %s OR request_id ILIKE %s)"
            search_pattern = f"%{search}%"
            params.extend([search_pattern, search_pattern])
        
        # Get total count
        count_query = query.replace("SELECT *", "SELECT COUNT(*)")
        try:
            total_count = execute_query(count_query, params, fetch_all=False)
            total = total_count.get('count', 0) if total_count else 0
        except:
            total = 0
        
        # Add pagination
        query += f" ORDER BY created_at DESC LIMIT {limit} OFFSET {(page - 1) * limit}"
        
        result = execute_query(query, params, fetch_all=True)
        
        # Get summary data
        summary_query = "SELECT COUNT(*) as total_requests, COALESCE(SUM(cost), 0) as total_cost FROM finance_operationmaintenance"
        summary = execute_query(summary_query, fetch_all=False)
        
        return jsonify({
            'success': True,
            'data': result if result else [],
            'summary': {
                'totalRequests': summary.get('total_requests', 0) if summary else 0,
                'pendingRequests': 0,
                'inProgressRequests': 0,
                'resolvedRequests': 0,
                'totalCost': summary.get('total_cost', 0) if summary else 0
            }
        })
        
    except Exception as e:
        logger.error(f"Error getting maintenance requests: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch maintenance requests',
            'message': str(e)
        }), 500

@finance_bp.route('/api/finance/maintenance', methods=['POST'])
@auth_required(roles=['admin', 'staff'])
@handle_database_error
def create_maintenance():
    """Create a new maintenance request"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['request_id', 'department', 'asset', 'issue_description']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Create maintenance record
        maintenance_data = {
            'id': str(uuid.uuid4()),
            'request_id': data['request_id'],
            'department': data['department'],
            'asset': data['asset'],
            'issue_description': data['issue_description'],
            'reported_date': data.get('reported_date', datetime.now().isoformat()),
            'resolved_date': data.get('resolved_date'),
            'cost': data.get('cost', 0),
            'status': data.get('status', 'pending'),
            'created_at': datetime.now().isoformat(),
            'created_by': g.user.get('id', 'system')
        }
        
        result = execute_insert('finance_operationmaintenance', maintenance_data)
        
        if result:
            return jsonify({
                'success': True,
                'data': result,
                'message': 'Maintenance request created successfully'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to create maintenance request'
            }), 500
            
    except Exception as e:
        logger.error(f"Error creating maintenance request: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to create maintenance request',
            'message': str(e)
        }), 500

@finance_bp.route('/api/finance/maintenance/<maintenance_id>', methods=['PUT'])
@auth_required(roles=['admin', 'staff'])
@handle_database_error
def update_maintenance(maintenance_id):
    """Update an existing maintenance request"""
    try:
        data = request.get_json()
        
        # Auto-set resolved date if status is being changed to resolved
        if data.get('status') == 'resolved' and not data.get('resolved_date'):
            data['resolved_date'] = datetime.now().isoformat()
        
        # Add updated timestamp
        data['updated_at'] = datetime.now().isoformat()
        data['updated_by'] = g.user.get('id', 'system')
        
        result = execute_update('finance_operationmaintenance', maintenance_id, data)
        
        if result:
            return jsonify({
                'success': True,
                'data': result,
                'message': 'Maintenance request updated successfully'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Maintenance request not found'
            }), 404
            
    except Exception as e:
        logger.error(f"Error updating maintenance request: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to update maintenance request',
            'message': str(e)
        }), 500

@finance_bp.route('/api/finance/maintenance/<maintenance_id>', methods=['DELETE'])
@auth_required(roles=['admin', 'staff'])
@handle_database_error
def delete_maintenance(maintenance_id):
    """Delete a maintenance request"""
    try:
        success = execute_delete('finance_operationmaintenance', maintenance_id)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Maintenance request deleted successfully'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Maintenance request not found'
            }), 404
            
    except Exception as e:
        logger.error(f"Error deleting maintenance request: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to delete maintenance request',
            'message': str(e)
        }), 500

# ==================== VENDOR ENDPOINTS ====================

@finance_bp.route('/api/finance/vendors', methods=['GET'])
@auth_required(roles=['admin', 'faculty', 'staff'])
@handle_database_error
def get_vendors():
    """Get all vendors with optional filtering"""
    try:
        # Get query parameters
        service_type = request.args.get('service_type')
        search = request.args.get('search')
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 50))
        
        # Build query with filters
        query = "SELECT * FROM finance_vendors WHERE 1=1"
        params = []
        
        if service_type:
            query += " AND service_type = %s"
            params.append(service_type)
        if search:
            query += " AND (vendor_name ILIKE %s OR vendor_id ILIKE %s OR email ILIKE %s)"
            search_pattern = f"%{search}%"
            params.extend([search_pattern, search_pattern, search_pattern])
        
        # Get total count
        count_query = query.replace("SELECT *", "SELECT COUNT(*)")
        try:
            total_count = execute_query(count_query, params, fetch_all=False)
            total = total_count.get('count', 0) if total_count else 0
        except:
            total = 0
        
        # Add pagination
        query += f" ORDER BY created_at DESC LIMIT {limit} OFFSET {(page - 1) * limit}"
        
        result = execute_query(query, params, fetch_all=True)
        
        # Get summary data
        summary_query = "SELECT COALESCE(SUM(amount_paid), 0) as total_paid, COALESCE(SUM(amount_due), 0) as total_due, COALESCE(SUM(total_transactions), 0) as total_transactions FROM finance_vendors"
        summary = execute_query(summary_query, fetch_all=False)
        
        return jsonify({
            'success': True,
            'data': result if result else [],
            'summary': {
                'totalAmountPaid': summary.get('total_paid', 0) if summary else 0,
                'totalAmountDue': summary.get('total_due', 0) if summary else 0,
                'totalTransactions': summary.get('total_transactions', 0) if summary else 0
            }
        })
        
    except Exception as e:
        logger.error(f"Error getting vendors: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch vendors',
            'message': str(e)
        }), 500

@finance_bp.route('/api/finance/vendors/<vendor_id>', methods=['GET'])
@auth_required(roles=['admin', 'faculty', 'staff'])
@handle_database_error
def get_vendor(vendor_id):
    """Get a specific vendor by ID"""
    try:
        query = "SELECT * FROM finance_vendors WHERE vendor_id = %s"
        result = execute_query(query, [vendor_id], fetch_all=False)
        
        if result:
            return jsonify({
                'success': True,
                'data': result
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Vendor not found'
            }), 404
            
    except Exception as e:
        logger.error(f"Error getting vendor: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch vendor',
            'message': str(e)
        }), 500

@finance_bp.route('/api/finance/vendors', methods=['POST'])
@auth_required(roles=['admin', 'staff'])
@handle_database_error
def create_vendor():
    """Create a new vendor"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['vendor_id', 'vendor_name', 'service_type']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Create vendor data
        vendor_data = {
            'vendor_id': data['vendor_id'],
            'vendor_name': data['vendor_name'],
            'service_type': data['service_type'],
            'contact_no': data.get('contact_no'),
            'email': data.get('email'),
            'total_transactions': data.get('total_transactions', 0),
            'amount_paid': data.get('amount_paid', 0),
            'amount_due': data.get('amount_due', 0),
            'created_at': datetime.now().isoformat(),
            'created_by': g.user.get('id', 'system')
        }
        
        result = execute_insert('finance_vendors', vendor_data)
        
        if result:
            return jsonify({
                'success': True,
                'data': result,
                'message': 'Vendor created successfully'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to create vendor'
            }), 500
            
    except Exception as e:
        logger.error(f"Error creating vendor: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to create vendor',
            'message': str(e)
        }), 500

@finance_bp.route('/api/finance/vendors/<vendor_id>', methods=['PUT'])
@auth_required(roles=['admin', 'staff'])
@handle_database_error
def update_vendor(vendor_id):
    """Update an existing vendor"""
    try:
        data = request.get_json()
        
        # Add updated timestamp
        data['updated_at'] = datetime.now().isoformat()
        data['updated_by'] = g.user.get('id', 'system')
        
        result = execute_update('finance_vendors', vendor_id, data)
        
        if result:
            return jsonify({
                'success': True,
                'data': result,
                'message': 'Vendor updated successfully'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Vendor not found'
            }), 404
            
    except Exception as e:
        logger.error(f"Error updating vendor: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to update vendor',
            'message': str(e)
        }), 500

@finance_bp.route('/api/finance/vendors/<vendor_id>', methods=['DELETE'])
@auth_required(roles=['admin', 'staff'])
@handle_database_error
def delete_vendor(vendor_id):
    """Delete a vendor"""
    try:
        success = execute_delete('finance_vendors', vendor_id)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Vendor deleted successfully'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Vendor not found'
            }), 404
            
    except Exception as e:
        logger.error(f"Error deleting vendor: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to delete vendor',
            'message': str(e)
        }), 500

