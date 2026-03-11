"""
Supabase model for HR Onboarding operations
"""

from datetime import datetime, date
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, EmailStr, Field, field_validator
from enum import Enum
import uuid
from utils.supabase_client import get_supabase

class EmployeeType(str, Enum):
    FACULTY = "Faculty"
    STAFF = "Staff"

class SystemRole(str, Enum):
    FACULTY = "Faculty"
    STAFF = "Staff"
    ADMIN = "Admin"

class DocumentStatus(str, Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"

class OnboardingStatus(str, Enum):
    DRAFT = "draft"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ACTIVE = "active"
    TERMINATED = "terminated"

class EmployeeRegistration(BaseModel):
    """Employee registration model"""
    employeeId: str
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., pattern=r'^\d{10}$')
    type: EmployeeType
    department: str = Field(..., min_length=2, max_length=100)
    designation: str = Field(..., min_length=2, max_length=100)
    joiningDate: date
    role: SystemRole
    createdAt: datetime = Field(default_factory=datetime.now)
    
    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v):
        if not v.isdigit() or len(v) != 10:
            raise ValueError('Phone number must be 10 digits')
        return v

class DocumentUpload(BaseModel):
    """Document upload model"""
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    employeeId: str
    documentType: str  # identityProof, educationalCertificates, appointmentLetter, experienceCertificate
    fileName: str
    fileSize: float  # in MB
    fileType: str
    filePath: str
    status: DocumentStatus = DocumentStatus.PENDING
    uploadedAt: datetime = Field(default_factory=datetime.now)
    verifiedAt: Optional[datetime] = None
    verifiedBy: Optional[str] = None

class RoleAssignment(BaseModel):
    """Role assignment model"""
    employeeId: str
    academicRole: str = Field(..., min_length=2, max_length=100)
    reportingManager: str = Field(..., min_length=2, max_length=100)
    departmentMapping: str = Field(..., min_length=2, max_length=100)
    permissions: Dict[str, bool] = Field(default_factory=dict)
    assignedAt: datetime = Field(default_factory=datetime.now)
    assignedBy: str

class WorkPolicy(BaseModel):
    """Work policy model"""
    employeeId: str
    workingHours: Dict[str, str]  # startTime, endTime
    shift: str  # morning, evening, night
    weeklyOffDays: List[str]
    probationPeriod: str  # in months
    leavePolicy: Dict[str, int]  # casualLeave, sickLeave, earnedLeave
    effectiveFrom: date
    createdAt: datetime = Field(default_factory=datetime.now)

class SalarySetup(BaseModel):
    """Salary setup model"""
    employeeId: str
    earnings: Dict[str, float] = Field(default_factory=dict)
    deductions: Dict[str, float] = Field(default_factory=dict)
    basic_salary: float = Field(..., gt=0)
    hra: float = Field(..., ge=0)
    total_earnings: float = Field(..., ge=0)
    total_deductions: float = Field(..., ge=0)
    net_salary: float = Field(..., ge=0)
    effectiveFrom: date
    createdAt: datetime = Field(default_factory=datetime.now)
    
    @field_validator('net_salary')
    @classmethod
    def validate_net_salary(cls, v, info):
        if 'total_earnings' in info.data and 'total_deductions' in info.data:
            expected = info.data['total_earnings'] - info.data['total_deductions']
            if abs(v - expected) > 0.01:
                raise ValueError('Net salary must equal earnings minus deductions')
        return v

class SystemAccess(BaseModel):
    """System access model"""
    employeeId: str
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8)
    temporaryPassword: bool = True
    modules: Dict[str, bool] = Field(default_factory=dict)
    sendWelcomeEmail: bool = True
    isActive: bool = False
    activatedAt: Optional[datetime] = None
    activatedBy: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.now)

