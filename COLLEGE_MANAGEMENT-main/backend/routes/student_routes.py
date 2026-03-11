from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import date
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
import uuid

from database import get_db
from models.db_models import Attendance, Mark, Fee, Internship, Subject
from schemas.student_schemas import (
    AttendanceCreate, AttendanceResponse, AttendanceUpdate,
    MarkCreate, MarkResponse, MarkUpdate,
    FeeCreate, FeeResponse, FeeUpdate,
    InternshipCreate, InternshipResponse, InternshipUpdate,
    SubjectResponse
)
from utils.auth import get_current_user, UserRole

router = APIRouter(prefix="/api/students", tags=["students"])

# Helper function to check if the current user is the student or an admin
async def check_student_access(student_id: str, current_user: dict):
    if current_user["role"] not in [UserRole.ADMIN, UserRole.STAFF] and str(current_user["id"]) != student_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this student's data"
        )

# Attendance Routes
@router.post("/{student_id}/attendance", response_model=AttendanceResponse)
async def create_attendance(
    student_id: str,
    attendance: AttendanceCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    await check_student_access(student_id, current_user)

    # Check if attendance already exists for the student on the given date and subject
    existing_attendance = db.query(Attendance).filter(
        and_(
            Attendance.student_id == uuid.UUID(student_id),
            Attendance.date == attendance.date,
            Attendance.subject_id == attendance.subject_id
        )
    ).first()

    if existing_attendance:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Attendance record already exists for this student on the given date and subject"
        )

    db_attendance = Attendance(
        student_id=uuid.UUID(student_id),
        **attendance.dict(),
        recorded_by=current_user["id"]
    )

    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)

    return db_attendance

@router.get("/{student_id}/attendance", response_model=List[AttendanceResponse])
async def get_student_attendance(
    student_id: str,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    subject_id: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    await check_student_access(student_id, current_user)

    query = db.query(Attendance).filter(
        Attendance.student_id == uuid.UUID(student_id)
    )
    
    if start_date:
        query = query.filter(Attendance.date >= start_date)
    if end_date:
        query = query.filter(Attendance.date <= end_date)
    if subject_id:
        query = query.filter(Attendance.subject_id == uuid.UUID(subject_id))
    if status:
        query = query.filter(Attendance.status == status)
    
    return query.order_by(Attendance.date.desc()).all()

@router.put("/attendance/{attendance_id}", response_model=AttendanceResponse)
async def update_attendance(
    attendance_id: str,
    attendance_update: AttendanceUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    db_attendance = db.query(Attendance).filter(Attendance.id == uuid.UUID(attendance_id)).first()
    
    if not db_attendance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attendance record not found"
        )
    
    # Check if the current user is authorized to update this attendance
    if current_user["role"] not in [UserRole.ADMIN, UserRole.STAFF]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update attendance records"
        )
    
    for key, value in attendance_update.dict(exclude_unset=True).items():
        setattr(db_attendance, key, value)
    
    db_attendance.recorded_by = current_user["id"]
    
    db.commit()
    db.refresh(db_attendance)
    
    return db_attendance

# Marks Routes
@router.post("/{student_id}/marks", response_model=MarkResponse)
async def create_mark(
    student_id: str,
    mark: MarkCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    await check_student_access(student_id, current_user)

    # Check if mark already exists for the student, subject and exam
    existing_mark = db.query(Mark).filter(
        and_(
            Mark.student_id == uuid.UUID(student_id),
            Mark.subject_id == mark.subject_id,
            Mark.exam_id == mark.exam_id
        )
    ).first()

    if existing_mark:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mark already exists for this student, subject and exam combination"
        )

    db_mark = Mark(
        student_id=uuid.UUID(student_id),
        **mark.dict(),
        recorded_by=current_user["id"]
    )

    db.add(db_mark)
    db.commit()
    db.refresh(db_mark)

    return db_mark

