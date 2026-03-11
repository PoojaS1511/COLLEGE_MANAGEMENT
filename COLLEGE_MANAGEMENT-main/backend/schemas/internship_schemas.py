from pydantic import BaseModel, Field, HttpUrl, validator
from datetime import datetime
from typing import Optional, List
from enum import Enum
from uuid import UUID

class InternshipType(str, Enum):
    FULL_TIME = "full_time"
    PART_TIME = "part_time"
    REMOTE = "remote"
    HYBRID = "hybrid"
    ONSITE = "onsite"

class InternshipBase(BaseModel):
    title: str = Field(..., max_length=255, description="Title of the internship position")
    company: str = Field(..., max_length=255, description="Name of the company offering the internship")
    location: str = Field(..., max_length=255, description="Location of the internship")
    type: InternshipType = Field(..., description="Type of internship (full-time, part-time, etc.)")
    duration: Optional[str] = Field(None, max_length=100, description="Duration of the internship")
    min_stipend: Optional[float] = Field(None, ge=0, description="Minimum monthly stipend")
    max_stipend: Optional[float] = Field(None, ge=0, description="Maximum monthly stipend")
    is_unpaid: bool = Field(False, description="Whether the internship is unpaid")
    apply_url: Optional[HttpUrl] = Field(None, description="URL to apply for the internship")
    source: Optional[str] = Field(None, max_length=100, description="Source of the internship posting")
    description: Optional[str] = Field(None, description="Detailed description of the internship")
    deadline: Optional[datetime] = Field(None, description="Application deadline")
    is_active: bool = Field(True, description="Whether the opportunity is still active")

    @validator('max_stipend')
    def validate_stipend_range(cls, v, values):
        if 'min_stipend' in values and v is not None and values['min_stipend'] is not None:
            if v < values['min_stipend']:
                raise ValueError('max_stipend must be greater than or equal to min_stipend')
        return v

class InternshipCreate(InternshipBase):
    pass

class InternshipUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    company: Optional[str] = Field(None, max_length=255)
    location: Optional[str] = Field(None, max_length=255)
    type: Optional[InternshipType] = None
    duration: Optional[str] = Field(None, max_length=100)
    min_stipend: Optional[float] = Field(None, ge=0)
    max_stipend: Optional[float] = Field(None, ge=0)
    is_unpaid: Optional[bool] = None
    apply_url: Optional[HttpUrl] = None
    source: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    deadline: Optional[datetime] = None
    is_active: Optional[bool] = None

class InternshipInDB(InternshipBase):
    id: UUID
    posted_date: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class InternshipResponse(InternshipInDB):
    pass

class InternshipListResponse(BaseModel):
    total: int
    items: List[InternshipResponse]
