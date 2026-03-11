# backend/models/career_course.py
from datetime import datetime
from .. import db
from sqlalchemy.dialects.postgresql import ARRAY, JSONB

class CareerCourse(db.Model):
    """Career Course model for career development courses"""
    __tablename__ = 'career_courses'

    id = db.Column(db.String(50), primary_key=True)
    title = db.Column(db.Text, nullable=False)
    platform = db.Column(db.Text, nullable=False)
    url = db.Column(db.Text, nullable=False)
    category = db.Column(db.Text)
    difficulty = db.Column(db.Text)
    duration = db.Column(db.Text)
    rating = db.Column(db.Numeric)
    language = db.Column(db.Text)
    is_free = db.Column(db.Boolean)
    instructor = db.Column(db.Text)
    description = db.Column(db.Text)
    image_url = db.Column(db.Text)
    skills = db.Column(ARRAY(db.Text))
    enrollment_status = db.Column(db.Text)
    progress = db.Column(db.Integer)
    assignments = db.Column(JSONB)
    resources = db.Column(JSONB)
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    updated_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        """Convert the model to a dictionary"""
        return {
            'id': str(self.id) if hasattr(self.id, 'hex') else self.id,
            'title': self.title,
            'platform': self.platform,
            'url': self.url,
            'category': self.category,
            'difficulty': self.difficulty,
            'duration': self.duration,
            'rating': float(self.rating) if self.rating is not None else None,
            'language': self.language,
            'is_free': self.is_free,
            'instructor': self.instructor,
            'description': self.description,
            'image_url': self.image_url,
            'skills': self.skills if self.skills else [],
            'enrollment_status': self.enrollment_status,
            'progress': self.progress,
            'assignments': self.assignments if self.assignments else {},
            'resources': self.resources if self.resources else [],
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    @classmethod
    def from_dict(cls, data):
        """Create a new instance from a dictionary"""
        return cls(
            id=data.get('id'),
            title=data.get('title'),
            platform=data.get('platform'),
            url=data.get('url'),
            category=data.get('category'),
            difficulty=data.get('difficulty'),
            duration=data.get('duration'),
            rating=data.get('rating'),
            language=data.get('language'),
            is_free=data.get('is_free', False),
            instructor=data.get('instructor'),
            description=data.get('description'),
            image_url=data.get('image_url'),
            skills=data.get('skills', []),
            enrollment_status=data.get('enrollment_status'),
            progress=data.get('progress', 0),
            assignments=data.get('assignments', {}),
            resources=data.get('resources', [])
        )

    def update_from_dict(self, data):
        """Update instance from a dictionary"""
        for key, value in data.items():
            if hasattr(self, key) and key != 'id':  # Don't update the ID
                setattr(self, key, value)

    def __repr__(self):
        return f'<CareerCourse {self.title} ({self.platform})>'