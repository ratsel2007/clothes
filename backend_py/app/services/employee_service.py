from datetime import date
from typing import Dict, List
from app.functions.calculate_staff import process_equipment

def calculate_staff_for_employee(
    start_date: date,
    officer_date: date,
    gender: str,
    maternity_leave_start: date | None = None,
    maternity_leave_duration: int = 0
) -> List[Dict]:
    return process_equipment(
        start_work_date=start_date.strftime('%d.%m.%Y'),
        officer_promotion_date=officer_date.strftime('%d.%m.%Y'),
        gender=gender,
        maternity_leave_start=maternity_leave_start.strftime('%d.%m.%Y') if maternity_leave_start else None,
        maternity_leave_duration=maternity_leave_duration
    )