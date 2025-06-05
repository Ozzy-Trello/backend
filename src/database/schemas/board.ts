import {DataTypes, Model, Optional} from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '@/database/connections';

interface BoardAttributes {
    id : string;
    workspace_id: string;
    name: string;
    description : string;
    background: string;
    created_at?: Date;
    updated_at?: Date;
}

interface BoardCreationAttributes extends Optional<BoardAttributes, 'id'> {}

class Board extends Model<BoardAttributes, BoardCreationAttributes> implements BoardAttributes {
    public id! : string;
    public workspace_id! : string;
    public name!: string;
    public description! : string;
    public background!: string;

    public readonly created_at!: Date;
    public readonly updated_at!: Date;
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
            allowNull: false,
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
            type: DataTypes.TEXT,
            defaultValue: '#FFFFFF',
            allowNull: false,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        tableName: 'board',
        sequelize,
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',    
    }
)

export default Board