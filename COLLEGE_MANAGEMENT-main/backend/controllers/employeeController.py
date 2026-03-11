"""
Employee Management Controller
Handles all employee-related API endpoints
"""

import os
import json
import uuid
import bcrypt
from datetime import datetime, date
from flask import request, jsonify
from werkzeug.utils import secure_filename
from dotenv import load_dotenv

# Import models
from models.supabase_employee_master import SupabaseEmployeeMaster
from models.supabase_employee_models import (
    SupabaseEmployeeDocuments,
    SupabaseSalaryStructure,
    SupabaseLeavePolicy,
    SupabaseWorkPolicy
)

# Load environment variables
load_dotenv()

# Initialize Supabase configs (prefer environment variables but fall back to values from supabase_client)
from supabase_client import SUPABASE_URL as CLIENT_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY as CLIENT_SUPABASE_SERVICE_ROLE_KEY

_raw_supabase_url = os.getenv('SUPABASE_URL') or CLIENT_SUPABASE_URL
if not _raw_supabase_url or not _raw_supabase_url.strip().startswith('http'):
    SUPABASE_URL = CLIENT_SUPABASE_URL
else:
    SUPABASE_URL = _raw_supabase_url.strip()

_raw_supabase_key = os.getenv('SUPABASE_KEY') or os.getenv('SUPABASE_SERVICE_ROLE_KEY') or CLIENT_SUPABASE_SERVICE_ROLE_KEY
if not _raw_supabase_key or _raw_supabase_key.strip().startswith('your_'):
    SUPABASE_KEY = CLIENT_SUPABASE_SERVICE_ROLE_KEY
else:
    SUPABASE_KEY = _raw_supabase_key.strip()

print(f"[EMPLOYEE] Effective SUPABASE_URL: {SUPABASE_URL!r}, SUPABASE_KEY set: {bool(SUPABASE_KEY)}")

# Initialize models
employee_model = SupabaseEmployeeMaster(SUPABASE_URL, SUPABASE_KEY)
documents_model = SupabaseEmployeeDocuments(SUPABASE_URL, SUPABASE_KEY)
salary_model = SupabaseSalaryStructure(SUPABASE_URL, SUPABASE_KEY)
leave_model = SupabaseLeavePolicy(SUPABASE_URL, SUPABASE_KEY)
work_model = SupabaseWorkPolicy(SUPABASE_URL, SUPABASE_KEY)

