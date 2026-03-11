from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class MessStatusBase(BaseModel):
    meal_type: str = Field(..., description="Type of meal (e.g., Breakfast, Lunch, Dinner)")
    status: str = Field("active", description="Status of the meal (active, inactive, delayed, cancelled)")

class MessStatusCreate(MessStatusBase):
    pass

class MessStatusUpdate(BaseModel):
    meal_type: Optional[str] = Field(None, description="Type of meal (e.g., Breakfast, Lunch, Dinner)")
    status: Optional[str] = Field(None, description="Status of the meal (active, inactive, delayed, cancelled)")

class MessStatus(MessStatusBase):
    id: int
    updated_at: datetime

    class Config:
        orm_mode = True
