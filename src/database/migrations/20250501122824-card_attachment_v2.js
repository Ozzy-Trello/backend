'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    const { DataTypes } = Sequelize;

    const tableCheck = await queryInterface.sequelize.query(
      `SELECT EXISTS (
         SELECT FROM information_schema.tables 
         WHERE table_schema = 'public'
         AND table_name = 'card_attachment'
       );`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (tableCheck) {
      await queryInterface.dropTable('card_attachment');
    }
    
    await queryInterface.createTable('card_attachment', {
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
      attachable_type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isIn: [['card', 'file']] // Adds validation but without the database-level ENUM constraints
        }
      },
      attachable_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      is_cover: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: true
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

    await queryInterface.addIndex('card_attachment', ['card_id']);
    await queryInterface.addIndex('card_attachment', ['attachable_type']);
    await queryInterface.addIndex('card_attachment', ['attachable_id']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('card_attachment');
  }
};
