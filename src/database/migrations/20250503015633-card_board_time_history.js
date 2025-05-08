'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;
    
    await queryInterface.createTable('card_board_time_history', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4
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
      board_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'board',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      entered_at: {
        type: 'TIMESTAMP',
        allowNull: false
      },
      exited_at: {
        type: 'TIMESTAMP',
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: 'TIMESTAMP'
      },
      updated_at: {
        allowNull: false,
        type: 'TIMESTAMP'
      }
    });
    
    await queryInterface.addIndex('card_board_time_history', ['card_id', 'board_id']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('card_board_time_history');
  }
};