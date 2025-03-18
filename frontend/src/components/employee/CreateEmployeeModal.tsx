import React from 'react';
import {Modal, Form, Button, Alert} from 'react-bootstrap';
import {Gender} from '../../types/employee.types';
import {employeeApi} from '../../api/employee.api';

interface CreateEmployeeModalProps {
    opened: boolean;
    onClose: () => void;
}

export function CreateEmployeeModal({opened, onClose}: CreateEmployeeModalProps) {
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
        <Modal show={opened} onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>Create New Employee</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {errorMessage && <Alert variant='danger'>{errorMessage}</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Form.Group className='mb-3'>
                        <Form.Label>ФИО</Form.Label>
                        <Form.Control
                            type='text'
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            isInvalid={!!errors.name}
                        />
                        <Form.Control.Feedback type='invalid'>{errors.name}</Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className='mb-3'>
                        <Form.Label>Пол</Form.Label>
                        <Form.Select
                            value={formData.gender}
                            onChange={(e) => setFormData({...formData, gender: e.target.value})}
                            isInvalid={!!errors.gender}>
                            <option value=''>Выберите пол</option>
                            <option value={Gender.Male}>Мужской</option>
                            <option value={Gender.Female}>Женский</option>
                        </Form.Select>
                        <Form.Control.Feedback type='invalid'>
                            {errors.gender}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className='mb-3'>
                        <Form.Label>Дата начала службы</Form.Label>
                        <Form.Control
                            type='date'
                            value={formData.startDate}
                            onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                            isInvalid={!!errors.startDate}
                        />
                        <Form.Control.Feedback type='invalid'>
                            {errors.startDate}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className='mb-3'>
                        <Form.Label>Дата присвоения офицерского звания</Form.Label>
                        <Form.Control
                            type='date'
                            value={formData.officerDate}
                            onChange={(e) =>
                                setFormData({...formData, officerDate: e.target.value})
                            }
                            isInvalid={!!errors.officerDate}
                        />
                        <Form.Control.Feedback type='invalid'>
                            {errors.officerDate}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <div className='d-flex justify-content-end gap-2'>
                        <Button variant='secondary' onClick={onClose}>
                            Отмена
                        </Button>
                        <Button variant='primary' type='submit'>
                            Добавить сотрудника
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
}
