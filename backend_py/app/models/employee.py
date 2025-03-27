from datetime import date
from typing import List, Optional
from uuid import uuid4
from sqlalchemy import Column, String, Date, Integer, Enum, JSON
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base

class Employee(Base):
    __tablename__ = "employees"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    name = Column(String, nullable=False)
    gender = Column(Enum('male', 'female', name='gender_enum'), nullable=False)
    start_date = Column(Date, nullable=False)
    officer_date = Column(Date, nullable=False)
    maternity_leave_start = Column(Date, nullable=True)
    maternity_leave_duration = Column(Integer, nullable=True, default=0)
    staff = Column(JSON, nullable=False)