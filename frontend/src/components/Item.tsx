import {ItemPeriod} from './ItemPeriod';
import {Staff} from './../types/employee.types';

interface ItemProps {
    staff: Staff;
}

export const Item = ({staff}: ItemProps) => {
    return (
        <div>
            <h3>
                {staff.name} | {staff.totalQuantity}
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
