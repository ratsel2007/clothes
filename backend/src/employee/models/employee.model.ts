import {Column, Model, Table, DataType} from 'sequelize-typescript';

@Table({tableName: 'employees'})
export class Employee extends Model {
    @Column({
        type: DataType.UUID,
        primaryKey: true,
        defaultValue: DataType.UUIDV4,
    })
    id: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    name: string;

    @Column({
        type: DataType.ENUM('male', 'female'),
        allowNull: false,
    })
    gender: 'male' | 'female';

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    startDate: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    officerDate: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
        defaultValue: null,
    })
    maternityLeaveStart: string | null;

    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        defaultValue: 0,
    })
    maternityLeaveDuration: number;

    @Column({
        type: DataType.JSONB,
        allowNull: false,
    })
    staff: Array<{
        issuances: Array<{
            date: string;
            quantity: number;
            used: number;
        }>;
        totalQuantity: number;
        cash: number;
    }>;
}
