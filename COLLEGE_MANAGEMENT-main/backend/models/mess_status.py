from sqlalchemy import Column, Integer, String, DateTime, func
from .base import Base

class MessStatus(Base):
    __tablename__ = "mess_status"

    id = Column(Integer, primary_key=True, index=True)
    meal_type = Column(String, unique=True, index=True, nullable=False)
    status = Column(String, default="active", nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<MessStatus(id={self.id}, meal_type='{self.meal_type}', status='{self.status}')>"