@router.get("/{student_id}/marks", response_model=List[MarkResponse])
async def get_student_marks(
    student_id: str,
    subject_id: Optional[str] = None,
    exam_id: Optional[str] = None,
    academic_year: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    await check_student_access(student_id, current_user)

    query = db.query(Mark).filter(
        Mark.student_id == uuid.UUID(student_id)
    )
    
    if subject_id:
        query = query.filter(Mark.subject_id == uuid.UUID(subject_id))
    if exam_id:
        query = query.filter(Mark.exam_id == uuid.UUID(exam_id))
    if academic_year:
        query = query.join(Exam, Mark.exam_id == Exam.id).filter(
            Exam.academic_year == academic_year
        )
    
    return query.order_by(Mark.created_at.desc()).all()

# Fees Routes
@router.post("/{student_id}/fees", response_model=FeeResponse)
async def create_fee(
    student_id: str,
    fee: FeeCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] not in [UserRole.ADMIN, UserRole.ACCOUNTS]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create fee records"
        )

    db_fee = Fee(
        student_id=uuid.UUID(student_id),
        **fee.dict()
    )

    db.add(db_fee)
    db.commit()
    db.refresh(db_fee)

    return db_fee

@router.get("/{student_id}/fees", response_model=List[FeeResponse])
async def get_student_fees(
    student_id: str,
    status: Optional[str] = None,
    fee_type: Optional[str] = None,
    academic_year: Optional[str] = None,
    semester: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    await check_student_access(student_id, current_user)

    query = db.query(Fee).filter(
        Fee.student_id == uuid.UUID(student_id)
    )
    
    if status:
        query = query.filter(Fee.status == status)
    if fee_type:
        query = query.filter(Fee.fee_type == fee_type)
    if academic_year:
        query = query.filter(Fee.academic_year == academic_year)
    if semester:
        query = query.filter(Fee.semester == semester)
    
    return query.order_by(Fee.due_date.desc()).all()

@router.put("/fees/{fee_id}/pay", response_model=FeeResponse)
async def record_fee_payment(
    fee_id: str,
    payment_data: dict,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] not in [UserRole.ADMIN, UserRole.ACCOUNTS]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to record fee payments"
        )
    
    db_fee = db.query(Fee).filter(Fee.id == uuid.UUID(fee_id)).first()
    
    if not db_fee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fee record not found"
        )
    
    # Update fee payment details
    db_fee.status = payment_data.get("status", db_fee.status)
    db_fee.payment_date = payment_data.get("payment_date", db_fee.payment_date)
    db_fee.payment_method = payment_data.get("payment_method", db_fee.payment_method)
    db_fee.transaction_id = payment_data.get("transaction_id", db_fee.transaction_id)
    db_fee.receipt_number = payment_data.get("receipt_number", db_fee.receipt_number)
    
    db.commit()
    db.refresh(db_fee)
    
    return db_fee

