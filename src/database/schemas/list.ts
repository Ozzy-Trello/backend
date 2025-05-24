import { DataTypes, Model, Optional } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '@/database/connections';

interface ListAttributes {
    id : string;
    board_id: string;
    order: number;
    card_limit?: number;
    name: string;
    background: string;
    created_at?: Date;
    updated_at?: Date;
}

interface ListCreationAttributes extends Optional<ListAttributes, 'id'> {}

class List extends Model<ListAttributes, ListCreationAttributes> implements ListAttributes {
    public id! : string;
    public board_id! : string;
    public order!: number;
    public card_limit?: number;
    public name!: string;
    public background! : string;

    public readonly created_at!: Date;
    public readonly updated_at!: Date;
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
        card_limit: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        name: {
            type: new DataTypes.STRING(128),
            allowNull: false,
        },
        background: {
            type: DataTypes.STRING(8),
            defaultValue: '#797979',
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
        tableName: 'list',
        sequelize,
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
)

export default List