class EmployeeController:
    """Employee Controller Class"""
    
    @staticmethod
    def create_employee():
        """Create new employee"""
        try:
            data = request.get_json()
            
            # Validate required fields
            required_fields = ['name', 'email', 'phone_number', 'role', 'department', 
                             'designation', 'employee_type', 'joining_date']
            
            for field in required_fields:
                if not data.get(field):
                    return jsonify({
                        'success': False,
                        'message': f'Missing required field: {field}'
                    }), 400
            
            # Validate role
            valid_roles = ['Faculty', 'Staff', 'Admin']
            if data['role'] not in valid_roles:
                return jsonify({
                    'success': False,
                    'message': f'Invalid role. Must be one of: {", ".join(valid_roles)}'
                }), 400
            
            # Validate employee type
            valid_types = ['Faculty', 'Staff']
            if data['employee_type'] not in valid_types:
                return jsonify({
                    'success': False,
                    'message': f'Invalid employee type. Must be one of: {", ".join(valid_types)}'
                }), 400
            
            # Convert joining_date to date object
            try:
                joining_date = datetime.strptime(data['joining_date'], '%Y-%m-%d').date()
                data['joining_date'] = joining_date
            except ValueError:
                return jsonify({
                    'success': False,
                    'message': 'Invalid joining_date format. Use YYYY-MM-DD'
                }), 400
            
            # Create employee
            employee = employee_model.create(data)
            
            if not employee:
                return jsonify({
                    'success': False,
                    'message': 'Failed to create employee'
                }), 500
            
            # Create related records if provided
            employee_uuid = employee['id']
            
            # Create salary structure if provided
            if data.get('salary_structure'):
                salary_model.create_salary_structure(employee_uuid, data['salary_structure'])
            
            # Create leave policy if provided
            if data.get('leave_policy'):
                leave_model.create_leave_policy(employee_uuid, data['leave_policy'])
            
            # Create work policy if provided
            if data.get('work_policy'):
                work_model.create_work_policy(employee_uuid, data['work_policy'])
            
            return jsonify({
                'success': True,
                'message': 'Employee created successfully',
                'data': employee
            }), 201
            
        except ValueError as e:
            return jsonify({
                'success': False,
                'message': str(e)
            }), 400
        except Exception as e:
            return jsonify({
                'success': False,
                'message': f'Internal server error: {str(e)}'
            }), 500
    
    @staticmethod
    def get_employees():
        """Get all employees with pagination and filters"""
        try:
            # Get query parameters
            page = int(request.args.get('page', 1))
            limit = int(request.args.get('limit', 50))
            department = request.args.get('department')
            status = request.args.get('status')
            role = request.args.get('role')
            employee_type = request.args.get('employee_type')
            search = request.args.get('search')
            
            # Build filters
            filters = {}
            if department:
                filters['department'] = department
            if status:
                filters['status'] = status
            if role:
                filters['role'] = role
            if employee_type:
                filters['employee_type'] = employee_type
            
            # Get employees
            if search:
                employees = employee_model.search(search, filters)
                result = {
                    'data': employees,
                    'total': len(employees),
                    'page': page,
                    'limit': limit,
                    'total_pages': 1
                }
            else:
                result = employee_model.get_all(filters, page, limit)
            
            return jsonify({
                'success': True,
                'data': result['data'],
                'pagination': {
                    'page': result['page'],
                    'limit': result['limit'],
                    'total': result['total'],
                    'total_pages': result['total_pages']
                }
            }), 200
            
        except Exception as e:
            return jsonify({
                'success': False,
                'message': f'Internal server error: {str(e)}'
            }), 500
    
    @staticmethod
    def get_employee(employee_id):
        """Get employee by ID"""
        try:
            employee = employee_model.get_by_id(employee_id)
            
            if not employee:
                return jsonify({
                    'success': False,
                    'message': 'Employee not found'
                }), 404
            
            # Get additional employee data
            employee_uuid = employee['id']
            
            # Get documents
            documents = documents_model.get_employee_documents(employee_uuid)
            
            # Get current salary
            current_salary = salary_model.get_current_salary(employee_uuid)
            
            # Get current leave policy
            current_leave = leave_model.get_current_leave_policy(employee_uuid)
            
            # Get current work policy
            current_work = work_model.get_current_work_policy(employee_uuid)
            
            # Get document stats
            doc_stats = documents_model.get_document_stats(employee_uuid)
            
            return jsonify({
                'success': True,
                'data': {
                    'employee': employee,
                    'documents': documents,
                    'document_stats': doc_stats,
                    'current_salary': current_salary,
                    'current_leave_policy': current_leave,
                    'current_work_policy': current_work
                }
            }), 200
            
        except Exception as e:
            return jsonify({
                'success': False,
                'message': f'Internal server error: {str(e)}'
            }), 500
    
    @staticmethod
    def update_employee(employee_id):
        """Update employee information"""
        try:
            data = request.get_json()
            
            # Remove fields that shouldn't be updated
            data.pop('employee_id', None)
            data.pop('id', None)
            
            # Validate joining_date format if provided
            if 'joining_date' in data:
                try:
                    joining_date = datetime.strptime(data['joining_date'], '%Y-%m-%d').date()
                    data['joining_date'] = joining_date
                except ValueError:
                    return jsonify({
                        'success': False,
                        'message': 'Invalid joining_date format. Use YYYY-MM-DD'
                    }), 400
            
            employee = employee_model.update(employee_id, data)
            
            if not employee:
                return jsonify({
                    'success': False,
                    'message': 'Employee not found or update failed'
                }), 404
            
            return jsonify({
                'success': True,
                'message': 'Employee updated successfully',
                'data': employee
            }), 200
            
        except Exception as e:
            return jsonify({
                'success': False,
                'message': f'Internal server error: {str(e)}'
            }), 500
    
    @staticmethod
    def delete_employee(employee_id):
        """Delete employee (soft delete)"""
        try:
            success = employee_model.delete(employee_id)
            
            if not success:
                return jsonify({
                    'success': False,
                    'message': 'Employee not found or delete failed'
                }), 404
            
            return jsonify({
                'success': True,
                'message': 'Employee deleted successfully'
            }), 200
            
        except Exception as e:
            return jsonify({
                'success': False,
                'message': f'Internal server error: {str(e)}'
            }), 500
    
    @staticmethod
    def upload_document():
        """Upload employee document"""
        try:
            data = request.get_json()
            
            # Validate required fields
            required_fields = ['employee_id', 'doc_type', 'doc_name', 'doc_url']
            
            for field in required_fields:
                if not data.get(field):
                    return jsonify({
                        'success': False,
                        'message': f'Missing required field: {field}'
                    }), 400
            
            # Get employee UUID
            employee = employee_model.get_by_id(data['employee_id'])
            if not employee:
                return jsonify({
                    'success': False,
                    'message': 'Employee not found'
                }), 404
            
            # Upload document
            document = documents_model.upload_document(employee['id'], data)
            
            if not document:
                return jsonify({
                    'success': False,
                    'message': 'Failed to upload document'
                }), 500
            
            return jsonify({
                'success': True,
                'message': 'Document uploaded successfully',
                'data': document
            }), 201
            
        except ValueError as e:
            return jsonify({
                'success': False,
                'message': str(e)
            }), 400
        except Exception as e:
            return jsonify({
                'success': False,
                'message': f'Internal server error: {str(e)}'
            }), 500
    
    @staticmethod
    def get_employee_documents(employee_id):
        """Get all documents for an employee"""
        try:
            employee = employee_model.get_by_id(employee_id)
            if not employee:
                return jsonify({
                    'success': False,
                    'message': 'Employee not found'
                }), 404
            
            documents = documents_model.get_employee_documents(employee['id'])
            
            return jsonify({
                'success': True,
                'data': documents
            }), 200
            
        except Exception as e:
            return jsonify({
                'success': False,
                'message': f'Internal server error: {str(e)}'
            }), 500
    
    @staticmethod
    def create_salary_structure():
        """Create salary structure for employee"""
        try:
            data = request.get_json()
            
            # Validate required fields
            required_fields = ['employee_id', 'basic_pay', 'effective_from']
            
            for field in required_fields:
                if not data.get(field):
                    return jsonify({
                        'success': False,
                        'message': f'Missing required field: {field}'
                    }), 400
            
            # Get employee UUID
            employee = employee_model.get_by_id(data['employee_id'])
            if not employee:
                return jsonify({
                    'success': False,
                    'message': 'Employee not found'
                }), 404
            
            # Create salary structure
            salary = salary_model.create_salary_structure(employee['id'], data)
            
            if not salary:
                return jsonify({
                    'success': False,
                    'message': 'Failed to create salary structure'
                }), 500
            
            return jsonify({
                'success': True,
                'message': 'Salary structure created successfully',
                'data': salary
            }), 201
            
        except ValueError as e:
            return jsonify({
                'success': False,
                'message': str(e)
            }), 400
        except Exception as e:
            return jsonify({
                'success': False,
                'message': f'Internal server error: {str(e)}'
            }), 500
    
    @staticmethod
    def get_department_stats():
        """Get department-wise statistics"""
        try:
            stats = employee_model.get_department_stats()
            
            return jsonify({
                'success': True,
                'data': stats
            }), 200
            
        except Exception as e:
            return jsonify({
                'success': False,
                'message': f'Internal server error: {str(e)}'
            }), 500
    
    @staticmethod
    def get_dashboard_stats():
        """Get dashboard statistics"""
        try:
            # Get all employees
            result = employee_model.get_all()
            employees = result['data']
            
            # Calculate statistics
            total_employees = len(employees)
            active_employees = len([e for e in employees if e['status'] == 'Active'])
            inactive_employees = total_employees - active_employees
            
            # Department-wise count
            dept_stats = {}
            for employee in employees:
                dept = employee['department']
                dept_stats[dept] = dept_stats.get(dept, 0) + 1
            
            # Role-wise count
            role_stats = {}
            for employee in employees:
                role = employee['role']
                role_stats[role] = role_stats.get(role, 0) + 1
            
            # Recent joiners (last 30 days)
            thirty_days_ago = datetime.now().date() - datetime.timedelta(days=30)
            recent_joiners = len([
                e for e in employees 
                if datetime.strptime(e['joining_date'], '%Y-%m-%d').date() >= thirty_days_ago
            ])
            
            return jsonify({
                'success': True,
                'data': {
                    'total_employees': total_employees,
                    'active_employees': active_employees,
                    'inactive_employees': inactive_employees,
                    'recent_joiners': recent_joiners,
                    'department_stats': dept_stats,
                    'role_stats': role_stats
                }
            }), 200
            
        except Exception as e:
            return jsonify({
                'success': False,
                'message': f'Internal server error: {str(e)}'
            }), 500