class OnboardingRecord(BaseModel):
    """Complete onboarding record"""
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    employeeId: str
    registration: EmployeeRegistration
    documents: List[DocumentUpload] = Field(default_factory=list)
    roleAssignment: Optional[RoleAssignment] = None
    workPolicy: Optional[WorkPolicy] = None
    salarySetup: Optional[SalarySetup] = None
    systemAccess: Optional[SystemAccess] = None
    status: OnboardingStatus = OnboardingStatus.DRAFT
    currentStep: int = 0
    completedSteps: List[int] = Field(default_factory=list)
    createdAt: datetime = Field(default_factory=datetime.now)
    updatedAt: datetime = Field(default_factory=datetime.now)
    completedAt: Optional[datetime] = None

class DashboardStats(BaseModel):
    """Dashboard statistics model"""
    totalOnboarded: int
    pendingOnboardings: int
    completedOnboardings: int
    completionPercentage: float
    recentActivity: List[Dict[str, Any]]

class SupabaseHROnboarding:
    """Supabase operations for HR Onboarding"""

    def __init__(self):
        try:
            self.supabase = get_supabase()
            self.mode = "online"
        except RuntimeError:
            self.supabase = None
            self.mode = "offline"
    
    def create_employee_registration(self, registration_data: dict) -> dict:
        """Create new employee registration"""
        try:
            if self.supabase is None:
                # Offline mode - return mock success response
                mock_id = str(uuid.uuid4())
                return {
                    'success': True, 
                    'data': {
                        'id': mock_id,
                        'employee_id': registration_data['employeeId'],
                        'name': registration_data['name'],
                        'email': registration_data['email'],
                        'phone': registration_data['phone'],
                        'type': registration_data['type'],
                        'department': registration_data['department'],
                        'designation': registration_data['designation'],
                        'joining_date': registration_data['joiningDate'],
                        'role': registration_data['role'],
                        'created_at': datetime.now().isoformat()
                    }
                }
            
            if self.supabase is None:
                # Offline mode - return mock success response
                mock_id = str(uuid.uuid4())
                return {
                    'success': True, 
                    'data': {
                        'id': mock_id,
                        'employee_id': registration_data['employeeId'],
                        'name': registration_data['name'],
                        'email': registration_data['email'],
                        'phone': registration_data['phone'],
                        'type': registration_data['type'],
                        'department': registration_data['department'],
                        'designation': registration_data['designation'],
                        'joining_date': registration_data['joiningDate'],
                        'role': registration_data['role'],
                        'created_at': datetime.now().isoformat()
                    }
                }
            
            # Convert to Supabase format
            data = {
                'id': str(uuid.uuid4()),
                'employee_id': registration_data['employeeId'],
                'name': registration_data['name'],
                'email': registration_data['email'],
                'phone': registration_data['phone'],
                'type': registration_data['type'],
                'department': registration_data['department'],
                'designation': registration_data['designation'],
                'joining_date': registration_data['joiningDate'],
                'role': registration_data['role'],
                'created_at': datetime.now().isoformat()
            }
            
            result = self.supabase.table('employee_registrations').insert(data).execute()
            
            if result.data:
                return {'success': True, 'data': result.data[0]}
            else:
                return {'success': False, 'message': 'Failed to create registration'}
                
        except Exception as e:
            return {'success': False, 'message': str(e)}
    
    def get_employee_registration(self, employee_id: str) -> dict:
        """Get employee registration by ID"""
        try:
            if self.supabase is None:
                # Offline mode - return mock data
                if employee_id == 'EMP20241001':
                    return {
                        'success': True, 
                        'data': {
                            'id': str(uuid.uuid4()),
                            'employee_id': 'EMP20241001',
                            'name': 'John Smith',
                            'email': 'john.smith@college.edu',
                            'phone': '9876543210',
                            'type': 'Faculty',
                            'department': 'Computer Science',
                            'designation': 'Assistant Professor',
                            'joining_date': '2024-01-15',
                            'role': 'Faculty',
                            'created_at': datetime.now().isoformat()
                        }
                    }
                else:
                    return {'success': False, 'message': 'Registration not found'}
            
            result = self.supabase.table('employee_registrations').select('*').eq('employee_id', employee_id).execute()
            
            if result.data:
                return {'success': True, 'data': result.data[0]}
            else:
                return {'success': False, 'message': 'Registration not found'}
                
        except Exception as e:
            return {'success': False, 'message': str(e)}
    
    def create_document_upload(self, document_data: dict) -> dict:
        """Create new document upload record"""
        try:
            if self.supabase is None:
                # Offline mode - return mock success response
                mock_id = str(uuid.uuid4())
                return {
                    'success': True, 
                    'data': {
                        'id': mock_id,
                        'employee_id': document_data['employeeId'],
                        'document_type': document_data['documentType'],
                        'file_name': document_data['fileName'],
                        'file_size': document_data['fileSize'],
                        'file_type': document_data['fileType'],
                        'file_path': document_data['filePath'],
                        'status': document_data.get('status', 'pending'),
                        'uploaded_at': datetime.now().isoformat()
                    }
                }
            
            data = {
                'id': str(uuid.uuid4()),
                'employee_id': document_data['employeeId'],
                'document_type': document_data['documentType'],
                'file_name': document_data['fileName'],
                'file_size': document_data['fileSize'],
                'file_type': document_data['fileType'],
                'file_path': document_data['filePath'],
                'status': document_data.get('status', 'pending'),
                'uploaded_at': datetime.now().isoformat()
            }
            
            result = self.supabase.table('document_uploads').insert(data).execute()
            
            if result.data:
                return {'success': True, 'data': result.data[0]}
            else:
                return {'success': False, 'message': 'Failed to upload document'}
                
        except Exception as e:
            return {'success': False, 'message': str(e)}
    
    def verify_document(self, document_id: str, status: str, verified_by: str) -> dict:
        """Verify document"""
        try:
            if self.supabase is None:
                # Offline mode - return mock success response
                return {'success': True, 'message': f'Document {status} successfully'}
            
            data = {
                'status': status,
                'verified_at': datetime.now().isoformat(),
                'verified_by': verified_by
            }
            
            result = self.supabase.table('document_uploads').update(data).eq('id', document_id).execute()
            
            if result.data:
                return {'success': True, 'message': f'Document {status} successfully'}
            else:
                return {'success': False, 'message': 'Failed to verify document'}
                
        except Exception as e:
            return {'success': False, 'message': str(e)}
    
    def get_employee_documents(self, employee_id: str) -> dict:
        """Get all documents for an employee"""
        try:
            if self.supabase is None:
                # Offline mode - return mock data
                return {
                    'success': True, 
                    'data': [
                        {
                            'id': str(uuid.uuid4()),
                            'employee_id': employee_id,
                            'document_type': 'Resume',
                            'file_name': 'resume.pdf',
                            'file_size': 2.5,
                            'file_type': 'PDF',
                            'file_path': '/uploads/resume.pdf',
                            'status': 'verified',
                            'uploaded_at': datetime.now().isoformat(),
                            'verified_at': datetime.now().isoformat()
                        }
                    ]
                }
            
            result = self.supabase.table('document_uploads').select('*').eq('employee_id', employee_id).order('uploaded_at', desc=True).execute()
            
            return {'success': True, 'data': result.data or []}
                
        except Exception as e:
            return {'success': False, 'message': str(e)}
    
    def create_role_assignment(self, role_data: dict) -> dict:
        """Create role assignment"""
        try:
            if self.supabase is None:
                # Offline mode - return mock success response
                mock_id = str(uuid.uuid4())
                return {
                    'success': True, 
                    'data': {
                        'id': mock_id,
                        'employee_id': role_data['employeeId'],
                        'academic_role': role_data['academicRole'],
                        'reporting_manager': role_data['reportingManager'],
                        'department_mapping': role_data['departmentMapping'],
                        'permissions': role_data['permissions'],
                        'assigned_at': datetime.now().isoformat(),
                        'assigned_by': role_data.get('assignedBy', 'admin')
                    }
                }
            
            data = {
                'id': str(uuid.uuid4()),
                'employee_id': role_data['employeeId'],
                'academic_role': role_data['academicRole'],
                'reporting_manager': role_data['reportingManager'],
                'department_mapping': role_data['departmentMapping'],
                'permissions': role_data['permissions'],
                'assigned_at': datetime.now().isoformat(),
                'assigned_by': role_data.get('assignedBy', 'admin')
            }
            
            result = self.supabase.table('role_assignments').insert(data).execute()
            
            if result.data:
                return {'success': True, 'data': result.data[0]}
            else:
                return {'success': False, 'message': 'Failed to create role assignment'}
                
        except Exception as e:
            return {'success': False, 'message': str(e)}
    
    def get_role_assignment(self, employee_id: str) -> dict:
        """Get role assignment for employee"""
        try:
            if self.supabase is None:
                # Offline mode - return mock data
                if employee_id == 'EMP20241001':
                    return {
                        'success': True, 
                        'data': {
                            'id': str(uuid.uuid4()),
                            'employee_id': employee_id,
                            'academic_role': 'Assistant Professor',
                            'reporting_manager': 'Dr. Smith',
                            'department_mapping': 'Computer Science',
                            'permissions': {'view_grades': True, 'edit_grades': False},
                            'assigned_at': datetime.now().isoformat(),
                            'assigned_by': 'admin'
                        }
                    }
                else:
                    return {'success': False, 'message': 'Role assignment not found'}
            
            result = self.supabase.table('role_assignments').select('*').eq('employee_id', employee_id).execute()
            
            if result.data:
                return {'success': True, 'data': result.data[0]}
            else:
                return {'success': False, 'message': 'Role assignment not found'}
                
        except Exception as e:
            return {'success': False, 'message': str(e)}
    
    def create_work_policy(self, policy_data: dict) -> dict:
        """Create work policy"""
        try:
            if self.supabase is None:
                # Offline mode - return mock success response
                mock_id = str(uuid.uuid4())
                return {
                    'success': True, 
                    'data': {
                        'id': mock_id,
                        'employee_id': policy_data['employeeId'],
                        'working_hours': policy_data['workingHours'],
                        'shift': policy_data['shift'],
                        'weekly_off_days': policy_data['weeklyOffDays'],
                        'probation_period': policy_data['probationPeriod'],
                        'leave_policy': policy_data['leavePolicy'],
                        'effective_from': policy_data['effectiveFrom'],
                        'created_at': datetime.now().isoformat()
                    }
                }
            
            data = {
                'id': str(uuid.uuid4()),
                'employee_id': policy_data['employeeId'],
                'working_hours': policy_data['workingHours'],
                'shift': policy_data['shift'],
                'weekly_off_days': policy_data['weeklyOffDays'],
                'probation_period': policy_data['probationPeriod'],
                'leave_policy': policy_data['leavePolicy'],
                'effective_from': policy_data['effectiveFrom'],
                'created_at': datetime.now().isoformat()
            }
            
            result = self.supabase.table('work_policies').insert(data).execute()
            
            if result.data:
                return {'success': True, 'data': result.data[0]}
            else:
                return {'success': False, 'message': 'Failed to create work policy'}
                
        except Exception as e:
            return {'success': False, 'message': str(e)}
    
    def get_work_policy(self, employee_id: str) -> dict:
        """Get work policy for employee"""
        try:
            if self.supabase is None:
                # Offline mode - return mock data
                if employee_id == 'EMP20241001':
                    return {
                        'success': True, 
                        'data': {
                            'id': str(uuid.uuid4()),
                            'employee_id': employee_id,
                            'working_hours': {'monday': '9AM-6PM', 'tuesday': '9AM-6PM'},
                            'shift': 'Morning',
                            'weekly_off_days': ['saturday', 'sunday'],
                            'probation_period': '6 months',
                            'leave_policy': {'casual_leave': 12, 'sick_leave': 10},
                            'effective_from': '2024-01-15',
                            'created_at': datetime.now().isoformat()
                        }
                    }
                else:
                    return {'success': False, 'message': 'Work policy not found'}
            
            result = self.supabase.table('work_policies').select('*').eq('employee_id', employee_id).execute()
            
            if result.data:
                return {'success': True, 'data': result.data[0]}
            else:
                return {'success': False, 'message': 'Work policy not found'}
                
        except Exception as e:
            return {'success': False, 'message': str(e)}
    
    def create_salary_setup(self, salary_data: dict) -> dict:
        """Create salary setup"""
        try:
            if self.supabase is None:
                # Offline mode - return mock success response
                mock_id = str(uuid.uuid4())
                return {
                    'success': True, 
                    'data': {
                        'id': mock_id,
                        'employee_id': salary_data['employeeId'],
                        'earnings': salary_data['earnings'],
                        'deductions': salary_data['deductions'],
                        'basic_salary': salary_data['basic_salary'],
                        'hra': salary_data['hra'],
                        'total_earnings': salary_data['total_earnings'],
                        'total_deductions': salary_data['total_deductions'],
                        'net_salary': salary_data['net_salary'],
                        'effective_from': salary_data['effectiveFrom'],
                        'created_at': datetime.now().isoformat()
                    }
                }
            
            data = {
                'id': str(uuid.uuid4()),
                'employee_id': salary_data['employeeId'],
                'earnings': salary_data['earnings'],
                'deductions': salary_data['deductions'],
                'basic_salary': salary_data['basic_salary'],
                'hra': salary_data['hra'],
                'total_earnings': salary_data['total_earnings'],
                'total_deductions': salary_data['total_deductions'],
                'net_salary': salary_data['net_salary'],
                'effective_from': salary_data['effectiveFrom'],
                'created_at': datetime.now().isoformat()
            }
            
            result = self.supabase.table('salary_setups').insert(data).execute()
            
            if result.data:
                return {'success': True, 'data': result.data[0]}
            else:
                return {'success': False, 'message': 'Failed to create salary setup'}
                
        except Exception as e:
            return {'success': False, 'message': str(e)}
    
    def get_salary_setup(self, employee_id: str) -> dict:
        """Get salary setup for employee"""
        try:
            if self.supabase is None:
                # Offline mode - return mock data
                if employee_id == 'EMP20241001':
                    return {
                        'success': True, 
                        'data': {
                            'id': str(uuid.uuid4()),
                            'employee_id': employee_id,
                            'earnings': {'basic': 50000, 'hra': 12000},
                            'deductions': {'pf': 1800, 'tax': 5000},
                            'basic_salary': 50000,
                            'hra': 12000,
                            'total_earnings': 62000,
                            'total_deductions': 6800,
                            'net_salary': 55200,
                            'effective_from': '2024-01-15',
                            'created_at': datetime.now().isoformat()
                        }
                    }
                else:
                    return {'success': False, 'message': 'Salary setup not found'}
            
            result = self.supabase.table('salary_setups').select('*').eq('employee_id', employee_id).execute()
            
            if result.data:
                return {'success': True, 'data': result.data[0]}
            else:
                return {'success': False, 'message': 'Salary setup not found'}
                
        except Exception as e:
            return {'success': False, 'message': str(e)}
    
    def create_system_access(self, access_data: dict) -> dict:
        """Create system access"""
        try:
            if self.supabase is None:
                # Offline mode - return mock success response
                mock_id = str(uuid.uuid4())
                return {
                    'success': True, 
                    'data': {
                        'id': mock_id,
                        'employee_id': access_data['employeeId'],
                        'username': access_data['username'],
                        'password': access_data['password'],
                        'temporary_password': access_data.get('temporaryPassword', True),
                        'modules': access_data['modules'],
                        'send_welcome_email': access_data.get('sendWelcomeEmail', True),
                        'is_active': False,
                        'created_at': datetime.now().isoformat()
                    }
                }
            
            data = {
                'id': str(uuid.uuid4()),
                'employee_id': access_data['employeeId'],
                'username': access_data['username'],
                'password': access_data['password'],
                'temporary_password': access_data.get('temporaryPassword', True),
                'modules': access_data['modules'],
                'send_welcome_email': access_data.get('sendWelcomeEmail', True),
                'is_active': False,
                'created_at': datetime.now().isoformat()
            }
            
            result = self.supabase.table('system_access').insert(data).execute()
            
            if result.data:
                return {'success': True, 'data': result.data[0]}
            else:
                return {'success': False, 'message': 'Failed to create system access'}
                
        except Exception as e:
            return {'success': False, 'message': str(e)}
    
    def activate_employee(self, employee_id: str, activated_by: str) -> dict:
        """Activate employee system access"""
        try:
            if self.supabase is None:
                # Offline mode - return mock success response
                return {'success': True, 'message': 'Employee activated successfully'}
            
            data = {
                'is_active': True,
                'activated_at': datetime.now().isoformat(),
                'activated_by': activated_by
            }
            
            result = self.supabase.table('system_access').update(data).eq('employee_id', employee_id).execute()
            
            # Update onboarding record
            onboarding_data = {
                'status': 'active',
                'updated_at': datetime.now().isoformat()
            }
            
            self.supabase.table('onboarding_records').update(onboarding_data).eq('employee_id', employee_id).execute()
            
            if result.data:
                return {'success': True, 'message': 'Employee activated successfully'}
            else:
                return {'success': False, 'message': 'Failed to activate employee'}
                
        except Exception as e:
            return {'success': False, 'message': str(e)}
    
    def get_system_access(self, employee_id: str) -> dict:
        """Get system access for employee"""
        try:
            if self.supabase is None:
                # Offline mode - return mock data
                if employee_id == 'EMP20241001':
                    return {
                        'success': True, 
                        'data': {
                            'id': str(uuid.uuid4()),
                            'employee_id': employee_id,
                            'username': 'john.smith',
                            'temporary_password': True,
                            'modules': {'hr': True, 'admin': True},
                            'send_welcome_email': True,
                            'is_active': True,
                            'activated_at': datetime.now().isoformat(),
                            'activated_by': 'admin'
                        }
                    }
                else:
                    return {'success': False, 'message': 'System access not found'}
            
            result = self.supabase.table('system_access').select('*').eq('employee_id', employee_id).execute()
            
            if result.data:
                return {'success': True, 'data': result.data[0]}
            else:
                return {'success': False, 'message': 'System access not found'}
                
        except Exception as e:
            return {'success': False, 'message': str(e)}
    
    def create_onboarding_record(self, record_data: dict) -> dict:
        """Create onboarding record"""
        try:
            if self.supabase is None:
                # Offline mode - return mock success response
                mock_id = str(uuid.uuid4())
                return {
                    'success': True, 
                    'data': {
                        'id': mock_id,
                        'employee_id': record_data['employeeId'],
                        'status': record_data.get('status', 'draft'),
                        'current_step': record_data.get('currentStep', 0),
                        'completed_steps': record_data.get('completedSteps', []),
                        'created_at': datetime.now().isoformat(),
                        'updated_at': datetime.now().isoformat()
                    }
                }
            
            data = {
                'id': str(uuid.uuid4()),
                'employee_id': record_data['employeeId'],
                'status': record_data.get('status', 'draft'),
                'current_step': record_data.get('currentStep', 0),
                'completed_steps': record_data.get('completedSteps', []),
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat()
            }
            
            result = self.supabase.table('onboarding_records').insert(data).execute()
            
            if result.data:
                return {'success': True, 'data': result.data[0]}
            else:
                return {'success': False, 'message': 'Failed to create onboarding record'}
                
        except Exception as e:
            return {'success': False, 'message': str(e)}
    
    def update_onboarding_status(self, employee_id: str, status: str, step: int = None) -> dict:
        """Update onboarding status and step"""
        try:
            if self.supabase is None:
                # Offline mode - return mock success response
                return {'success': True, 'message': 'Status updated successfully'}
            
            data = {
                'status': status,
                'updated_at': datetime.now().isoformat()
            }
            
            if step is not None:
                data['current_step'] = step
            
            result = self.supabase.table('onboarding_records').update(data).eq('employee_id', employee_id).execute()
            
            if result.data:
                return {'success': True, 'message': 'Status updated successfully'}
            else:
                return {'success': False, 'message': 'Failed to update status'}
                
        except Exception as e:
            return {'success': False, 'message': str(e)}
    
    def get_onboarding_record(self, employee_id: str) -> dict:
        """Get onboarding record for employee"""
        try:
            if self.supabase is None:
                # Offline mode - return mock data
                if employee_id == 'EMP20241001':
                    return {
                        'success': True, 
                        'data': {
                            'id': str(uuid.uuid4()),
                            'employee_id': 'EMP20241001',
                            'status': 'completed',
                            'current_step': 6,
                            'completed_steps': [0, 1, 2, 3, 4, 5, 6],
                            'created_at': datetime.now().isoformat(),
                            'updated_at': datetime.now().isoformat(),
                            'completed_at': datetime.now().isoformat()
                        }
                    }
                else:
                    return {'success': False, 'message': 'Onboarding record not found'}
            
            result = self.supabase.table('onboarding_records').select('*').eq('employee_id', employee_id).execute()
            
            if result.data:
                return {'success': True, 'data': result.data[0]}
            else:
                return {'success': False, 'message': 'Onboarding record not found'}
                
        except Exception as e:
            return {'success': False, 'message': str(e)}
    
    def get_dashboard_stats(self) -> dict:
        """Get dashboard statistics"""
        try:
            # Check if Supabase client is available
            if self.supabase is None:
                # Return mock data when offline
                return {
                    'success': True,
                    'data': {
                        'totalOnboarded': 25,
                        'pendingOnboardings': 3,
                        'completedOnboardings': 22,
                        'completionPercentage': 88.0,
                        'recentActivity': [
                            {
                                'id': str(uuid.uuid4()),
                                'employeeName': 'John Doe',
                                'action': 'Registration Started',
                                'time': '2 hours ago',
                                'status': 'in_progress'
                            },
                            {
                                'id': str(uuid.uuid4()),
                                'employeeName': 'Jane Smith',
                                'action': 'Documents Verified',
                                'time': '1 day ago',
                                'status': 'completed'
                            }
                        ]
                    }
                }
            
            # Initialize with default values
            stats = {
                'totalOnboarded': 0,
                'pendingOnboardings': 0,
                'completedOnboardings': 0,
                'completionPercentage': 0,
                'recentActivity': []
            }
            
            # Try to get total counts (with error handling for missing tables)
            try:
                if self.supabase is None:
                    # Use mock counts when offline
                    stats['totalOnboarded'] = 25
                    stats['pendingOnboardings'] = 3
                    stats['completedOnboardings'] = 22
                else:
                    total_result = self.supabase.table('hr_onboarding_records').select('count', count='exact').execute()
                    stats['totalOnboarded'] = total_result.count or 0
            except Exception:
                # Table doesn't exist or other error, use default
                pass
            
            try:
                # Get pending count
                if self.supabase is None:
                    # Use mock counts when offline
                    stats['pendingOnboardings'] = 3
                else:
                    pending_result = self.supabase.table('hr_onboarding_records').select('count', count='exact').in_('status', ['draft', 'in_progress']).execute()
                    stats['pendingOnboardings'] = pending_result.count or 0
            except Exception:
                # Table doesn't exist or other error, use default
                pass
            
            try:
                # Get completed count
                if self.supabase is None:
                    # Use mock counts when offline
                    stats['completedOnboardings'] = 22
                else:
                    completed_result = self.supabase.table('hr_onboarding_records').select('count', count='exact').eq('status', 'completed').execute()
                    stats['completedOnboardings'] = completed_result.count or 0
            except Exception:
                # Table doesn't exist or other error, use default
                pass
            
            # Calculate completion percentage
            if stats['totalOnboarded'] > 0:
                stats['completionPercentage'] = round((stats['completedOnboardings'] / stats['totalOnboarded']) * 100, 2)
            
            try:
                # Try to get recent activity (with error handling)
                if self.supabase is None:
                    # Use mock activity when offline
                    stats['recentActivity'] = [
                        {
                            'id': str(uuid.uuid4()),
                            'employeeName': 'John Doe',
                            'action': 'Registration Started',
                            'time': '2 hours ago',
                            'status': 'in_progress'
                        },
                        {
                            'id': str(uuid.uuid4()),
                            'employeeName': 'Jane Smith',
                            'action': 'Documents Verified',
                            'time': '1 day ago',
                            'status': 'completed'
                        }
                    ]
                else:
                    activity_result = self.supabase.table('hr_onboarding_activity_log').select(
                        'action, description, status, created_at, employee_name'
                    ).order('created_at', desc=True).limit(5).execute()
                    
                    for activity in activity_result.data or []:
                        stats['recentActivity'].append({
                            'id': str(uuid.uuid4()),
                            'employeeName': activity.get('employee_name', 'Unknown'),
                            'action': activity.get('action', 'Unknown'),
                            'time': self._format_time_ago(activity.get('created_at', datetime.now().isoformat())),
                            'status': activity.get('status', 'unknown')
                        })
            except Exception:
                # Table doesn't exist or other error, use mock data
                stats['recentActivity'] = [
                    {
                        'id': str(uuid.uuid4()),
                        'employeeName': 'John Doe',
                        'action': 'Registration Started',
                        'time': '2 hours ago',
                        'status': 'in_progress'
                    },
                    {
                        'id': str(uuid.uuid4()),
                        'employeeName': 'Jane Smith',
                        'action': 'Documents Verified',
                        'time': '1 day ago',
                        'status': 'completed'
                    }
                ]
            
            return {
                'success': True,
                'data': stats
            }
            
        except Exception as e:
            return {'success': False, 'message': str(e)}
    
    def log_activity(self, employee_id: str, action: str, description: str, status: str, created_by: str = None) -> dict:
        """Log onboarding activity"""
        try:
            if self.supabase is None:
                # Offline mode - just return success without logging
                return {'success': True, 'message': 'Activity logged (offline mode)'}
            
            data = {
                'id': str(uuid.uuid4()),
                'employee_id': employee_id,
                'action': action,
                'description': description,
                'status': status,
                'created_by': created_by
            }
            
            result = self.supabase.table('onboarding_activity_log').insert(data).execute()
            
            return {'success': True, 'data': result.data[0] if result.data else None}
                
        except Exception as e:
            return {'success': False, 'message': str(e)}
    
    def _format_time_ago(self, created_at: str) -> str:
        """Format datetime as 'X hours ago'"""
        try:
            now = datetime.now()
            created = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
            diff = now - created
            
            if diff.days > 0:
                return f"{diff.days} day{'s' if diff.days > 1 else ''} ago"
            elif diff.seconds > 3600:
                hours = diff.seconds // 3600
                return f"{hours} hour{'s' if hours > 1 else ''} ago"
            elif diff.seconds > 60:
                minutes = diff.seconds // 60
                return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
            else:
                return "Just now"
        except:
            return "Unknown time"
