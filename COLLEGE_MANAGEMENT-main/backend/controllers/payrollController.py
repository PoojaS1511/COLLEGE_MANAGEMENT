"""
Payroll Controller
Handles all payroll-related operations and business logic
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from flask import Blueprint, request, jsonify
from models.supabase_payroll import payroll_model
from datetime import datetime, date
import logging

logger = logging.getLogger(__name__)

# Create Blueprint
payroll_bp = Blueprint('payroll', __name__, url_prefix='/api/payroll')

@payroll_bp.route('/', methods=['GET'])
def get_all_payroll():
    """Get all payroll records with pagination and filtering"""
    try:
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 50, type=int)
        status_filter = request.args.get('status')
        month_filter = request.args.get('month')
        
        # Calculate offset
        offset = (page - 1) * limit
        
        # Get payroll records
        result = payroll_model.get_all_payroll_records(
            limit=limit,
            offset=offset,
            status_filter=status_filter,
            month_filter=month_filter
        )
        
        return jsonify({
            'success': True,
            'data': result['data'],
            'pagination': {
                'page': page,
                'limit': limit,
                'total': result['total'],
                'pages': (result['total'] + limit - 1) // limit
            }
        })
        
    except Exception as e:
        logger.error(f"Error fetching payroll records: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@payroll_bp.route('/<int:payroll_id>', methods=['GET'])
def get_payroll_by_id(payroll_id):
    """Get payroll record by ID"""
    try:
        payroll = payroll_model.get_payroll_by_id(payroll_id)
        
        if not payroll:
            return jsonify({
                'success': False,
                'error': 'Payroll record not found'
            }), 404
        
        return jsonify({
            'success': True,
            'data': payroll
        })
        
    except Exception as e:
        logger.error(f"Error fetching payroll record {payroll_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@payroll_bp.route('/faculty/<faculty_id>/month/<month>', methods=['GET'])
def get_payroll_by_faculty_month(faculty_id, month):
    """Get payroll record by faculty ID and month"""
    try:
        payroll = payroll_model.get_payroll_by_faculty_month(faculty_id, month)
        
        if not payroll:
            return jsonify({
                'success': False,
                'error': 'Payroll record not found for this faculty and month'
            }), 404
        
        return jsonify({
            'success': True,
            'data': payroll
        })
        
    except Exception as e:
        logger.error(f"Error fetching payroll for faculty {faculty_id}, month {month}: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@payroll_bp.route('/', methods=['POST'])
def create_payroll():
    """Create a new payroll record"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['faculty_id', 'pay_month', 'basic_salary', 'total_days', 'present_days', 'role']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Create payroll record
        payroll = payroll_model.create_payroll_record(data)
        
        return jsonify({
            'success': True,
            'data': payroll,
            'message': 'Payroll record created successfully'
        }), 201
        
    except Exception as e:
        logger.error(f"Error creating payroll record: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@payroll_bp.route('/<int:payroll_id>', methods=['PUT'])
def update_payroll(payroll_id):
    """Update payroll record"""
    try:
        data = request.get_json()
        
        # Update payroll record
        payroll = payroll_model.update_payroll_record(payroll_id, data)
        
        return jsonify({
            'success': True,
            'data': payroll,
            'message': 'Payroll record updated successfully'
        })
        
    except Exception as e:
        logger.error(f"Error updating payroll record {payroll_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@payroll_bp.route('/<int:payroll_id>/approve', methods=['POST'])
def approve_payroll(payroll_id):
    """Approve payroll record"""
    try:
        payroll = payroll_model.approve_payroll(payroll_id)
        
        return jsonify({
            'success': True,
            'data': payroll,
            'message': 'Payroll approved successfully'
        })
        
    except Exception as e:
        logger.error(f"Error approving payroll {payroll_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@payroll_bp.route('/<int:payroll_id>/pay', methods=['POST'])
def mark_payroll_as_paid(payroll_id):
    """Mark payroll as paid"""
    try:
        payroll = payroll_model.mark_as_paid(payroll_id)
        
        return jsonify({
            'success': True,
            'data': payroll,
            'message': 'Payroll marked as paid successfully'
        })
        
    except Exception as e:
        logger.error(f"Error marking payroll {payroll_id} as paid: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@payroll_bp.route('/<int:payroll_id>', methods=['DELETE'])
def delete_payroll(payroll_id):
    """Delete payroll record"""
    try:
        success = payroll_model.delete_payroll_record(payroll_id)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Payroll record deleted successfully'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Payroll record not found'
            }), 404
        
    except Exception as e:
        logger.error(f"Error deleting payroll record {payroll_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@payroll_bp.route('/dashboard', methods=['GET'])
def get_payroll_dashboard():
    """Get payroll dashboard statistics"""
    try:
        statistics = payroll_model.get_payroll_statistics()
        
        return jsonify({
            'success': True,
            'data': statistics
        })
        
    except Exception as e:
        logger.error(f"Error fetching payroll dashboard: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@payroll_bp.route('/calculate', methods=['POST'])
def calculate_payroll():
    """Calculate payroll for a faculty"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['faculty_id', 'pay_month', 'basic_salary', 'total_days', 'present_days', 'role']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Calculate payroll
        payroll_data = payroll_model.calculate_monthly_payroll(
            faculty_id=data['faculty_id'],
            pay_month=data['pay_month'],
            basic_salary=data['basic_salary'],
            total_days=data['total_days'],
            present_days=data['present_days'],
            role=data['role']
        )
        
        return jsonify({
            'success': True,
            'data': payroll_data,
            'message': 'Payroll calculated successfully'
        })
        
    except Exception as e:
        logger.error(f"Error calculating payroll: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@payroll_bp.route('/bulk-approve', methods=['POST'])
def bulk_approve_payroll():
    """Bulk approve multiple payroll records"""
    try:
        data = request.get_json()
        payroll_ids = data.get('payroll_ids', [])
        
        if not payroll_ids:
            return jsonify({
                'success': False,
                'error': 'No payroll IDs provided'
            }), 400
        
        result = payroll_model.bulk_approve_payroll(payroll_ids)
        
        return jsonify({
            'success': True,
            'data': result,
            'message': f'Bulk approval completed. {result["success_count"]} records approved, {result["error_count"]} errors.'
        })
        
    except Exception as e:
        logger.error(f"Error in bulk approve payroll: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@payroll_bp.route('/payslip/<int:payroll_id>', methods=['GET'])
def generate_payslip(payroll_id):
    """Generate payslip for payroll record"""
    try:
        payroll = payroll_model.get_payroll_by_id(payroll_id)
        
        if not payroll:
            return jsonify({
                'success': False,
                'error': 'Payroll record not found'
            }), 404
        
        # Generate payslip data
        payslip_data = {
            'payroll': payroll,
            'generated_date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'institution': 'College ERP System',
            'payslip_id': f'PSL-{payroll_id}-{datetime.now().strftime("%Y%m%d")}'
        }
        
        return jsonify({
            'success': True,
            'data': payslip_data,
            'message': 'Payslip generated successfully'
        })
        
    except Exception as e:
        logger.error(f"Error generating payslip for payroll {payroll_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@payroll_bp.route('/months', methods=['GET'])
def get_available_months():
    """Get available payroll months"""
    try:
        # This would typically query distinct months from the database
        # For now, return current year months
        current_year = datetime.now().year
        months = []
        
        for month in range(1, 13):
            month_str = f'{current_year}-{month:02d}-01'
            months.append({
                'value': month_str,
                'label': datetime(current_year, month, 1).strftime('%B %Y')
            })
        
        return jsonify({
            'success': True,
            'data': months
        })
        
    except Exception as e:
        logger.error(f"Error fetching available months: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
