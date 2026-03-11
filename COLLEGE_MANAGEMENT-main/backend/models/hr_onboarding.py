from datetime import datetime, date
from typing import Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field, field_validator
from enum import Enum
import uuid

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
    weeklyOffDays: list[str]
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
    documents: list[DocumentUpload] = Field(default_factory=list)
    roleAssignment: Optional[RoleAssignment] = None
    workPolicy: Optional[WorkPolicy] = None
    salarySetup: Optional[SalarySetup] = None
    systemAccess: Optional[SystemAccess] = None
    status: OnboardingStatus = OnboardingStatus.DRAFT
    currentStep: int = 0
    completedSteps: list[int] = Field(default_factory=list)
    createdAt: datetime = Field(default_factory=datetime.now)
    updatedAt: datetime = Field(default_factory=datetime.now)
    completedAt: Optional[datetime] = None

class DashboardStats(BaseModel):
    """Dashboard statistics model"""
    totalOnboarded: int
    pendingOnboardings: int
    completedOnboardings: int
    completionPercentage: float
    recentActivity: list[Dict[str, Any]]

class OnboardingStep(BaseModel):
    """Onboarding step model"""
    step: int
    name: str
    status: str  # pending, in_progress, completed
    completedAt: Optional[datetime] = None

# Database Models (for SQLAlchemy)
class EmployeeRegistrationDB:
    """SQLAlchemy model for Employee Registration"""
    
    def __init__(self, db_connection):
        self.db = db_connection
    
    def create_table(self):
        """Create employee registration table"""
        query = """
        CREATE TABLE IF NOT EXISTS employee_registrations (
            id VARCHAR(36) PRIMARY KEY,
            employee_id VARCHAR(20) UNIQUE NOT NULL,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            phone VARCHAR(10) NOT NULL,
            type ENUM('Faculty', 'Staff') NOT NULL,
            department VARCHAR(100) NOT NULL,
            designation VARCHAR(100) NOT NULL,
            joining_date DATE NOT NULL,
            role ENUM('Faculty', 'Staff', 'Admin') NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
        """
        self.db.execute_query(query)
    
    def create(self, registration_data: dict) -> str:
        """Create new employee registration"""
        query = """
        INSERT INTO employee_registrations 
        (id, employee_id, name, email, phone, type, department, designation, joining_date, role)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        employee_id = registration_data['employeeId']
        registration_id = str(uuid.uuid4())
        
        self.db.execute_query(query, (
            registration_id,
            employee_id,
            registration_data['name'],
            registration_data['email'],
            registration_data['phone'],
            registration_data['type'],
            registration_data['department'],
            registration_data['designation'],
            registration_data['joiningDate'],
            registration_data['role']
        ))
        
        return registration_id

class DocumentUploadDB:
    """SQLAlchemy model for Document Upload"""
    
    def __init__(self, db_connection):
        self.db = db_connection
    
    def create_table(self):
        """Create document uploads table"""
        query = """
        CREATE TABLE IF NOT EXISTS document_uploads (
            id VARCHAR(36) PRIMARY KEY,
            employee_id VARCHAR(20) NOT NULL,
            document_type VARCHAR(50) NOT NULL,
            file_name VARCHAR(255) NOT NULL,
            file_size DECIMAL(5,2) NOT NULL,
            file_type VARCHAR(10) NOT NULL,
            file_path VARCHAR(500) NOT NULL,
            status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
            uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            verified_at TIMESTAMP NULL,
            verified_by VARCHAR(100) NULL,
            FOREIGN KEY (employee_id) REFERENCES employee_registrations(employee_id)
        )
        """
        self.db.execute_query(query)
    
    def create(self, document_data: dict) -> str:
        """Create new document upload record"""
        query = """
        INSERT INTO document_uploads 
        (id, employee_id, document_type, file_name, file_size, file_type, file_path)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        document_id = str(uuid.uuid4())
        
        self.db.execute_query(query, (
            document_id,
            document_data['employeeId'],
            document_data['documentType'],
            document_data['fileName'],
            document_data['fileSize'],
            document_data['fileType'],
            document_data['filePath']
        ))
        
        return document_id

class OnboardingRecordDB:
    """SQLAlchemy model for complete Onboarding Record"""
    
    def __init__(self, db_connection):
        self.db = db_connection
    
    def create_table(self):
        """Create onboarding records table"""
        query = """
        CREATE TABLE IF NOT EXISTS onboarding_records (
            id VARCHAR(36) PRIMARY KEY,
            employee_id VARCHAR(20) UNIQUE NOT NULL,
            status ENUM('draft', 'in_progress', 'completed', 'active', 'terminated') DEFAULT 'draft',
            current_step INT DEFAULT 0,
            completed_steps JSON,
            registration_id VARCHAR(36),
            role_assignment_id VARCHAR(36),
            work_policy_id VARCHAR(36),
            salary_setup_id VARCHAR(36),
            system_access_id VARCHAR(36),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            completed_at TIMESTAMP NULL,
            FOREIGN KEY (employee_id) REFERENCES employee_registrations(employee_id)
        )
        """
        self.db.execute_query(query)
    
    def create(self, record_data: dict) -> str:
        """Create new onboarding record"""
        query = """
        INSERT INTO onboarding_records 
        (id, employee_id, status, current_step, completed_steps)
        VALUES (%s, %s, %s, %s, %s)
        """
        record_id = str(uuid.uuid4())
        
        self.db.execute_query(query, (
            record_id,
            record_data['employeeId'],
            record_data.get('status', 'draft'),
            record_data.get('currentStep', 0),
            json.dumps(record_data.get('completedSteps', []))
        ))
        
        return record_id
    
    def update_status(self, employee_id: str, status: str, step: int = None):
        """Update onboarding status and step"""
        query = """
        UPDATE onboarding_records 
        SET status = %s, updated_at = CURRENT_TIMESTAMP
        """
        params = [status]
        
        if step is not None:
            query += ", current_step = %s"
            params.append(step)
        
        query += " WHERE employee_id = %s"
        params.append(employee_id)
        
        self.db.execute_query(query, params)

# Import json for completed_steps field
import json
