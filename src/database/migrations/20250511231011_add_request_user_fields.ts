import { DataTypes } from "sequelize";
import sequelize from "@/database/connections";

export async function up(): Promise<void> {
  const queryInterface = sequelize.getQueryInterface();

  await queryInterface.addColumn("request", "authorized_by", {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: "user",
      key: "id",
    },
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
  });

  await queryInterface.addColumn("request", "warehouse_user", {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: "user",
      key: "id",
    },
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
  });

  await queryInterface.addColumn("request", "production_user", {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: "user",
      key: "id",
    },
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
  });
}

export async function down(): Promise<void> {
  const queryInterface = sequelize.getQueryInterface();

  await queryInterface.removeColumn("request", "authorized_by");
  await queryInterface.removeColumn("request", "warehouse_user");
  await queryInterface.removeColumn("request", "production_user");
}
