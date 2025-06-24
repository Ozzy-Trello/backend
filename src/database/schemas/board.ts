import { DataTypes, Model, Optional } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import sequelize from "@/database/connections";
import { BoardRole } from "./board_role";

export type BoardVisibility = "public" | "role_based";

interface BoardAttributes {
  id: string;
  workspace_id: string;
  name: string;
  description: string;
  background: string;
  visibility: BoardVisibility;
  created_at?: Date;
  updated_at?: Date;
  // Add association type
  boardRoles?: Array<{ role_id: string }>;
}

interface BoardCreationAttributes
  extends Optional<BoardAttributes, "id" | "visibility"> {}

// Add interface for the model with associations
interface BoardInstance extends Model<BoardAttributes, BoardCreationAttributes>, BoardAttributes {
  // Add association methods here if needed
}

class Board
  extends Model<BoardAttributes, BoardCreationAttributes>
  implements BoardAttributes
{
  public id!: string;
  public workspace_id!: string;
  public name!: string;
  public description!: string;
  public background!: string;
  public visibility!: BoardVisibility;
  public boardRoles?: Array<{ role_id: string }>;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Board.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4,
      primaryKey: true,
    },
    workspace_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    name: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    description: {
      type: new DataTypes.TEXT(),
      allowNull: false,
    },
    background: {
      type: DataTypes.TEXT,
      defaultValue: "#FFFFFF",
      allowNull: false,
    },
    visibility: {
      type: DataTypes.ENUM("public", "role_based"),
      allowNull: false,
      defaultValue: "public",
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
    tableName: "board",
    sequelize,
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// Define associations in a separate function
export function associate(models: any): void {
  Board.hasMany(models.BoardRole, {
    foreignKey: "board_id",
    as: "members",
  });

  Board.belongsToMany(models.Role, {
    through: "board_roles",
    foreignKey: "board_id",
    otherKey: "role_id",
    as: "roles",
  });
}

export default Board;
