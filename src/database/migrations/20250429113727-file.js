'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;
    await queryInterface.createTable('file', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false
      },
      size: {
        type: DataTypes.DOUBLE,
        allowNull: false
      },
      size_unit: {
        type: DataTypes.STRING,
        allowNull: false
      },
      mime_type: {
        type: DataTypes.STRING,
        allowNull: false
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

    await queryInterface.addIndex('file', ['created_by']);
    await queryInterface.addIndex('file', ['name']);
    await queryInterface.addIndex('file', ['mime_type']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('file');
  }
};
