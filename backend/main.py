import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.db.session import engine, Base, SessionLocal
from app.api.v1.api import api_router
from app.models.user import User
from app.models.system_setting import SystemSetting
from app.core.security import get_password_hash

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs"
)

# Set CORS origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads directory for face snapshots
app.mount("/static", StaticFiles(directory=settings.UPLOAD_DIR), name="static")

# Include API Router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.on_event("startup")
def startup_event():
    # Initialize DB tables
    Base.metadata.create_all(bind=engine)
    
    # Seed default Admin and Settings if missing
    db = SessionLocal()
    try:
        # Check system settings
        cfg = db.query(SystemSetting).first()
        if not cfg:
            db.add(SystemSetting())
            db.commit()
            
        # Check admin user
        admin = db.query(User).filter(User.role == "admin").first()
        if not admin:
            admin_user = User(
                full_name="System Administrator",
                email="admin@facerec.com",
                employee_id="ADM-001",
                department="IT & Security",
                role="admin",
                hashed_password=get_password_hash("admin123"),
                is_active=True
            )
            db.add(admin_user)
            
            # Seed sample regular user for demonstration
            sample_user = User(
                full_name="Alex Morgan",
                email="alex.morgan@company.com",
                employee_id="EMP-102",
                department="Engineering",
                role="user",
                hashed_password=get_password_hash("user123"),
                is_active=True
            )
            db.add(sample_user)
            db.commit()
            print("Database initialized with default admin and sample user.")
    except Exception as e:
        print(f"Startup seed error: {e}")
    finally:
        db.close()

@app.get("/health")
def health_check():
    return {"status": "healthy", "project": settings.PROJECT_NAME}
