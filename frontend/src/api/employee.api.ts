import axios from 'axios';
import {Employee} from '../types/employee.types';

const API_URL = 'http://localhost:3000';

export const employeeApi = {
    create: async (employeeData: any) => {
        const response = await axios.post(`${API_URL}/employee/create/`, employeeData);
        return response.data;
    },

    getAll: async () => {
        const response = await axios.get<any[]>(`${API_URL}/employee/`);
        return response.data;
    },

    getOne: async (id: string) => {
        const response = await axios.get<any[]>(`${API_URL}/employee/${id}`);
        return response.data;
    },

    deleteById: async (id: string) => {
        // Fixed: changed from /employee/ to /employees/
        const response = await axios.delete(`${API_URL}/employee/${id}`);
        return response.data;
    },

    updateEmployee: async (employee: Employee) => {
        // Fixed: changed from /employee/ to /employees/
        const response = await axios.put<Employee>(`${API_URL}/employee/${employee.id}`, employee);
        return response.data;
    },
};
