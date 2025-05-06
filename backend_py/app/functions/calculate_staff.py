import json
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from dataclasses import dataclass
import os
from pathlib import Path

@dataclass
class Period:
    start_date: Optional[str]
    end_date: Optional[str]
    period_months: int
    quantity: int

@dataclass
class EquipmentItem:
    item_name: str
    periods: List[Period]
    cash: Optional[float] = None

@dataclass
class Issuance:
    date: str
    quantity: int
    used: int = 0

def load_data() -> tuple[List[EquipmentItem], ...]:
    data_dir = Path(__file__).parent.parent / 'data'
    
    def load_json(filename: str) -> List[EquipmentItem]:
        with open(data_dir / filename, 'r', encoding='utf-8') as f:
            data = json.load(f)
            return [
                EquipmentItem(
                    item_name=item['item_name'],
                    periods=[
                        Period(
                            start_date=period.get('start_date'),
                            end_date=period.get('end_date'),
                            period_months=period['period_months'],
                            quantity=period['quantity']
                        ) 
                        for period in item['periods']
                    ],
                    cash=item.get('cash')
                )
                for item in data
            ]

    return (
        load_json('non_officer_data.json'),
        load_json('officer_data.json'),
        load_json('woman_non_officer_data.json'),
        load_json('woman_officer_data.json')
    )

def parse_date(date_str: str) -> datetime:
    try:
        return datetime.strptime(date_str, '%d.%m.%Y')
    except ValueError as e:
        raise ValueError(f"Invalid date format: {date_str}") from e

def format_date(date: datetime) -> str:
    return date.strftime('%d.%m.%Y')

def find_applicable_period(item: EquipmentItem, issue_date: datetime) -> Optional[Period]:
    if not item:
        return None

    for period in item.periods:
        start_date = parse_date(period.start_date) if period.start_date else datetime(1970, 1, 1)
        end_date = parse_date(period.end_date) if period.end_date else datetime(2100, 1, 1)
        
        if start_date <= issue_date <= end_date:
            return period
    
    return None

def calculate_equipment_dates(
    start_work_date: str,
    officer_promotion_date: str,
    item_name: str,
    gender: str,
    maternity_leave_start: Optional[str] = None,
    maternity_leave_duration: int = 0
) -> Dict:
    non_officer_data, officer_data, woman_non_officer_data, woman_officer_data = load_data()
    
    work_start = parse_date(start_work_date)
    promotion_date = parse_date(officer_promotion_date)
    maternity_start = parse_date(maternity_leave_start) if maternity_leave_start else None
    current_date = datetime.now()

    # Select data based on gender
    non_officer_item = next(
        (item for item in (woman_non_officer_data if gender == 'female' else non_officer_data)
         if item.item_name == item_name),
        None
    )
    officer_item = next(
        (item for item in (woman_officer_data if gender == 'female' else officer_data)
         if item.item_name == item_name),
        None
    )

    if not non_officer_item and not officer_item:
        return {'issuances': [], 'total_quantity': 0}

    issuances = []
    total_quantity = 0
    current_issue_date = work_start
    last_issuance_date = None

    while current_issue_date <= current_date:
        is_officer = current_issue_date >= promotion_date
        current_item = officer_item if is_officer else non_officer_item

        if not current_item:
            break

        applicable_period = find_applicable_period(current_item, current_issue_date)
        if not applicable_period:
            break

        # Handle transition period
        if last_issuance_date and not is_officer:
            next_issue_date = last_issuance_date + timedelta(days=applicable_period.period_months * 30)
            if next_issue_date > promotion_date:
                current_issue_date = next_issue_date
                continue

        # Check previous issuance expiration
        if last_issuance_date:
            expiration_date = last_issuance_date + timedelta(days=applicable_period.period_months * 30)
            if maternity_start and gender == 'female':
                if last_issuance_date < maternity_start < expiration_date:
                    expiration_date += timedelta(days=maternity_leave_duration * 30)
            
            if current_issue_date < expiration_date:
                current_issue_date = expiration_date
                continue

        issuances.append({
            'date': format_date(current_issue_date),
            'quantity': applicable_period.quantity,
            'used': 0
        })
        total_quantity += applicable_period.quantity

        last_issuance_date = current_issue_date
        current_issue_date += timedelta(days=applicable_period.period_months * 30)

        # Account for maternity leave
        if maternity_start and gender == 'female':
            if current_issue_date < maternity_start < (current_issue_date + timedelta(days=applicable_period.period_months * 30)):
                current_issue_date += timedelta(days=maternity_leave_duration * 30)

    return {
        'issuances': issuances,
        'total_quantity': total_quantity
    }

def process_equipment(
    start_work_date: str,
    officer_promotion_date: str,
    gender: str,
    maternity_leave_start: Optional[str] = None,
    maternity_leave_duration: int = 0
) -> List[Dict]:
    non_officer_data, officer_data, woman_non_officer_data, woman_officer_data = load_data()
    
    # Get all unique item names
    all_items = set()
    if gender == 'female':
        all_items.update(item.item_name for item in woman_officer_data)
        all_items.update(item.item_name for item in woman_non_officer_data)
    else:
        all_items.update(item.item_name for item in officer_data)
        all_items.update(item.item_name for item in non_officer_data)

    results = []
    for item_name in all_items:
        item_result = calculate_equipment_dates(
            start_work_date,
            officer_promotion_date,
            item_name,
            gender,
            maternity_leave_start,
            maternity_leave_duration
        )
        
        # Get cash compensation info
        data_source = woman_officer_data if gender == 'female' else officer_data
        officer_item = next((item for item in data_source if item.item_name == item_name), None)
        data_source = woman_non_officer_data if gender == 'female' else non_officer_data
        non_officer_item = next((item for item in data_source if item.item_name == item_name), None)
        
        cash_value = (officer_item or non_officer_item).cash if (officer_item or non_officer_item) else 0

        results.append({
            'name': item_name,
            'issuances': item_result['issuances'],
            'total_quantity': item_result['total_quantity'],
            'cash': cash_value
        })

    return results