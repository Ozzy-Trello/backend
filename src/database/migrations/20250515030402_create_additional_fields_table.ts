import { DataTypes } from "sequelize";
import sequelize from "@/database/connections";

export async function up(): Promise<void> {
  const queryInterface = sequelize.getQueryInterface();

  await queryInterface.createTable("additional_fields", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
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
    data: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
      comment: "JSON object containing additional field data",
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

  // Add index for faster lookups by card_id
  await queryInterface.addIndex("additional_fields", ["card_id"]);
}

export async function down(): Promise<void> {
  const queryInterface = sequelize.getQueryInterface();

  await queryInterface.dropTable("additional_fields");
}