# Internship Routes
@router.post("/{student_id}/internships", response_model=InternshipResponse)
async def create_internship(
    student_id: str,
    internship: InternshipCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    await check_student_access(student_id, current_user)

    db_internship = Internship(
        student_id=uuid.UUID(student_id),
        **internship.dict()
    )

    db.add(db_internship)
    db.commit()
    db.refresh(db_internship)

    return db_internship

@router.get("/{student_id}/internships", response_model=List[InternshipResponse])
async def get_student_internships(
    student_id: str,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    await check_student_access(student_id, current_user)

    query = db.query(Internship).filter(
        Internship.student_id == uuid.UUID(student_id)
    )
    
    if status:
        query = query.filter(Internship.status == status)
    
    return query.order_by(Internship.start_date.desc()).all()

@router.put("/internships/{internship_id}", response_model=InternshipResponse)
async def update_internship(
    internship_id: str,
    internship_update: InternshipUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    db_internship = db.query(Internship).filter(Internship.id == uuid.UUID(internship_id)).first()
    
    if not db_internship:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Internship record not found"
        )

    # Check if the current user is the student who owns this internship or an admin
    if current_user["role"] not in [UserRole.ADMIN, UserRole.STAFF] and str(current_user["id"]) != str(db_internship.student_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this internship record"
        )
    
    for key, value in internship_update.dict(exclude_unset=True).items():
        setattr(db_internship, key, value)
    
    db.commit()
    db.refresh(db_internship)
    
    return db_internship

# Subject Routes
@router.get("/subjects", response_model=List[SubjectResponse])
async def get_subjects(
    course_id: Optional[str] = None,
    semester: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    query = db.query(Subject)
    
    if course_id:
        query = query.filter(Subject.course_id == uuid.UUID(course_id))
    if semester is not None:
        query = query.filter(Subject.semester == semester)
    
    return query.order_by(Subject.subject_code).all()

# Student Dashboard Stats
@router.get("/{student_id}/dashboard-stats")
async def get_dashboard_stats(
    student_id: str,
    academic_year: Optional[str] = None,
    semester: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    await check_student_access(student_id, current_user)

    # Get attendance stats
    attendance_query = db.query(Attendance).filter(
        Attendance.student_id == uuid.UUID(student_id)
    )
    
    if academic_year:
        # Assuming academic year is in format "2023-2024"
        start_year = int(academic_year.split('-')[0])
        end_year = int(academic_year.split('-')[1])
        attendance_query = attendance_query.filter(
            and_(
                Attendance.date >= date(start_year, 6, 1),  # Academic year starts in June
                Attendance.date < date(end_year, 6, 1)
            )
        )
    
    attendance_records = attendance_query.all()
    
    total_classes = len(attendance_records)
    present_classes = len([r for r in attendance_records if r.status == 'present'])
    attendance_percentage = round((present_classes / total_classes * 100), 2) if total_classes > 0 else 0
    
    # Get upcoming exams
    today = date.today()
    upcoming_exams = db.query(Exam).filter(
        and_(
            Exam.date >= today,
            Exam.id.in_(
                db.query(Mark.exam_id).filter(
                    Mark.student_id == uuid.UUID(student_id)
                )
            )
        )
    ).order_by(Exam.date).limit(5).all()

    # Get pending fees
    pending_fees = db.query(Fee).filter(
        and_(
            Fee.student_id == uuid.UUID(student_id),
            Fee.status.in_(["unpaid", "partial"])
        )
    ).all()

    total_pending = sum(float(fee.amount) for fee in pending_fees)

    # Get CGPA (simplified calculation)
    marks = db.query(Mark).filter(
        Mark.student_id == uuid.UUID(student_id)
    ).all()
    
    if academic_year:
        marks = [m for m in marks if m.exam and m.exam.academic_year == academic_year]
    if semester:
        marks = [m for m in marks if m.exam and m.exam.semester == semester]
    
    # Simple CGPA calculation (assuming 10-point scale)
    total_credits = 0
    weighted_sum = 0
    
    for mark in marks:
        if mark.marks_obtained is not None and mark.subject and mark.subject.credits:
            # Convert percentage to GPA (simplified)
            percentage = (mark.marks_obtained / mark.max_marks) * 100
            if percentage >= 90:
                gpa = 10
            elif percentage >= 80:
                gpa = 9
            elif percentage >= 70:
                gpa = 8
            elif percentage >= 60:
                gpa = 7
            elif percentage >= 50:
                gpa = 6
            elif percentage >= 40:
                gpa = 5
            else:
                gpa = 0
                
            total_credits += mark.subject.credits
            weighted_sum += gpa * mark.subject.credits
    
    cgpa = round(weighted_sum / total_credits, 2) if total_credits > 0 else 0
    
    return {
        "attendance_percentage": attendance_percentage,
        "total_classes": total_classes,
        "present_classes": present_classes,
        "upcoming_exams": [
            {
                "id": str(exam.id),
                "name": exam.name,
                "date": exam.date.isoformat(),
                "subject": exam.subject.subject_name if exam.subject else "Unknown"
            }
            for exam in upcoming_exams
        ],
        "pending_fees": total_pending,
        "cgpa": cgpa,
        "recent_activities": []  # Can be implemented to show recent activities
    }
