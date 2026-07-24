from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    date_str = Column(String, index=True, nullable=False)  # YYYY-MM-DD for fast aggregation
    time_str = Column(String, nullable=False)  # HH:MM:SS
    status = Column(String, default="Present")  # 'Present', 'Late', 'On Time'
    confidence = Column(Float, nullable=True)  # Recognition confidence percentage (e.g. 94.5%)
    method = Column(String, default="Face Recognition")  # 'Face Recognition' or 'Manual'
    snapshot_path = Column(String, nullable=True)

    user = relationship("User", back_populates="attendances")
