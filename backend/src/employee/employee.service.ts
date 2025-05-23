import {Injectable, ConflictException, NotFoundException} from '@nestjs/common';
import {InjectModel} from '@nestjs/sequelize';
import {Employee} from './models/employee.model';
import {calculateEquipment} from '../functions/calculate';
import {compareAndUpdateEmployeeVersions} from '../functions/compare_employee_versions';
import { formatDateToDDMMYYYY } from 'src/functions/formatDate';

@Injectable()
export class EmployeeService {
    constructor(
        @InjectModel(Employee)
        private employeeModel: typeof Employee
    ) {}

    async findAll(): Promise<Employee[]> {
        return this.employeeModel.findAll();
    }

    async create(employee: Employee): Promise<Employee> {
        // Validate input data
        if (!employee.name || !employee.gender || !employee.startDate || !employee.officerDate) {
            throw new ConflictException('Пожалуйста, заполните все обязательные поля');
        }

        // Check if employee with same name exists
        const existingEmployee = await this.employeeModel.findOne({
            where: {name: employee.name},
        });

        if (existingEmployee) {
            throw new ConflictException(`Сотрудник с именем ${employee.name} уже существует`);
        }

        const startDate = formatDateToDDMMYYYY(employee.startDate);
        const officerDate = formatDateToDDMMYYYY(employee.officerDate);
        const maternityLeaveStart = employee.maternityLeaveStart ? formatDateToDDMMYYYY(employee.maternityLeaveStart) : null;
  
        
        const staffData = calculateEquipment(
            employee.gender,
            startDate,
            officerDate,
            maternityLeaveStart,
            employee.maternityLeaveDuration || 0
        );

        return this.employeeModel.create({
            name: employee.name,
            gender: employee.gender,
            startDate: employee.startDate,
            officerDate: employee.officerDate,
            maternityLeaveStart: employee.maternityLeaveStart,
            maternityLeaveDuration: employee.maternityLeaveDuration,
            staff: staffData,
        });
    }

    async findOne(id: string): Promise<Employee> {
        // Find existing employee
        const existingEmployee = await this.employeeModel.findByPk(id);
        if (!existingEmployee) {
            throw new NotFoundException(`Employee with ID ${id} not found`);
        }

        const updatedStaff = compareAndUpdateEmployeeVersions(existingEmployee);

        // Update employee if changes were made
        if (JSON.stringify(existingEmployee.staff) !== JSON.stringify(updatedStaff)) {
            await existingEmployee.update({staff: updatedStaff});
        }

        return existingEmployee;
    }

    async deleteAll(): Promise<{message: string}> {
        await this.employeeModel.destroy({
            where: {},
            truncate: true,
        });
        return {message: 'All employees have been deleted successfully'};
    }

    async deleteById(id: string): Promise<{message: string}> {
        const employee = await this.employeeModel.findByPk(id);

        if (!employee) {
            throw new NotFoundException(`Employee with ID ${id} not found`);
        }

        await employee.destroy();
        return {message: `Employee with ID ${id} has been deleted successfully`};
    }

    async update(id: string, employee: Employee): Promise<Employee> {
        const existingEmployee = await this.employeeModel.findByPk(id);

        if (!existingEmployee) {
            throw new NotFoundException(`Employee with ID ${id} not found`);
        }

        await existingEmployee.update(employee);
        return existingEmployee;
    }
}
