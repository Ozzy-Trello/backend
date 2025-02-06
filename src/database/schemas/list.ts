import { DataTypes, Model, Optional } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '@/database/connections';

interface ListAttributes {
    id : string;
    board_id: string;
    order: number;
    name: string;
    background : string;
}

interface ListCreationAttributes extends Optional<ListAttributes, 'id'> {}

class List extends Model<ListAttributes, ListCreationAttributes> implements ListAttributes {
    public id! : string;
    public board_id! : string;
    public order!: number;
    public name!: string;
    public background! : string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

List.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: uuidv4,
            primaryKey: true,
        },
        board_id: {
            type: DataTypes.UUID,
        },
        order: {
            type: DataTypes.INTEGER,
        },
        name: {
            type: new DataTypes.STRING(128),
            allowNull: false,
        },
        background: {
            type: DataTypes.STRING(8),
            defaultValue: '#797979',
            allowNull: false,
        }
    },
    {
        tableName: 'list',
        sequelize,
    }
)

export default List