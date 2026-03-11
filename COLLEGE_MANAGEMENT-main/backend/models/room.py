from sqlalchemy import Column, String, Integer, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .base import Base
import uuid

class Room(Base):
    __tablename__ = 'rooms'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False, unique=True)
    building = Column(String(100))
    floor = Column(String(50))
    capacity = Column(Integer, nullable=False)
    room_type = Column(String(50))  # e.g., 'lecture', 'lab', 'seminar'
    is_active = Column(Boolean, default=True)
    
    # Relationships
    exam_rooms = relationship('ExamRoom', back_populates='room')
