from pydantic import BaseModel, validator
from uuid import UUID
from datetime import datetime
from typing import Optional

class ExamInvigilatorBase(BaseModel):
    exam_id: UUID
    staff_id: UUID
    role: str

    @validator('role')
    def validate_role(cls, v):
        valid_roles = ["Chief Invigilator", "Invigilator", "Observer"]
        if v not in valid_roles:
            raise ValueError(f"Role must be one of {valid_roles}")
        return v

class ExamInvigilatorCreate(ExamInvigilatorBase):
    pass

class ExamInvigilatorUpdate(BaseModel):
    role: Optional[str] = None

class ExamInvigilatorInDB(ExamInvigilatorBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
