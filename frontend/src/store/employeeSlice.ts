import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {employeeApi} from '../api/employee.api';
import {Employee} from '../types/employee.types';

export const fetchEmployees = createAsyncThunk('employee/fetchAll', async () => {
    const response = await employeeApi.getAll();
    return response || [];
});

export const fetchEmployeeById = createAsyncThunk('employee/fetchOne', async (id: string) => {
    const response = await employeeApi.getOne(id);
    // .then((employees) => employees.find((employee: Employee) => employee.id === id));
    return response;
});

export const deleteEmployee = createAsyncThunk('employee/delete', async (id: string) => {
    await employeeApi.deleteById(id);
    return id;
});

export const updateEmployee = createAsyncThunk('employees/update', async (employee: Employee) => {
    const response = await employeeApi.updateEmployee(employee);
    return response;
});

interface EmployeeState {
    employees: Employee[];
    selectedEmployee: Employee | null;
    loading: boolean;
    error: string | null;
}

const initialState: EmployeeState = {
    employees: [],
    selectedEmployee: null,
    loading: false,
    error: null,
};

const employeeSlice = createSlice({
    name: 'employees',
    initialState,
    reducers: {
        setSelectedEmployee: (state, action: PayloadAction<string>) => {
            state.selectedEmployee =
                state.employees.find((emp) => emp.id === action.payload) || null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchEmployees.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchEmployees.fulfilled, (state, action) => {
                state.loading = false;
                state.employees = action.payload;
            })
            .addCase(fetchEmployeeById.fulfilled, (state, action) => {
                state.selectedEmployee = action.payload;
            })
            .addCase(deleteEmployee.fulfilled, (state, action) => {
                state.employees = state.employees.filter((emp) => emp.id !== action.payload);
                state.selectedEmployee = null;
            })
            .addCase(updateEmployee.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateEmployee.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.employees.findIndex((emp) => emp.id === action.payload.id);
                if (index !== -1) {
                    state.employees[index] = action.payload;
                    state.selectedEmployee = action.payload;
                }
            })
            .addCase(updateEmployee.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to update employee';
            });
    },
});

export const {setSelectedEmployee} = employeeSlice.actions;
export default employeeSlice.reducer;
