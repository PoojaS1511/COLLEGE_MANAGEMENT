import sys
import os
from pathlib import Path

# Add the project root to the Python path
project_root = str(Path(__file__).resolve().parent.parent)
sys.path.insert(0, project_root)

from datetime import datetime, time
import uuid
from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models.db_models import Base, Exam, ExamRoom, ExamStudent, ExamInvigilator
from models.user import User
from models.subject import Subject
from models.room import Room

def init_db():
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Check if we already have sample data
        if db.query(Exam).count() > 0:
            print("Sample data already exists. Skipping initialization.")
            return
        
        print("Creating sample exam data...")
        
        # Get or create a sample user
        user = db.query(User).first()
        if not user:
            user = User(
                id=uuid.uuid4(),
                email="admin@example.com",
                hashed_password="hashed_password_here",  # In a real app, hash this properly
                full_name="Admin User",
                role="admin",
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        # Create sample subjects if they don't exist
        math_subject = db.query(Subject).filter(Subject.name == "Mathematics").first()
        if not math_subject:
            math_subject = Subject(
                id=uuid.uuid4(),
                name="Mathematics",
                code="MATH101",
                department_id=uuid.uuid4(),
                credits=4,
                description="Introduction to Mathematics"
            )
            db.add(math_subject)
            db.commit()
            db.refresh(math_subject)
        
        physics_subject = db.query(Subject).filter(Subject.name == "Physics").first()
        if not physics_subject:
            physics_subject = Subject(
                id=uuid.uuid4(),
                name="Physics",
                code="PHYS101",
                department_id=uuid.uuid4(),
                credits=4,
                description="Introduction to Physics"
            )
            db.add(physics_subject)
            db.commit()
            db.refresh(physics_subject)
        
        # Create sample rooms if they don't exist
        room1 = db.query(Room).filter(Room.name == "Room 101").first()
        if not room1:
            room1 = Room(
                id=uuid.uuid4(),
                name="Room 101",
                building="Main Building",
                capacity=30,
                room_type="Lecture Hall"
            )
            db.add(room1)
            db.commit()
            db.refresh(room1)
        
        room2 = db.query(Room).filter(Room.name == "Lab 201").first()
        if not room2:
            room2 = Room(
                id=uuid.uuid4(),
                name="Lab 201",
                building="Science Building",
                capacity=20,
                room_type="Lab"
            )
            db.add(room2)
            db.commit()
            db.refresh(room2)
        
        # Create sample exams
        exam1 = Exam(
            id=uuid.uuid4(),
            name="Midterm Exam - Mathematics",
            subject_id=math_subject.id,
            academic_year="2023-2024",
            semester="Fall",
            date=datetime(2023, 11, 15).date(),
            start_time=time(9, 0),
            end_time=time(11, 0),
            duration=120,
            exam_type="Midterm",
            max_marks=100,
            passing_marks=35,
            status="Scheduled",
            description="Midterm exam for Mathematics",
            created_by=user.id
        )
        db.add(exam1)
        
        exam2 = Exam(
            id=uuid.uuid4(),
            name="Final Exam - Physics",
            subject_id=physics_subject.id,
            academic_year="2023-2024",
            semester="Fall",
            date=datetime(2023, 12, 20).date(),
            start_time=time(14, 0),
            end_time=time(17, 0),
            duration=180,
            exam_type="Final",
            max_marks=100,
            passing_marks=35,
            status="Draft",
            description="Final exam for Physics",
            created_by=user.id
        )
        db.add(exam2)
        
        db.commit()
        
        # Create exam rooms
        exam_room1 = ExamRoom(
            id=uuid.uuid4(),
            exam_id=exam1.id,
            room_id=room1.id,
            max_students=30,
            current_students=0
        )
        db.add(exam_room1)
        
        exam_room2 = ExamRoom(
            id=uuid.uuid4(),
            exam_id=exam2.id,
            room_id=room2.id,
            max_students=20,
            current_students=0
        )
        db.add(exam_room2)
        
        db.commit()
        
        print("Sample exam data created successfully!")
        
    except Exception as e:
        print(f"Error initializing exam data: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("Initializing exam database...")
    init_db()
    print("Database initialization complete.")
