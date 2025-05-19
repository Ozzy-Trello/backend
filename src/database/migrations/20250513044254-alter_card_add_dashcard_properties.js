'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("card", "type", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("card", "start_date", {
      type: "TIMESTAMP",
      allowNull: true
    });

    await queryInterface.addColumn("card", "due_date", {
      type: "TIMESTAMP",
      allowNull: true
    });

    await queryInterface.addColumn("card", "due_date_reminder", {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn("card", "dash_config", {
      type: Sequelize.JSONB,
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("card", "type");
    await queryInterface.removeColumn("card", "start_date");
    await queryInterface.removeColumn("card", "due_date");
    await queryInterface.removeColumn("card", "due_date_reminder");
    await queryInterface.removeColumn("card", "dash_config");
  }
};
