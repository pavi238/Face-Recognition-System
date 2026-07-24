from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.schemas.user import UserOut

class AttendanceBase(BaseModel):
    status: Optional[str] = "Present"
    method: Optional[str] = "Face Recognition"

class AttendanceCreate(AttendanceBase):
    user_id: int
    confidence: Optional[float] = None
    snapshot: Optional[str] = None  # Base64 snapshot

class AttendanceOut(AttendanceBase):
    id: int
    user_id: int
    timestamp: datetime
    date_str: str
    time_str: str
    confidence: Optional[float] = None
    snapshot_path: Optional[str] = None
    user: Optional[UserOut] = None

    class Config:
        from_attributes = True

class AttendanceFilter(BaseModel):
    user_id: Optional[int] = None
    date_from: Optional[str] = None
    date_to: Optional[str] = None
    status: Optional[str] = None
    search: Optional[str] = None
