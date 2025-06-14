'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('card', 'created_by', {
      type: Sequelize.UUID,
      allowNull: true, // sementara biar ga error dulu
    });
    await queryInterface.addColumn('card', 'updated_by', {
      type: Sequelize.UUID,
      allowNull: true,
    });

    await queryInterface.addColumn('list', 'created_by', {
      type: Sequelize.UUID,
      allowNull: true, // sementara biar ga error dulu
    });
    await queryInterface.addColumn('list', 'updated_by', {
      type: Sequelize.UUID,
      allowNull: true,
    });

    await queryInterface.addColumn('board', 'created_by', {
      type: Sequelize.UUID,
      allowNull: true, // sementara biar ga error dulu
    });
    await queryInterface.addColumn('board', 'updated_by', {
      type: Sequelize.UUID,
      allowNull: true,
    });

  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('board', 'updated_by');
    await queryInterface.removeColumn('board', 'created_by');

    await queryInterface.removeColumn('list', 'updated_by');
    await queryInterface.removeColumn('list', 'created_by');

    await queryInterface.removeColumn('card', 'updated_by');
    await queryInterface.removeColumn('card', 'created_by');
  }
};
