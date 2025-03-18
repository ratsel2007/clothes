import {useDispatch, useSelector} from 'react-redux';
import {WearingPeriod} from '../types/employee.types';
import {RootState} from '../store/store';
import {updateEmployee} from '../store/employeeSlice';
import {Button} from 'react-bootstrap';

interface ItemPeriodProps {
    period: WearingPeriod;
    staffName: string;
    periodIndex: number;
}

export const ItemPeriod = ({period, staffName, periodIndex}: ItemPeriodProps) => {
    const dispatch = useDispatch();
    const selectedEmployee = useSelector((state: RootState) => state.employees.selectedEmployee);
    const loading = useSelector((state: RootState) => state.employees.loading);

    const handleQuantityChange = async (increment: boolean) => {
        if (!selectedEmployee) return;

        const updatedEmployee = {
            ...selectedEmployee,
            staff: selectedEmployee.staff.map((s) => {
                if (s.name === staffName) {
                    return {
                        ...s,
                        totalQuantity: s.totalQuantity + (increment ? -1 : 1),
                        issuances: s.issuances.map((issuance, i) => {
                            if (i === periodIndex) {
                                return {
                                    ...issuance,
                                    quantity: issuance.quantity + (increment ? -1 : 1),
                                    used: issuance.used + (increment ? 1 : -1),
                                };
                            }
                            return issuance;
                        }),
                    };
                }
                return s;
            }),
        };

        try {
            await dispatch(updateEmployee(updatedEmployee)).unwrap();
        } catch (error) {
            console.error('Failed to update employee:', error);
        }
    };

    return (
        <div className='mb-3 period'>
            <div className='d-flex align-items-center justify-content-between column'>
                <div>{period.date}</div>
                <div>
                    <span className='red'>{period.quantity}</span>|
                    <span className='green'>{period.used}</span>
                </div>

                <div className='d-flex gap-2 button-group'>
                    <Button
                        variant='danger'
                        size='sm'
                        onClick={() => handleQuantityChange(false)}
                        disabled={period.used <= 0 || loading}>
                        -
                    </Button>
                    <Button
                        variant='success'
                        size='sm'
                        onClick={() => handleQuantityChange(true)}
                        disabled={period.quantity <= 0 || loading}>
                        +
                    </Button>
                </div>
            </div>
        </div>
    );
};
