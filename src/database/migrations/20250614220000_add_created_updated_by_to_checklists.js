'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('checklists', 'created_by', {
      type: Sequelize.UUID,
      allowNull: true,
    });
    await queryInterface.addColumn('checklists', 'updated_by', {
      type: Sequelize.UUID,
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('checklists', 'updated_by');
    await queryInterface.removeColumn('checklists', 'created_by');
  }
}; 