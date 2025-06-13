import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@/database/connections';

interface WorkspaceMemberAttributes {
  workspace_id: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
}

interface WorkspaceMemberCreationAttributes extends Optional<WorkspaceMemberAttributes, 'created_at' | 'updated_at'> {}

class WorkspaceMember extends Model<WorkspaceMemberAttributes, WorkspaceMemberCreationAttributes> implements WorkspaceMemberAttributes {
  public workspace_id!: string;
  public user_id!: string;
  public created_at!: Date;
  public updated_at!: Date;

  // Association methods
  public static associate(models: any) {
    WorkspaceMember.belongsTo(models.Workspace, {
      foreignKey: 'workspace_id',
      as: 'workspace',
    });
    
    WorkspaceMember.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });
  }

  // Initialize the model
  public static initialize(sequelize: any): typeof WorkspaceMember {
    WorkspaceMember.init(
      {
        workspace_id: {
          type: DataTypes.UUID,
          allowNull: false,
          primaryKey: true,
          references: {
            model: 'workspaces',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        user_id: {
          type: DataTypes.UUID,
          allowNull: false,
          primaryKey: true,
          references: {
            model: 'users',
            key: 'id',
          },
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
        tableName: 'workspace_members',
        sequelize,
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        defaultScope: {
          attributes: { exclude: ['id'] }
        },
      }
    );

    return WorkspaceMember;
  }
}

// Initialize the model
WorkspaceMember.initialize(sequelize);

export { WorkspaceMember };
export type { WorkspaceMemberAttributes, WorkspaceMemberCreationAttributes };