'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Rename color to value
    await queryInterface.renameColumn('label', 'color', 'value');
    // Add value_type enum
    await queryInterface.addColumn('label', 'value_type', {
      type: Sequelize.ENUM('color', 'user', 'custom_field'),
      allowNull: false,
      defaultValue: 'color',
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn('label', 'value', 'color');
    await queryInterface.removeColumn('label', 'value_type');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_label_value_type";');
  }
};
