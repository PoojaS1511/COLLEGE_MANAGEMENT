from pydantic import BaseModel, validator
from uuid import UUID
from typing import Optional
from datetime import datetime

class ExamStudentBase(BaseModel):
    exam_id: UUID
    student_id: UUID
    room_id: Optional[UUID] = None
    seat_number: Optional[str] = None
    status: str = "Registered"
    marks_obtained: Optional[float] = None
    grade: Optional[str] = None

    @validator('status')
    def validate_status(cls, v):
        valid_statuses = ["Registered", "Present", "Absent", "Deferred"]
        if v not in valid_statuses:
            raise ValueError(f"Status must be one of {valid_statuses}")
        return v

class ExamStudentCreate(ExamStudentBase):
    pass

class ExamStudentUpdate(BaseModel):
    room_id: Optional[UUID] = None
    seat_number: Optional[str] = None
    status: Optional[str] = None
    marks_obtained: Optional[float] = None
    grade: Optional[str] = None

class ExamStudentInDB(ExamStudentBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
