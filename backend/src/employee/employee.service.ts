import {Injectable, ConflictException} from '@nestjs/common';
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
        const staffData = processEquipment(formattedStartDate, formattedOfficerDate);

        return this.employeeModel.create({
            ...employee,
            staff: staffData,
        });
    }
}
