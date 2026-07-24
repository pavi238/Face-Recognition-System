from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Any
from jose import jwt, JWTError

from app.db.session import get_db
from app.models.user import User
from app.schemas.user import Token, UserOut
from app.core.security import verify_password, create_access_token
from app.core.config import settings

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user account")
    return user

def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin authorization required")
    return current_user

@router.post("/login", response_model=Token)
def login_access_token(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()) -> Any:
    """OAuth2 password login for administrators and staff."""
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user:
        # Check by employee ID
        user = db.query(User).filter(User.employee_id == form_data.username).first()
        
    if not user or not user.hashed_password:
        raise HTTPException(status_code=400, detail="Incorrect email/employee ID or password")
    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email/employee ID or password")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="User account is deactivated")
        
    access_token = create_access_token(subject=user.id)
    
    # Calculate enrolled faces count
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

@router.get("/me", response_model=UserOut)
def read_user_me(current_user: User = Depends(get_current_user)) -> Any:
    """Fetch current authenticated user profile."""
    return UserOut(
        id=current_user.id,
        full_name=current_user.full_name,
        email=current_user.email,
        employee_id=current_user.employee_id,
        department=current_user.department,
        role=current_user.role,
        is_active=current_user.is_active,
        avatar_url=current_user.avatar_url,
        created_at=current_user.created_at,
        enrolled_faces_count=len(current_user.face_encodings)
    )
