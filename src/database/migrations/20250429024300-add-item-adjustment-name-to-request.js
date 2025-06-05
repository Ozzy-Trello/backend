"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("request", "item_name", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    
    await queryInterface.addColumn("request", "adjustment_name", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("request", "item_name");
    await queryInterface.removeColumn("request", "adjustment_name");
  },
};
