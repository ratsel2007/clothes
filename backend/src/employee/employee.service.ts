import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/sequelize';
import {Employee} from './models/employee.model';

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
        return this.employeeModel.create({...employee});
    }
}
