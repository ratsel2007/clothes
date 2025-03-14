import React from 'react';
import {observer} from 'mobx-react-lite';
import {CreateEmployeeModal} from './employee/CreateEmployeeModal';
import {employeeStore} from '../stores/employeeStore';

export const Header = observer(() => {
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    React.useEffect(() => {
        employeeStore.fetchEmployees();
    }, [isModalOpen]);

    return (
        <header>
            <h1>Выдача имущества</h1>
            <div>
                <select
                    value={employeeStore.selectedEmployee?.id || ''}
                    onChange={(e) => employeeStore.setSelectedEmployee(e.target.value)}>
                    <option value=''>Select employee</option>
                    {employeeStore.employees.map((employee) => (
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
});
