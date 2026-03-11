from datetime import datetime, time
from typing import Optional
from pydantic import BaseModel, Field, validator
from uuid import UUID

class ExamBase(BaseModel):
    name: str
    subject_id: UUID
    academic_year: str
    semester: str
    date: str
    start_time: str
    end_time: str
    duration: int
    exam_type: str
    max_marks: int = 100
    passing_marks: int = 35
    status: str = "Draft"
    description: Optional[str] = None

    @validator('date')
    def validate_date(cls, v):
        try:
            datetime.strptime(v, '%Y-%m-%d')
            return v
        except ValueError:
            raise ValueError("Date must be in YYYY-MM-DD format")

    @validator('start_time', 'end_time')
    def validate_time(cls, v):
        try:
            time.fromisoformat(v)
            return v
        except ValueError:
            raise ValueError("Time must be in HH:MM:SS format")

class ExamCreate(ExamBase):
    pass

class ExamUpdate(ExamBase):
    name: Optional[str] = None
    subject_id: Optional[UUID] = None
    academic_year: Optional[str] = None
    semester: Optional[str] = None
    date: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    duration: Optional[int] = None
    exam_type: Optional[str] = None
    max_marks: Optional[int] = None
    passing_marks: Optional[int] = None
    status: Optional[str] = None
    description: Optional[str] = None

class ExamInDB(ExamBase):
    id: UUID
    created_by: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
