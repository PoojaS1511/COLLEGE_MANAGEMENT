"""
Employee Management Routes
API endpoints for employee onboarding and management
"""

from flask import Blueprint
from controllers.employeeController import EmployeeController

# Create Blueprint
employee_bp = Blueprint('employee', __name__, url_prefix='/api/employees')

# Employee CRUD Routes
employee_bp.add_url_rule('/', 'create_employee', EmployeeController.create_employee, methods=['POST'])
employee_bp.add_url_rule('/', 'get_employees', EmployeeController.get_employees, methods=['GET'])
employee_bp.add_url_rule('/<employee_id>', 'get_employee', EmployeeController.get_employee, methods=['GET'])
employee_bp.add_url_rule('/<employee_id>', 'update_employee', EmployeeController.update_employee, methods=['PUT'])
employee_bp.add_url_rule('/<employee_id>', 'delete_employee', EmployeeController.delete_employee, methods=['DELETE'])

# Document Management Routes
employee_bp.add_url_rule('/documents', 'upload_document', EmployeeController.upload_document, methods=['POST'])
employee_bp.add_url_rule('/<employee_id>/documents', 'get_employee_documents', EmployeeController.get_employee_documents, methods=['GET'])

# Salary Structure Routes
employee_bp.add_url_rule('/salary', 'create_salary_structure', EmployeeController.create_salary_structure, methods=['POST'])

# Statistics Routes
employee_bp.add_url_rule('/stats/departments', 'get_department_stats', EmployeeController.get_department_stats, methods=['GET'])
employee_bp.add_url_rule('/stats/dashboard', 'get_dashboard_stats', EmployeeController.get_dashboard_stats, methods=['GET'])
