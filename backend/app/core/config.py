import os

class Settings:
    PROJECT_NAME: str = "Enterprise Face Recognition & Attendance System"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-key-face-recognition-2026-production-ready-jwt-hash")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database URL
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./face_rec.db")
    
    # Upload Storage
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    UPLOAD_DIR: str = os.path.join(BASE_DIR, "uploads")
    UNKNOWN_FACES_DIR: str = os.path.join(UPLOAD_DIR, "unknown")
    USER_FACES_DIR: str = os.path.join(UPLOAD_DIR, "users")

settings = Settings()

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.UNKNOWN_FACES_DIR, exist_ok=True)
os.makedirs(settings.USER_FACES_DIR, exist_ok=True)
