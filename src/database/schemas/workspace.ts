import { DataTypes, Model, Optional } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '@/database/connections';

interface WorkspaceAttributes {
  id: string;
  name: string;
  slug: string;
  description: string;
}


interface WorkspaceCreationAttributes extends Optional<WorkspaceAttributes, 'id'> { }

class Workspace extends Model<WorkspaceAttributes, WorkspaceCreationAttributes> implements WorkspaceAttributes {
  public id!: string;
  public name!: string;
  public slug!: string;
  public description!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
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
  },
  {
    tableName: 'workspace',
    sequelize,
  }
)

export default Workspace