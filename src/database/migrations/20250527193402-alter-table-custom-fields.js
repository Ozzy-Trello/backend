'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

   await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_type t
          JOIN pg_enum e ON t.oid = e.enumtypid
          WHERE t.typname = 'enum_custom_field_source' AND e.enumlabel = 'custom'
        ) THEN
          ALTER TYPE "enum_custom_field_source" ADD VALUE 'custom';
        END IF;
      END
      $$;
    `);


    await queryInterface.changeColumn("custom_field", "source", {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.addColumn("custom_field", "type", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    
    await queryInterface.addColumn("custom_field", "is_show_at_front", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
    
    await queryInterface.addColumn("custom_field", "options", {
      type: Sequelize.JSONB,
      allowNull: true,
    });
    
    await queryInterface.addColumn("custom_field", "order", {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("custom_field", "order");
    await queryInterface.removeColumn("custom_field", "options");
    await queryInterface.removeColumn("custom_field", "is_show_at_front");
    await queryInterface.removeColumn("custom_field", "type");

    await queryInterface.sequelize.query(`
      ALTER TABLE custom_field ALTER COLUMN source TYPE VARCHAR;
      DROP TYPE IF EXISTS "enum_custom_field_source";
      CREATE TYPE IF EXISTS"enum_custom_field_source" AS ENUM ('product', 'user');
      ALTER TABLE custom_field ALTER COLUMN source TYPE "enum_custom_field_source" 
      USING source::"enum_custom_field_source";
    `);
  }
};