export interface Period {
    start_date: string | null;
    end_date: string | null;
    period_months: number;
    quantity: number;
}

export interface EquipmentItem {
    item_name: string;
    periods: Period[];
    cash: number;
}
