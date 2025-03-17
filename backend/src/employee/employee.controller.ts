import {Controller, Get, Post, Body, Param, Delete} from '@nestjs/common';
import {EmployeeService} from './employee.service';
import {Employee} from './models/employee.model';

@Controller('employee')
export class EmployeeController {
    constructor(private readonly employeeService: EmployeeService) {}

    @Get()
    findAll(): Promise<Employee[]> {
        return this.employeeService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string): Promise<Employee> {
        return this.employeeService.findOne(id);
    }

    @Post('create')
    create(@Body() employee: Employee): Promise<Employee> {
        return this.employeeService.create(employee);
    }

    @Delete('delete-all')
    async deleteAll() {
        return this.employeeService.deleteAll();
    }

    @Delete(':id')
    async deleteById(@Param('id') id: string) {
        return this.employeeService.deleteById(id);
    }
}
