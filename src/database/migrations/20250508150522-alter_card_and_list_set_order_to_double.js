'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Change the order column in list table
    await queryInterface.changeColumn('list', 'order', {
      type: Sequelize.DOUBLE,
      allowNull: true
    });

    // Change the order column in card table
    await queryInterface.changeColumn('card', 'order', {
      type: Sequelize.DOUBLE,
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert the order column in list table back to INTEGER
    await queryInterface.changeColumn('list', 'order', {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    // Revert the order column in card table back to INTEGER
    await queryInterface.changeColumn('card', 'order', {
      type: Sequelize.INTEGER,
      allowNull: false
    });
  }
};