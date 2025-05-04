'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // await queryInterface.removeColumn("trigger", "condition_value")
    let tableInfo = await queryInterface.describeTable("trigger").catch(() => null);
    if (tableInfo?.condition_value) {
      console.log("condition_value ada, kita hapus dulu. . . ")
      await queryInterface.removeColumn("trigger", "condition_value")
      console.log("hapus condition_value berhasil di hapus ")
    }
    if (!tableInfo?.condition) {
      console.log("condition tidak ada, kita buat dulu. . . ")
      await queryInterface.addColumn("trigger", "condition", {
        type: Sequelize.JSONB, // Menggunakan JSONB untuk fleksibilitas format
        allowNull: true
      });
      console.log("condition berhasil di buat ")
    }
  },

  async down (queryInterface, Sequelize) {
    // await queryInterface.removeColumn("trigger", "condition")
    const tableInfo = await queryInterface.describeTable("trigger").catch(() => null);
    if (tableInfo?.condition) {
      await queryInterface.removeColumn("trigger", "condition")
    }
    if (!tableInfo?.condition_value) {
      await queryInterface.addColumn("trigger", "condition_value", {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }
  }
};
