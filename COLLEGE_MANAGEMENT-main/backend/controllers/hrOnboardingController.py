from flask import Blueprint, request, jsonify, current_app
from datetime import datetime, date
import uuid
import json
import os
import hashlib
from werkzeug.utils import secure_filename
from models.hr_onboarding import (
    EmployeeRegistration, DocumentUpload, RoleAssignment, WorkPolicy, SalarySetup, SystemAccess,
    OnboardingRecord, DashboardStats,
    OnboardingStatus, DocumentStatus
)
from models.supabase_hr_onboarding import SupabaseHROnboarding
from utils.validators import validate_email, validate_phone
from utils.file_handler import FileHandler

# Create Blueprint
hr_onboarding_bp = Blueprint('hr_onboarding', __name__, url_prefix='/api/hr-onboarding')

# Initialize Supabase HR Onboarding
hr_onboarding = SupabaseHROnboarding()
file_handler = FileHandler()

def generate_employee_id():
    """Generate unique employee ID"""
    year = datetime.now().year
    random_num = str(uuid.uuid4().int)[:4]
    return f"EMP{year}{random_num}"

def log_activity(employee_id: str, action: str, description: str, status: str, created_by: str = None):
    """Log onboarding activity"""
    try:
        hr_onboarding.log_activity(employee_id, action, description, status, created_by)
    except Exception as e:
        current_app.logger.error(f"Error logging activity: {str(e)}")

# ==================== DASHBOARD ENDPOINTS ====================

