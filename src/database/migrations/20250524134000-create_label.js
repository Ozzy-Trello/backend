'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('label', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      value: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      value_type : {
        type: Sequelize.ENUM('color', 'user', 'custom_field'),
        allowNull: false,
        defaultValue: 'color',
      },
      workspace_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'workspace',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('label');
  }
};
