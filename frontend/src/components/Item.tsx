import {ItemPeriod} from './ItemPeriod';
import {Staff} from './../types/employee.types';

interface ItemProps {
    staff: Staff;
}

export const Item = ({staff}: ItemProps) => {
    return (
        <div className='item'>
            <h3>
                {staff.name} | {staff.totalQuantity} | {staff.totalQuantity * (staff.cash || 0)} ₽
            </h3>
            <div className='flex'>
                {staff.issuances.map((issuance, index) => (
                    <ItemPeriod
                        key={index}
                        period={issuance}
                        staffName={staff.name}
                        periodIndex={index}
                    />
                ))}
            </div>
        </div>
    );
};
