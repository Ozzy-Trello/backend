import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@/database/connections';

interface WorkspaceMemberAttributes {
  workspace_id: string;
  user_id: string;
  role_id: string;
  created_at?: Date;
  updated_at?: Date;
}

interface WorkspaceMemberCreationAttributes extends WorkspaceMemberAttributes { }

class WorkspaceMember extends Model<WorkspaceMemberAttributes, WorkspaceMemberCreationAttributes> implements WorkspaceMemberAttributes {
  public user_id!: string;
  public role_id!: string;
  public workspace_id!: string;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

WorkspaceMember.init(
  {
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'user',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    role_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'role',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    workspace_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'workspace',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
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
    tableName: 'workspace_member',
    sequelize,
    defaultScope: {
      attributes: { exclude: ['id'] }
    },
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
)

export default WorkspaceMember