from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base

class RecognitionLog(Base):
    __tablename__ = "recognition_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Null if unknown face
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    confidence = Column(Float, nullable=False)
    distance = Column(Float, nullable=False)
    is_known = Column(Boolean, default=False)
    snapshot_path = Column(String, nullable=True)
    camera_id = Column(String, default="Webcam 0")
    notes = Column(String, nullable=True)

    user = relationship("User", back_populates="recognition_logs")
