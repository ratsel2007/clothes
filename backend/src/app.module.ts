import {Module} from '@nestjs/common';
import {SequelizeModule} from '@nestjs/sequelize';
import {EmployeeModule} from './employee/employee.module';

@Module({
    imports: [
        SequelizeModule.forRoot({
            dialect: 'postgres',
            host: 'localhost',
            port: 5432,
            username: 'postgres',
            password: 'postgres',
            database: 'clothes_db',
            autoLoadModels: true,
            synchronize: true,
        }),
        EmployeeModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
