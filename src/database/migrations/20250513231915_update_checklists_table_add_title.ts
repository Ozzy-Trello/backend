import { DataTypes } from "sequelize";
import sequelize from "@/database/connections";

export async function up(): Promise<void> {
  const queryInterface = sequelize.getQueryInterface();

  // Add title column to the checklists table
  await queryInterface.addColumn("checklists", "title", {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: "Checklist",
    comment: "Title of the checklist",
  });

  // Remove the unique constraint on card_id to allow multiple checklists per card
  // We need to drop and recreate the index without the unique constraint
  await queryInterface.removeIndex("checklists", "checklists_card_id");
  await queryInterface.addIndex("checklists", ["card_id"]);
}

export async function down(): Promise<void> {
  const queryInterface = sequelize.getQueryInterface();

  // Remove the title column
  await queryInterface.removeColumn("checklists", "title");

  // Recreate the unique constraint on card_id
  // This might fail if there are multiple checklists per card
  await queryInterface.removeIndex("checklists", "checklists_card_id");
  await queryInterface.addIndex("checklists", ["card_id"], {
    unique: true,
  });
}
