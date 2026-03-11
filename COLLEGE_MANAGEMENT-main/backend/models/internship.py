from datetime import datetime
from typing import Optional
from pydantic import BaseModel, HttpUrl
from uuid import UUID, uuid4

class InternshipOpportunity(BaseModel):
    """Model for internship opportunities in the database"""
    id: UUID = None
    title: str
    company: str
    location: str
    type: str  # full_time, part_time, remote, hybrid, onsite
    duration: Optional[str] = None
    min_stipend: Optional[float] = None
    max_stipend: Optional[float] = None
    is_unpaid: bool = False
    apply_url: Optional[str] = None
    source: Optional[str] = None
    description: Optional[str] = None
    deadline: Optional[datetime] = None
    posted_date: datetime = None
    is_active: bool = True
    created_at: datetime = None
    updated_at: datetime = None
    
    def __init__(self, **data):
        super().__init__(**data)
        if self.id is None:
            self.id = uuid4()
        if self.posted_date is None:
            self.posted_date = datetime.utcnow()
        if self.created_at is None:
            self.created_at = datetime.utcnow()
        if self.updated_at is None:
            self.updated_at = datetime.utcnow()
    
    def to_dict(self):
        """Convert model to dictionary for database operations"""
        return {
            'id': str(self.id),
            'title': self.title,
            'company': self.company,
            'location': self.location,
            'type': self.type,
            'duration': self.duration,
            'min_stipend': self.min_stipend,
            'max_stipend': self.max_stipend,
            'is_unpaid': self.is_unpaid,
            'apply_url': str(self.apply_url) if self.apply_url else None,
            'source': self.source,
            'description': self.description,
            'deadline': self.deadline.isoformat() if self.deadline else None,
            'posted_date': self.posted_date.isoformat(),
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    @classmethod
    def from_dict(cls, data: dict):
        """Create model from dictionary (e.g., from database)"""
        if 'id' in data:
            data['id'] = UUID(data['id']) if not isinstance(data['id'], UUID) else data['id']
        if 'deadline' in data and data['deadline']:
            data['deadline'] = datetime.fromisoformat(data['deadline']) if isinstance(data['deadline'], str) else data['deadline']
        if 'posted_date' in data and data['posted_date']:
            data['posted_date'] = datetime.fromisoformat(data['posted_date']) if isinstance(data['posted_date'], str) else data['posted_date']
        if 'created_at' in data and data['created_at']:
            data['created_at'] = datetime.fromisoformat(data['created_at']) if isinstance(data['created_at'], str) else data['created_at']
        if 'updated_at' in data and data['updated_at']:
            data['updated_at'] = datetime.fromisoformat(data['updated_at']) if isinstance(data['updated_at'], str) else data['updated_at']
        return cls(**data)
