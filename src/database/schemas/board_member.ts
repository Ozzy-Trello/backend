import { DataTypes, Model } from 'sequelize';
import sequelize from '@/database/connections';

interface BoardMemberAttributes {
    board_id : string;
    user_id: string;
    role_id: string;
    created_at?: Date;
    updated_at?: Date;
}

interface BoardMemberCreationAttributes extends BoardMemberAttributes {}

class BoardMember extends Model<BoardMemberAttributes, BoardMemberCreationAttributes> implements BoardMemberAttributes {
    public board_id! : string;
    public user_id!: string;
    public role_id!: string;

    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

BoardMember.init(
    {
        board_id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
        },
        role_id: {
            type: DataTypes.UUID,
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
        tableName: 'board_member',
        sequelize,
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',    
    }
)

export default BoardMember