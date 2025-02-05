import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@/database/connections';

interface WorkspaceMemberAttributes {
    workspace_id : string;
    user_id: string;
}

interface WorkspaceMemberCreationAttributes extends WorkspaceMemberAttributes {}

class WorkspaceMember extends Model<WorkspaceMemberAttributes, WorkspaceMemberCreationAttributes> implements WorkspaceMemberAttributes {
    public workspace_id! : string;
    public user_id!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

WorkspaceMember.init(
    {
        workspace_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
    },
    {
        tableName: 'workspace_member',
        sequelize,
    }
)

export default WorkspaceMember