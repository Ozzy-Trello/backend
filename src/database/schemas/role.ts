import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@/database/connections';
import { isPermissionStructure, PermissionStructure } from '@/utils/security_utils';

interface RoleAttributes {
  id: string;
  name: string;
  description: string;
  default: boolean;
  permissions?: PermissionStructure;
}

interface RoleCreationAttributes extends Optional<RoleAttributes, 'id' | 'default'> {}

class Role extends Model<RoleAttributes, RoleCreationAttributes> implements RoleCreationAttributes {
  public id!: string;
  public name!: string;
  public description!: string;
  public default!: boolean;
  public permissions?: PermissionStructure;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
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
    permissions: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {
        board: { create: false, read: true, update: false, delete: false },
        list: { create: false, read: true, update: false, delete: false },
        card: { create: false, read: true, update: false, delete: false },
      },
      validate: {
        isEven(value:any) {
          if (!isPermissionStructure(value)) {
            throw new Error('is not valid permission object!');
          }
        }
      }
    },
  },
  {
    tableName: 'role',
    sequelize,
  }
);

export default Role;