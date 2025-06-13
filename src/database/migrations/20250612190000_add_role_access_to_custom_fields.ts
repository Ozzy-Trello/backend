import { QueryInterface, DataTypes } from "sequelize";

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Add canView and canEdit columns to custom_field table
      await queryInterface.addColumn(
        "custom_field",
        "can_view",
        {
          type: DataTypes.JSONB,
          allowNull: true,
          defaultValue: [], // Empty array by default
          comment: "Array of role IDs that can view this custom field"
        },
        { transaction }
      );

      await queryInterface.addColumn(
        "custom_field",
        "can_edit",
        {
          type: DataTypes.JSONB,
          allowNull: true,
          defaultValue: [], // Empty array by default
          comment: "Array of role IDs that can edit this custom field"
        },
        { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      console.error("Error in migration add_role_access_to_custom_fields:", error);
      throw error;
    }
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Remove the columns
      await queryInterface.removeColumn("custom_field", "can_view", { transaction });
      await queryInterface.removeColumn("custom_field", "can_edit", { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      console.error("Error rolling back add_role_access_to_custom_fields migration:", error);
      throw error;
    }
  },
};
