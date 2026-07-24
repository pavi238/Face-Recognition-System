from pydantic import BaseModel
from typing import Optional

class SystemSettingBase(BaseModel):
    confidence_threshold: float = 0.50
    detector_model: str = "hog"
    work_start_time: str = "09:00"
    camera_device_index: int = 0
    enable_audio_alerts: bool = True
    enable_liveness_check: bool = True
    duplicate_log_cooldown_seconds: int = 60

class SystemSettingUpdate(BaseModel):
    confidence_threshold: Optional[float] = None
    detector_model: Optional[str] = None
    work_start_time: Optional[str] = None
    camera_device_index: Optional[int] = None
    enable_audio_alerts: Optional[bool] = None
    enable_liveness_check: Optional[bool] = None
    duplicate_log_cooldown_seconds: Optional[int] = None

class SystemSettingOut(SystemSettingBase):
    id: int

    class Config:
        from_attributes = True
