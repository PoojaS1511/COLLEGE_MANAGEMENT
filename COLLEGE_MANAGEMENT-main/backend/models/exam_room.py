from pydantic import BaseModel, validator
from uuid import UUID
from typing import Optional

class ExamRoomBase(BaseModel):
    exam_id: UUID
    room_id: UUID
    max_students: int
    current_students: int = 0

class ExamRoomCreate(ExamRoomBase):
    pass

class ExamRoomUpdate(BaseModel):
    exam_id: Optional[UUID] = None
    room_id: Optional[UUID] = None
    max_students: Optional[int] = None
    current_students: Optional[int] = None

class ExamRoomInDB(ExamRoomBase):
    id: UUID

    class Config:
        from_attributes = True
