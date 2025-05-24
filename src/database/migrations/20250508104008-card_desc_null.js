'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable("card").catch(() => null);
    if (tableInfo?.description) {
      await queryInterface.changeColumn('card', 'description', {
        type: Sequelize.STRING,
        allowNull: true
      });
    }
  },

  async down (queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable("card").catch(() => null);
    if (tableInfo?.description) {
      await queryInterface.changeColumn('card', 'description', {
        type: Sequelize.STRING,
        allowNull: false
      });
    }
  }
};
