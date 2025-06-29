'use strict';

const {v4: uuidv4} = require("uuid");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('automation_rule_filter', {
      id: {
        type: Sequelize.UUID,
        defaultValue: uuidv4,
        primaryKey: true,
      },
      rule_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'automation_rule',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      group_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      condition: {
        type: Sequelize.JSONB,
        allowNull: false,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('automation_rule_filter');
  }
};
