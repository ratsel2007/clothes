import axios from 'axios';

const API_URL = 'http://localhost:3000';

export const employeeApi = {
    create: async (employeeData: any) => {
        const response = await axios.post(`${API_URL}/employee/create`, employeeData);
        return response.data;
    },

    getAll: async () => {
        const response = await axios.get(`${API_URL}/employee`);
        return response.data;
    },
};
