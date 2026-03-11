from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from ..database import get_db
from ..models.mess_status import MessStatus
from ..schemas.mess_status import MessStatus as MessStatusSchema, MessStatusCreate, MessStatusUpdate

router = APIRouter(
    prefix="/api/hostel",
    tags=["hostel"],
    responses={404: {"description": "Not found"}},
)

@router.get("/mess-status", response_model=List[MessStatusSchema])
def get_mess_statuses(db: Session = Depends(get_db)):
    """
    Retrieve all mess statuses
    """
    return db.query(MessStatus).order_by(MessStatus.meal_type).all()

@router.post("/mess-status", response_model=MessStatusSchema, status_code=status.HTTP_201_CREATED)
def create_mess_status(status_data: MessStatusCreate, db: Session = Depends(get_db)):
    """
    Create a new mess status
    """
    db_status = db.query(MessStatus).filter(MessStatus.meal_type == status_data.meal_type).first()
    if db_status:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Meal type already exists"
        )
    
    db_status = MessStatus(**status_data.dict())
    db.add(db_status)
    db.commit()
    db.refresh(db_status)
    return db_status

@router.put("/mess-status/{status_id}", response_model=MessStatusSchema)
def update_mess_status(
    status_id: int, 
    status_data: MessStatusUpdate, 
    db: Session = Depends(get_db)
):
    """
    Update an existing mess status
    """
    db_status = db.query(MessStatus).filter(MessStatus.id == status_id).first()
    if not db_status:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Status not found"
        )
    
    # Update fields if they are provided
    update_data = status_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_status, field, value)
    
    db.commit()
    db.refresh(db_status)
    return db_status

@router.delete("/mess-status/{status_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_mess_status(status_id: int, db: Session = Depends(get_db)):
    """
    Delete a mess status
    """
    db_status = db.query(MessStatus).filter(MessStatus.id == status_id).first()
    if not db_status:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Status not found"
        )
    
    db.delete(db_status)
    db.commit()
    return None
