import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  async up(queryInterface: QueryInterface) {
    await queryInterface.addColumn("request", "request_sent", {
      type: DataTypes.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn("request", "request_received", {
      type: DataTypes.INTEGER,
      allowNull: true,
    });
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.removeColumn("request", "request_sent");
    await queryInterface.removeColumn("request", "request_received");
  },
};
