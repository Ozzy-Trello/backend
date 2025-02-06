import { DataTypes, Model, Optional } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '@/database/connections';

interface TagAttributes {
    id : string;
    name: string;
    description : string;
}


interface TagCreationAttributes extends Optional<TagAttributes, 'id'> {}

class Tag extends Model<TagAttributes, TagCreationAttributes> implements TagAttributes {
    public id! : string;
    public name!: string;
    public description! : string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Tag.init(
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

export default Tag