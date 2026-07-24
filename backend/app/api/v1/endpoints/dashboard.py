from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Any
from datetime import datetime, timedelta

from app.db.session import get_db
from app.models.user import User
from app.models.attendance import Attendance
from app.models.recognition_log import RecognitionLog
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db), current_user: Any = Depends(get_current_user)) -> Any:
    today_str = datetime.now().strftime("%Y-%m-%d")
    
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    
    today_records = db.query(Attendance).filter(Attendance.date_str == today_str).all()
    today_count = len(today_records)
    
    on_time_count = sum(1 for r in today_records if r.status == "On Time")
    late_count = sum(1 for r in today_records if r.status == "Late")
    
    unknown_today = db.query(RecognitionLog).filter(
        RecognitionLog.is_known == False,
        RecognitionLog.timestamp >= datetime.now().replace(hour=0, minute=0, second=0)
    ).count()
    
    # Generate 7-day attendance trend
    trend = []
    for i in range(6, -1, -1):
        dt = datetime.now() - timedelta(days=i)
        d_str = dt.strftime("%Y-%m-%d")
        day_name = dt.strftime("%a")
        
        day_att = db.query(Attendance).filter(Attendance.date_str == d_str).all()
        p_cnt = sum(1 for r in day_att if r.status == "On Time")
        l_cnt = sum(1 for r in day_att if r.status == "Late")
        
        trend.append({
            "date": d_str,
            "day": day_name,
            "on_time": p_cnt,
            "late": l_cnt,
            "total": len(day_att)
        })
        
    # Recent activity stream
    recent_logs = db.query(RecognitionLog).order_by(RecognitionLog.timestamp.desc()).limit(10).all()
    activity_stream = []
    for l in recent_logs:
        user_name = l.user.full_name if l.user else "Unknown Subject"
        dept = l.user.department if l.user else "N/A"
        activity_stream.append({
            "id": l.id,
            "name": user_name,
            "department": dept,
            "is_known": l.is_known,
            "confidence": l.confidence,
            "timestamp": l.timestamp.strftime("%H:%M:%S"),
            "snapshot_path": l.snapshot_path or (l.user.avatar_url if l.user else None)
        })
        
    return {
        "summary": {
            "total_users": total_users,
            "active_users": active_users,
            "today_attendance": today_count,
            "on_time_count": on_time_count,
            "late_count": late_count,
            "unknown_today": unknown_today,
            "attendance_rate": round((today_count / total_users * 100), 1) if total_users > 0 else 0
        },
        "weekly_trend": trend,
        "recent_activity": activity_stream
    }
