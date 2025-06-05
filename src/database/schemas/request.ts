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
    request_sent: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    request_received: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    production_recieved: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    warehouse_returned: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    warehouse_final_used_amount: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    authorized_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    warehouse_user: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    production_user: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    is_rejected: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_done: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    satuan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "request",
  }
);
