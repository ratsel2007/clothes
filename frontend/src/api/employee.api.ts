import axios from 'axios';

const API_URL = 'http://localhost:3000';

export const employeeApi = {
    create: async (employeeData: any) => {
        const response = await axios.post(`${API_URL}/employee/create`, employeeData);
        return response.data;
    },

    getAll: async () => {
        const response = await axios.get<any[]>(`${API_URL}/employee`);
        return response.data;
    },

    deleteById: async (id: string) => {
        const response = await axios.delete(`${API_URL}/employee/${id}`);
        return response.data;
    },
};
