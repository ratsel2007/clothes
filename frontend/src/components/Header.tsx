import React from 'react';
import {Form, Button} from 'react-bootstrap';
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
            <div className='d-flex gap-3 align-items-center justify-content-center'>
                <Form.Select
                    value={selectedEmployee?.id || ''}
                    onChange={(e) => dispatch(setSelectedEmployee(e.target.value))}
                    style={{width: 'auto'}}>
                    <option value=''>Выбрать сотрудника</option>
                    {employees.map((employee: any) => (
                        <option key={employee.id} value={employee.id}>
                            {employee.name}
                        </option>
                    ))}
                </Form.Select>
                <Button variant='primary' onClick={() => setIsModalOpen(true)}>
                    Добавить сотрудника
                </Button>
            </div>
            <CreateEmployeeModal opened={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </header>
    );
};
