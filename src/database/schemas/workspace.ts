import { DataTypes, Model, Optional } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '@/database/connections';

interface WorkspaceAttributes {
  id: string;
  name: string;
  slug: string;
  description: string;
  created_at?: Date;
  updated_at?: Date;
}


interface WorkspaceCreationAttributes extends Optional<WorkspaceAttributes, 'id'> { }

class Workspace extends Model<WorkspaceAttributes, WorkspaceCreationAttributes> implements WorkspaceAttributes {
  public id!: string;
  public name!: string;
  public slug!: string;
  public description!: string;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Workspace.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4,
      primaryKey: true,
    },
    name: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    slug: {
      type: new DataTypes.TEXT,
      allowNull: false,
      unique: true
    },
    description: {
      type: new DataTypes.TEXT,
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
    tableName: 'workspace',
    sequelize,
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
)

export default Workspace