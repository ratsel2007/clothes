import React from 'react';
import {Form, Button} from 'react-bootstrap';
import {useSelector, useDispatch} from 'react-redux';
import {CreateEmployeeModal} from './employee/CreateEmployeeModal';
import {RootState} from '../store/store';
import {
    fetchEmployees,
    setSelectedEmployee,
    deleteEmployee,
    fetchEmployeeById,
} from '../store/employeeSlice';

export const Header = () => {
    const dispatch = useDispatch();
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const employees = useSelector((state: RootState) => state.employees.employees);
    const selectedEmployee = useSelector((state: RootState) => state.employees.selectedEmployee);

    React.useEffect(() => {
        dispatch(fetchEmployees() as any);
    }, [isModalOpen, dispatch]);

    const handleDelete = () => {
        if (selectedEmployee?.id) {
            dispatch(deleteEmployee(selectedEmployee.id) as any);
        }
    };

    return (
        <header>
            <div className='d-flex gap-3 align-items-center pb-4'>
                <Form.Select
                    value={selectedEmployee?.id || ''}
                    onChange={(e) => {
                        if (e.target.value) {
                            dispatch(fetchEmployeeById(e.target.value) as any);
                        } else {
                            dispatch(setSelectedEmployee(''));
                        }
                    }}
                    style={{width: 'auto'}}>
                    <option value=''>Выбрать сотрудника</option>
                    {employees.map((employee: any) => (
                        <option key={employee.id} value={employee.id}>
                            {employee.name}
                        </option>
                    ))}
                </Form.Select>
                {selectedEmployee && (
                    <Button variant='danger' onClick={handleDelete}>
                        Удалить сотрудника
                    </Button>
                )}
                <Button variant='primary' onClick={() => setIsModalOpen(true)}>
                    Добавить сотрудника
                </Button>
            </div>
            <CreateEmployeeModal opened={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </header>
    );
};
