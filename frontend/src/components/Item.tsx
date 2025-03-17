import {useSelector} from 'react-redux';
import {RootState} from '../store/store';
import {Staff} from './../types/employee.types';

interface ItemProps {
    staff: Staff;
}

export const Item = ({staff}: ItemProps) => {
    const selectedEmployee = useSelector((state: RootState) => state.employees.selectedEmployee);

    return (
        <div>
            <h3>{staff.name}</h3>
            <div>
                {staff.issuances.map((issuance, index) => (
                    <div key={index}>
                        <span>Date: {issuance.date}</span>
                        <span>Quantity: {issuance.quantity}</span>
                    </div>
                ))}
            </div>
            <p>Total Quantity: {staff.totalQuantity}</p>
        </div>
    );
};
