import React from 'react';
import {CreateEmployeeModal} from './employee/CreateEmployeeModal';

export function Header() {
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    return (
        <header>
            <h1>Clothes Shop</h1>
            <button onClick={() => setIsModalOpen(true)}>Create Employee</button>
            <CreateEmployeeModal opened={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </header>
    );
}
