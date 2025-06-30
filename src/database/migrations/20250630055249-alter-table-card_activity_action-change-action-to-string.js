'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   await queryInterface.sequelize.query(`
      ALTER TABLE public.card_activity_action
      ALTER COLUMN "action" TYPE varchar
      USING "action"::varchar;
    `);
  },

  async down (queryInterface, Sequelize) {
   await queryInterface.sequelize.query(`
      ALTER TABLE public.card_activity_action
      ALTER COLUMN "action" TYPE varchar
      USING "action"::varchar;
    `);
  }
};
