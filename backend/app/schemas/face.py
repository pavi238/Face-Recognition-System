from pydantic import BaseModel
from typing import Optional, List
from app.schemas.user import UserOut

class FaceEnrollRequest(BaseModel):
    user_id: int
    images: List[str]  # List of base64 data URLs
    labels: Optional[List[str]] = []

class FaceVerifyRequest(BaseModel):
    image: str  # Base64 string from webcam stream

class DetectedFaceResult(BaseModel):
    box: List[int]  # [top, right, bottom, left]
    matched: bool
    user: Optional[UserOut] = None
    confidence: float
    distance: float
    message: str
    access_token: Optional[str] = None
    token_type: Optional[str] = "bearer"

class VerificationResponse(BaseModel):
    faces_detected_count: int
    results: List[DetectedFaceResult]
    attendance_recorded: bool = False
