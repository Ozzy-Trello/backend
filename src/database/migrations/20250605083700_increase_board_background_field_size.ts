import { DataTypes } from "sequelize";
import sequelize from "@/database/connections";

export async function up(): Promise<void> {
  await sequelize.getQueryInterface().changeColumn("board", "background", {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: '#FFFFFF',
  });
}

export async function down(): Promise<void> {
  await sequelize.getQueryInterface().changeColumn("board", "background", {
    type: DataTypes.STRING(8),
    allowNull: false,
    defaultValue: '#FFFFFF',
  });
}
