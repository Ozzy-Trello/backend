import { DataTypes, Model, Optional } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '@/database/connections';

interface Tag {
    id : string;
    name: string;
    description : string;
}

interface TaskCreationAttributes extends Optional<Tag, 'id'> {}

class Card extends Model<Tag, TaskCreationAttributes> implements Tag {
    public id! : string;
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
        tableName: 'tag',
        sequelize,
    }
)

export default Card