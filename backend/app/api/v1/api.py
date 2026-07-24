from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, face, attendance, logs, settings, dashboard

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(face.router, prefix="/face", tags=["face"])
api_router.include_router(attendance.router, prefix="/attendance", tags=["attendance"])
api_router.include_router(logs.router, prefix="/logs", tags=["logs"])
api_router.include_router(settings.router, prefix="/settings", tags=["settings"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
