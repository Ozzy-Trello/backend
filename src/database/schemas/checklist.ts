import { DataTypes, Model, Optional } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import sequelize from "@/database/connections";

interface ChecklistItem {
  label: string;
  checked: boolean;
}

interface ChecklistAttributes {
  id: string;
  card_id: string;
  title: string;
  data: ChecklistItem[];
  created_by?: string;
  updated_by?: string;
  created_at?: Date;
  updated_at?: Date;
}

interface ChecklistCreationAttributes
  extends Optional<ChecklistAttributes, "id"> {}

class Checklist
  extends Model<ChecklistAttributes, ChecklistCreationAttributes>
  implements ChecklistAttributes
{
  public id!: string;
  public card_id!: string;
  public title!: string;
  public data!: ChecklistItem[];
  public created_by?: string;
  public updated_by?: string;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Checklist.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4,
      primaryKey: true,
    },
    card_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "card",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "Checklist",
    },
    data: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    updated_by: {
      type: DataTypes.UUID,
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
    tableName: "checklists",
    sequelize,
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Checklist;
