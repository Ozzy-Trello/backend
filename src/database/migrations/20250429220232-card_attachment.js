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

    if (!tableCheck[0].exists) {
      await queryInterface.createTable('card_attachment', {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          allowNull: false,
          primaryKey: true
        },
        card_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: 'card',
            key: 'id'
          }
        },
        file_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: 'file',
            key: 'id'
          }
        },
        is_cover: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
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
          type: DataTypes.TIME,
          allowNull: false,
          defaultValue: Sequelize.NOW
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        },
        deleted_at: {
          type: DataTypes.TIME,
          allowNull: true
        }
      });
  
      await queryInterface.addIndex('card_attachment', ['file_id']);
      await queryInterface.addIndex('card_attachment', ['card_id']);
    }
    
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('card_attachment');
  }
};
