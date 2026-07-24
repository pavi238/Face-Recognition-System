from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Any, List, Optional

from app.db.session import get_db
from app.models.recognition_log import RecognitionLog
from app.models.user import User
from app.schemas.user import UserOut
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()

@router.get("/")
def get_recognition_logs(
    db: Session = Depends(get_db),
    is_known: Optional[bool] = Query(None),
    user_id: Optional[int] = Query(None),
    limit: int = Query(50, le=200),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Retrieve recognition audit logs including unknown face detections."""
    query = db.query(RecognitionLog)
    
    if is_known is not None:
        query = query.filter(RecognitionLog.is_known == is_known)
    if user_id:
        query = query.filter(RecognitionLog.user_id == user_id)
        
    logs = query.order_by(RecognitionLog.timestamp.desc()).limit(limit).all()
    
    results = []
    for l in logs:
        user_out = None
        if l.user:
            user_out = UserOut(
                id=l.user.id,
                full_name=l.user.full_name,
                email=l.user.email,
                employee_id=l.user.employee_id,
                department=l.user.department,
                role=l.user.role,
                is_active=l.user.is_active,
                avatar_url=l.user.avatar_url,
                created_at=l.user.created_at,
                enrolled_faces_count=len(l.user.face_encodings)
            )
        results.append({
            "id": l.id,
            "user_id": l.user_id,
            "user": user_out,
            "timestamp": l.timestamp.isoformat(),
            "confidence": l.confidence,
            "distance": l.distance,
            "is_known": l.is_known,
            "snapshot_path": l.snapshot_path,
            "camera_id": l.camera_id,
            "notes": l.notes
        })
    return results
