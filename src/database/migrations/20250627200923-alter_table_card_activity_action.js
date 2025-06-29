'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {


    // card_activity_action
    await queryInterface.renameColumn('card_activity_action', 'source', 'old_value');

    await queryInterface.addColumn("card_activity_action", "new_value", {
      type: Sequelize.JSONB,
      allowNull: true,
    });

    // card_activity
    await queryInterface.addColumn("card_activity", "triggered_by", {
      type: Sequelize.STRING,
      allowNull: false,
    });

     await queryInterface.addColumn("card_activity", "created_by", {
      type: Sequelize.UUID,
      allowNull: false,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.renameColumn('card_activity_action', 'old_value', 'source');
    await queryInterface.removeColumn('card_activity_action', 'new_value');

    await queryInterface.removeColumn('card_activity', 'triggered_by');
    await queryInterface.removeColumn('card_activity', 'created_by');
  }
};
