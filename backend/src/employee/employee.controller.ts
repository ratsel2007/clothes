import {Controller, Get, Post, Body} from '@nestjs/common';
import {EmployeeService} from './employee.service';
import {Employee} from './models/employee.model';

@Controller('employee')
export class EmployeeController {
    constructor(private readonly employeeService: EmployeeService) {}

    @Get()
    findAll(): Promise<Employee[]> {
        return this.employeeService.findAll();
    }

    @Post('create')
    create(@Body() employee: Employee): Promise<Employee> {
        return this.employeeService.create(employee);
    }
}
