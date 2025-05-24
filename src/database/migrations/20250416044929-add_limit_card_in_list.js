'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable("list").catch(() => null);
    if (!tableInfo?.card_limit) {
      await queryInterface.addColumn("list", "card_limit", {
        type: Sequelize.INTEGER,
        allowNull: true, // Bisa diubah ke false jika wajib diisi
      });
    }
  },

  async down (queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable("list").catch(() => null);
    if (tableInfo?.card_limit) {
      await queryInterface.removeColumn("list", "card_limit");
    }
  }
};
