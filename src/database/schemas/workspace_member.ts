import { DataTypes, Model, Optional } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
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
        },
        role_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        workspace_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
    },
    {
        tableName: 'workspace',
        sequelize,
    }
)

export default WorkspaceMember