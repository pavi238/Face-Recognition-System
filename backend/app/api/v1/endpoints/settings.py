from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Any

from app.db.session import get_db
from app.models.system_setting import SystemSetting
from app.schemas.setting import SystemSettingOut, SystemSettingUpdate
from app.api.v1.endpoints.auth import get_current_user, get_current_admin

router = APIRouter()

@router.get("/", response_model=SystemSettingOut)
def get_settings(db: Session = Depends(get_db), current_user: Any = Depends(get_current_user)) -> Any:
    setting = db.query(SystemSetting).first()
    if not setting:
        setting = SystemSetting()
        db.add(setting)
        db.commit()
        db.refresh(setting)
    return setting

@router.put("/", response_model=SystemSettingOut)
def update_settings(
    payload: SystemSettingUpdate,
    db: Session = Depends(get_db),
    current_admin: Any = Depends(get_current_admin)
) -> Any:
    setting = db.query(SystemSetting).first()
    if not setting:
        setting = SystemSetting()
        db.add(setting)
        
    if payload.confidence_threshold is not None:
        setting.confidence_threshold = payload.confidence_threshold
    if payload.detector_model is not None:
        setting.detector_model = payload.detector_model
    if payload.work_start_time is not None:
        setting.work_start_time = payload.work_start_time
    if payload.camera_device_index is not None:
        setting.camera_device_index = payload.camera_device_index
    if payload.enable_audio_alerts is not None:
        setting.enable_audio_alerts = payload.enable_audio_alerts
    if payload.enable_liveness_check is not None:
        setting.enable_liveness_check = payload.enable_liveness_check
    if payload.duplicate_log_cooldown_seconds is not None:
        setting.duplicate_log_cooldown_seconds = payload.duplicate_log_cooldown_seconds
        
    db.commit()
    db.refresh(setting)
    return setting
