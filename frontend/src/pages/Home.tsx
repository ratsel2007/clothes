import {observer} from 'mobx-react-lite';
import {employeeStore} from '../stores/employeeStore';
import {useEffect} from 'react';
import {Staff} from '../components/Staff';

export const Home = observer(() => {
    useEffect(() => {
        console.log('Selected Employee:', employeeStore.selectedEmployee?.staff);
    }, [employeeStore.selectedEmployee]);

    return (
        <div>
            <h2>Welcome to Clothes Shop</h2>
            <h3>{employeeStore.selectedEmployee?.name || 'Select an employee'}</h3>
            <h4>{employeeStore.selectedEmployee?.gender || 'No gender specified'}</h4>
            {/* {employeeStore.selectedEmployee?.staff.map((item) => ( <Staff key={item.id} />)} */}

            <Staff />
        </div>
    );
});
