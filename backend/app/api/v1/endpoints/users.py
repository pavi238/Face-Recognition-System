from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Any, List, Optional
import os
import uuid

from app.db.session import get_db
from app.models.user import User
from app.models.face_encoding import FaceEncoding
from app.schemas.user import UserOut, UserCreate, UserUpdate
from app.core.security import get_password_hash
from app.core.config import settings
from app.core.vision import base64_to_cv2, extract_face_encodings, serialize_encoding
from app.api.v1.endpoints.auth import get_current_user, get_current_admin

router = APIRouter()

@router.get("/", response_model=List[UserOut])
def get_users(
    db: Session = Depends(get_db),
    search: Optional[str] = Query(None, description="Search by name, email, or ID"),
    department: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Retrieve all users with optional filtering."""
    query = db.query(User)
    
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (User.full_name.ilike(search_pattern)) |
            (User.email.ilike(search_pattern)) |
            (User.employee_id.ilike(search_pattern))
        )
    if department:
        query = query.filter(User.department == department)
    if role:
        query = query.filter(User.role == role)
        
    users = query.order_by(User.created_at.desc()).all()
    
    result = []
    for u in users:
        result.append(UserOut(
            id=u.id,
            full_name=u.full_name,
            email=u.email,
            employee_id=u.employee_id,
            department=u.department,
            role=u.role,
            is_active=u.is_active,
            avatar_url=u.avatar_url,
            created_at=u.created_at,
            enrolled_faces_count=len(u.face_encodings)
        ))
    return result

@router.post("/", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
) -> Any:
    """Create a new user with optional initial password and face enrollment samples."""
    # Check duplicate email
    if db.query(User).filter(User.email == user_in.email).first():
        raise HTTPException(status_code=400, detail="User with this email already exists.")
    # Check duplicate employee_id
    if db.query(User).filter(User.employee_id == user_in.employee_id).first():
        raise HTTPException(status_code=400, detail="User with this Employee ID already exists.")
        
    hashed_pwd = get_password_hash(user_in.password) if user_in.password else None
    
    user = User(
        full_name=user_in.full_name,
        email=user_in.email,
        employee_id=user_in.employee_id,
        department=user_in.department or "General",
        role=user_in.role or "user",
        hashed_password=hashed_pwd,
        is_active=user_in.is_active
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Process multi-shot face images if provided
    if user_in.face_images:
        for idx, img_b64 in enumerate(user_in.face_images):
            try:
                cv_img = base64_to_cv2(img_b64)
                encodings = extract_face_encodings(cv_img)
                if encodings:
                    box, enc_vec = encodings[0]
                    
                    # Save snapshot to disk
                    file_name = f"user_{user.id}_{uuid.uuid4().hex[:8]}.jpg"
                    file_path = os.path.join(settings.USER_FACES_DIR, file_name)
                    
                    import cv2
                    cv2.imwrite(file_path, cv_img)
                    rel_path = f"/static/users/{file_name}"
                    
                    # Set avatar url if first image
                    if idx == 0:
                        user.avatar_url = rel_path
                        db.commit()
                        
                    label_name = ["Frontal", "Left Angle", "Right Angle"][idx % 3]
                    face_record = FaceEncoding(
                        user_id=user.id,
                        encoding_data=serialize_encoding(enc_vec),
                        label=label_name,
                        image_path=rel_path
                    )
                    db.add(face_record)
            except Exception as e:
                print(f"Error processing image {idx}: {e}")
        db.commit()
        db.refresh(user)
        
    return UserOut(
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

@router.get("/{user_id}", response_model=UserOut)
def get_user_by_id(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> Any:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserOut(
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

@router.put("/{user_id}", response_model=UserOut)
def update_user(
    user_id: int,
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
) -> Any:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user_in.full_name is not None:
        user.full_name = user_in.full_name
    if user_in.email is not None:
        user.email = user_in.email
    if user_in.employee_id is not None:
        user.employee_id = user_in.employee_id
    if user_in.department is not None:
        user.department = user_in.department
    if user_in.role is not None:
        user.role = user_in.role
    if user_in.is_active is not None:
        user.is_active = user_in.is_active
    if user_in.password:
        user.hashed_password = get_password_hash(user_in.password)
        
    db.commit()
    db.refresh(user)
    return UserOut(
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

@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
) -> Any:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully", "id": user_id}
