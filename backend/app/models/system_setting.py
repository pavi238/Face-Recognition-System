from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from datetime import datetime
from app.db.session import Base

class SystemSetting(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, index=True)
    confidence_threshold = Column(Float, default=0.50)  # Lower is stricter (0.35 to 0.65)
    detector_model = Column(String, default="hog")  # 'hog' or 'cnn' or 'opencv'
    work_start_time = Column(String, default="09:00")  # Punctuality calculation reference
    camera_device_index = Column(Integer, default=0)
    enable_audio_alerts = Column(Boolean, default=True)
    enable_liveness_check = Column(Boolean, default=True)
    duplicate_log_cooldown_seconds = Column(Integer, default=60)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
