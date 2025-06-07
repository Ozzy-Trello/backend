'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    await queryInterface.createTable('card_label', {
      id: {
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        type: DataTypes.UUID
      },
      card_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'card',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      label_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'label',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      created_by: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'user',
          key: 'id'
        }
      },
      created_at: {
        allowNull: false,
        type: 'TIMESTAMP'
      },
      updated_at: {
        allowNull: false,
        type: 'TIMESTAMP',
      },
      deleted_at: {
        allowNull: true,
        type: 'TIMESTAMP',
      }
    });

    await queryInterface.addIndex('card_label', ['card_id']);
    await queryInterface.addIndex('card_label', ['label_id']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('card_label');
    await queryInterface.removeIndex('card_label', ['card_id']);
    await queryInterface.removeIndex('card_label', ['label_id']);
  }
};
