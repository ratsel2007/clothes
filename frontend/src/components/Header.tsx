import React from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {CreateEmployeeModal} from './employee/CreateEmployeeModal';
import {RootState} from '../store/store';
import {fetchEmployees, setSelectedEmployee} from '../store/employeeSlice';

export const Header = () => {
    const dispatch = useDispatch();
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const employees = useSelector((state: RootState) => state.employees.employees);
    const selectedEmployee = useSelector((state: RootState) => state.employees.selectedEmployee);

    React.useEffect(() => {
        dispatch(fetchEmployees() as any);
    }, [isModalOpen, dispatch]);

    return (
        <header>
            <h1>Выдача имущества</h1>
            <div>
                <select
                    value={selectedEmployee?.id || ''}
                    onChange={(e) => dispatch(setSelectedEmployee(e.target.value))}>
                    <option value=''>Select employee</option>
                    {employees.map((employee) => (
                        <option key={employee.id} value={employee.id}>
                            {employee.name}
                        </option>
                    ))}
                </select>
                <br />
                <button onClick={() => setIsModalOpen(true)}>Create Employee</button>
            </div>
            <CreateEmployeeModal opened={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </header>
    );
};
