import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../connections";

export interface PermissionAttributes {
  id: string;
  level: "MEMBER" | "OBSERVER" | "MODERATOR" | "ADMIN";
  description: string;
  permissions: {
    board: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
    };
    list: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
      move: boolean;
    };
    card: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
      move: boolean;
    };
  };
  created_at: Date;
  updated_at: Date;
}

export interface PermissionCreationAttributes
  extends Optional<PermissionAttributes, "id" | "created_at" | "updated_at"> {}

class Permission
  extends Model<PermissionAttributes, PermissionCreationAttributes>
  implements PermissionAttributes
{
  public id!: string;
  public level!: "MEMBER" | "OBSERVER" | "MODERATOR" | "ADMIN";
  public description!: string;
  public permissions!: {
    board: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
    };
    list: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
      move: boolean;
    };
    card: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
      move: boolean;
    };
  };

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Permission.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    level: {
      type: DataTypes.ENUM("MEMBER", "OBSERVER", "MODERATOR", "ADMIN"),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "",
    },
    permissions: {
      type: DataTypes.JSONB,
      allowNull: true,
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
    tableName: "permissions",
    modelName: "Permission",
    sequelize,
    timestamps: true,
    underscored: true,
  }
);

export default Permission;
