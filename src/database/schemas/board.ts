import { DataTypes, Model, Optional } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '@/database/connections';

interface BoardAttributes {
    id : string;
    workspace_id: string;
    name: string;
    description : string;
    background: string;
}

interface BoardCreationAttributes extends Optional<BoardAttributes, 'id'> {}

class Board extends Model<BoardAttributes, BoardCreationAttributes> implements BoardAttributes {
    public id! : string;
    public workspace_id! : string;
    public name!: string;
    public description! : string;
    public background!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Board.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: uuidv4,
            primaryKey: true,
        },
        workspace_id: {
            type: DataTypes.UUID,
        },
        name: {
            type: new DataTypes.STRING(128),
            allowNull: false,
        },
        description: {
            type: new DataTypes.TEXT,
            allowNull: false,
        },
        background: {
            type: DataTypes.STRING(8),
            defaultValue: '#FFFFFF',
            allowNull: false,
        }
    },
    {
        tableName: 'board',
        sequelize,
    }
)

export default Board