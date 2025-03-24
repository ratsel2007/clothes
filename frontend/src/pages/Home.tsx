import {useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {RootState} from '../store/store';
import {Item} from '../components/Item';
import {fetchEmployees, deleteEmployee} from '../store/employeeSlice';
import {Container, Button, Alert} from 'react-bootstrap';

export const Home = () => {
    const dispatch = useDispatch();
    const selectedEmployee = useSelector((state: RootState) => state.employees.selectedEmployee);

    useEffect(() => {
        dispatch(fetchEmployees() as any);
    }, [dispatch]);

    const handleDelete = () => {
        if (selectedEmployee?.id) {
            dispatch(deleteEmployee(selectedEmployee.id) as any);
        }
    };

    return (
        <Container>
            <Alert variant={selectedEmployee ? 'info' : 'warning'} className='mb-4'>
                <h3 className='m-0'>{selectedEmployee?.name || 'Выберите сотрудника'}</h3>
            </Alert>

            <div className='d-flex flex-column gap-3'>
                {selectedEmployee?.staff?.map((item, index) => (
                    <Item key={index} staff={item} />
                ))}
            </div>
        </Container>
    );
};
