import { DataTypes } from "sequelize";
import sequelize from "@/database/connections";

export const Request = sequelize.define(
  "Request",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    card_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    request_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    requested_item_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    request_amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    adjustment_no: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    item_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    adjustment_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "request",
  }
);
