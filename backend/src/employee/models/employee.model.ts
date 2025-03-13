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
        type: DataType.DATEONLY,
        allowNull: false,
    })
    startDate: Date;

    @Column({
        type: DataType.DATEONLY,
        allowNull: false,
    })
    officerDate: Date;

    @Column({
        type: DataType.JSONB,
        allowNull: true,
    })
    decree: {
        date: Date;
        duration: number;
    } | null;

    @Column({
        type: DataType.JSONB,
        allowNull: false,
    })
    staff: Array<{
        issuances: Array<{
            date: Date;
            quantity: number;
            used: number;
        }>;
        totalQuantity: number;
        cash: number;
    }>;
}
