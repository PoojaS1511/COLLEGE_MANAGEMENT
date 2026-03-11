from sqlalchemy import Column, String, Date, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .base import Base
import uuid
from datetime import datetime

class Student(Base):
    __tablename__ = 'students'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String, unique=True, nullable=False)  # Supabase auth user ID
    admission_number = Column(String(50), unique=True, nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    phone = Column(String(20))
    date_of_birth = Column(Date)
    gender = Column(String(20))
    address = Column(String(500))
    city = Column(String(100))
    state = Column(String(100))
    country = Column(String(100))
    pincode = Column(String(20))
    course_id = Column(UUID(as_uuid=True), ForeignKey('courses.id'))
    admission_date = Column(Date, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    course = relationship('Course', back_populates='students')
    attendance_records = relationship('Attendance', back_populates='student')
    marks = relationship('Mark', back_populates='student')
    fees = relationship('Fee', back_populates='student')
    internships = relationship('Internship', back_populates='student')
