'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('automation_rule', 'created_by', {
      type: Sequelize.UUID,
      allowNull: false,
    });
    await queryInterface.addColumn('automation_rule', 'updated_by', {
      type: Sequelize.UUID,
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('automation_rule', 'updated_by');
    await queryInterface.removeColumn('automation_rule', 'created_by');
  }
};
