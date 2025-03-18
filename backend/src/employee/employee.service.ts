import {Injectable, ConflictException, NotFoundException} from '@nestjs/common';
import {InjectModel} from '@nestjs/sequelize';
import {Employee} from './models/employee.model';
import {formatDateToDDMMYYYY} from '../functions/formatDate';
import {processEquipment} from '../functions/calculate_staff';

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
        // Check if employee with same name exists
        const existingEmployee = await this.employeeModel.findOne({
            where: {name: employee.name},
        });

        if (existingEmployee) {
            throw new ConflictException(`Сотрудник с именем ${employee.name} уже существует`);
        }

        const formattedStartDate = formatDateToDDMMYYYY(employee.startDate);
        const formattedOfficerDate = formatDateToDDMMYYYY(employee.officerDate);
        const staffData = processEquipment(
            formattedStartDate,
            formattedOfficerDate,
            employee.gender
        );

        return this.employeeModel.create({
            ...employee,
            staff: staffData,
        });
    }

    async findOne(id: string): Promise<Employee> {
        const employee = await this.employeeModel.findByPk(id);
        if (!employee) {
            throw new NotFoundException(`Employee with ID ${id} not found`);
        }
        console.log(employee);
        return employee;
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
