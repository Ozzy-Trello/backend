import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "@/database/connections";

interface BoardRoleAttributes {
  board_id: string;
  role_id: string;
  created_at: Date;
  updated_at: Date;
}

interface BoardRoleCreationAttributes
  extends Optional<BoardRoleAttributes, "created_at" | "updated_at"> {}

class BoardRole
  extends Model<BoardRoleAttributes, BoardRoleCreationAttributes>
  implements BoardRoleAttributes
{
  public board_id!: string;
  public role_id!: string;

  public created_at!: Date;
  public updated_at!: Date;

  // Association methods
  public static associate(models: any) {
    BoardRole.belongsTo(models.Role, {
      foreignKey: "role_id",
      as: "role",
    });

    BoardRole.belongsTo(models.Board, {
      foreignKey: "board_id",
      as: "board",
    });
  }

  // Initialize the model
  public static initialize(sequelize: any): typeof BoardRole {
    BoardRole.init(
      {
        board_id: {
          type: DataTypes.UUID,
          allowNull: false,
          primaryKey: true,
          references: {
            model: "boards",
            key: "id",
          },
          onDelete: "CASCADE",
        },
        role_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: "roles",
            key: "id",
          },
          onDelete: "CASCADE",
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
        tableName: "board_roles",
        sequelize,
        timestamps: true,
        underscored: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
      }
    );

    return BoardRole;
  }
}

// Initialize the model
BoardRole.initialize(sequelize);

export { BoardRole };
export type { BoardRoleAttributes, BoardRoleCreationAttributes };
