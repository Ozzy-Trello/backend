import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "@/database/connections";

export type PermissionStructure = {
  board?: { view: boolean; edit: boolean; delete: boolean };
  list?: { create: boolean; edit: boolean; delete: boolean };
  card?: { create: boolean; edit: boolean; delete: boolean; assign: boolean };
  member?: { add: boolean; remove: boolean; change_role: boolean };
};

interface RoleAttributes {
  id: string;
  name: string;
  description: string;
  is_default: boolean;
  created_at: Date;
  updated_at: Date;
}

interface RoleCreationAttributes
  extends Optional<RoleAttributes, "id" | "created_at" | "updated_at"> {}

class Role
  extends Model<RoleAttributes, RoleCreationAttributes>
  implements RoleAttributes
{
  public id!: string;
  public name!: string;
  public description!: string;
  public is_default!: boolean;
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
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "",
    },
    is_default: {
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
    tableName: "roles",
    sequelize,
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export { Role };
export type { RoleAttributes, RoleCreationAttributes };
