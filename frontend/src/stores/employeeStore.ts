import { makeAutoObservable } from 'mobx';
import { Employee } from '../types/employee.types';
import { employeeApi } from '../api/employee.api';

class EmployeeStore {
    selectedEmployee: Employee | null = null;
    employees: Employee[] = [];

    constructor() {
        makeAutoObservable(this);
    }

    setSelectedEmployee = async (id: string) => {
        if (!id) {
            this.selectedEmployee = null;
            return;
        }
        try {
            const employee = await employeeApi.getAll().then(employees => employees.find((emp: Employee) => emp.id === id));
            this.selectedEmployee = employee;
        } catch (error) {
            console.error('Failed to fetch employee:', error);
            this.selectedEmployee = null;
        }
    }

    fetchEmployees = async () => {
        try {
            const response = await employeeApi.getAll();
            this.employees = response || [];
        } catch (error) {
            console.error('Failed to fetch employees:', error);
            this.employees = [];
        }
    }
}

export const employeeStore = new EmployeeStore();