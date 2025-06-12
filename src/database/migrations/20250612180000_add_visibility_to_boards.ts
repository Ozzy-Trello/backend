import { QueryInterface, DataTypes } from "sequelize";

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.addColumn("board", "visibility", {
    type: DataTypes.ENUM("public", "role_based"),
    allowNull: false,
    defaultValue: "public",
  });

  // Create board_roles junction table for role-based visibility
  await queryInterface.createTable("board_roles", {
    board_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "board",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    role_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "role",
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
  });

  // Add composite primary key
  await queryInterface.addConstraint("board_roles", {
    fields: ["board_id", "role_id"],
    type: "primary key",
    name: "board_roles_pkey",
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeColumn("board", "visibility");
  await queryInterface.dropTable("board_roles");
}
