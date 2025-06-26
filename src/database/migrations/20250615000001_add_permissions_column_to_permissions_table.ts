import { QueryInterface, DataTypes } from "sequelize";

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Add permissions JSONB column to permissions table
      await queryInterface.addColumn(
        "permissions",
        "permissions",
        {
          type: DataTypes.JSONB,
          allowNull: true,
        },
        { transaction }
      );

      // Update existing permissions with default permission structures including move permissions
      await queryInterface.sequelize.query(
        `UPDATE permissions SET permissions = CASE 
          WHEN level = 'MEMBER' THEN '{"board": {"create": false, "read": true, "update": false, "delete": false}, "list": {"create": true, "read": true, "update": true, "delete": false, "move": true}, "card": {"create": true, "read": true, "update": true, "delete": false, "move": true}}'::jsonb
          WHEN level = 'OBSERVER' THEN '{"board": {"create": false, "read": true, "update": false, "delete": false}, "list": {"create": false, "read": true, "update": false, "delete": false, "move": false}, "card": {"create": false, "read": true, "update": false, "delete": false, "move": false}}'::jsonb
          WHEN level = 'MODERATOR' THEN '{"board": {"create": false, "read": true, "update": true, "delete": false}, "list": {"create": true, "read": true, "update": true, "delete": true, "move": true}, "card": {"create": true, "read": true, "update": true, "delete": true, "move": true}}'::jsonb
          WHEN level = 'ADMIN' THEN '{"board": {"create": true, "read": true, "update": true, "delete": true}, "list": {"create": true, "read": true, "update": true, "delete": true, "move": true}, "card": {"create": true, "read": true, "update": true, "delete": true, "move": true}}'::jsonb
          ELSE '{}'::jsonb
        END`,
        { transaction }
      );

      await transaction.commit();
      console.log("Successfully added permissions column to permissions table");
    } catch (error) {
      console.error("Migration failed:", error);
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Remove permissions column
      await queryInterface.removeColumn("permissions", "permissions", {
        transaction,
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
