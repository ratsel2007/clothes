import {observer} from 'mobx-react-lite';
import {employeeStore} from '../stores/employeeStore';

export const Staff = observer(() => {
    return (
        <div>
            <h3>Staff Information</h3>
            {employeeStore.selectedEmployee?.staff && (
                <div>{/* Staff data will be displayed here */}</div>
            )}
        </div>
    );
});
