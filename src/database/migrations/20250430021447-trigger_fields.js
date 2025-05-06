'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn("trigger", "all_card")
    await queryInterface.addColumn("trigger", "condition_type", {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn("trigger", "group_type", {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("trigger", "condition_type")
    await queryInterface.removeColumn("trigger", "group_type")
    await queryInterface.addColumn("trigger", "all_card", {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    });
  }
};
