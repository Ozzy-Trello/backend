import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@/database/connections';

interface WorkspaceMemberAttributes {
    workspace_id: string;
    user_id: string;
    role_id: string;
}

interface WorkspaceMemberCreationAttributes extends WorkspaceMemberAttributes{}

class WorkspaceMember extends Model<WorkspaceMemberAttributes, WorkspaceMemberCreationAttributes> implements WorkspaceMemberAttributes {
    public user_id! : string;
    public role_id!: string;
    public workspace_id!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

WorkspaceMember.init(
    {
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
        },
        role_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        workspace_id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
        },
    },
    {
        tableName: 'workspace_member',
        sequelize,
        defaultScope: {
            attributes: {exclude: ['id']}
        },
    }
)

export default WorkspaceMember