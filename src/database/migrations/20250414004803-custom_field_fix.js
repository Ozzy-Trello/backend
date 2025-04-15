'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn("custom_field", "workspace_id");
    await queryInterface.addColumn("custom_field", "board_id", {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'board',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("custom_field", "board_id");
    await queryInterface.addColumn("custom_field", "workspace_id", {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'workspace',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  }
};
