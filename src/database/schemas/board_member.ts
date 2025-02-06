import { DataTypes, Model } from 'sequelize';
import sequelize from '@/database/connections';

interface BoardMemberAttributes {
    board_id : string;
    user_id: string;
    role_id: string;
}

interface BoardMemberCreationAttributes extends BoardMemberAttributes {}

class BoardMember extends Model<BoardMemberAttributes, BoardMemberCreationAttributes> implements BoardMemberAttributes {
    public board_id! : string;
    public user_id!: string;
    public role_id!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

BoardMember.init(
    {
        board_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        role_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
    },
    {
        tableName: 'board_member',
        sequelize,
    }
)

export default BoardMember