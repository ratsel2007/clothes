import React from 'react';
import {Gender} from '../../types/employee.types';
import {employeeApi} from '../../api/employee.api';

interface CreateEmployeeModalProps {
    opened: boolean;
    onClose: () => void;
}

export function CreateEmployeeModal({onClose}: CreateEmployeeModalProps) {
    const [formData, setFormData] = React.useState({
        name: '',
        gender: '',
        startDate: '',
        officerDate: '',
        staff: [],
    });

    const [errors, setErrors] = React.useState({
        name: '',
        gender: '',
        startDate: '',
        officerDate: '',
    });

    const validateForm = () => {
        const newErrors = {
            name: !formData.name ? 'Name is required' : '',
            gender: !formData.gender ? 'Gender is required' : '',
            startDate: !formData.startDate ? 'Start date is required' : '',
            officerDate: !formData.officerDate ? 'Officer date is required' : '',
        };
        setErrors(newErrors);
        return !Object.values(newErrors).some((error) => error);
    };

    const [errorMessage, setErrorMessage] = React.useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            await employeeApi.create({
                ...formData,
                startDate: new Date(formData.startDate).toISOString(),
                officerDate: new Date(formData.officerDate).toISOString(),
            });
            onClose();
            setFormData({
                name: '',
                gender: '',
                startDate: '',
                officerDate: '',
                staff: [],
            });
            setErrorMessage('');
        } catch (error: any) {
            setErrorMessage(error.response?.data?.message || 'Failed to create employee');
            console.error('Failed to create employee:', error);
        }
    };

    return (
        <div>
            <div onClick={onClose}>×</div>
            <h2>Create New Employee</h2>
            {errorMessage && <div style={{color: 'red', marginBottom: '10px'}}>{errorMessage}</div>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>
                        Name:
                        <input
                            type='text'
                            name='name'
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            required
                        />
                    </label>
                    {errors.name && <span>{errors.name}</span>}
                </div>

                <div>
                    <label>
                        Gender:
                        <select
                            name='gender'
                            value={formData.gender}
                            onChange={(e) => setFormData({...formData, gender: e.target.value})}
                            required>
                            <option value=''>Select gender</option>
                            <option value={Gender.Male}>Male</option>
                            <option value={Gender.Female}>Female</option>
                        </select>
                    </label>
                    {errors.gender && <span>{errors.gender}</span>}
                </div>

                <div>
                    <label>
                        Start Date:
                        <input
                            type='date'
                            name='startDate'
                            value={formData.startDate}
                            onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                            required
                        />
                    </label>
                    {errors.startDate && <span>{errors.startDate}</span>}
                </div>

                <div>
                    <label>
                        Officer Date:
                        <input
                            type='date'
                            name='officerDate'
                            value={formData.officerDate}
                            onChange={(e) =>
                                setFormData({...formData, officerDate: e.target.value})
                            }
                            required
                        />
                    </label>
                    {errors.officerDate && <span>{errors.officerDate}</span>}
                </div>

                <button type='submit'>Create Employee</button>
            </form>
        </div>
    );
}
