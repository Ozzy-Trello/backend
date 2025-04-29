'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable("card").catch(() => null);
    if (!tableInfo?.location) {
      await queryInterface.addColumn("card", "location", {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },

  async down (queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable("card").catch(() => null);
    if (tableInfo?.location) {
      await queryInterface.removeColumn("card", "location");
    }
  }
};
