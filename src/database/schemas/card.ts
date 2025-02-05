import { DataTypes, Model, Optional } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '@/database/connections';

interface TaskAttributes {
    id : string;
    list_id: string;
    name: string;
    description : string;
}

interface TaskCreationAttributes extends Optional<TaskAttributes, 'id'> {}

class Card extends Model<TaskAttributes, TaskCreationAttributes> implements TaskAttributes {
    public id! : string;
    public list_id!: string;
    public name!: string;
    public description! : string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Card.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: uuidv4,
            primaryKey: true,
        },
        list_id: {
            type: DataTypes.UUID,
            primaryKey: true,
        },
        name: {
            type: new DataTypes.STRING(128),
            allowNull: false,
        },
        description: {
            type: new DataTypes.TEXT,
            allowNull: false,
        },
    },
    {
        tableName: 'board',
        sequelize,
    }
)

export default Card