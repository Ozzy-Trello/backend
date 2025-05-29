'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("card_custom_field", "value_option", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    
    await queryInterface.addColumn("card_custom_field", "value_date", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("card_custom_field", "value_checkbox", {
      type: Sequelize.BOOLEAN,
      allowNull: true,
    });

    await queryInterface.changeColumn("card_custom_field", "order", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
     await queryInterface.changeColumn("card_custom_field", "order", {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
    await queryInterface.removeColumn("card_custom_field", "value_checkbox");
    await queryInterface.removeColumn("card_custom_field", "value_date");
    await queryInterface.removeColumn("card_custom_field", "value_option");
  }
};
