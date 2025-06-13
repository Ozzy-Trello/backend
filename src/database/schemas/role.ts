import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@/database/connections';

interface RoleAttributes {
  id: string;
  name: string;
  description: string;
  default: boolean;
  created_at?: Date;
  updated_at?: Date;
}

interface RoleCreationAttributes extends Optional<RoleAttributes, 'id' | 'default'> {}

class Role extends Model<RoleAttributes, RoleCreationAttributes> implements RoleCreationAttributes {
  public id!: string;
  public name!: string;
  public description!: string;
  public default!: boolean;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Role.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(128),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    default: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
    tableName: 'role',
    sequelize,
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

export default Role;