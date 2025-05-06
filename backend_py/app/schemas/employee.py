from datetime import date
from typing import List, Optional
from pydantic import BaseModel, UUID4
from enum import Enum

class Gender(str, Enum):
    MALE = 'male'
    FEMALE = 'female'

class Issuance(BaseModel):
    date: str
    quantity: int
    used: int

class StaffItem(BaseModel):
    name: str
    issuances: List[Issuance]
    total_quantity: int
    cash: float

class EmployeeCreate(BaseModel):
    name: str
    gender: Gender
    start_date: date
    officer_date: date
    maternity_leave_start: Optional[date] = None
    maternity_leave_duration: Optional[int] = 0

class Employee(EmployeeCreate):
    id: UUID4
    staff: List[StaffItem]

    class Config:
        from_attributes = True