import { DataTypes } from "sequelize";
import sequelize from "@/database/connections";

export async function up(): Promise<void> {
  await sequelize.getQueryInterface().addColumn("request", "production_recieved", {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  });

  await sequelize.getQueryInterface().addColumn("request", "warehouse_returned", {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  });

  await sequelize.getQueryInterface().addColumn("request", "warehouse_final_used_amount", {
    type: DataTypes.INTEGER,
    allowNull: true,
  });
}

export async function down(): Promise<void> {
  await sequelize.getQueryInterface().removeColumn("request", "production_recieved");
  await sequelize.getQueryInterface().removeColumn("request", "warehouse_returned");
  await sequelize.getQueryInterface().removeColumn("request", "warehouse_final_used_amount");
}
