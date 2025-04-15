'use strict';

const {DataTypes} = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn("card_activity", "activity_type");
    await queryInterface.removeColumn("card_activity_action", "action");
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS enum_card_activity_action_action;`);
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS enum_card_activity_activity_action;`);

    await queryInterface.addColumn("card_activity", "activity_type", {
      type: DataTypes.ENUM('action', 'comment'),
      allowNull: true, 
    });

    await queryInterface.addColumn("card_activity_action", "action", {
      type: DataTypes.ENUM('move_list', 'make_label', 'add_tag', 'remove_tag'),
      allowNull: true, 
    });
  },

  async down (queryInterface, Sequelize) {
    // action
    await queryInterface.removeColumn("card_activity", "activity_type");
    await queryInterface.removeColumn("card_activity_action", "action");
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS enum_card_activity_action_action;`);
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS enum_card_activity_activity_action;`);

    await queryInterface.addColumn("card_activity", "activity_type", {
      type: DataTypes.ENUM('action', 'comment'),
      allowNull: true, 
    });

    await queryInterface.addColumn("card_activity_action", "action", {
      type: DataTypes.ENUM('move_card', 'assign_tag', 'unassign_tag'),
      allowNull: true, 
    });
  }
};
