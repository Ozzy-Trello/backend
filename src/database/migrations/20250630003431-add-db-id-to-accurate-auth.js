'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('accurate_auth', 'db_id', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Database ID for Accurate integration'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('accurate_auth', 'db_id');
  }
}; 