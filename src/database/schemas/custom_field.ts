import { DataTypes, Model, Optional } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import sequelize from "@/database/connections";
import {
  EnumCustomFieldType,
  EnumCustomFieldSource,
} from "@/types/custom_field";

interface CustomFieldAttributes {
  id: string;
  name: string;
  type: EnumCustomFieldType;
  is_show_at_front: boolean;
  options: JSON;
  order: number;
  description: string;
  workspace_id: string;
  source: string;
  trigger_id?: string;
  can_view?: string[];
  can_edit?: string[];
  created_at?: Date;
  updated_at?: Date;
}

interface CustomFieldCreationAttributes
  extends Optional<CustomFieldAttributes, "id"> {}

class CustomField
  extends Model<CustomFieldAttributes, CustomFieldCreationAttributes>
  implements CustomFieldAttributes
{
  public id!: string;
  public name!: string;
  public type!: EnumCustomFieldType;
  public is_show_at_front!: boolean;
  public options!: JSON;
  public order!: number;
  public description!: string;
  public workspace_id!: string;
  public source!: string;
  public trigger_id?: string;
  public can_view?: string[];
  public can_edit?: string[];

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

CustomField.init(
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
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_show_at_front: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    options: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    order: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    workspace_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "workspace",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    trigger_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "trigger",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    description: {
      type: new DataTypes.TEXT(),
      allowNull: false,
    },
    source: {
      type: DataTypes.STRING,
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
    can_view: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    },
    can_edit: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    },
  },
  {
    tableName: "custom_field",
    sequelize,
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default CustomField;
