from typing import Optional, List
from datetime import date, datetime
from pydantic import BaseModel, Field, validator
from uuid import UUID
from enum import Enum
from typing import Optional

# Enums
class AttendanceStatus(str, Enum):
    PRESENT = "present"
    ABSENT = "absent"
    LATE = "late"
    EXCUSED = "excused"

class FeeStatus(str, Enum):
    PAID = "paid"
    UNPAID = "unpaid"
    PARTIAL = "partial"
    WAIVED = "waived"

class InternshipStatus(str, Enum):
    APPLIED = "applied"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    REJECTED = "rejected"

# Base schemas
class AttendanceBase(BaseModel):
    date: date
    status: AttendanceStatus
    subject_id: UUID
    notes: Optional[str] = None

class MarkBase(BaseModel):
    subject_id: UUID
    exam_id: UUID
    marks_obtained: float
    max_marks: float = 100.0
    grade: Optional[str] = None
    remarks: Optional[str] = None

class FeeBase(BaseModel):
    fee_type: str
    amount: float
    due_date: Optional[date] = None
    status: FeeStatus = FeeStatus.UNPAID
    payment_date: Optional[date] = None
    payment_method: Optional[str] = None
    transaction_id: Optional[str] = None
    receipt_number: Optional[str] = None
    academic_year: Optional[str] = None
    semester: Optional[str] = None

class InternshipBase(BaseModel):
    company_name: str
    position: str
    start_date: date
    end_date: Optional[date] = None
    status: InternshipStatus = InternshipStatus.APPLIED
    description: Optional[str] = None
    supervisor_name: Optional[str] = None
    supervisor_email: Optional[str] = None
    supervisor_phone: Optional[str] = None
    is_paid: bool = False
    stipend_amount: Optional[float] = None
    certificate_url: Optional[str] = None

class SubjectBase(BaseModel):
    subject_code: str
    subject_name: str
    course_id: Optional[UUID] = None
    semester: Optional[int] = None
    credits: Optional[int] = None

# Create schemas
class AttendanceCreate(AttendanceBase):
    pass

class MarkCreate(MarkBase):
    pass

class FeeCreate(FeeBase):
    pass

class InternshipCreate(InternshipBase):
    pass

class SubjectCreate(SubjectBase):
    pass

# Update schemas
class AttendanceUpdate(BaseModel):
    status: Optional[AttendanceStatus] = None
    subject_id: Optional[UUID] = None
    notes: Optional[str] = None

class MarkUpdate(BaseModel):
    marks_obtained: Optional[float] = None
    max_marks: Optional[float] = None
    grade: Optional[str] = None
    remarks: Optional[str] = None

class FeeUpdate(BaseModel):
    status: Optional[FeeStatus] = None
    payment_date: Optional[date] = None
    payment_method: Optional[str] = None
    transaction_id: Optional[str] = None
    receipt_number: Optional[str] = None

class InternshipUpdate(BaseModel):
    company_name: Optional[str] = None
    position: Optional[str] = None
    end_date: Optional[date] = None
    status: Optional[InternshipStatus] = None
    description: Optional[str] = None
    supervisor_name: Optional[str] = None
    supervisor_email: Optional[str] = None
    supervisor_phone: Optional[str] = None
    is_paid: Optional[bool] = None
    stipend_amount: Optional[float] = None
    certificate_url: Optional[str] = None

# Response schemas
class SubjectResponse(SubjectBase):
    id: UUID
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class AttendanceResponse(AttendanceBase):
    id: UUID
    student_id: UUID
    recorded_by: Optional[UUID] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class MarkResponse(MarkBase):
    id: UUID
    student_id: UUID
    recorded_by: Optional[UUID] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class FeeResponse(FeeBase):
    id: UUID
    student_id: UUID
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class InternshipResponse(InternshipBase):
    id: UUID
    student_id: UUID
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Dashboard schemas
class DashboardStats(BaseModel):
    attendance_percentage: float
    total_classes: int
    present_classes: int
    upcoming_exams: List[dict]
    pending_fees: float
    cgpa: float
    recent_activities: List[dict]

    class Config:
        from_attributes = True
