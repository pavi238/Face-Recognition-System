from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session
from typing import Any, List, Optional
from datetime import datetime, timedelta
import csv
import io

from app.db.session import get_db
from app.models.attendance import Attendance
from app.models.user import User
from app.schemas.attendance import AttendanceOut, AttendanceCreate
from app.schemas.user import UserOut
from app.api.v1.endpoints.auth import get_current_user, get_current_admin

router = APIRouter()

@router.get("/", response_model=List[AttendanceOut])
def get_attendance_history(
    db: Session = Depends(get_db),
    user_id: Optional[int] = Query(None),
    date_from: Optional[str] = Query(None, description="YYYY-MM-DD"),
    date_to: Optional[str] = Query(None, description="YYYY-MM-DD"),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Get attendance records with filtering."""
    query = db.query(Attendance).join(User)
    
    if user_id:
        query = query.filter(Attendance.user_id == user_id)
    if date_from:
        query = query.filter(Attendance.date_str >= date_from)
    if date_to:
        query = query.filter(Attendance.date_str <= date_to)
    if status:
        query = query.filter(Attendance.status == status)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (User.full_name.ilike(search_pattern)) |
            (User.employee_id.ilike(search_pattern)) |
            (User.department.ilike(search_pattern))
        )
        
    records = query.order_by(Attendance.timestamp.desc()).all()
    
    results = []
    for r in records:
        u_out = UserOut(
            id=r.user.id,
            full_name=r.user.full_name,
            email=r.user.email,
            employee_id=r.user.employee_id,
            department=r.user.department,
            role=r.user.role,
            is_active=r.user.is_active,
            avatar_url=r.user.avatar_url,
            created_at=r.user.created_at,
            enrolled_faces_count=len(r.user.face_encodings)
        )
        results.append(AttendanceOut(
            id=r.id,
            user_id=r.user_id,
            timestamp=r.timestamp,
            date_str=r.date_str,
            time_str=r.time_str,
            status=r.status,
            confidence=r.confidence,
            snapshot_path=r.snapshot_path,
            method=r.method,
            user=u_out
        ))
    return results

@router.post("/manual", response_model=AttendanceOut)
def record_manual_attendance(
    payload: AttendanceCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
) -> Any:
    """Manually add or override an attendance log (Admin only)."""
    user = db.query(User).filter(User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    now = datetime.now()
    today_str = now.strftime("%Y-%m-%d")
    time_str = now.strftime("%H:%M:%S")
    
    att = Attendance(
        user_id=user.id,
        timestamp=now,
        date_str=today_str,
        time_str=time_str,
        status=payload.status or "Present",
        confidence=100.0,
        method="Manual Override"
    )
    db.add(att)
    db.commit()
    db.refresh(att)
    
    u_out = UserOut(
        id=user.id,
        full_name=user.full_name,
        email=user.email,
        employee_id=user.employee_id,
        department=user.department,
        role=user.role,
        is_active=user.is_active,
        avatar_url=user.avatar_url,
        created_at=user.created_at,
        enrolled_faces_count=len(user.face_encodings)
    )
    
    return AttendanceOut(
        id=att.id,
        user_id=att.user_id,
        timestamp=att.timestamp,
        date_str=att.date_str,
        time_str=att.time_str,
        status=att.status,
        confidence=att.confidence,
        snapshot_path=att.snapshot_path,
        method=att.method,
        user=u_out
    )

@router.get("/export/csv")
def export_attendance_csv(
    db: Session = Depends(get_db),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Generate CSV file download of attendance logs."""
    query = db.query(Attendance).join(User)
    if date_from:
        query = query.filter(Attendance.date_str >= date_from)
    if date_to:
        query = query.filter(Attendance.date_str <= date_to)
        
    records = query.order_by(Attendance.timestamp.desc()).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Attendance ID", "Employee ID", "Full Name", "Department", "Date", "Time", "Status", "Method", "Confidence (%)"])
    
    for r in records:
        writer.writerow([
            r.id,
            r.user.employee_id,
            r.user.full_name,
            r.user.department,
            r.date_str,
            r.time_str,
            r.status,
            r.method,
            f"{r.confidence or 0}%"
        ])
        
    csv_content = output.getvalue()
    filename = f"attendance_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
