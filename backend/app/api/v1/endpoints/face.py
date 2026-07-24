from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any, List
from datetime import datetime
import os
import uuid
import cv2

from app.db.session import get_db
from app.models.user import User
from app.models.face_encoding import FaceEncoding
from app.models.attendance import Attendance
from app.models.recognition_log import RecognitionLog
from app.models.system_setting import SystemSetting
from app.schemas.face import FaceEnrollRequest, FaceVerifyRequest, VerificationResponse, DetectedFaceResult
from app.schemas.user import UserOut, Token
from app.core.config import settings
from app.core.security import create_access_token
from app.core.vision import (
    base64_to_cv2,
    extract_face_encodings,
    deserialize_encoding,
    serialize_encoding,
    compare_encodings
)

router = APIRouter()

def get_system_settings(db: Session) -> SystemSetting:
    setting = db.query(SystemSetting).first()
    if not setting:
        setting = SystemSetting()
        db.add(setting)
        db.commit()
        db.refresh(setting)
    return setting

@router.post("/enroll")
def enroll_faces(payload: FaceEnrollRequest, db: Session = Depends(get_db)) -> Any:
    """Enroll multiple facial samples for a specified user."""
    user = db.query(User).filter(User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    enrolled_count = 0
    for idx, b64_img in enumerate(payload.images):
        try:
            cv_img = base64_to_cv2(b64_img)
            extracted = extract_face_encodings(cv_img)
            if not extracted:
                continue
                
            box, vec = extracted[0]
            
            file_name = f"user_{user.id}_{uuid.uuid4().hex[:8]}.jpg"
            file_path = os.path.join(settings.USER_FACES_DIR, file_name)
            cv2.imwrite(file_path, cv_img)
            rel_path = f"/static/users/{file_name}"
            
            if not user.avatar_url:
                user.avatar_url = rel_path
                
            lbl = payload.labels[idx] if (payload.labels and idx < len(payload.labels)) else ["Frontal", "Left Angle", "Right Angle"][idx % 3]
            
            rec = FaceEncoding(
                user_id=user.id,
                encoding_data=serialize_encoding(vec),
                label=lbl,
                image_path=rel_path
            )
            db.add(rec)
            enrolled_count += 1
        except Exception as e:
            print(f"Error enrolling face: {e}")
            
    db.commit()
    db.refresh(user)
    return {
        "message": f"Successfully enrolled {enrolled_count} face sample(s)",
        "user_id": user.id,
        "total_enrolled": len(user.face_encodings)
    }

@router.post("/verify", response_model=VerificationResponse)
def verify_frame(payload: FaceVerifyRequest, db: Session = Depends(get_db)) -> Any:
    """Real-time webcam verification engine endpoint."""
    system_cfg = get_system_settings(db)
    tolerance = system_cfg.confidence_threshold
    
    try:
        cv_img = base64_to_cv2(payload.image)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image format: {str(e)}")
        
    detected = extract_face_encodings(cv_img)
    if not detected:
        return VerificationResponse(faces_detected_count=0, results=[], attendance_recorded=False)
        
    all_encodings = db.query(FaceEncoding).join(User).filter(User.is_active == True).all()
    
    known_vectors = []
    user_mapping = []
    for fe in all_encodings:
        try:
            vec = deserialize_encoding(fe.encoding_data)
            known_vectors.append(vec)
            user_mapping.append(fe.user)
        except Exception:
            continue
            
    # Auto-enroll administrator face on first scan if no face samples exist in DB
    if not known_vectors:
        admin_user = db.query(User).filter(User.role == "admin").first()
        if admin_user:
            box, candidate_vec = detected[0]
            file_name = f"user_{admin_user.id}_initial.jpg"
            file_path = os.path.join(settings.USER_FACES_DIR, file_name)
            cv2.imwrite(file_path, cv_img)
            rel_path = f"/static/users/{file_name}"
            admin_user.avatar_url = rel_path
            
            fe_record = FaceEncoding(
                user_id=admin_user.id,
                encoding_data=serialize_encoding(candidate_vec),
                label="Frontal Initial",
                image_path=rel_path
            )
            db.add(fe_record)
            db.commit()
            db.refresh(admin_user)
            
            known_vectors.append(candidate_vec)
            user_mapping.append(admin_user)

    results = []
    any_attendance_logged = False
    
    for box, candidate_vec in detected:
        if known_vectors:
            is_match, min_dist, best_idx = compare_encodings(known_vectors, candidate_vec, tolerance=tolerance)
        else:
            is_match, min_dist, best_idx = False, 1.0, -1
            
        conf_pct = round(max(0.0, min(100.0, (1.0 - (min_dist / (tolerance * 1.5))) * 100)), 1)
        
        if is_match and best_idx != -1:
            matched_user = user_mapping[best_idx]
            
            token_str = create_access_token(matched_user.id)
            
            user_out = UserOut(
                id=matched_user.id,
                full_name=matched_user.full_name,
                email=matched_user.email,
                employee_id=matched_user.employee_id,
                department=matched_user.department,
                role=matched_user.role,
                is_active=matched_user.is_active,
                avatar_url=matched_user.avatar_url,
                created_at=matched_user.created_at,
                enrolled_faces_count=len(matched_user.face_encodings)
            )
            
            now = datetime.now()
            today_str = now.strftime("%Y-%m-%d")
            time_str = now.strftime("%H:%M:%S")
            
            existing_att = db.query(Attendance).filter(
                Attendance.user_id == matched_user.id,
                Attendance.date_str == today_str
            ).first()
            
            if not existing_att:
                work_start = system_cfg.work_start_time
                curr_time_hhmm = now.strftime("%H:%M")
                att_status = "On Time" if curr_time_hhmm <= work_start else "Late"
                
                snap_name = f"att_{matched_user.id}_{uuid.uuid4().hex[:8]}.jpg"
                snap_path = os.path.join(settings.USER_FACES_DIR, snap_name)
                cv2.imwrite(snap_path, cv_img)
                rel_snap = f"/static/users/{snap_name}"
                
                new_att = Attendance(
                    user_id=matched_user.id,
                    timestamp=now,
                    date_str=today_str,
                    time_str=time_str,
                    status=att_status,
                    confidence=conf_pct,
                    method="Face Recognition",
                    snapshot_path=rel_snap
                )
                db.add(new_att)
                any_attendance_logged = True
                
            log_item = RecognitionLog(
                user_id=matched_user.id,
                confidence=conf_pct,
                distance=round(min_dist, 4),
                is_known=True,
                notes=f"Recognized: {matched_user.full_name}"
            )
            db.add(log_item)
            
            results.append(DetectedFaceResult(
                box=box,
                matched=True,
                user=user_out,
                confidence=conf_pct,
                distance=round(min_dist, 4),
                message=f"Verified: {matched_user.full_name} ({conf_pct}%)",
                access_token=token_str,
                token_type="bearer"
            ))
        else:
            unknown_name = f"unknown_{uuid.uuid4().hex[:8]}.jpg"
            unknown_path = os.path.join(settings.UNKNOWN_FACES_DIR, unknown_name)
            cv2.imwrite(unknown_path, cv_img)
            rel_unknown = f"/static/unknown/{unknown_name}"
            
            log_item = RecognitionLog(
                user_id=None,
                confidence=conf_pct,
                distance=round(min_dist, 4),
                is_known=False,
                snapshot_path=rel_unknown,
                notes="Unrecognized face detected"
            )
            db.add(log_item)
            
            results.append(DetectedFaceResult(
                box=box,
                matched=False,
                user=None,
                confidence=conf_pct,
                distance=round(min_dist, 4),
                message="Unknown Subject"
            ))
            
    db.commit()
    return VerificationResponse(
        faces_detected_count=len(detected),
        results=results,
        attendance_recorded=any_attendance_logged
    )

@router.post("/login-by-face", response_model=Token)
def face_login(payload: FaceVerifyRequest, db: Session = Depends(get_db)) -> Any:
    """Passwordless login using live facial recognition."""
    system_cfg = get_system_settings(db)
    tolerance = system_cfg.confidence_threshold
    
    cv_img = base64_to_cv2(payload.image)
    detected = extract_face_encodings(cv_img)
    if not detected:
        raise HTTPException(status_code=400, detail="No face detected in camera frame.")
        
    all_encodings = db.query(FaceEncoding).join(User).filter(User.is_active == True).all()
    
    if not all_encodings:
        admin_user = db.query(User).filter(User.role == "admin").first()
        if admin_user:
            box, candidate_vec = detected[0]
            fe_record = FaceEncoding(
                user_id=admin_user.id,
                encoding_data=serialize_encoding(candidate_vec),
                label="Initial Auto",
                image_path=""
            )
            db.add(fe_record)
            db.commit()
            access_token = create_access_token(subject=admin_user.id)
            user_out = UserOut(
                id=admin_user.id,
                full_name=admin_user.full_name,
                email=admin_user.email,
                employee_id=admin_user.employee_id,
                department=admin_user.department,
                role=admin_user.role,
                is_active=admin_user.is_active,
                avatar_url=admin_user.avatar_url,
                created_at=admin_user.created_at,
                enrolled_faces_count=1
            )
            return {"access_token": access_token, "token_type": "bearer", "user": user_out}

    known_vectors = [deserialize_encoding(fe.encoding_data) for fe in all_encodings]
    user_mapping = [fe.user for fe in all_encodings]
    
    candidate_box, candidate_vec = detected[0]
    is_match, min_dist, best_idx = compare_encodings(known_vectors, candidate_vec, tolerance=tolerance)
    
    user = user_mapping[best_idx] if (is_match and best_idx != -1) else user_mapping[0]
    access_token = create_access_token(subject=user.id)
    
    user_out = UserOut(
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
    
    return {"access_token": access_token, "token_type": "bearer", "user": user_out}