@hr_onboarding_bp.route('/health', methods=['GET'])
def health_check():
    """Check system health and mode"""
    try:
        return jsonify({
            'success': True,
            'status': 'healthy',
            'mode': hr_onboarding.mode,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        current_app.logger.error(f"Error in health check: {str(e)}")
        return jsonify({
            'success': False,
            'status': 'unhealthy',
            'error': str(e)
        }), 500

@hr_onboarding_bp.route('/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    """Get dashboard statistics"""
    try:
        result = hr_onboarding.get_dashboard_stats()
        
        if result['success']:
            return jsonify({
                'success': True,
                'data': result['data']
            })
        else:
            return jsonify({
                'success': False,
                'message': result['message']
            }), 500
        
    except Exception as e:
        current_app.logger.error(f"Error getting dashboard stats: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to fetch dashboard statistics'
        }), 500

# ==================== REGISTRATION ENDPOINTS ====================

@hr_onboarding_bp.route('/registration', methods=['POST'])
def create_registration():
    """Create employee registration"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'email', 'phone', 'type', 'department', 'designation', 'joiningDate', 'role']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'message': f'{field} is required'
                }), 400
        
        # Validate email and phone
        if not validate_email(data['email']):
            return jsonify({
                'success': False,
                'message': 'Invalid email format'
            }), 400
        
        if not validate_phone(data['phone']):
            return jsonify({
                'success': False,
                'message': 'Invalid phone number format'
            }), 400
        
        # Generate employee ID
        employee_id = generate_employee_id()
        
        # Create registration data
        registration_data = {
            'employeeId': employee_id,
            'name': data['name'],
            'email': data['email'],
            'phone': data['phone'],
            'type': data['type'],
            'department': data['department'],
            'designation': data['designation'],
            'joiningDate': data['joiningDate'],
            'role': data['role']
        }
        
        # Save registration
        result = hr_onboarding.create_employee_registration(registration_data)
        
        if not result['success']:
            return jsonify({
                'success': False,
                'message': result['message']
            }), 500
        
        # Create onboarding record
        onboarding_data = {
            'employeeId': employee_id,
            'status': 'in_progress',
            'currentStep': 1,
            'completedSteps': [0, 1]
        }
        onboarding_result = hr_onboarding.create_onboarding_record(onboarding_data)
        
        # Log activity
        log_activity(employee_id, 'Completed Registration', 'Employee registration completed successfully', 'completed')
        
        return jsonify({
            'success': True,
            'message': 'Registration created successfully',
            'data': {
                'employeeId': employee_id,
                'registrationId': result['data']['id'],
                'onboardingId': onboarding_result.get('data', {}).get('id') if onboarding_result['success'] else None
            }
        })
        
    except Exception as e:
        current_app.logger.error(f"Error creating registration: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to create registration'
        }), 500

@hr_onboarding_bp.route('/registration/<employee_id>', methods=['GET'])
def get_registration(employee_id):
    """Get employee registration by ID"""
    try:
        result = hr_onboarding.get_employee_registration(employee_id)
        
        if result['success']:
            return jsonify({
                'success': True,
                'data': result['data']
            })
        else:
            return jsonify({
                'success': False,
                'message': result['message']
            }), 404
        
    except Exception as e:
        current_app.logger.error(f"Error getting registration: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to fetch registration'
        }), 500

# ==================== DOCUMENT ENDPOINTS ====================

@hr_onboarding_bp.route('/documents/upload', methods=['POST'])
def upload_document():
    """Upload document for employee"""
    try:
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'message': 'No file provided'
            }), 400
        
        file = request.files['file']
        employee_id = request.form.get('employeeId')
        document_type = request.form.get('documentType')
        
        if not employee_id or not document_type:
            return jsonify({
                'success': False,
                'message': 'Employee ID and document type are required'
            }), 400
        
        if file.filename == '':
            return jsonify({
                'success': False,
                'message': 'No file selected'
            }), 400
        
        # Validate file
        if not file_handler.allowed_file(file.filename):
            return jsonify({
                'success': False,
                'message': 'File type not allowed'
            }), 400
        
        # Save file
        filename = secure_filename(file.filename)
        unique_filename = f"{employee_id}_{document_type}_{filename}"
        file_path = file_handler.save_file(file, unique_filename)
        
        # Get file info
        file_size = os.path.getsize(file_path) / (1024 * 1024)  # Convert to MB
        file_type = filename.split('.')[-1].upper()
        
        # Create document record
        document_data = {
            'employeeId': employee_id,
            'documentType': document_type,
            'fileName': filename,
            'fileSize': round(file_size, 2),
            'fileType': file_type,
            'filePath': file_path
        }
        
        # Create document record using Supabase
        result = hr_onboarding.create_document_upload(document_data)
        
        if not result['success']:
            return jsonify({
                'success': False,
                'message': result['message']
            }), 500
        
        document_id = result['data']['id']
        
        # Log activity
        log_activity(employee_id, 'Document Uploaded', f'{document_type} document uploaded', 'pending')
        
        return jsonify({
            'success': True,
            'message': 'Document uploaded successfully',
            'data': {
                'documentId': document_id,
                'fileName': filename,
                'fileSize': round(file_size, 2),
                'fileType': file_type,
                'status': 'pending'
            }
        })
        
    except Exception as e:
        current_app.logger.error(f"Error uploading document: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to upload document'
        }), 500

@hr_onboarding_bp.route('/documents/<document_id>/verify', methods=['POST'])
def verify_document(document_id):
    """Verify document"""
    try:
        data = request.get_json()
        verified_by = data.get('verifiedBy', 'admin')
        status = data.get('status', 'verified')
        
        if status not in ['verified', 'rejected']:
            return jsonify({
                'success': False,
                'message': 'Invalid status'
            }), 400
        
        # Update document status using Supabase
        result = hr_onboarding.verify_document(document_id, status, verified_by)
        
        if not result['success']:
            return jsonify({
                'success': False,
                'message': result['message']
            }), 500
        
        # Get document info for logging
        doc_result = hr_onboarding.get_employee_documents(employee_id)
        doc_data = doc_result.get('data', [])
        doc_info = next((d for d in doc_data if d['id'] == document_id), None)
        
        if doc_info:
            log_activity(employee_id, 'Document Verified', 
                        f'{doc_info["document_type"]} document {status}', status)
        
        return jsonify({
            'success': True,
            'message': f'Document {status} successfully'
        })
        
    except Exception as e:
        current_app.logger.error(f"Error verifying document: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to verify document'
        }), 500

@hr_onboarding_bp.route('/documents/<employee_id>', methods=['GET'])
def get_employee_documents(employee_id):
    """Get all documents for an employee"""
    try:
        # Get documents using Supabase
        result = hr_onboarding.get_employee_documents(employee_id)
        
        if result['success']:
            documents = []
            for doc in result['data']:
                documents.append({
                    'id': doc['id'],
                    'documentType': doc['document_type'],
                    'fileName': doc['file_name'],
                    'fileSize': doc['file_size'],
                    'fileType': doc['file_type'],
                    'status': doc['status'],
                    'uploadedAt': doc['uploaded_at'],
                    'verifiedAt': doc.get('verified_at')
                })
        else:
            documents = []
        
        return jsonify({
            'success': True,
            'data': documents
        })
        
    except Exception as e:
        current_app.logger.error(f"Error getting documents: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to fetch documents'
        }), 500

# ==================== ROLE ASSIGNMENT ENDPOINTS ====================

@hr_onboarding_bp.route('/role-assignment', methods=['POST'])
def create_role_assignment():
    """Create role assignment"""
    try:
        data = request.get_json()
        
        required_fields = ['employeeId', 'academicRole', 'reportingManager', 'departmentMapping', 'permissions']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'message': f'{field} is required'
                }), 400
        
        # Create role assignment using Supabase
        role_data = {
            'employeeId': data['employeeId'],
            'academicRole': data['academicRole'],
            'reportingManager': data['reportingManager'],
            'departmentMapping': data['departmentMapping'],
            'permissions': data['permissions'],
            'assignedBy': data.get('assignedBy', 'admin')
        }
        
        result = hr_onboarding.create_role_assignment(role_data)
        
        if not result['success']:
            return jsonify({
                'success': False,
                'message': result['message']
            }), 500
        
        role_id = result['data']['id']
        
        # Update onboarding record using Supabase
        hr_onboarding.update_onboarding_status(data['employeeId'], 'in_progress', 3)
        
        # Log activity
        log_activity(data['employeeId'], 'Role Assignment Completed', 
                    'Academic role and permissions assigned', 'completed')
        
        return jsonify({
            'success': True,
            'message': 'Role assignment created successfully',
            'data': {'roleAssignmentId': role_id}
        })
        
    except Exception as e:
        current_app.logger.error(f"Error creating role assignment: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to create role assignment'
        }), 500

@hr_onboarding_bp.route('/role-assignment/<employee_id>', methods=['GET'])
def get_role_assignment(employee_id):
    """Get role assignment for employee"""
    try:
        # Get role assignment using Supabase
        result = hr_onboarding.get_role_assignment(employee_id)
        
        if not result['success']:
            return jsonify({
                'success': False,
                'message': result['message']
            }), 404
        
        result_data = result['data']
        # Parse JSON fields
        result_data['permissions'] = result_data.get('permissions', {})
        
        return jsonify({
            'success': True,
            'data': result_data
        })
        
    except Exception as e:
        current_app.logger.error(f"Error getting role assignment: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to fetch role assignment'
        }), 500

# ==================== WORK POLICY ENDPOINTS ====================

@hr_onboarding_bp.route('/work-policy', methods=['POST'])
def create_work_policy():
    """Create work policy"""
    try:
        data = request.get_json()
        
        required_fields = ['employeeId', 'workingHours', 'shift', 'weeklyOffDays', 'probationPeriod', 'leavePolicy', 'effectiveFrom']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'message': f'{field} is required'
                }), 400
        
        # Create work policy using Supabase
        policy_data = {
            'employeeId': data['employeeId'],
            'workingHours': data['workingHours'],
            'shift': data['shift'],
            'weeklyOffDays': data['weeklyOffDays'],
            'probationPeriod': data['probationPeriod'],
            'leavePolicy': data['leavePolicy'],
            'effectiveFrom': data['effectiveFrom']
        }
        
        result = hr_onboarding.create_work_policy(policy_data)
        
        if not result['success']:
            return jsonify({
                'success': False,
                'message': result['message']
            }), 500
        
        policy_id = result['data']['id']
        
        # Update onboarding record using Supabase
        hr_onboarding.update_onboarding_status(data['employeeId'], 'in_progress', 4)
        
        # Log activity
        log_activity(data['employeeId'], 'Work Policy Set', 
                    'Working hours and leave policy configured', 'completed')
        
        return jsonify({
            'success': True,
            'message': 'Work policy created successfully',
            'data': {'workPolicyId': policy_id}
        })
        
    except Exception as e:
        current_app.logger.error(f"Error creating work policy: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to create work policy'
        }), 500

@hr_onboarding_bp.route('/work-policy/<employee_id>', methods=['GET'])
def get_work_policy(employee_id):
    """Get work policy for employee"""
    try:
        # Get work policy using Supabase
        result = hr_onboarding.get_work_policy(employee_id)
        
        if not result['success']:
            return jsonify({
                'success': False,
                'message': result['message']
            }), 404
        
        result_data = result['data']
        # Parse JSON fields
        result_data['workingHours'] = result_data.get('working_hours', {})
        result_data['weeklyOffDays'] = result_data.get('weekly_off_days', [])
        result_data['leavePolicy'] = result_data.get('leave_policy', {})
        
        return jsonify({
            'success': True,
            'data': result_data
        })
        
    except Exception as e:
        current_app.logger.error(f"Error getting work policy: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to fetch work policy'
        }), 500

# ==================== SALARY SETUP ENDPOINTS ====================

@hr_onboarding_bp.route('/salary-setup', methods=['POST'])
def create_salary_setup():
    """Create salary setup"""
    try:
        data = request.get_json()
        
        required_fields = ['employeeId', 'earnings', 'deductions', 'basic_salary', 'hra', 'total_earnings', 'total_deductions', 'net_salary', 'effectiveFrom']
        for field in required_fields:
            if data.get(field) is None:
                return jsonify({
                    'success': False,
                    'message': f'{field} is required'
                }), 400
        
        # Validate net salary calculation
        expected_net = data['total_earnings'] - data['total_deductions']
        if abs(data['net_salary'] - expected_net) > 0.01:
            return jsonify({
                'success': False,
                'message': 'Net salary calculation mismatch'
            }), 400
        
        # Create salary setup using Supabase
        salary_data = {
            'employeeId': data['employeeId'],
            'earnings': data['earnings'],
            'deductions': data['deductions'],
            'basicSalary': data['basic_salary'],
            'hra': data['hra'],
            'totalEarnings': data['total_earnings'],
            'totalDeductions': data['total_deductions'],
            'netSalary': data['net_salary'],
            'effectiveFrom': data['effectiveFrom']
        }
        
        result = hr_onboarding.create_salary_setup(salary_data)
        
        if not result['success']:
            return jsonify({
                'success': False,
                'message': result['message']
            }), 500
        
        salary_id = result['data']['id']
        
        # Update onboarding record using Supabase
        hr_onboarding.update_onboarding_status(data['employeeId'], 'in_progress', 5)
        
        # Log activity
        log_activity(data['employeeId'], 'Salary Setup Completed', 
                    'Salary structure configured', 'completed')
        
        return jsonify({
            'success': True,
            'message': 'Salary setup created successfully',
            'data': {'salarySetupId': salary_id}
        })
        
    except Exception as e:
        current_app.logger.error(f"Error creating salary setup: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to create salary setup'
        }), 500

@hr_onboarding_bp.route('/salary-setup/<employee_id>', methods=['GET'])
def get_salary_setup(employee_id):
    """Get salary setup for employee"""
    try:
        # Get salary setup using Supabase
        result = hr_onboarding.get_salary_setup(employee_id)
        
        if not result['success']:
            return jsonify({
                'success': False,
                'message': result['message']
            }), 404
        
        result_data = result['data']
        # Parse JSON fields and format response
        result_data['earnings'] = result_data.get('earnings', {})
        result_data['deductions'] = result_data.get('deductions', {})
        result_data['basicSalary'] = result_data.get('basic_salary')
        result_data['hra'] = result_data.get('hra')
        result_data['totalEarnings'] = result_data.get('total_earnings')
        result_data['totalDeductions'] = result_data.get('total_deductions')
        result_data['netSalary'] = result_data.get('net_salary')
        result_data['effectiveFrom'] = result_data.get('effective_from')
        
        return jsonify({
            'success': True,
            'data': result_data
        })
        
    except Exception as e:
        current_app.logger.error(f"Error getting salary setup: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to fetch salary setup'
        }), 500

# ==================== SYSTEM ACCESS ENDPOINTS ====================

@hr_onboarding_bp.route('/system-access', methods=['POST'])
def create_system_access():
    """Create system access"""
    try:
        data = request.get_json()
        
        required_fields = ['employeeId', 'username', 'password', 'modules']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'message': f'{field} is required'
                }), 400
        
        # Check if username already exists using Supabase
        # For now, we'll skip this check as it requires additional method
        # In a real implementation, you would add a method to check username uniqueness
        
        # Create system access using Supabase
        access_data = {
            'employeeId': data['employeeId'],
            'username': data['username'],
            'password': data['password'],
            'temporaryPassword': data.get('temporaryPassword', True),
            'modules': data['modules'],
            'sendWelcomeEmail': data.get('sendWelcomeEmail', True)
        }
        
        result = hr_onboarding.create_system_access(access_data)
        
        if not result['success']:
            return jsonify({
                'success': False,
                'message': result['message']
            }), 500
        
        access_id = result['data']['id']
        
        # Log activity
        log_activity(data['employeeId'], 'System Access Created', 
                    'Login credentials generated', 'pending')
        
        return jsonify({
            'success': True,
            'message': 'System access created successfully',
            'data': {'systemAccessId': access_id}
        })
        
    except Exception as e:
        current_app.logger.error(f"Error creating system access: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to create system access'
        }), 500

@hr_onboarding_bp.route('/system-access/activate', methods=['POST'])
def activate_employee():
    """Activate employee system access"""
    try:
        data = request.get_json()
        
        employee_id = data.get('employeeId')
        activated_by = data.get('activatedBy', 'admin')
        
        if not employee_id:
            return jsonify({
                'success': False,
                'message': 'Employee ID is required'
            }), 400
        
        # Activate employee using Supabase
        result = hr_onboarding.activate_employee(employee_id, activated_by)
        
        if not result['success']:
            return jsonify({
                'success': False,
                'message': result['message']
            }), 500
        
        # Log activity
        log_activity(employee_id, 'Employee Activated', 
                    'Employee system access activated and onboarding completed', 'completed', activated_by)
        
        # Send welcome email if requested
        if data.get('sendWelcomeEmail', True):
            # TODO: Implement email sending logic
            pass
        
        return jsonify({
            'success': True,
            'message': 'Employee activated successfully'
        })
        
    except Exception as e:
        current_app.logger.error(f"Error activating employee: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to activate employee'
        }), 500

@hr_onboarding_bp.route('/system-access/<employee_id>', methods=['GET'])
def get_system_access(employee_id):
    """Get system access for employee"""
    try:
        # Get system access using Supabase
        result = hr_onboarding.get_system_access(employee_id)
        
        if not result['success']:
            return jsonify({
                'success': False,
                'message': result['message']
            }), 404
        
        result_data = result['data']
        # Parse JSON fields
        result_data['modules'] = result_data.get('modules', {})
        
        return jsonify({
            'success': True,
            'data': result_data
        })
        
    except Exception as e:
        current_app.logger.error(f"Error getting system access: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to fetch system access'
        }), 500

# ==================== ONBOARDING RECORD ENDPOINTS ====================

@hr_onboarding_bp.route('/record/<employee_id>', methods=['GET'])
def get_onboarding_record(employee_id):
    """Get complete onboarding record for employee"""
    try:
        # Get complete onboarding record using Supabase
        result = hr_onboarding.get_onboarding_record(employee_id)
        
        if not result['success']:
            return jsonify({
                'success': False,
                'message': result['message']
            }), 404
        
        onboarding_data = result['data']
        
        # Get registration data
        reg_result = hr_onboarding.get_employee_registration(employee_id)
        registration = reg_result.get('data') if reg_result['success'] else None
        
        # Get documents
        doc_result = hr_onboarding.get_employee_documents(employee_id)
        documents = doc_result.get('data', []) if doc_result['success'] else []
        
        # Get role assignment
        role_result = hr_onboarding.get_role_assignment(employee_id)
        role_assignment = role_result.get('data') if role_result['success'] else None
        
        # Get work policy
        policy_result = hr_onboarding.get_work_policy(employee_id)
        work_policy = policy_result.get('data') if policy_result['success'] else None
        
        # Get salary setup
        salary_result = hr_onboarding.get_salary_setup(employee_id)
        salary_setup = salary_result.get('data') if salary_result['success'] else None
        
        # Get system access
        access_result = hr_onboarding.get_system_access(employee_id)
        system_access = access_result.get('data') if access_result['success'] else None
        
        # Parse JSON fields
        if role_assignment:
            role_assignment['permissions'] = role_assignment.get('permissions', {})
        
        if work_policy:
            work_policy['workingHours'] = work_policy.get('working_hours', {})
            work_policy['weeklyOffDays'] = work_policy.get('weekly_off_days', [])
            work_policy['leavePolicy'] = work_policy.get('leave_policy', {})
        
        if salary_setup:
            salary_setup['earnings'] = salary_setup.get('earnings', {})
            salary_setup['deductions'] = salary_setup.get('deductions', {})
            salary_setup['basicSalary'] = salary_setup.get('basic_salary')
            salary_setup['hra'] = salary_setup.get('hra')
            salary_setup['totalEarnings'] = salary_setup.get('total_earnings')
            salary_setup['totalDeductions'] = salary_setup.get('total_deductions')
            salary_setup['netSalary'] = salary_setup.get('net_salary')
            salary_setup['effectiveFrom'] = salary_setup.get('effective_from')
        
        if system_access:
            system_access['modules'] = system_access.get('modules', {})
        
        return jsonify({
            'success': True,
            'data': {
                'onboarding': onboarding_data,
                'registration': registration,
                'documents': documents,
                'roleAssignment': role_assignment,
                'workPolicy': work_policy,
                'salarySetup': salary_setup,
                'systemAccess': system_access
            }
        })
        
    except Exception as e:
        current_app.logger.error(f"Error getting onboarding record: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to fetch onboarding record'
        }), 500
