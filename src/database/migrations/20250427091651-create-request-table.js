"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("request", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      card_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      request_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      requested_item_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      request_amount: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("request");
  },
};
