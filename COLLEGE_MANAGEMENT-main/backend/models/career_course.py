from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, validator
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from .base import Base

# Pydantic Models for request/response validation

class CareerCourseBase(BaseModel):
    """Base model for career course data validation"""
    title: str = Field(..., min_length=1, max_length=255)
    platform: Optional[str] = Field(None, max_length=100)
    embed_url: Optional[str] = Field(None, max_length=500)
    description: Optional[str] = Field(None, max_length=1000)
    level: Optional[str] = Field(None, max_length=50)
    external_url: Optional[str] = Field(None, max_length=500)
    category: Optional[str] = Field(None, max_length=100)
    is_free: Optional[bool] = True
    career_id: int
    course_id: int

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "title": "Introduction to Python",
                "platform": "Coursera",
                "description": "Learn Python programming from scratch",
                "level": "Beginner",
                "is_free": True,
                "career_id": 1,
                "course_id": 1
            }
        }

# Pydantic Models for different operations
class CareerCourseCreate(CareerCourseBase):
    """Model for creating a new career course"""
    pass

class CareerCourseUpdate(BaseModel):
    """Model for updating an existing career course"""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    platform: Optional[str] = Field(None, max_length=100)
    embed_url: Optional[str] = Field(None, max_length=500)
    description: Optional[str] = Field(None, max_length=1000)
    level: Optional[str] = Field(None, max_length=50)
    external_url: Optional[str] = Field(None, max_length=500)
    category: Optional[str] = Field(None, max_length=100)
    is_free: Optional[bool] = None
    career_id: Optional[int] = None
    course_id: Optional[int] = None

    class Config:
        from_attributes = True

class CareerCourseInDB(CareerCourseBase):
    """Model for career course data in the database"""
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# SQLAlchemy Model
class CareerCourse(Base):
    __tablename__ = 'career_courses'
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    platform = Column(String(100))
    embed_url = Column(String(500))
    description = Column(Text)
    level = Column(String(50))
    external_url = Column(String(500))
    category = Column(String(100))
    is_free = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    career_id = Column(Integer, ForeignKey('careers.id'), nullable=False)
    course_id = Column(Integer, ForeignKey('courses.id'), nullable=False)
    
    # Relationships
    career = relationship("Career", back_populates="career_courses")
    course = relationship("Course", back_populates="career_courses")
    
    def __repr__(self):
        return f"<CareerCourse {self.title} ({self.platform})>"
    
    def to_dict(self):
        """Convert model instance to dictionary"""
        return {
            'id': self.id,
            'title': self.title,
            'platform': self.platform,
            'description': self.description,
            'level': self.level,
            'external_url': self.external_url,
            'category': self.category,
            'is_free': self.is_free,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'career_id': self.career_id,
            'course_id': self.course_id
        }