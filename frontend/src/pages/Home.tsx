import {useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {RootState} from '../store/store';
import {Item} from '../components/Item';
import {fetchEmployees, deleteEmployee} from '../store/employeeSlice';

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
        <div>
            <h2>Welcome to Clothes Shop</h2>
            {selectedEmployee && (
                <button onClick={handleDelete}>Delete {selectedEmployee.name}</button>
            )}

            <h3>{selectedEmployee?.name || 'Select an employee'}</h3>
            {selectedEmployee?.staff?.map((item, index) => (
                <Item key={index} staff={item} />
            ))}
        </div>
    );
};
