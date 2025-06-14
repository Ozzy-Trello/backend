'use strict';

const {v4: uuidv4} = require("uuid");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create split_job_template table
    await queryInterface.createTable('split_job_template', {
      id: {
        type: Sequelize.UUID,
        defaultValue: uuidv4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      workspace_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'workspace',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      custom_field_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'custom_field',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
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

    // Add indexes for performance
    await queryInterface.addIndex('split_job_template', ['workspace_id']);
    await queryInterface.addIndex('split_job_template', ['custom_field_id']);

    // Create split_job_value table
    await queryInterface.createTable('split_job_value', {
      id: {
        type: Sequelize.UUID,
        defaultValue: uuidv4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      split_job_template_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'split_job_template',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      card_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'card',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      custom_field_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'custom_field',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      value: {
        type: Sequelize.DECIMAL(15, 2),
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

    // Add indexes for performance
    await queryInterface.addIndex('split_job_value', ['split_job_template_id']);
    await queryInterface.addIndex('split_job_value', ['card_id']);
    await queryInterface.addIndex('split_job_value', ['custom_field_id']);
  },

  async down(queryInterface, Sequelize) {
    // Drop tables in reverse order to respect foreign key constraints
    await queryInterface.dropTable('split_job_value');
    await queryInterface.dropTable('split_job_template');
  }
};
