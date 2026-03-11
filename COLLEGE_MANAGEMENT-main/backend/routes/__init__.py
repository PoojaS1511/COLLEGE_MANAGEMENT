# Routes package
# backend/routes/__init__.py
from .career_courses import bp as career_courses_bp

# Export the blueprint to be imported by app.py
__all__ = ['career_courses_bp']